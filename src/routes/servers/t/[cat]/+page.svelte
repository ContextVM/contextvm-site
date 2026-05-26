<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
	import { eventStore } from '$lib/services/eventStore';
	import { TagServersModel, CatalogSchemasModel } from '$lib/models/catalogSchemas';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import {
		createTagServersLoader,
		createCommonSchemaAnnouncementsLoader
	} from '$lib/services/loaders.svelte';
	import { useServerAnnouncements } from '$lib/queries/serverQueries';
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import Seo from '$lib/components/SEO.svelte';
	import CatalogBrowseSection from '$lib/components/CatalogBrowseSection.svelte';

	const cat = $derived(page.params.cat as string);

	// Models — reactive, update as events arrive
	const providerPubkeysStore = $derived(eventStore.model(TagServersModel, cat));
	const providerPubkeys = $derived($providerPubkeysStore || []);
	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);

	// All schemas — for displaying related schemas in this category
	const allSchemas = eventStore.model(CatalogSchemasModel);
	const relatedSchemas = $derived(($allSchemas || []).filter((s) => s.categories.includes(cat)));
	const allCategories = $derived.by(() => {
		const seen = new SvelteSet<string>();
		for (const schema of relatedSchemas) {
			for (const category of schema.categories) {
				seen.add(category);
			}
		}
		return Array.from(seen).sort();
	});
	const schemaBadges = $derived(
		relatedSchemas.map((schema) => ({ ...schema, providerCount: schema.providers.length }))
	);

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
			createTagServersLoader(cat).subscribe(),
			createCommonSchemaAnnouncementsLoader().subscribe()
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
	title="#{cat} Servers | ContextVM"
	description="MCP servers in the {cat} category on the Nostr network."
/>

<main class="min-h-screen bg-background px-4 py-8">
	<div class="container mx-auto">
		<!-- Breadcrumb -->
		<nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
			<a href={resolve('/servers')} class="hover:text-primary">Servers</a>
			<span>/</span>
			<span class="font-medium text-foreground">#{cat}</span>
		</nav>

		<!-- Header -->
		<div class="mx-auto mb-12 max-w-4xl text-center">
			<h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
				#{cat}
			</h1>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
				MCP servers in the <strong>{cat}</strong> category.
			</p>
		</div>

		<div class="mx-auto max-w-6xl">
			<div class="mb-10">
				<CatalogBrowseSection
					title="Explore Related Catalog"
					categories={allCategories}
					schemas={schemaBadges}
				/>
			</div>

			<!-- Server grid -->
			<h2 class="mb-6 text-xl font-semibold">
				Servers
				{#if !loading && providers.length > 0}
					<span class="ml-2 text-base font-normal text-muted-foreground">({providers.length})</span>
				{/if}
			</h2>

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
					<p>No servers found in the <strong>{cat}</strong> category yet.</p>
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
