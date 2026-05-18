<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	type MenuButtonProps = WithElementRef<HTMLButtonAttributes> & {
		isActive?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		isActive = false,
		children,
		...restProps
	}: MenuButtonProps = $props();
</script>

<button
	bind:this={ref}
	data-slot="sidebar-menu-button"
	data-active={isActive}
	class={cn(
		'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring/40 focus-visible:outline-none',
		isActive
			? 'bg-sidebar-accent text-sidebar-accent-foreground'
			: 'text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</button>
