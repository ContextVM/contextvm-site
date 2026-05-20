<script lang="ts">
	import { page } from '$app/state';
	import { useSchemaProviders, useCatalogSchemas } from '$lib/queries/catalogQueries';
	import { useServerAnnouncements } from '$lib/queries/serverQueries';
	import { eventStore } from '$lib/services/eventStore';
	import { SchemaProvidersModel, CatalogSchemasModel } from '$lib/models/catalogSchemas';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import Seo from '$lib/components/SEO.svelte';

	const hash = $derived(page.params.hash as string);

	// Fetch all schemas to get the name and categories for the header
	const schemasQuery = useCatalogSchemas();
	const allSchemas = eventStore.model(CatalogSchemasModel);
	const currentSchema = $derived($allSchemas?.find((s) => s.hash === hash));

	// Fetch providers for this specific hash
	const providersQuery = $derived(useSchemaProviders(hash));
	const providerPubkeysStore = $derived(eventStore.model(SchemaProvidersModel, hash));
	const providerPubkeys = $derived($providerPubkeysStore || []);

	// Fetch all servers to resolve pubkeys to ServerCard data
	const serverAnnouncementsQuery = useServerAnnouncements();
	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);

	const loading = $derived(
		$schemasQuery.isFetching ||
			$providersQuery?.isFetching ||
			$serverAnnouncementsQuery.isFetching
	);

	const providers = $derived.by(() => {
		if (!providerPubkeys || !$serverAnnouncements) return [];
		return $serverAnnouncements.filter((s) => providerPubkeys.includes(s.pubkey));
	});
</script>

<Seo title="{currentSchema?.name || 'Schema Providers'} | ContextVM" />

<main class="min-h-screen bg-background px-4 py-8">
	<div class="container mx-auto">
		<!-- Header Section -->
		<div class="mx-auto mb-12 max-w-4xl text-center">
			<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
				{currentSchema?.name || 'Schema Providers'}
			</h1>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
				The following MCP servers implement this common tool schema.
			</p>
			{#if currentSchema?.categories?.length}
				<div class="mt-6 flex flex-wrap justify-center gap-2">
					{#each currentSchema.categories as cat}
						<span class="rounded-md bg-secondary/50 px-3 py-1 text-sm text-secondary-foreground"
							>#{cat}</span
						>
					{/each}
				</div>
			{/if}
			<div
				class="mt-6 flex items-center justify-center font-mono text-sm text-muted-foreground"
			>
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
					class="mr-2 lucide lucide-hash"
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

		<div class="mx-auto max-w-6xl">
			{#if loading && !providers.length}
				<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each Array(3) as _}
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
					<p>No known public servers provide this schema yet.</p>
				</div>
			{/if}
		</div>
	</div>
</main>
