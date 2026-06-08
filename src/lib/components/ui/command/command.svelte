<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChildrenOrChild<CommandPrimitive.RootProps> & {
		children: Snippet;
	} = $props();
</script>

<CommandPrimitive.Root
	bind:ref
	data-slot="command"
	class={cn(
		'flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Root>
