<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { mcpClientService } from '$lib/services/mcpClient.svelte';
	import { eventStore } from '$lib/services/eventStore';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import { decodeServerIdentifier, resolveServerIdentifier } from '$lib/utils';
	import {
		useServerAnnouncement,
		useServerAnnouncements,
		matchesServerSearch
	} from '$lib/queries/serverQueries';
	import { serverKeys } from '$lib/queries/serverQueryKeys';
	import { createQuery } from '@tanstack/svelte-query';
	import { cn } from '$lib/utils.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import ServerIcon from '@lucide/svelte/icons/server';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import SearchIcon from '@lucide/svelte/icons/search';
	import PlugIcon from '@lucide/svelte/icons/plug';
	import UnplugIcon from '@lucide/svelte/icons/unplug';
	import LoaderIcon from '@lucide/svelte/icons/loader-circle';
	import XIcon from '@lucide/svelte/icons/x';

	const serversHref = $derived('/servers');

	// ── Connected servers ────────────────────────────────────────────────

	const connectedServers = $derived.by(() =>
		[...mcpClientService.clients.entries()].map(([pubkey, client]) => {
			const state = mcpClientService.getConnectionState(pubkey);
			return {
				pubkey,
				name: client.getServerVersion()?.name ?? 'Unknown server',
				state
			};
		})
	);

	const connectedPubkeys = $derived(new Set(connectedServers.map((s) => s.pubkey)));

	// ── Available servers from Nostr ─────────────────────────────────────

	// Trigger the loader so events flow into the event store and track loading state
	const serverAnnouncementsQuery = useServerAnnouncements();
	// Reactive model that parses SERVER_ANNOUNCEMENT_KIND events from the event store
	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);

	let searchTerm = $state('');
	let connectingPubkey = $state<string | null>(null);

	// Identifier resolution (NIP-05, npub, nprofile, hex, shortname)
	const resolvedSearchIdentifierQuery = $derived.by(() => {
		const trimmed = searchTerm.trim();
		return createQuery({
			queryKey: serverKeys.searchIdentifier(trimmed, page.url.hostname),
			queryFn: () => resolveServerIdentifier(trimmed, page.url.hostname),
			enabled: trimmed.length > 0
		});
	});

	const decodedSearchIdentifier = $derived(
		$resolvedSearchIdentifierQuery.data ?? decodeServerIdentifier(searchTerm)
	);

	const filteredAnnouncements = $derived.by(() => {
		const announcements = $serverAnnouncements;
		if (!announcements) return [];

		if (!searchTerm.trim()) return announcements.slice(0, 50);

		const term = searchTerm.trim();
		return announcements.filter((s) => matchesServerSearch(s, term));
	});

	// Exclude already-connected servers from the available list
	const availableServers = $derived(
		filteredAnnouncements.filter((s) => !connectedPubkeys.has(s.pubkey))
	);

	// Resolved server that is not in announcements (e.g. NIP-05 resolution)
	const searchServerQuery = $derived(
		decodedSearchIdentifier
			? useServerAnnouncement(decodedSearchIdentifier.pubkey, decodedSearchIdentifier.relayHints)
			: null
	);

	const resolvedServer = $derived($searchServerQuery?.data?.server ?? null);
	const showResolvedServer = $derived(
		resolvedServer !== null &&
			!connectedPubkeys.has(resolvedServer.pubkey) &&
			!filteredAnnouncements.some((s) => s.pubkey === resolvedServer.pubkey)
	);

	// ── Actions ──────────────────────────────────────────────────────────

	async function connectToServer(identifier: string) {
		connectingPubkey = identifier;
		try {
			await mcpClientService.getClient(identifier);
		} catch (e) {
			console.error('Failed to connect to server:', e);
		} finally {
			connectingPubkey = null;
		}
	}

	async function disconnectServer(identifier: string) {
		await mcpClientService.disconnect(identifier);
	}
</script>

<div class="flex h-full flex-col">
	<!-- ═══ Connected Servers ═══ -->
	<div class="shrink-0 px-2 pt-2">
		<p class="text-xs font-medium text-sidebar-foreground/70">Connected</p>
	</div>

	<div class="shrink-0 space-y-0.5 pb-1">
		{#if connectedServers.length === 0}
			<div class="mx-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/40 p-3">
				<p class="text-xs leading-5 text-sidebar-foreground/70">
					No servers connected. Search below to find and connect to servers.
				</p>
				<a
					href={resolve(serversHref)}
					class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-sidebar-primary hover:underline"
				>
					Browse all servers
					<ExternalLinkIcon class="h-3 w-3" />
				</a>
			</div>
		{:else}
			{#each connectedServers as server (server.pubkey)}
				<div
					class="group mx-2 flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
				>
					<a href={resolve(`/s/${server.pubkey}`)} class="flex min-w-0 flex-1 items-center gap-2">
						<span
							class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground"
						>
							<ServerIcon class="h-3.5 w-3.5" />
						</span>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-xs font-medium">{server.name}</span>
							<span class="block truncate font-mono text-[10px] text-sidebar-foreground/50">
								{server.pubkey.slice(0, 12)}...
							</span>
						</span>
					</a>
					<span
						class={cn(
							'h-2 w-2 shrink-0 rounded-full',
							server.state.connected
								? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
								: server.state.loading
									? 'bg-amber-500'
									: 'bg-destructive'
						)}
						aria-label={server.state.connected ? 'Connected' : 'Disconnected'}
					></span>
					<button
						class="ml-0.5 shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-sidebar-accent hover:text-destructive"
						aria-label="Disconnect"
						onclick={() => disconnectServer(server.pubkey)}
					>
						<UnplugIcon class="h-3.5 w-3.5" />
					</button>
				</div>
			{/each}
		{/if}
	</div>

	<!-- ═══ Divider ═══ -->
	<div class="mx-3 my-2 shrink-0 border-t border-sidebar-border/50"></div>

	<!-- ═══ Search Bar ═══ -->
	<div class="shrink-0 px-2 pb-2">
		<div class="relative">
			<SearchIcon
				class="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				bind:value={searchTerm}
				type="text"
				placeholder="Search or enter pubkey / identifier…"
				class="h-8 pr-8 pl-8 text-xs"
			/>
			{#if searchTerm}
				<button
					class="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
					aria-label="Clear search"
					onclick={() => (searchTerm = '')}
				>
					<XIcon class="h-3 w-3" />
				</button>
			{/if}
		</div>
	</div>

	<!-- ═══ Available Servers ═══ -->
	<div class="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
		{#if $serverAnnouncementsQuery.isFetching && !$serverAnnouncements?.length}
			<div class="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
				<LoaderIcon class="h-3.5 w-3.5 animate-spin" />
				Loading servers…
			</div>
		{:else if !$serverAnnouncements?.length}
			<div class="py-4 text-center text-xs text-muted-foreground">
				No servers found. Check back later for server announcements.
			</div>
		{:else}
			{#if searchTerm && availableServers.length > 0}
				<p class="mb-1 text-[11px] font-medium text-sidebar-foreground/60">
					{availableServers.length} result{availableServers.length !== 1 ? 's' : ''}
				</p>
			{/if}

			<div class="space-y-0.5">
				{#each availableServers.slice(0, 30) as server (server.pubkey)}
					{@const isConnecting = connectingPubkey === server.pubkey}
					<div
						class="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent/60"
					>
						<a href={resolve(`/s/${server.pubkey}`)} class="flex min-w-0 flex-1 items-center gap-2">
							<span
								class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground"
							>
								<ServerIcon class="h-3.5 w-3.5" />
							</span>
							<span class="min-w-0 flex-1">
								<span class="block truncate text-xs font-medium">{server.name}</span>
								<span class="block truncate font-mono text-[10px] text-sidebar-foreground/50">
									{server.pubkey.slice(0, 12)}...
								</span>
							</span>
						</a>
						<Button
							variant="outline"
							size="sm"
							class="h-7 shrink-0 gap-1 px-2 text-[11px]"
							disabled={isConnecting}
							onclick={() => connectToServer(server.pubkey)}
						>
							{#if isConnecting}
								<LoaderIcon class="h-3 w-3 animate-spin" />
							{:else}
								<PlugIcon class="h-3 w-3" />
							{/if}
							Connect
						</Button>
					</div>
				{/each}
			</div>

			<!-- Resolved identifier result (not in announcements) -->
			{#if showResolvedServer && decodedSearchIdentifier}
				{@const isConnecting = connectingPubkey === resolvedServer?.pubkey}
				<div class="mt-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 p-3">
					<p class="mb-2 text-[11px] text-sidebar-foreground/70">
						Resolved from identifier
						<span class="font-mono">{decodedSearchIdentifier.original}</span>
					</p>
					<div class="flex items-center gap-2">
						<span
							class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground"
						>
							<ServerIcon class="h-3.5 w-3.5" />
						</span>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-xs font-medium">
								{resolvedServer!.name}
							</span>
							<span class="block truncate font-mono text-[10px] text-sidebar-foreground/50">
								{resolvedServer!.pubkey.slice(0, 12)}...
							</span>
						</span>
						<Button
							variant="outline"
							size="sm"
							class="h-7 shrink-0 gap-1 px-2 text-[11px]"
							disabled={isConnecting}
							onclick={() => connectToServer(resolvedServer!.pubkey)}
						>
							{#if isConnecting}
								<LoaderIcon class="h-3 w-3 animate-spin" />
							{:else}
								<PlugIcon class="h-3 w-3" />
							{/if}
							Connect
						</Button>
					</div>
				</div>
			{:else if decodedSearchIdentifier && !resolvedServer && !$resolvedSearchIdentifierQuery.isLoading && searchTerm && availableServers.length === 0}
				{@const isConnecting = connectingPubkey === decodedSearchIdentifier.pubkey}
				<!-- Valid identifier but no server data yet — offer direct connection -->
				<div class="mt-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 p-3">
					<p class="mb-2 text-[11px] text-sidebar-foreground/70">
						Connect directly to
						<span class="font-mono">{decodedSearchIdentifier.pubkey.slice(0, 12)}...</span>
					</p>
					<Button
						variant="outline"
						size="sm"
						class="h-7 w-full gap-1 text-[11px]"
						disabled={isConnecting}
						onclick={() => connectToServer(decodedSearchIdentifier!.original)}
					>
						{#if isConnecting}
							<LoaderIcon class="h-3 w-3 animate-spin" />
						{:else}
							<PlugIcon class="h-3 w-3" />
						{/if}
						Connect
					</Button>
				</div>
			{:else if searchTerm && availableServers.length === 0 && !showResolvedServer && !decodedSearchIdentifier}
				<p class="py-4 text-center text-xs text-muted-foreground">
					No servers match "{searchTerm}"
				</p>
			{/if}
		{/if}
	</div>
</div>
