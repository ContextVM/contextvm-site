<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { useServerAnnouncement, useServerAnnouncements } from '$lib/queries/serverQueries';
	import { eventStore } from '$lib/services/eventStore';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import Seo from '$lib/components/SEO.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		decodeServerIdentifier,
		encodeServerIdentity,
		resolveServerIdentifier
	} from '$lib/utils';

	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);

	const serverAnnouncementsQuery = useServerAnnouncements();

	let loading = $state($serverAnnouncementsQuery.isFetching);
	let searchTerm = $state('');
	const resolvedSearchIdentifierQuery = $derived.by(() => {
		const trimmedSearchTerm = searchTerm.trim();

		return createQuery({
			queryKey: ['server-search-identifier', trimmedSearchTerm, page.url.hostname],
			queryFn: () => resolveServerIdentifier(trimmedSearchTerm, page.url.hostname),
			enabled: trimmedSearchTerm.length > 0
		});
	});

	const filteredServerAnnouncements = $derived.by(() => {
		if (!searchTerm.trim()) {
			return $serverAnnouncements;
		}

		const term = searchTerm.toLowerCase().trim();
		const decodedIdentifier = decodeServerIdentifier(searchTerm);
		const normalizedPubkey = decodedIdentifier?.pubkey;
		return (
			$serverAnnouncements?.filter((server) => {
				const identity = encodeServerIdentity(server.pubkey, []);

				return (
					server.name.toLowerCase().includes(term) ||
					server.about?.toLowerCase().includes(term) ||
					server.website?.toLowerCase().includes(term) ||
					server.pubkey.includes(term) ||
					identity.npub.toLowerCase().includes(term) ||
					(normalizedPubkey !== undefined && server.pubkey === normalizedPubkey)
				);
			}) ?? []
		);
	});

	const decodedSearchIdentifier = $derived(
		$resolvedSearchIdentifierQuery.data ?? decodeServerIdentifier(searchTerm)
	);
	const searchServerQuery = $derived(
		decodedSearchIdentifier
			? useServerAnnouncement(decodedSearchIdentifier.pubkey, decodedSearchIdentifier.relayHints)
			: null
	);
	const serverLookupHref = $derived.by(() => {
		const identifier = decodedSearchIdentifier;
		return identifier ? `/s/${identifier.original}` : null;
	});
</script>

<Seo
	title="Servers"
	description="Discover and connect with Model Context Protocol (MCP) servers on Nostr."
/>
<main class="min-h-screen bg-background px-4 py-8">
	<div class="container mx-auto">
		<!-- Header Section -->
		<div class="mx-auto mb-12 max-w-4xl text-center">
			<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">Public MCP Servers</h1>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
				Discover and connect with Model Context Protocol servers running on the Nostr network. No
				domains, no OAuth, no port forwarding—just cryptographic keys and relays.
			</p>
			
			<div class="mt-8 flex justify-center">
				<Button href="/catalog" variant="outline" size="lg" class="group relative overflow-hidden border-primary/50 bg-background/50 hover:bg-primary/10">
					<span class="relative z-10 flex items-center gap-2 font-medium">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4h2a2 2 0 0 0 2-2v-8"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>
						Browse Common Schemas
					</span>
				</Button>
			</div>
		</div>

		<!-- Server Announcements Section -->
		<div class="mx-auto max-w-6xl">
			<!-- Search Section -->
			<div class="mb-12 flex flex-col items-center justify-center gap-4">
				<Input
					bind:value={searchTerm}
					type="text"
					placeholder="🔎 Search servers by name, about, website, hex pubkey, npub, nprofile, or NIP-05..."
					class="w-full max-w-md"
				/>
			</div>

			{#if filteredServerAnnouncements?.length > 0}
				<div class="mb-12 text-center">
					<h2 class="mb-4 text-3xl font-bold">
						Available MCP Servers
						{#if searchTerm}
							<span class="ml-2 text-lg font-normal text-muted-foreground">
								({filteredServerAnnouncements.length} results)
							</span>
						{/if}
					</h2>
				</div>
				<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each filteredServerAnnouncements as server (server.id)}
						<div class="w-full max-w-sm">
							<ServerCard
								{server}
								serverIdentifier={decodedSearchIdentifier?.pubkey === server.pubkey
									? decodedSearchIdentifier.original
									: undefined}
							/>
						</div>
					{/each}
				</div>
			{:else if searchTerm}
				{@const decodedIdentifier = decodedSearchIdentifier}
				{@const resolvedServer = $searchServerQuery?.data?.server}
				{#if filteredServerAnnouncements?.length === 0}
					<div class="mt-12 text-center">
						{#if $resolvedSearchIdentifierQuery.isLoading}
							<p class="mb-6 text-muted-foreground">Resolving server identifier...</p>
						{:else if resolvedServer}
							<p class="mb-6 text-muted-foreground">
								Resolved a server from this identifier using its relay hints.
							</p>
							<div class="mx-auto w-full max-w-sm">
								<ServerCard
									server={resolvedServer}
									serverIdentifier={decodedIdentifier?.original}
								/>
							</div>
						{:else}
							<p class="mb-4 text-muted-foreground">No servers found matching "{searchTerm}"</p>
						{/if}
						{#if decodedIdentifier && serverLookupHref && !resolvedServer}
							<p class="mb-4 text-muted-foreground">
								This looks like a valid server identifier. Go to the server page to connect.
							</p>
							<Button class="px-6" href={serverLookupHref}>Go</Button>
						{/if}
					</div>
				{:else}
					<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each Array(3) as _, i (i)}
							<div class="w-full max-w-sm">
								<LoadingCard layout="article" />
							</div>
						{/each}
					</div>
				{/if}
			{:else if !$serverAnnouncements?.length && !loading}
				<div class="mt-12 text-center text-muted-foreground">
					<p>No MCP servers found. Check back later for server announcements.</p>
				</div>
			{:else if loading}
				<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each Array(3) as _, i (i)}
						<div class="w-full max-w-sm">
							<LoadingCard layout="article" />
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>
