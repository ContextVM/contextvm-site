<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { eventStore } from '$lib/services/eventStore';
	import { SchemaProvidersModel, CatalogSchemasModel } from '$lib/models/catalogSchemas';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import {
		createSchemaProviderLoader,
		createCommonSchemaAnnouncementsLoader
	} from '$lib/services/loaders.svelte';
	import { useServerAnnouncements } from '$lib/queries/serverQueries';
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import Seo from '$lib/components/SEO.svelte';
	import { formatSchemaLabel } from '$lib/utils/cep15';
	import CatalogBrowseSection from '$lib/components/CatalogBrowseSection.svelte';

	const hash = $derived(page.params.hash as string);

	// Get the schema name from the catalog model
	const allSchemas = eventStore.model(CatalogSchemasModel);
	const currentSchema = $derived(($allSchemas || []).find((s) => s.hash === hash));
	const schemaLabel = $derived(
		currentSchema ? formatSchemaLabel(currentSchema.name, hash) : `${hash.substring(0, 8)}...`
	);
	const relatedSchemas = $derived(
		($allSchemas || [])
			.filter(
				(schema) =>
					schema.hash !== hash &&
					schema.categories.some((category) => currentSchema?.categories.includes(category))
			)
			.map((schema) => ({ ...schema, providerCount: schema.providers.length }))
	);

	// Provider pubkeys for this schema hash
	const providerPubkeysStore = $derived(eventStore.model(SchemaProvidersModel, hash));
	const providerPubkeys = $derived($providerPubkeysStore || []);
	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);

	// Matching server announcements
	const providers = $derived.by(() => {
		if (!providerPubkeys.length || !$serverAnnouncements) return [];
		return $serverAnnouncements.filter((s) => providerPubkeys.includes(s.pubkey));
	});

	// Use the existing query to track loading state for server announcements
	const serverAnnouncementsQuery = useServerAnnouncements();
	let loading = $state(true);

	$effect(() => {
		const subs = [
			createCommonSchemaAnnouncementsLoader().subscribe(),
			createSchemaProviderLoader(hash).subscribe()
		];

		return () => {
			subs.forEach((s) => s.unsubscribe());
		};
	});

	// Drop loading state once we have our initial server query resolved
	// (or if we already have matching providers)
	$effect(() => {
		if (!$serverAnnouncementsQuery.isFetching || providers.length > 0) {
			loading = false;
		}
	});
</script>

<Seo
	title="{currentSchema?.name || 'Schema'} | ContextVM"
	description="MCP servers implementing the {currentSchema?.name || hash} common tool schema."
/>

<main class="min-h-screen bg-background px-4 py-8">
	<div class="container mx-auto">
		<!-- Breadcrumb -->
		<nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
			<a href={resolve('/servers')} class="hover:text-primary">Servers</a>
			<span>/</span>
			<span class="font-mono font-medium text-foreground">{schemaLabel}</span>
		</nav>

		<!-- Header -->
		<div class="mx-auto mb-12 max-w-4xl text-center">
			<h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
				{currentSchema?.name || hash.substring(0, 16) + '…'}
			</h1>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
				MCP servers implementing this common tool schema.
			</p>

			<div class="mt-6">
				<CatalogBrowseSection
					title="Explore Related Catalog"
					categories={currentSchema?.categories ?? []}
					schemas={relatedSchemas}
				/>
			</div>

			<!-- Full hash -->
			<div class="mt-4 flex items-center justify-center font-mono text-sm text-muted-foreground">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="mr-2"
					><line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line
						x1="10"
						x2="8"
						y1="3"
						y2="21"
					/><line x1="16" x2="14" y1="3" y2="21" /></svg
				>
				{hash}
			</div>
		</div>

		<!-- Server grid -->
		<div class="mx-auto max-w-6xl">
			{#if loading && !providers.length}
				<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each Array(3) as _, idx (idx)}
						<div class="w-full max-w-sm"><LoadingCard layout="article" /></div>
					{/each}
				</div>
			{:else if providers.length > 0}
				<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each providers as server (server.id)}
						<div class="w-full max-w-sm">
							<ServerCard {server} />
						</div>
					{/each}
				</div>
			{:else}
				<div class="mt-12 text-center text-muted-foreground">
					<p>No known public servers implement this schema yet.</p>
					<a
						href={resolve('/servers')}
						class="mt-4 inline-block text-sm text-primary hover:underline"
					>
						Browse all servers
					</a>
				</div>
			{/if}
		</div>
	</div>
</main>
