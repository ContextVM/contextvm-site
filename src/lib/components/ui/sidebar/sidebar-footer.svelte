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
	data-slot="sidebar-footer"
	class={cn(
		'mt-auto border-t border-sidebar-border bg-[var(--sidebar)]/95 px-3 py-3 backdrop-blur',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
