<script lang="ts">
	import { resolve } from '$app/paths';
	import { extractCommonSchemas, extractCategories, formatSchemaLabel } from '$lib/utils/cep15';
	import type { Event } from 'nostr-tools';

	let { tags }: { tags: Event['tags'] } = $props();

	// Build a synthetic event-like object so we can reuse existing extractors
	const fakeEvent = $derived({ tags } as Event);

	const categories = $derived(extractCategories(fakeEvent));
	const schemas = $derived(extractCommonSchemas(fakeEvent));

	const hasContent = $derived(categories.length > 0 || schemas.length > 0);
</script>

{#if hasContent}
	<div class="mt-4 rounded-lg border border-border bg-card p-4">
		<h3 class="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
			Browse Catalog
		</h3>

		{#if categories.length > 0}
			<div class="mb-3">
				<p class="mb-2 text-xs text-muted-foreground">Categories</p>
				<div class="flex flex-wrap gap-1.5">
					{#each categories as cat (cat)}
						<a
							href={resolve(`/servers/t/${cat}`)}
							class="inline-flex items-center rounded-md bg-secondary/60 px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary"
						>
							#{cat}
						</a>
					{/each}
				</div>
			</div>
		{/if}

		{#if schemas.length > 0}
			<div>
				<p class="mb-2 text-xs text-muted-foreground">Common Schemas</p>
				<div class="flex flex-wrap gap-1.5">
					{#each schemas as schema (schema.hash)}
						<a
							href={resolve(`/servers/i/${schema.hash}`)}
							class="inline-flex items-center rounded-md border border-border bg-muted/50 px-2.5 py-1 font-mono text-xs transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
						>
							{formatSchemaLabel(schema.name, schema.hash)}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
