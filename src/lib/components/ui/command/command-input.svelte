<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<CommandPrimitive.InputProps> = $props();
</script>

<CommandPrimitive.Input
	bind:ref
	data-slot="command-input"
	class={cn(
		'h-10 w-full border-b border-border bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus:outline-none',
		className
	)}
	{...restProps}
/>
