<script lang="ts">
	import { formatUnixTimestamp, pubkeyToHexColor } from '$lib/utils';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { ServerAnnouncement } from '$lib/models/serverAnnouncements';
	import { mcpClientService } from '$lib/services/mcpClient.svelte';
	import {
		parseCapTagsFromEvent,
		parsePmiTagsFromEvent,
		toParsedCapTags,
		formatCapTagPrice
	} from '$lib/services/payments/cep8-tags';

	let { server }: { server: ServerAnnouncement } = $props();

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
					<p class="text-sm font-medium text-muted-foreground">Public Key</p>
					<div
						class="h-2 w-2 rounded-full"
						style="background-color: {pubkeyToHexColor(server.pubkey)}"
					></div>
				</div>
				<p class="font-mono text-xs break-all">{server.pubkey}</p>
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
