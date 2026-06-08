<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChildrenOrChild<CommandPrimitive.ViewportProps> & {
		children: Snippet;
	} = $props();
</script>

<CommandPrimitive.Viewport
	bind:ref
	data-slot="command-viewport"
	class={cn('max-h-72 overflow-y-auto p-1', className)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Viewport>
