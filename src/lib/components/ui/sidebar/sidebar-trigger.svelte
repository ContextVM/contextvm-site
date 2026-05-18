<script lang="ts">
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { useSidebar } from './context';

	type TriggerProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement>;

	let {
		ref = $bindable(null),
		class: className,
		type = 'button',
		children,
		...restProps
	}: TriggerProps = $props();

	const sidebar = useSidebar();
</script>

<button
	bind:this={ref}
	data-slot="sidebar-trigger"
	class={cn(
		'inline-flex size-9 shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium text-sidebar-foreground/70 transition-colors outline-none hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/40 disabled:pointer-events-none disabled:opacity-50',
		className
	)}
	{type}
	onclick={() => sidebar.toggle()}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<PanelLeftIcon class="h-4 w-4" />
		<span class="sr-only">Toggle sidebar</span>
	{/if}
</button>
