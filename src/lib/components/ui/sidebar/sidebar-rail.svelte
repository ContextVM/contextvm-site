<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { useSidebar } from './context';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLButtonElement>> = $props();

	const sidebar = useSidebar();
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="sidebar-rail"
	class={cn(
		'absolute inset-y-0 right-0 hidden w-2 cursor-col-resize bg-transparent transition-colors group-data-[state=collapsed]/sidebar:block hover:bg-sidebar-accent/40',
		className
	)}
	onclick={() => sidebar.toggle()}
	{...restProps}
>
	{@render children?.()}
</button>
