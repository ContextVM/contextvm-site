<script lang="ts">
	type LayoutType = 'article';

	let { layout = 'article' }: { layout?: LayoutType } = $props();
</script>

{#if layout === 'article'}
	<div
		class="group block h-full overflow-hidden rounded-lg border border-border bg-card transition-all"
	>
		<div class="grid h-full grid-rows-[auto_auto_1fr_auto]">
			<div class="aspect-video overflow-hidden bg-muted">
				<div class="h-full w-full animate-pulse bg-muted-foreground/20"></div>
			</div>
			<div class="space-y-4 p-6">
				<div class="flex items-center">
					<div class="h-4 w-20 animate-pulse rounded bg-muted-foreground/40"></div>
				</div>
				<div class="space-y-2">
					<div class="h-6 w-3/4 animate-pulse rounded bg-muted-foreground/40"></div>
					<div class="h-4 w-1/2 animate-pulse rounded bg-muted-foreground/30"></div>
				</div>
				<div class="space-y-2">
					<div class="h-4 w-full animate-pulse rounded bg-muted-foreground/30"></div>
					<div class="h-4 w-5/6 animate-pulse rounded bg-muted-foreground/30"></div>
					<div class="h-4 w-4/6 animate-pulse rounded bg-muted-foreground/30"></div>
				</div>
				<div class="flex items-center">
					<div class="h-4 w-24 animate-pulse rounded bg-muted-foreground/40"></div>
				</div>
			</div>
		</div>
	</div>
{/if}
