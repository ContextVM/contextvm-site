<script lang="ts">
	import { page } from '$app/state';
	import { parseServerInitializeMsg } from '$lib/models/serverAnnouncements';
	import { getAvailableCapabilities, pubkeyToHexColor, copyToClipboard } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { Collapsible } from 'bits-ui';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import type { NostrClientTransport } from '@contextvm/sdk';
	import ToolCallForm from '$lib/components/ToolCallForm.svelte';
	import ResourceReadForm from '$lib/components/ResourceReadForm.svelte';
	import PromptGetForm from '$lib/components/PromptGetForm.svelte';
	import ResourceTemplateReadForm from '$lib/components/ResourceTemplateReadForm.svelte';
	import ServerInformationCard from '$lib/components/ServerInformationCard.svelte';
	import ServerConnectionCard from '$lib/components/ServerConnectionCard.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import { DIALOG_IDS, dialogState } from '$lib/stores/dialog-state.svelte';
	import {
		useServerAnnouncement,
		useServerTools,
		useServerResources,
		useServerResourceTemplates,
		useServerPrompts
	} from '$lib/queries/serverQueries';
	import { queryClient } from '$lib/query-client';
	import { serverKeys } from '$lib/queries/serverQueryKeys';
	import Seo from '$lib/components/SEO.svelte';

	const pubkey = page.params.pubkey ?? '';

	// Dynamic SEO data for server pages
	let seoTitle = $state('Loading server...');
	let seoDescription = $state('Loading server information...');
	let seoImage = $state('/logo-black.svg');
	let seoUrl = $state(`https://contextvm.com/s/${pubkey}`);
	let seoType = $state('website' as 'website' | 'article');

	// Update SEO data when server loads
	$effect(() => {
		if ($serverQuery.data?.server) {
			const server = $serverQuery.data.server;
			const serverName = server.name || 'Unnamed Server';
			const serverAbout = server.about || 'No description available for this server.';
			const serverPicture = server.picture || '/logo-black.svg';

			seoTitle = serverName;
			seoDescription =
				serverAbout.length > 160 ? serverAbout.substring(0, 160) + '...' : serverAbout;
			seoImage = serverPicture;
			seoUrl = `https://contextvm.com/s/${pubkey}`;
			seoType = 'website';
		}
	});

	// Use individual queries
	const serverQuery = useServerAnnouncement(pubkey);

	let toolsQuery = $derived(
		$serverQuery.isFetched
			? $serverQuery.data?.isPublic
				? useServerTools(pubkey, true)
				: useServerTools(pubkey, false)
			: undefined
	);
	let resourcesQuery = $derived(
		$serverQuery.isFetched
			? $serverQuery.data?.isPublic
				? useServerResources(pubkey, true)
				: useServerResources(pubkey, false)
			: undefined
	);
	let resourceTemplatesQuery = $derived(
		$serverQuery.isFetched
			? $serverQuery.data?.isPublic
				? useServerResourceTemplates(pubkey, true)
				: useServerResourceTemplates(pubkey, false)
			: undefined
	);
	let promptsQuery = $derived(
		$serverQuery.isFetched
			? $serverQuery.data?.isPublic
				? useServerPrompts(pubkey, true)
				: useServerPrompts(pubkey, false)
			: undefined
	);

	// Connection state
	const connectionState = $derived<McpConnectionState>(mcpClientService.getConnectionState(pubkey));

	// Server capabilities data
	const serverData = $derived({
		tools: $toolsQuery?.data || null,
		resources: $resourcesQuery?.data || null,
		resourceTemplates: $resourceTemplatesQuery?.data || null,
		prompts: $promptsQuery?.data || null
	});

	let activeTab = $state('about');

	// Connect to server (public or private)
	async function connectToServer() {
		if (!pubkey) return;
		try {
			// For public servers, just get the client
			if ($serverQuery.data?.isPublic) {
				await mcpClientService.getClient(pubkey);
				// Refetch all queries after connection
				$serverQuery.refetch();
				$toolsQuery?.refetch();
				$resourcesQuery?.refetch();
				$resourceTemplatesQuery?.refetch();
				$promptsQuery?.refetch();
				return;
			} else {
				const client = await mcpClientService.getClient(pubkey);
				if (!client) return null;

				const initializeEvent = (
					client.transport as NostrClientTransport
				).getServerInitializeEvent();
				if (!initializeEvent) return null;
				const server = parseServerInitializeMsg(initializeEvent);
				queryClient.setQueryData(serverKeys.announcement(pubkey), { server, isPublic: false });
			}
		} catch (err) {
			console.error('Connection error:', err);
		}
	}

	// Disconnect from server
	async function disconnectFromServer() {
		if (!$serverQuery.data?.server) return;

		try {
			await mcpClientService.disconnect(pubkey);
		} catch (err) {
			console.error('Disconnection error:', err);
		}
	}
</script>

<Seo title={seoTitle} description={seoDescription} image={seoImage} url={seoUrl} type={seoType} />

{#if $serverQuery.data?.server}
	{@const availableCapabilities = getAvailableCapabilities($serverQuery.data.server)}
	<article class="container mx-auto max-w-6xl px-4 py-6 sm:py-8 md:py-12">
		<!-- Back to servers link -->
		<button
			onclick={() => goto('/')}
			class="mb-4 flex items-center text-sm font-medium text-muted-foreground hover:text-primary sm:mb-6"
		>
			← Back to servers
		</button>

		<!-- Server header with picture -->
		{#if $serverQuery.data.server.picture}
			<div class="mb-6 h-64 overflow-hidden rounded-lg bg-muted sm:mb-8">
				<img
					src={$serverQuery.data.server.picture}
					alt={$serverQuery.data.server.name}
					class="h-full w-full object-cover"
				/>
			</div>
		{:else}
			<div
				class="mb-6 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-muted sm:mb-8"
				style="background-color: {pubkeyToHexColor($serverQuery.data.server.pubkey)}"
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
							{$serverQuery.data.server.name}
						</h2>
						{#if $serverQuery.data.server.website}
							<a
								href={$serverQuery.data.server.website}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm text-primary hover:underline"
							>
								{$serverQuery.data.server.website}
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
									<Alert.Title>Login to connect</Alert.Title>
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
								{#if $serverQuery.data.server.about}
									<p class="text-sm">{$serverQuery.data.server.about}</p>
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
									<ToolCallForm
										{tool}
										serverPubkey={$serverQuery.data.server.pubkey}
										{connectionState}
									/>
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
											serverPubkey={$serverQuery.data.server.pubkey}
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
											serverPubkey={$serverQuery.data.server.pubkey}
											{connectionState}
										/>
									{/each}
								{/if}
							{:else if $serverQuery.data}
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
									<PromptGetForm
										{prompt}
										{connectionState}
										serverPubkey={$serverQuery.data.server.pubkey}
									/>
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
						<ServerInformationCard server={$serverQuery.data.server} />
					</Tabs.Content>

					<!-- Connection Tab -->
					<Tabs.Content value="connection" class="mt-4">
						<ServerConnectionCard server={$serverQuery.data.server} />
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
								$serverQuery.data.server.capabilities,
								null,
								2
							)}</pre>
						<button
							onclick={() =>
								copyToClipboard(JSON.stringify($serverQuery.data?.server?.capabilities, null, 2))}
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
			{#if !$activeAccount}
				<Alert.Root variant="destructive" class="w-fit">
					<Alert.Title>Please log in to connect to a server</Alert.Title>
				</Alert.Root>
			{:else}
				<Button onclick={connectToServer} disabled={connectionState.loading || !$activeAccount}>
					{#if connectionState.loading}
						Connecting...
					{:else}
						Attempt Connect To Server
					{/if}
				</Button>
			{/if}
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
