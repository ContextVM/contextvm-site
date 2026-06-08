<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChildrenOrChild<CommandPrimitive.GroupHeadingProps> & {
		children: Snippet;
	} = $props();
</script>

<CommandPrimitive.GroupHeading
	bind:ref
	data-slot="command-group-heading"
	class={cn('px-2 pt-2 text-xs font-semibold text-muted-foreground', className)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.GroupHeading>
