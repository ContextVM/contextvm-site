<script lang="ts">
	import { page } from '$app/state';
	import { eventStore } from '$lib/services/eventStore';
	import {
		parseServerInitializeMsg,
		ServerAnnouncementModel,
		type ServerAnnouncement
	} from '$lib/models/serverAnnouncements';
	import { getAvailableCapabilities, pubkeyToHexColor, copyToClipboard } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { Collapsible } from 'bits-ui';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import type {
		Prompt,
		Resource,
		ResourceTemplate,
		Tool
	} from '@modelcontextprotocol/sdk/types.js';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import type { NostrClientTransport } from '@contextvm/sdk';
	import type { Subscription } from 'rxjs';
	import ToolCallForm from '$lib/components/ToolCallForm.svelte';
	import ResourceReadForm from '$lib/components/ResourceReadForm.svelte';
	import PromptGetForm from '$lib/components/PromptGetForm.svelte';
	import ResourceTemplateReadForm from '$lib/components/ResourceTemplateReadForm.svelte';
	import ServerInformationCard from '$lib/components/ServerInformationCard.svelte';
	import ServerConnectionCard from '$lib/components/ServerConnectionCard.svelte';
	import {
		createPromptsAnnouncementByPubkeyLoader,
		createResourcesAnnouncementByPubkeyLoader,
		createResourcesTemplatesAnnouncementByPubkeyLoader,
		createServerAnnouncementByPubkeyLoader,
		createToolsAnnouncementByPubkeyLoader
	} from '$lib/services/loaders.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import { DIALOG_IDS, dialogState } from '$lib/stores/dialog-state.svelte';

	const pubkey = page.params.pubkey ?? '';

	// Try to load server from public announcements
	const server = eventStore.model(ServerAnnouncementModel, pubkey);

	// For private servers (no public announcement)
	let privateServer = $state<ServerAnnouncement | null>(null);

	// Combined server object
	const currentServer = $derived($server || privateServer);

	// Connection state
	let connectionState = $derived<McpConnectionState>(
		currentServer
			? mcpClientService.getConnectionState(currentServer.pubkey)
			: { connected: false, loading: false, error: null }
	);

	// Server capabilities data
	let serverData = $state({
		tools: null as Tool[] | null,
		resources: null as Resource[] | null,
		resourceTemplates: null as ResourceTemplate[] | null,
		prompts: null as Prompt[] | null
	});

	let activeTab = $state('about');

	let triedMcpListCommands = $state(false);

	// Load server capabilities from announcements (for public servers)
	$effect(() => {
		if (!$server) return;

		const capabilities = getAvailableCapabilities($server);
		let toolsSub: Subscription | null = null;
		let resourcesSub: Subscription | null = null;
		let resourceTemplatesSub: Subscription | null = null;
		let promptsSub: Subscription | null = null;
		let hasLoadedFromAnnouncements = false;

		// Load tools if supported
		if (capabilities.includes('tools')) {
			toolsSub = createToolsAnnouncementByPubkeyLoader(pubkey).subscribe((event) => {
				if (event) {
					try {
						const content = JSON.parse(event.content);
						serverData.tools = content.tools || [];
						hasLoadedFromAnnouncements = true;
					} catch (err) {
						console.error('Failed to parse tools announcement:', err);
					}
				}
			});
		}

		// Load resources if supported
		if (capabilities.includes('resources')) {
			resourcesSub = createResourcesAnnouncementByPubkeyLoader(pubkey).subscribe((event) => {
				if (event) {
					try {
						const content = JSON.parse(event.content);
						serverData.resources = content.resources || [];
						hasLoadedFromAnnouncements = true;
					} catch (err) {
						console.error('Failed to parse resources announcement:', err);
					}
				}
			});

			resourceTemplatesSub = createResourcesTemplatesAnnouncementByPubkeyLoader(pubkey).subscribe(
				(event) => {
					if (event) {
						try {
							const content = JSON.parse(event.content);
							serverData.resourceTemplates = content.resourceTemplates || [];
							hasLoadedFromAnnouncements = true;
						} catch (err) {
							console.error('Failed to parse resource templates announcement:', err);
						}
					}
				}
			);
		}

		// Load prompts if supported
		if (capabilities.includes('prompts')) {
			promptsSub = createPromptsAnnouncementByPubkeyLoader(pubkey).subscribe((event) => {
				if (event) {
					try {
						const content = JSON.parse(event.content);
						serverData.prompts = content.prompts || [];
						hasLoadedFromAnnouncements = true;
					} catch (err) {
						console.error('Failed to parse prompts announcement:', err);
					}
				}
			});
		}

		// Check if we need to fall back to MCP list commands
		queueMicrotask(() => {
			if (!triedMcpListCommands && !hasLoadedFromAnnouncements) {
				triedMcpListCommands = true;
				loadServerCapabilities(pubkey, capabilities);
			}
		});

		return () => {
			toolsSub?.unsubscribe();
			resourcesSub?.unsubscribe();
			resourceTemplatesSub?.unsubscribe();
			promptsSub?.unsubscribe();
		};
	});

	// Load server capabilities via MCP (for private servers)
	async function loadServerCapabilities(
		serverPubkey: string,
		capabilities: string[] = ['tools', 'resources', 'prompts']
	) {
		serverData.tools = null;
		serverData.resources = null;
		serverData.resourceTemplates = null;
		serverData.prompts = null;

		for (const capability of capabilities) {
			try {
				switch (capability) {
					case 'tools':
						serverData.tools = (await mcpClientService.listTools(serverPubkey)).tools;
						break;
					case 'resources': {
						const resources = await mcpClientService.listResources(serverPubkey);
						const templates = await mcpClientService.listResourcesTemplates(serverPubkey);
						serverData.resources = resources.resources;
						serverData.resourceTemplates = templates.resourceTemplates;
						break;
					}
					case 'prompts':
						serverData.prompts = (await mcpClientService.listPrompts(serverPubkey)).prompts;
						break;
				}
			} catch (err) {
				console.error(`Failed to load ${capability}:`, err);
			}
		}
	}

	// Connect to server (public or private)
	async function connectToServer() {
		if (!pubkey) return;
		try {
			// For public servers, just get the client
			if ($server) {
				await mcpClientService.getClient($server.pubkey);
				return;
			}
			// For private servers, get client and load capabilities
			const client = await mcpClientService.getClient(pubkey);
			if (!client) return;

			// Get server initialization event
			const initializeEvent = (client.transport as NostrClientTransport).getServerInitializeEvent();
			if (!initializeEvent) return;

			privateServer = parseServerInitializeMsg(initializeEvent);
			if (!privateServer) return;
			// Load capabilities
			const capabilities = getAvailableCapabilities(privateServer);
			triedMcpListCommands = true;
			await loadServerCapabilities(pubkey, capabilities);
		} catch (err) {
			console.error('Connection error:', err);
		}
	}

	// Disconnect from server
	async function disconnectFromServer() {
		if (!currentServer) return;

		try {
			await mcpClientService.disconnect(currentServer.pubkey);
		} catch (err) {
			console.error('Disconnection error:', err);
		}
	}

	// Load server announcement if not already loaded (for private server detection)
	$effect(() => {
		if ($server) return;
		const sub = createServerAnnouncementByPubkeyLoader(pubkey).subscribe();
		return () => sub.unsubscribe();
	});
</script>

{#if currentServer}
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
			<div class="mb-6 h-64 overflow-hidden rounded-lg bg-muted sm:mb-8">
				<img
					src={currentServer.picture}
					alt={currentServer.name}
					class="h-full w-full object-cover"
				/>
			</div>
		{:else}
			<div
				class="mb-6 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-muted sm:mb-8"
				style="background-color: {pubkeyToHexColor(currentServer.pubkey)}"
			></div>
		{/if}

		<!-- Two-column layout -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Left column (2/3 width) -->
			<div class="lg:col-span-2">
				<!-- Server name and website -->
				<div class="mb-6 flex items-center justify-between">
					<div>
						<h2 class="text-2xl leading-none font-bold sm:text-3xl md:text-4xl">
							{currentServer.name}
						</h2>
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
							{#if !$activeAccount}
								<Alert.Root
									class="cursor-pointer transition-colors hover:bg-muted/50"
									onclick={() => (dialogState.dialogId = DIALOG_IDS.LOGIN)}
								>
									<CircleUserRound />
									<Alert.Title>Loging to connect</Alert.Title>
								</Alert.Root>
							{/if}
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
							{#if (capability === 'tools' && serverData.tools?.length) || (capability === 'resources' && (serverData.resources?.length || serverData.resourceTemplates?.length)) || (capability === 'prompts' && serverData.prompts?.length)}
								<Tabs.Trigger value={capability}>{capability}</Tabs.Trigger>
							{/if}
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
						<Tabs.Content value="tools" class="mt-4 flex flex-col gap-2">
							{#if serverData.tools}
								{#each serverData.tools as tool (tool.name)}
									<ToolCallForm {tool} serverPubkey={currentServer.pubkey} {connectionState} />
								{/each}
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
						<Tabs.Content value="resources" class="mt-4 flex flex-col gap-2">
							{#if serverData.resources}
								{#if serverData.resources?.length}
									<h3 class="text-lg font-medium">Resources</h3>
									{#each serverData.resources as resource (resource.uri)}
										<ResourceReadForm
											{resource}
											serverPubkey={currentServer.pubkey}
											{connectionState}
										/>
									{/each}
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
							{#if serverData.resourceTemplates}
								{#if serverData.resourceTemplates?.length}
									<h3 class="text-lg font-medium">Resource Templates</h3>
									<p class="mb-4 text-sm text-muted-foreground">
										Parameterized resource templates that can be customized with specific values
									</p>
									{#each serverData.resourceTemplates as resourceTemplate (resourceTemplate.uriTemplate)}
										<ResourceTemplateReadForm
											{resourceTemplate}
											serverPubkey={currentServer.pubkey}
											{connectionState}
										/>
									{/each}
								{/if}
							{:else if $server}
								<Card.Root>
									<Card.Content class="pt-6">
										<p class="text-center text-sm text-muted-foreground">
											No resource templates available.
										</p>
									</Card.Content>
								</Card.Root>
							{/if}
						</Tabs.Content>
					{/if}

					<!-- Prompts tab -->
					{#if availableCapabilities.includes('prompts')}
						<Tabs.Content value="prompts" class="mt-4 flex flex-col gap-2">
							{#if serverData.prompts}
								{#each serverData.prompts as prompt (prompt.name)}
									<PromptGetForm {prompt} {connectionState} serverPubkey={currentServer.pubkey} />
								{/each}
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
				<!-- Server Information Tabs -->
				<Tabs.Root value="info" class="mb-6">
					<Tabs.List class="grid w-full grid-cols-2">
						<Tabs.Trigger value="info">Information</Tabs.Trigger>
						<Tabs.Trigger value="connection">Connection</Tabs.Trigger>
					</Tabs.List>

					<!-- Information Tab -->
					<Tabs.Content value="info" class="mt-4">
						<ServerInformationCard server={currentServer} />
					</Tabs.Content>

					<!-- Connection Tab -->
					<Tabs.Content value="connection" class="mt-4">
						<ServerConnectionCard server={currentServer} />
					</Tabs.Content>
				</Tabs.Root>
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
					<div class="relative">
						<pre class="overflow-x-auto rounded bg-muted p-4 pr-12 text-xs">{JSON.stringify(
								currentServer.capabilities,
								null,
								2
							)}</pre>
						<button
							onclick={() => copyToClipboard(JSON.stringify(currentServer.capabilities, null, 2))}
							class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
							aria-label="Copy raw server data"
						>
							<CopyIcon class="h-4 w-4" />
						</button>
					</div>
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
			<Button onclick={connectToServer} disabled={connectionState.loading || !$activeAccount}>
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
