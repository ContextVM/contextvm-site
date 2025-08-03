<script lang="ts">
	import { page } from '$app/state';
	import { eventStore } from '$lib/services/eventStore';
	import { serverAnnouncementByPubkeyLoader } from '$lib/services/loaders';
	import {
		parseServerAnnouncement,
		ServerAnnouncementModel,
		type ServerAnnouncement
	} from '$lib/models/serverAnnouncements';
	import { formatUnixTimestamp } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { Collapsible } from 'bits-ui';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import ToolsList from '$lib/components/ToolsList.svelte';
	import ResourcesList from '$lib/components/ResourcesList.svelte';
	import ResourceTemplatesList from '$lib/components/ResourceTemplatesList.svelte';
	import PromptsList from '$lib/components/PromptsList.svelte';
	import type {
		InitializeResult,
		Prompt,
		Resource,
		ResourceTemplate,
		Tool
	} from '@modelcontextprotocol/sdk/types.js';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import type { NostrClientTransport } from '@contextvm/sdk';

	const pubkey = page.params.pubkey ?? '';

	const server = eventStore.model(ServerAnnouncementModel, pubkey);

	// Create a minimal server object for private servers
	let privateServer = $state<ServerAnnouncement | null>(null);

	// Derived server that combines both public and private servers
	const currentServer = $derived($server || privateServer);

	// MCP connection state - using the service's state directly
	let connectionState = $derived<McpConnectionState>(
		currentServer
			? mcpClientService.getConnectionState(currentServer.pubkey)
			: { connected: false, loading: false, error: null }
	);

	// Server capabilities data
	let serverData = $state<{
		tools: Tool[] | null;
		resources: Resource[] | null;
		resourceTemplates: ResourceTemplate[] | null;
		prompts: Prompt[] | null;
	}>({
		tools: null,
		resources: null,
		resourceTemplates: null,
		prompts: null
	});

	let activeTab = $state('about');

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

	// Load server capabilities with error handling
	async function loadServerCapabilities(
		serverPubkey: string,
		capabilities: string[] = ['tools', 'resources', 'prompts']
	) {
		const results = {
			tools: null as Tool[] | null,
			resources: null as Resource[] | null,
			resourceTemplates: null as ResourceTemplate[] | null,
			prompts: null as Prompt[] | null
		};

		for (const capability of capabilities) {
			try {
				switch (capability) {
					case 'tools':
						results.tools = (await mcpClientService.listTools(serverPubkey)).tools;
						break;
					case 'resources':
						// Try to load regular resources
						results.resources = (await mcpClientService.listResources(serverPubkey)).resources;
						results.resourceTemplates = (
							await mcpClientService.listResourcesTemplates(serverPubkey)
						).resourceTemplates;
						console.log('Regular resources loaded', results.resources, results.resourceTemplates);
						break;
					case 'prompts':
						results.prompts = (await mcpClientService.listPrompts(serverPubkey)).prompts;
						break;
				}
			} catch (err) {
				console.error(`Failed to load ${capability}:`, err);
			}
		}

		return results;
	}

	async function connectToServer() {
		if (!$server) return;

		try {
			const client = await mcpClientService.getClient($server.pubkey);
			if (client) {
				// Load capabilities based on what the server supports
				const capabilities = getAvailableCapabilities($server);
				const results = await loadServerCapabilities($server.pubkey, capabilities);

				// Update server data with loaded capabilities
				serverData = results;
			}
		} catch (err) {
			// Error is handled by the service
			console.error('Connection error:', err);
		}
	}

	async function disconnectFromServer() {
		if (!currentServer) return;

		try {
			await mcpClientService.disconnect(currentServer.pubkey);

			// Reset server data
			serverData = {
				tools: null,
				resources: null,
				resourceTemplates: null,
				prompts: null
			};

			// If this was a private server, clear the privateServer object
			if (privateServer) {
				privateServer = null;
			}
		} catch (err) {
			// Error is handled by the service
			console.error('Disconnection error:', err);
		}
	}

	async function attemptConnectToPrivateServer() {
		if (!pubkey) return;

		try {
			// Check if user is logged in
			const currentAccount = activeAccount.getValue();
			if (!currentAccount) {
				throw new Error('Please log in to connect to servers');
			}

			// Try to connect to the server directly
			const client = await mcpClientService.getClient(pubkey);
			if (client) {
				const initializeEvent = (
					client.transport as NostrClientTransport
				).getServerInitializeEvent();
				if (!initializeEvent) return;

				// Create a minimal server object for private servers
				const parsedServer = parseServerAnnouncement(initializeEvent);
				if (!parsedServer) return;

				privateServer = parsedServer;

				// Get available capabilities from the server's initialization response
				const capabilities = getAvailableCapabilities(parsedServer);

				// Only load capabilities that the server actually supports
				const results = await loadServerCapabilities(pubkey, capabilities);

				// Update server data with loaded capabilities
				serverData = results;
			}
		} catch (err) {
			// Error is handled by the service
			console.error('Private server connection error:', err);
		}
	}
</script>

{#if currentServer}
	{@const publishedAt = formatUnixTimestamp(currentServer.created_at, true)}
	{@const availableCapabilities = getAvailableCapabilities(currentServer)}
	<article class="container mx-auto max-w-6xl px-4 py-6 sm:py-8 md:py-12">
		<!-- Back to servers link -->
		<button
			onclick={() => goto('/')}
			class="mb-4 flex items-center text-sm font-medium text-muted-foreground hover:text-primary sm:mb-6"
		>
			← Back to servers
		</button>

		<!-- Server header with picture -->
		{#if currentServer.picture}
			<div class="mb-6 aspect-video overflow-hidden rounded-lg bg-muted sm:mb-8">
				<img
					src={currentServer.picture}
					alt={currentServer.name}
					class="h-full w-full object-cover"
				/>
			</div>
		{/if}

		<!-- Two-column layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Left column (2/3 width) -->
			<div class="lg:col-span-2">
				<!-- Server name and website -->
				<div class="mb-6 flex items-center justify-between">
					<div>
						<h1
							class="mb-3 text-2xl leading-tight font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl"
						>
							{currentServer.name}
						</h1>
						{#if currentServer.website}
							<a
								href={currentServer.website}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm text-primary hover:underline"
							>
								{currentServer.website}
							</a>
						{/if}
					</div>
					<div class="flex items-center space-x-2">
						{#if connectionState.connected}
							<span
								class="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
							>
								Connected
							</span>
							<Button
								variant="outline"
								onclick={disconnectFromServer}
								disabled={connectionState.loading}
							>
								Disconnect
							</Button>
						{:else}
							<Button
								onclick={connectToServer}
								disabled={connectionState.loading || !$activeAccount}
							>
								{#if connectionState.loading}
									Connecting...
								{:else}
									Connect to Server
								{/if}
							</Button>
						{/if}
					</div>
				</div>

				<!-- Error message -->
				{#if connectionState.error}
					<Card.Root class="mb-6 border-destructive">
						<Card.Content class="pt-6">
							<p class="text-sm text-destructive">{connectionState.error}</p>
						</Card.Content>
					</Card.Root>
				{/if}

				<!-- Tabs for server information -->
				<Tabs.Root bind:value={activeTab}>
					<Tabs.List class="grid w-full grid-cols-5">
						<Tabs.Trigger value="about">About</Tabs.Trigger>
						{#each availableCapabilities as capability (capability)}
							<Tabs.Trigger value={capability}>{capability}</Tabs.Trigger>
						{/each}
					</Tabs.List>

					<!-- About tab -->
					<Tabs.Content value="about" class="mt-4">
						<Card.Root>
							<Card.Content class="pt-6">
								{#if currentServer.about}
									<p class="text-sm">{currentServer.about}</p>
								{:else}
									<p class="text-sm text-muted-foreground">
										No description available for this server.
									</p>
								{/if}
							</Card.Content>
						</Card.Root>
					</Tabs.Content>

					<!-- Tools tab -->
					{#if availableCapabilities.includes('tools')}
						<Tabs.Content value="tools" class="mt-4">
							{#if connectionState.connected}
								<ToolsList
									tools={serverData.tools}
									loading={connectionState.loading}
									error={connectionState.error}
								/>
							{:else}
								<Card.Root>
									<Card.Content class="pt-6">
										<p class="text-center text-sm text-muted-foreground">
											Connect to the server to view available tools.
										</p>
									</Card.Content>
								</Card.Root>
							{/if}
						</Tabs.Content>
					{/if}

					<!-- Resources tab -->
					{#if availableCapabilities.includes('resources')}
						<Tabs.Content value="resources" class="mt-4">
							{#if connectionState.connected}
								{#if serverData.resources?.length}
									<h3 class="text-lg font-medium">Resources</h3>
									<ResourcesList
										resources={serverData.resources}
										loading={connectionState.loading}
										error={connectionState.error}
									/>
								{/if}
								{#if serverData.resourceTemplates?.length}
									<h3 class="text-lg font-medium">Resource Templates</h3>
									<ResourceTemplatesList
										resourceTemplates={serverData.resourceTemplates}
										loading={connectionState.loading}
										error={connectionState.error}
									/>
								{/if}
							{:else}
								<Card.Root>
									<Card.Content class="pt-6">
										<p class="text-center text-sm text-muted-foreground">
											Connect to the server to view available resources.
										</p>
									</Card.Content>
								</Card.Root>
							{/if}
						</Tabs.Content>
					{/if}

					<!-- Prompts tab -->
					{#if availableCapabilities.includes('prompts')}
						<Tabs.Content value="prompts" class="mt-4">
							{#if connectionState.connected}
								<PromptsList
									prompts={serverData.prompts}
									loading={connectionState.loading}
									error={connectionState.error}
								/>
							{:else}
								<Card.Root>
									<Card.Content class="pt-6">
										<p class="text-center text-sm text-muted-foreground">
											Connect to the server to view available prompts.
										</p>
									</Card.Content>
								</Card.Root>
							{/if}
						</Tabs.Content>
					{/if}
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
								<time
									datetime={new Date(currentServer.created_at * 1000).toISOString()}
									class="text-sm"
								>
									{publishedAt}
								</time>
							</div>
							<div>
								<p class="text-sm font-medium text-muted-foreground">Version</p>
								<p class="text-sm">{currentServer.capabilities.serverInfo?.version || 'Unknown'}</p>
							</div>
							<div>
								<p class="text-sm font-medium text-muted-foreground">Public Key</p>
								<p class="font-mono text-xs break-all">{currentServer.pubkey}</p>
							</div>
							{#if currentServer.supportsEncryption}
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
							currentServer.capabilities,
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
			The server you're looking for doesn't exist or couldn't be loaded from public announcements.
			This might be a private server that doesn't publish announcements.
		</p>
		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<Button
				onclick={attemptConnectToPrivateServer}
				disabled={connectionState.loading || !$activeAccount}
			>
				{#if connectionState.loading}
					Connecting...
				{:else}
					Attempt Connect To Server
				{/if}
			</Button>
			<button
				onclick={() => goto('/')}
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Back to servers
			</button>
		</div>
		{#if connectionState.error}
			<Card.Root class="mx-auto mt-6 max-w-md border-destructive">
				<Card.Content class="pt-6">
					<p class="text-sm text-destructive">{connectionState.error}</p>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
{/if}
