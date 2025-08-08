<script lang="ts">
	import { addressLoader } from '$lib/services/loaders.svelte';
	import { metadataRelays } from '$lib/services/relay-pool';
	import { eventStore } from '../services/eventStore';
	import { ProfileModel } from 'applesauce-core/models';
	import Button from './ui/button/button.svelte';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { logout } from '$lib/services/accountManager.svelte';

	let { pubkey }: { pubkey: string } = $props();

	const profile = eventStore.model(ProfileModel, pubkey);
	$effect(() => {
		if ($profile) return;
		const sub = addressLoader({
			kind: 0,
			pubkey,
			relays: metadataRelays
		}).subscribe();
		return () => sub.unsubscribe();
	});
</script>

{#if $profile}
	<div class="flex items-center gap-2">
		<img
			src={$profile.picture || `https://robohash.org/${pubkey}.png`}
			alt="pfp"
			class="my-4 h-8 w-8 rounded-full object-cover"
		/>
		<div>
			<span class="text-lg font-semibold"
				>{$profile.name || $profile.display_name || 'Unknown'}</span
			>
		</div>
		<Button variant="ghost" size="icon" onclick={logout} aria-label="Logout">
			<LogOut class="h-4 w-4" />
		</Button>
	</div>
{/if}
