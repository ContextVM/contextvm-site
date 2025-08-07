<script lang="ts">
	import { formatUnixTimestamp, pubkeyToHexColor } from '$lib/utils';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { ServerAnnouncement } from '$lib/models/serverAnnouncements';

	let { server }: { server: ServerAnnouncement } = $props();

	const publishedAt = formatUnixTimestamp(server.created_at, true);
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
		</div>
	</Card.Content>
</Card.Root>
