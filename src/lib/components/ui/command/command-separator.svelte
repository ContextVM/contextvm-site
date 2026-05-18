<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<CommandPrimitive.SeparatorProps> = $props();
</script>

<CommandPrimitive.Separator
	bind:ref
	data-slot="command-separator"
	class={cn('my-1 h-px bg-border', className)}
	{...restProps}
/>
