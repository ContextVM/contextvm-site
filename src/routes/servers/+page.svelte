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
	import { Search } from 'lucide-svelte';

	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);

	const serverAnnouncementsQuery = useServerAnnouncements();

	const hasServers = $derived(($serverAnnouncements?.length ?? 0) > 0);
	const loading = $derived($serverAnnouncementsQuery.isLoading && !hasServers);
	let searchTerm = $state('');
	let visibleCount = $state(6);

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

	const visibleServers = $derived(filteredServerAnnouncements?.slice(0, visibleCount) ?? []);
	const hasMore = $derived((filteredServerAnnouncements?.length ?? 0) > visibleCount);

	$effect(() => {
		// Reset pagination when search term changes
		searchTerm;
		visibleCount = 6;
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
		</div>

		<!-- Server Announcements Section -->
		<div class="mx-auto max-w-6xl">
			<!-- Search Section -->
			<div class="relative mb-4">
				<Search
					class="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					bind:value={searchTerm}
					type="text"
					placeholder="Search Servers..."
					class="h-[76px] w-full pl-16"
				/>
			</div>

			{#if filteredServerAnnouncements?.length > 0}
				<!-- Server count label -->
				<p class="mb-4 text-sm text-muted-foreground">
					{filteredServerAnnouncements.length} Servers available
				</p>

				<div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
					{#each visibleServers as server (server.id)}
						<ServerCard
							{server}
							serverIdentifier={decodedSearchIdentifier?.pubkey === server.pubkey
								? decodedSearchIdentifier.original
								: undefined}
						/>
					{/each}
				</div>

				{#if hasMore}
					<div class="mt-6 flex justify-center">
						<Button variant="outline" onclick={() => (visibleCount += 6)}>
							Load more servers
						</Button>
					</div>
				{/if}
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
							<ServerCard
								server={resolvedServer}
								serverIdentifier={decodedIdentifier?.original}
							/>
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
				{/if}
			{:else if !$serverAnnouncements?.length && !loading}
				<div class="mt-12 text-center text-muted-foreground">
					<p>No MCP servers found. Check back later for server announcements.</p>
				</div>
			{:else if loading}
				<div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
					{#each Array(6) as _, i (i)}
						<LoadingCard layout="server-row" />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>
