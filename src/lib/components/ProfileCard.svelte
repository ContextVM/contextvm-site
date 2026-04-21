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

	let {
		pubkey,
		showLogout = true,
		showBanner = false,
		showAbout = false
	}: {
		pubkey: string;
		showLogout?: boolean;
		showBanner?: boolean;
		showAbout?: boolean;
	} = $props();

	const profile = $derived(eventStore.model(ProfileModel, pubkey));
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

<div class="overflow-hidden rounded-lg border border-border bg-card">
	{#if showBanner && $profile?.banner}
		<img src={$profile.banner} alt="" class="h-32 w-full object-cover" />
	{/if}

	<div class="p-4">
		{#if $profile}
			<div class="flex items-center gap-2">
				{@render pfp(pubkey, $profile.picture)}
				<div class="min-w-0 flex-1">
					<span class="block truncate text-lg font-semibold"
						>{$profile.name || $profile.display_name || 'Unknown'}</span
					>
					{#if $profile.nip05}
						<p class="text-xs text-muted-foreground">{$profile.nip05}</p>
					{/if}
				</div>
				{#if showLogout}
					<Button variant="ghost" size="icon" onclick={logout} aria-label="Logout">
						<LogOut class="h-4 w-4" />
					</Button>
				{/if}
			</div>

			{#if showAbout}
				<p class="mt-4 text-sm whitespace-pre-wrap text-muted-foreground">
					{$profile.about || 'No profile description available.'}
				</p>
			{/if}
		{:else}
			<div class="flex items-center gap-2">
				{@render pfp(pubkey, undefined)}
				<div class="min-w-0 flex-1">
					<span class="block truncate text-lg font-semibold">{pubkey.slice(0, 6)}</span>
				</div>
				{#if showLogout}
					<Button variant="ghost" size="icon" onclick={logout} aria-label="Logout">
						<LogOut class="h-4 w-4" />
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>
