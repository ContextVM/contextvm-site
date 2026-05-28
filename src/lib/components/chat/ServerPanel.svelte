<script lang="ts">
	import { resolve } from '$app/paths';
	import { mcpClientService } from '$lib/services/mcpClient.svelte';
	import { cn } from '$lib/utils.js';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import ServerIcon from '@lucide/svelte/icons/server';

	const serversHref = $derived('/servers');

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
</script>

<div class="space-y-3 py-2">
	<div class="px-2">
		<p class="text-xs font-medium text-sidebar-foreground/70">Connected servers</p>
	</div>

	{#if connectedServers.length === 0}
		<div class="mx-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/40 p-3">
			<p class="text-xs leading-5 text-sidebar-foreground/70">
				No servers connected. Connect an MCP server from the servers page.
			</p>
			<a
				href={resolve(serversHref)}
				class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-sidebar-primary hover:underline"
			>
				Open servers
				<ExternalLinkIcon class="h-3 w-3" />
			</a>
		</div>
	{:else}
		<div class="space-y-1">
			{#each connectedServers as server (server.pubkey)}
				<a
					href={resolve(`/s/${server.pubkey}`)}
					class="mx-2 flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
				>
					<span
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground"
					>
						<ServerIcon class="h-4 w-4" />
					</span>
					<span class="min-w-0 flex-1">
						<span class="block truncate text-xs font-medium">{server.name}</span>
						<span class="block truncate font-mono text-[10px] text-sidebar-foreground/50">
							{server.pubkey.slice(0, 12)}...
						</span>
					</span>
					<span
						class={cn(
							'h-2.5 w-2.5 shrink-0 rounded-full',
							server.state.connected
								? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]'
								: server.state.loading
									? 'bg-amber-500'
									: 'bg-destructive'
						)}
						aria-label={server.state.connected ? 'Connected' : 'Disconnected'}
					></span>
				</a>
			{/each}
		</div>
	{/if}
</div>
