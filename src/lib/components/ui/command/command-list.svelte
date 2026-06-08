<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChildrenOrChild<CommandPrimitive.ListProps> & {
		children: Snippet;
	} = $props();
</script>

<CommandPrimitive.List
	bind:ref
	data-slot="command-list"
	class={cn('max-h-72 overflow-hidden', className)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.List>
