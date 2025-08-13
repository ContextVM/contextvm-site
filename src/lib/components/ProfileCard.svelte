<script lang="ts">
	import { addressLoader } from '$lib/services/loaders.svelte';
	import { metadataRelays } from '$lib/services/relay-pool';
	import { eventStore } from '../services/eventStore';
	import { ProfileModel } from 'applesauce-core/models';
	import Button from './ui/button/button.svelte';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { logout } from '$lib/services/accountManager.svelte';
	import { pubkeyToHexColor } from '$lib/utils';
	import { Metadata } from 'nostr-tools/kinds';

	let { pubkey }: { pubkey: string } = $props();

	const profile = eventStore.model(ProfileModel, pubkey);
	$effect(() => {
		if ($profile) return;
		const sub = addressLoader({
			kind: Metadata,
			pubkey,
			relays: metadataRelays
		}).subscribe();
		return () => sub.unsubscribe();
	});
</script>

{#snippet pfp(pubkey: string, pfp?: string)}
	{#if pfp}
		<img src={pfp} alt="pfp" class="my-4 h-8 w-8 rounded-full object-cover" />
	{:else}
		<div class="h-8 w-8 rounded-full" style="background-color: {pubkeyToHexColor(pubkey)}"></div>
	{/if}
{/snippet}

{#if $profile}
	<div class="flex items-center gap-2">
		{@render pfp(pubkey, $profile.picture)}
		<div>
			<span class="text-lg font-semibold"
				>{$profile.name || $profile.display_name || 'Unknown'}</span
			>
		</div>
		<Button variant="ghost" size="icon" onclick={logout} aria-label="Logout">
			<LogOut class="h-4 w-4" />
		</Button>
	</div>
{:else}
	<div class="flex items-center gap-2">
		{@render pfp(pubkey, undefined)}
		<div>
			<span class="text-lg font-semibold">{pubkey.slice(0, 6)}</span>
		</div>
		<Button variant="ghost" size="icon" onclick={logout} aria-label="Logout">
			<LogOut class="h-4 w-4" />
		</Button>
	</div>
{/if}
