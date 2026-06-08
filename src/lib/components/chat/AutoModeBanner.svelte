<script lang="ts">
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';

	let { usingDefaultKey = false }: { usingDefaultKey?: boolean } = $props();
</script>

<div
	class="flex flex-col gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/45 px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
>
	<div class="flex min-w-0 items-start gap-2.5">
		<div
			class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background/70 text-primary"
		>
			<SparklesIcon class="h-4 w-4" />
		</div>
		<div class="min-w-0">
			<p class="font-medium text-foreground">OpenRouter auto mode</p>
			<p class="text-xs leading-5 text-muted-foreground">
				Free models rotate automatically. Add your own key for steadier limits.
			</p>
		</div>
	</div>
	{#if usingDefaultKey}
		<div
			class="inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground"
		>
			<KeyRoundIcon class="h-3.5 w-3.5" />
			Bundled public key
		</div>
	{/if}
</div>
