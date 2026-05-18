<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { useSidebar } from './context';

	type SidebarSide = 'left' | 'right';
	type SidebarVariant = 'sidebar' | 'floating' | 'inset';
	type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';

	let {
		ref = $bindable(null),
		side = 'left',
		variant = 'sidebar',
		collapsible = 'offcanvas',
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		side?: SidebarSide;
		variant?: SidebarVariant;
		collapsible?: SidebarCollapsible;
	} = $props();

	const sidebar = useSidebar();
</script>

{#if sidebar.isMobile && sidebar.openMobile}
	<button
		class="fixed inset-0 z-40 bg-black/50"
		aria-label="Close sidebar"
		onclick={() => sidebar.setOpenMobile(false)}
	></button>
{/if}

<aside
	bind:this={ref}
	data-sidebar
	data-state={sidebar.state}
	data-collapsible={collapsible}
	data-variant={variant}
	data-side={side}
	class={cn(
		'group/sidebar z-50 flex flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)] transition-[width,transform] duration-200 ease-out',
		side === 'left' ? 'border-r border-sidebar-border' : 'border-l border-sidebar-border',
		side === 'left' ? 'left-0' : 'right-0',
		sidebar.isMobile ? 'fixed inset-y-0' : 'sticky top-0 h-screen',
		sidebar.isMobile
			? sidebar.openMobile
				? 'translate-x-0 shadow-2xl'
				: side === 'left'
					? '-translate-x-full'
					: 'translate-x-full'
			: 'translate-x-0',
		sidebar.isMobile
			? 'w-[var(--sidebar-width-mobile)]'
			: collapsible === 'icon' && sidebar.state === 'collapsed'
				? 'w-14'
				: 'w-[var(--sidebar-width)]',
		variant === 'floating' ? 'm-3 rounded-xl border border-sidebar-border shadow-lg' : '',
		variant === 'inset' ? 'm-3 rounded-xl border border-sidebar-border' : '',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</aside>
