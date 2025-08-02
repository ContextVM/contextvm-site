<script lang="ts">
	import { page } from '$app/state';
	import { eventStore } from '$lib/services/eventStore';
	import { serverAnnouncementByPubkeyLoader } from '$lib/services/loaders';
	import {
		ServerAnnouncementModel,
		type ServerAnnouncement
	} from '$lib/models/serverAnnouncements';
	import { formatUnixTimestamp } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { Collapsible } from 'bits-ui';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { InitializeResult } from '@modelcontextprotocol/sdk/types.js';

	const pubkey = page.params.pubkey ?? '';

	const server = eventStore.model(ServerAnnouncementModel, pubkey);

	$effect(() => {
		if ($server) return;
		const sub = serverAnnouncementByPubkeyLoader(pubkey).subscribe();
		return () => {
			sub.unsubscribe();
		};
	});

	function hasCapability(server: InitializeResult, capability: string): boolean {
		return capability in server.capabilities;
	}

	function getAvailableCapabilities(server: ServerAnnouncement): string[] {
		return ['tools', 'resources', 'prompts'].filter((capability) =>
			hasCapability(server.capabilities, capability)
		);
	}
</script>

{#if $server}
	{@const publishedAt = formatUnixTimestamp($server.created_at, true)}
	{@const availableCapabilities = getAvailableCapabilities($server)}
	<article class="container mx-auto max-w-6xl px-4 py-6 sm:py-8 md:py-12">
		<!-- Back to servers link -->
		<button
			onclick={() => goto('/')}
			class="mb-4 flex items-center text-sm font-medium text-muted-foreground hover:text-primary sm:mb-6"
		>
			← Back to servers
		</button>

		<!-- Server header with picture -->
		{#if $server.picture}
			<div class="mb-6 aspect-video overflow-hidden rounded-lg bg-muted sm:mb-8">
				<img src={$server.picture} alt={$server.name} class="h-full w-full object-cover" />
			</div>
		{/if}

		<!-- Two-column layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Left column (2/3 width) -->
			<div class="lg:col-span-2">
				<!-- Server name and website -->
				<div class="mb-6">
					<h1
						class="mb-3 text-2xl leading-tight font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl"
					>
						{$server.name}
					</h1>
					{#if $server.website}
						<a
							href={$server.website}
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-primary hover:underline"
						>
							{$server.website}
						</a>
					{/if}
				</div>

				<!-- Tabs for server information -->
				<Tabs.Root value="about">
					<Tabs.List class="grid w-full grid-cols-4">
						<Tabs.Trigger value="about">About</Tabs.Trigger>
						{#each availableCapabilities as capability (capability)}
							<Tabs.Trigger value={capability}>{capability}</Tabs.Trigger>
						{/each}
					</Tabs.List>

					<!-- About tab -->
					<Tabs.Content value="about" class="mt-4">
						<Card.Root>
							<Card.Content class="pt-6">
								{#if $server.about}
									<p class="text-sm">{$server.about}</p>
								{:else}
									<p class="text-sm text-muted-foreground">
										No description available for this server.
									</p>
								{/if}
							</Card.Content>
						</Card.Root>
					</Tabs.Content>

					<!-- Dynamic capability tabs -->
					{#each availableCapabilities as capability (capability)}
						<Tabs.Content value={capability} class="mt-4">
							<Card.Root>
								<Card.Content class="pt-6">
									<p class="text-sm">This server has {capability}.</p>
								</Card.Content>
							</Card.Root>
						</Tabs.Content>
					{/each}
				</Tabs.Root>
			</div>

			<!-- Right column (1/3 width) -->
			<div class="lg:col-span-1">
				<!-- Server metadata -->
				<Card.Root class="mb-6">
					<Card.Header>
						<Card.Title>Server Information</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
							<div>
								<p class="text-sm font-medium text-muted-foreground">Published</p>
								<time datetime={new Date($server.created_at * 1000).toISOString()} class="text-sm">
									{publishedAt}
								</time>
							</div>
							<div>
								<p class="text-sm font-medium text-muted-foreground">Version</p>
								<p class="text-sm">{$server.capabilities.serverInfo?.version || 'Unknown'}</p>
							</div>
							<div>
								<p class="text-sm font-medium text-muted-foreground">Protocol Version</p>
								<p class="text-sm">{$server.capabilities.protocolVersion || 'Unknown'}</p>
							</div>
							<div>
								<p class="text-sm font-medium text-muted-foreground">Public Key</p>
								<p class="font-mono text-xs break-all">{$server.pubkey}</p>
							</div>
							{#if $server.supportsEncryption}
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
			</div>
		</div>

		<!-- Raw data section -->
		<div class="mt-8">
			<Collapsible.Root>
				<Collapsible.Trigger
					class="flex w-full items-center justify-between pb-4 text-left text-sm font-medium text-muted-foreground hover:text-primary"
				>
					<h2 class="mb-4 text-xl font-semibold">Raw Server Data</h2>
					<ChevronsUpDownIcon />
				</Collapsible.Trigger>
				<Collapsible.Content>
					<pre class="overflow-x-auto rounded bg-muted p-4 text-xs">{JSON.stringify(
							$server.capabilities,
							null,
							2
						)}</pre>
				</Collapsible.Content>
			</Collapsible.Root>
		</div>
	</article>
{:else}
	<div class="container mx-auto px-4 py-16 text-center">
		<h1 class="mb-4 text-2xl font-bold">Server not found</h1>
		<p class="mb-6 text-muted-foreground">
			The server you're looking for doesn't exist or couldn't be loaded.
		</p>
		<button
			onclick={() => goto('/')}
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			Back to servers
		</button>
	</div>
{/if}
