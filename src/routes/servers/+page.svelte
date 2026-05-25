<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { createQuery } from '@tanstack/svelte-query';
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { useServerAnnouncement, useServerAnnouncements } from '$lib/queries/serverQueries';
	import { eventStore } from '$lib/services/eventStore';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import { CatalogSchemasModel } from '$lib/models/catalogSchemas';
	import { createCommonSchemaAnnouncementsLoader } from '$lib/services/loaders.svelte';
	import Seo from '$lib/components/SEO.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { formatSchemaLabel } from '$lib/utils/cep15';
	import {
		decodeServerIdentifier,
		encodeServerIdentity,
		resolveServerIdentifier
	} from '$lib/utils';

	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);
	const allSchemas = eventStore.model(CatalogSchemasModel);

	// All unique categories and schemas across the network for the discovery strip
	const allCategories = $derived.by(() => {
		const seen: string[] = [];
		for (const schema of $allSchemas || []) {
			for (const cat of schema.categories) {
				if (!seen.includes(cat)) seen.push(cat);
			}
		}
		return seen.sort();
	});

	const serverAnnouncementsQuery = useServerAnnouncements();

	$effect(() => {
		const sub = createCommonSchemaAnnouncementsLoader().subscribe();
		return () => sub.unsubscribe();
	});

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
		</div>

		<!-- Discovery Strip: Categories & Schemas -->
		{#if allCategories.length > 0 || ($allSchemas || []).length > 0}
			<div class="mx-auto mb-10 max-w-6xl">
				{#if allCategories.length > 0}
					<div class="mb-6">
						<h2 class="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
							Browse by Category
						</h2>
						<div class="flex flex-wrap gap-2">
							{#each allCategories as cat (cat)}
								<a
									href={resolve(`/servers/t/${cat}`)}
									class="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
								>
									#{cat}
								</a>
							{/each}
						</div>
					</div>
				{/if}

				{#if ($allSchemas || []).length > 0}
					<div>
						<h2 class="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
							Browse by Common Schema
						</h2>
						<div class="flex flex-wrap gap-2">
							{#each $allSchemas || [] as schema (schema.hash)}
								<a
									href={resolve(`/servers/i/${schema.hash}`)}
									class="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
								>
									<span class="font-medium">{formatSchemaLabel(schema.name, schema.hash)}</span>
									<span
										class="rounded-full bg-primary/10 px-1.5 py-0.5 font-sans text-xs font-semibold text-primary"
									>
										{schema.providers.length}
									</span>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

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
