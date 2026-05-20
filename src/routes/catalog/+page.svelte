<script lang="ts">
	import { useCatalogSchemas } from '$lib/queries/catalogQueries';
	import { eventStore } from '$lib/services/eventStore';
	import { CatalogSchemasModel } from '$lib/models/catalogSchemas';
	import Seo from '$lib/components/SEO.svelte';
	import { Input } from '$lib/components/ui/input';
	import LoadingCard from '$lib/components/LoadingCard.svelte';

	const schemas = eventStore.model(CatalogSchemasModel);
	const query = useCatalogSchemas();

	let searchTerm = $state('');

	const filteredSchemas = $derived.by(() => {
		if (!searchTerm.trim()) return $schemas || [];
		const term = searchTerm.toLowerCase();
		return ($schemas || []).filter(
			(s) =>
				s.name.toLowerCase().includes(term) ||
				s.categories.some((c) => c.toLowerCase().includes(term)) ||
				s.hash.includes(term)
		);
	});
</script>

<Seo
	title="Common Schemas Catalog"
	description="Discover standardized tools implemented by multiple MCP servers on Nostr."
/>
<main class="min-h-screen bg-background px-4 py-8">
	<div class="container mx-auto">
		<!-- Header Section -->
		<div class="mx-auto mb-12 max-w-4xl text-center">
			<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">Browse Common Schemas</h1>
			<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
				Discover standardized CEP-15 tool schemas implemented across the network. Choose a schema to
				see which servers provide it.
			</p>
		</div>

		<!-- Catalog Section -->
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 flex flex-col items-center justify-center gap-4">
				<Input
					bind:value={searchTerm}
					type="text"
					placeholder="🔎 Search schemas by name, category, or hash..."
					class="w-full max-w-md"
				/>
			</div>

			{#if $query.isFetching && !$schemas?.length}
				<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each Array(6) as _, i}
						<div class="w-full max-w-sm"><LoadingCard layout="article" /></div>
					{/each}
				</div>
			{:else if filteredSchemas.length > 0}
				<div class="mb-12 text-center">
					<h2 class="mb-4 text-3xl font-bold">
						Available Schemas
						{#if searchTerm}
							<span class="ml-2 text-lg font-normal text-muted-foreground">
								({filteredSchemas.length} results)
							</span>
						{/if}
					</h2>
				</div>
				<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each filteredSchemas as schema (schema.hash)}
						<a href="/catalog/{schema.hash}" class="group w-full max-w-sm">
							<div
								class="h-full rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
							>
								<div class="mb-4 flex items-center justify-between">
									<h3 class="text-lg font-bold">{schema.name}</h3>
									<span
										class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
									>
										{schema.providers.length}
										{schema.providers.length === 1 ? 'provider' : 'providers'}
									</span>
								</div>

								{#if schema.categories.length > 0}
									<div class="mb-4 flex flex-wrap gap-2">
										{#each schema.categories as cat}
											<span
												class="rounded-md bg-secondary/50 px-2 py-1 text-xs text-secondary-foreground"
												>#{cat}</span
											>
										{/each}
									</div>
								{/if}

								<div class="mt-4 flex items-center font-mono text-xs text-muted-foreground">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="mr-1"
										><line x1="4" x2="20" y1="9" y2="9" /><line
											x1="4"
											x2="20"
											y1="15"
											y2="15"
										/><line x1="10" x2="8" y1="3" y2="21" /><line
											x1="16"
											x2="14"
											y1="3"
											y2="21"
										/></svg
									>
									{schema.hash.substring(0, 12)}...
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<div class="mt-12 text-center text-muted-foreground">
					<p>No schemas found matching your search.</p>
				</div>
			{/if}
		</div>
	</div>
</main>
