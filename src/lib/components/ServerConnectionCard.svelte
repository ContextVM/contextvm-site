<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { ServerAnnouncement } from '$lib/models/serverAnnouncements';
	import { slugify, type ServerIdentity } from '$lib/utils';
	import { copyToClipboard } from '$lib/utils';
	import CopyIcon from '@lucide/svelte/icons/copy';

	let {
		server,
		serverIdentifier = server.pubkey,
		identity
	}: {
		server: ServerAnnouncement;
		serverIdentifier?: string;
		identity?: ServerIdentity;
	} = $props();

	const preferredIdentifier = $derived(
		identity?.hasPublishedRelayList ? identity.nprofile : (identity?.npub ?? serverIdentifier)
	);
	const identifierLabel = $derived(identity?.hasPublishedRelayList ? 'nprofile' : 'npub');

	const rawCommand = $derived(`npx cvmi use ${preferredIdentifier}`);

	const configJson = $derived(`{
	"mcpServers": {
		"${slugify(server.name) || 'contextvm-server'}": {
		"command": "npx",
		"args": ["cvmi", "use", "${preferredIdentifier}"]
		}
	}
}`);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Connection Information</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			<div>
				<p class="mb-4 text-sm text-muted-foreground">
					Connecting to this server allows you to use it through an MCP host like Claude, Goose, or
					others. For hosts that don't support nostr transport directly, use
					<a href="https://www.npmjs.com/package/cvmi" target="_blank" class="hover:underline">
						<strong>cvmi</strong>
					</a> first.
				</p>
				<p class="text-xs text-muted-foreground">
					These examples prefer the <span class="font-mono">{identifierLabel}</span> identity so relay
					hints are preserved when a published relay list is available.
				</p>
			</div>

			<Tabs.Root value="raw" class="w-full">
				<Tabs.List class="grid w-full grid-cols-2">
					<Tabs.Trigger value="raw">Raw Command</Tabs.Trigger>
					<Tabs.Trigger value="config">Config JSON</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="raw" class="mt-4">
					<div class="relative rounded-lg bg-muted p-4">
						<div class="absolute top-2 right-2">
							<button
								onclick={() => copyToClipboard(rawCommand)}
								class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
								aria-label="Copy raw command"
							>
								<CopyIcon class="h-4 w-4" />
							</button>
						</div>
						<pre class="overflow-x-auto pr-10 text-sm"><code>{rawCommand}</code></pre>
						<p class="mt-2 text-xs text-muted-foreground">
							This command exposes the remote server locally over stdio using
							<span class="font-mono">cvmi use</span>.
						</p>
					</div>
				</Tabs.Content>

				<Tabs.Content value="config" class="mt-4">
					<div class="relative rounded-lg bg-muted p-4">
						<div class="absolute top-2 right-2">
							<button
								onclick={() => copyToClipboard(configJson)}
								class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
								aria-label="Copy config JSON"
							>
								<CopyIcon class="h-4 w-4" />
							</button>
						</div>
						<pre class="overflow-x-auto pr-10 text-sm"><code>{configJson}</code></pre>
						<p class="mt-2 text-xs text-muted-foreground">
							Add this configuration to your MCP host config file. For more configuration details,
							visit the <a
								href="https://github.com/ContextVM/cvmi"
								target="_blank"
								class="hover:underline"
							>
								cvmi GitHub repository
							</a>.
						</p>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</Card.Content>
</Card.Root>
