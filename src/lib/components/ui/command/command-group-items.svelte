<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChildrenOrChild<CommandPrimitive.GroupItemsProps> & {
		children: Snippet;
	} = $props();
</script>

<CommandPrimitive.GroupItems
	bind:ref
	data-slot="command-group-items"
	class={cn('space-y-1', className)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.GroupItems>
