<script lang="ts">
	import {
		relayState,
		setSelectedRelays,
		resetToDefaultRelays,
		useDevRelay,
		removeRelays
	} from '$lib/services/relay-store.svelte';
	import { relayPool } from '$lib/services/relay-pool';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import RelayItem from './RelayItem.svelte';

	let customRelayInput = $state('');

	const relays$ = relayPool.relays$;

	const selectedRelays = $derived(
		Array.from($relays$).filter(([url, _]) =>
			relayState.current.some((selectedUrl) => url.startsWith(selectedUrl))
		)
	);

	function addCustomRelay() {
		if (customRelayInput) {
			setSelectedRelays([...relayState.current, customRelayInput]);
			customRelayInput = '';
		}
	}

	function removeSelectedRelay(relays: string[]) {
		removeRelays(relays);
	}
</script>

<div class="relay-selector space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Relays</h2>
		<div class="flex gap-2">
			<Button onclick={resetToDefaultRelays} variant="outline" size="sm">Use Defaults</Button>
			<Button onclick={useDevRelay} variant="outline" size="sm">Use Dev</Button>
		</div>
	</div>

	<div class="space-y-3">
		<div class="flex gap-2">
			<Input
				bind:value={customRelayInput}
				placeholder="wss://your-relay.com"
				class="flex-1"
				onkeydown={(e) => e.key === 'Enter' && addCustomRelay()}
			/>
			<Button onclick={addCustomRelay} size="icon">
				<Plus class="h-4 w-4" />
			</Button>
		</div>
	</div>

	<div class="space-y-2">
		<p class="text-sm font-medium">Active Relays ({$relays$.size})</p>
		<div class="max-h-60 space-y-2 overflow-y-auto">
			{#if selectedRelays.length > 0}
				<p class="text-xs font-medium text-muted-foreground">Load Relays</p>
				{#each selectedRelays as relay (relay[0])}
					<RelayItem
						relay={relay[1]}
						isSelected={true}
						onRemove={(url) => {
							removeSelectedRelay([url]);
						}}
					/>
				{/each}
			{/if}

			{#if selectedRelays.length > 0}
				<div class="my-2 border-t"></div>
			{/if}

			{#if $relays$.size > 0}
				<p class="text-xs font-medium text-muted-foreground">Relay Pool</p>
				{#each $relays$ as relay (relay[0])}
					<RelayItem relay={relay[1]} isSelected={false} />
				{/each}
			{/if}
		</div>
	</div>
</div>
