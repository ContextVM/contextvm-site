<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatSchemaLabel, type CEP15SchemaInfo } from '$lib/utils/cep15';

	interface CatalogSchemaBadge extends CEP15SchemaInfo {
		providerCount?: number;
	}

	let {
		title,
		categories = [],
		schemas = []
	}: {
		title: string;
		categories?: string[];
		schemas?: CatalogSchemaBadge[];
	} = $props();

	const hasContent = $derived(categories.length > 0 || schemas.length > 0);
</script>

{#if hasContent}
	<div class="rounded-lg border border-border bg-card p-4">
		<h3 class="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
			{title}
		</h3>

		{#if categories.length > 0}
			<div class={schemas.length > 0 ? 'mb-4' : ''}>
				<p class="mb-2 text-xs text-muted-foreground">Categories</p>
				<div class="flex flex-wrap gap-2">
					{#each categories as category (category)}
						<a
							href={resolve(`/servers/t/${category}`)}
							class="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
						>
							#{category}
						</a>
					{/each}
				</div>
			</div>
		{/if}

		{#if schemas.length > 0}
			<div>
				<p class="mb-2 text-xs text-muted-foreground">Common Schemas</p>
				<div class="flex flex-wrap gap-2">
					{#each schemas as schema (schema.hash)}
						<a
							href={resolve(`/servers/i/${schema.hash}`)}
							class="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
						>
							<span class="font-medium">{formatSchemaLabel(schema.name, schema.hash)}</span>
							{#if schema.providerCount}
								<span
									class="rounded-full bg-primary/10 px-1.5 py-0.5 font-sans text-xs font-semibold text-primary"
								>
									{schema.providerCount}
								</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
