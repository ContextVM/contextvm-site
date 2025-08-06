<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import X from '@lucide/svelte/icons/x';
	import Wifi from '@lucide/svelte/icons/wifi';
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import Loader from '@lucide/svelte/icons/loader';
	import type { Relay } from 'applesauce-relay';

	let {
		relay,
		onRemove,
		isSelected = false
	}: {
		relay: Relay;
		onRemove?: (url: string) => void;
		isSelected?: boolean;
	} = $props();

	const relayConnected = relay.connected$;
</script>

<div
	class="flex items-center justify-between rounded-md border p-3 {isSelected
		? 'border-primary/30 bg-primary/5'
		: ''}"
>
	<div class="flex items-center gap-2">
		{#if $relayConnected}
			<Wifi class="h-4 w-4 text-green-500" />
		{:else if !$relayConnected && relay.attempts$.value > 0}
			<Loader class="h-4 w-4 animate-spin text-yellow-500" />
		{:else}
			<WifiOff class="h-4 w-4 text-red-500" />
		{/if}
		<span class="max-w-[200px] truncate text-sm">{relay.url}</span>
		{#if isSelected}
			<span class="rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">Selected</span>
		{/if}
	</div>
	{#if isSelected && onRemove}
		<Button onclick={() => onRemove(relay.url)} variant="ghost" size="icon" class="h-6 w-6">
			<X class="h-3 w-3" />
		</Button>
	{/if}
</div>
