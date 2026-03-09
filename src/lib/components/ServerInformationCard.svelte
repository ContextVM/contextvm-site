<script lang="ts">
	import {
		formatUnixTimestamp,
		pubkeyToHexColor,
		copyToClipboard,
		type ServerIdentity
	} from '$lib/utils';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { ServerAnnouncement } from '$lib/models/serverAnnouncements';
	import { mcpClientService } from '$lib/services/mcpClient.svelte';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { parsePmiTagsFromEvent } from '$lib/services/payments/cep8-tags';

	let { server, identity }: { server: ServerAnnouncement; identity?: ServerIdentity } = $props();
	let activeIdentityTab = $state<'npub' | 'hex' | 'nprofile'>('npub');

	const publishedAt = $derived(formatUnixTimestamp(server.created_at, true));

	const initializeEvent = $derived(mcpClientService.getServerInitializeEvent(server.pubkey));
	const serverPmis = $derived(parsePmiTagsFromEvent(initializeEvent));
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-2">
			<Card.Title>Server Information</Card.Title>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			<div>
				<p class="text-sm font-medium text-muted-foreground">Published</p>
				{publishedAt}
			</div>
			<div>
				<p class="text-sm font-medium text-muted-foreground">Version</p>
				<p class="text-sm">{server.capabilities.serverInfo?.version || 'Unknown'}</p>
			</div>
			<div>
				<div class=" inline-flex items-center gap-2">
					<p class="text-sm font-medium text-muted-foreground">Identity</p>
					<div
						class="h-2 w-2 rounded-full"
						style="background-color: {pubkeyToHexColor(server.pubkey)}"
					></div>
				</div>
				<div class="mt-2 space-y-3">
					<Tabs.Root bind:value={activeIdentityTab} class="w-full">
						<Tabs.List class="grid w-full grid-cols-3">
							<Tabs.Trigger value="npub">npub</Tabs.Trigger>
							<Tabs.Trigger value="nprofile" disabled={!identity}>nprofile</Tabs.Trigger>
							<Tabs.Trigger value="hex">hex</Tabs.Trigger>
						</Tabs.List>

						<Tabs.Content value="npub" class="mt-3">
							<div class="rounded-lg bg-muted/40 p-3">
								<div class="flex items-start justify-between gap-2">
									<div class="space-y-1">
										<p class="text-xs font-medium text-muted-foreground">npub</p>
									</div>
									<button
										onclick={() => copyToClipboard(identity?.npub ?? server.pubkey)}
										class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
										aria-label="Copy npub"
									>
										<CopyIcon class="h-4 w-4" />
									</button>
								</div>
								<p class="mt-3 font-mono text-xs break-all">{identity?.npub ?? server.pubkey}</p>
							</div>
						</Tabs.Content>

						<Tabs.Content value="hex" class="mt-3">
							<div class="rounded-lg bg-muted/40 p-3">
								<div class="flex items-start justify-between gap-2">
									<div class="space-y-1">
										<p class="text-xs font-medium text-muted-foreground">Hex pubkey</p>
									</div>
									<button
										onclick={() => copyToClipboard(server.pubkey)}
										class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
										aria-label="Copy public key"
									>
										<CopyIcon class="h-4 w-4" />
									</button>
								</div>
								<p class="mt-3 font-mono text-xs break-all">{server.pubkey}</p>
							</div>
						</Tabs.Content>

						{#if identity}
							<Tabs.Content value="nprofile" class="mt-3">
								<div class="rounded-lg bg-muted/40 p-3">
									<div class="flex items-start justify-between gap-2">
										<div class="space-y-1">
											<p class="text-xs font-medium text-muted-foreground">nprofile</p>
										</div>
										<button
											onclick={() => copyToClipboard(identity.nprofile)}
											class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
											aria-label="Copy nprofile"
										>
											<CopyIcon class="h-4 w-4" />
										</button>
									</div>
									<p class="mt-3 font-mono text-xs break-all">{identity.nprofile}</p>
									{#if identity.relayHints.length > 0}
										<p class="mt-2 text-xs text-muted-foreground">
											Relay hints from {identity.relaySource === 'kind10002'
												? 'published relay list'
												: identity.relaySource === 'announcement'
													? 'announcement discovery'
													: identity.relaySource === 'connection'
														? 'connection events'
														: 'selected relays'}
										</p>
									{/if}
								</div>
							</Tabs.Content>
						{/if}
					</Tabs.Root>
				</div>
			</div>
			{#if server.supportsEncryption}
				<div>
					<p class="text-sm font-medium text-muted-foreground">Encryption</p>
					<span
						class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
					>
						Supported
					</span>
				</div>
			{/if}

			{#if serverPmis.length > 0}
				<div>
					<p class="text-sm font-medium text-muted-foreground">Payment methods (PMIs)</p>
					<div class="mt-1 flex flex-wrap gap-2">
						{#each serverPmis as pmi (pmi)}
							<span
								class="rounded-full bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground"
							>
								{pmi}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
