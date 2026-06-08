<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="sidebar-group-label"
	class={cn(
		'flex items-center gap-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
