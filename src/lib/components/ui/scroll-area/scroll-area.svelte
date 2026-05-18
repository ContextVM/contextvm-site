<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="scroll-area"
	class={cn('relative h-full w-full', className)}
	{...restProps}
>
	<div class="h-full w-full overflow-auto">{@render children?.()}</div>
</div>
