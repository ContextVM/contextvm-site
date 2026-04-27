<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { parseServerInitializeMsg } from '$lib/models/serverAnnouncements';
	import {
		getAvailableCapabilities,
		pubkeyToHexColor,
		copyToClipboard,
		resolveServerIdentifier
	} from '$lib/utils';
	import { goto } from '$app/navigation';
	import { Collapsible } from 'bits-ui';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import { eventStore } from '$lib/services/eventStore';
	import { createServerNotesLoader } from '$lib/services/loaders.svelte';
	import { TimelineModel } from 'applesauce-core/models';
	// NOTE: transport may be wrapped (payments middleware), so we access initialize via service.
	import ToolCallForm from '$lib/components/ToolCallForm.svelte';
	import ResourceReadForm from '$lib/components/ResourceReadForm.svelte';
	import PromptGetForm from '$lib/components/PromptGetForm.svelte';
	import ResourceTemplateReadForm from '$lib/components/ResourceTemplateReadForm.svelte';
	import ServerInformationCard from '$lib/components/ServerInformationCard.svelte';
	import ServerConnectionCard from '$lib/components/ServerConnectionCard.svelte';
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import ServerNoteCard from '$lib/components/ServerNoteCard.svelte';
	import ServerReviewsSection from '$lib/components/ServerReviewsSection.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import { DIALOG_IDS, dialogState } from '$lib/stores/dialog-state.svelte';
	import {
		useServerAnnouncement,
		useServerIdentity,
		useServerTools,
		useServerResources,
		useServerResourceTemplates,
		useServerPrompts
	} from '$lib/queries/serverQueries';
	import { queryClient } from '$lib/query-client';
	import { serverKeys } from '$lib/queries/serverQueryKeys';
	import Seo from '$lib/components/SEO.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { createServerNotesFilter } from '$lib/constants';
	import { npubEncode } from 'nostr-tools/nip19';

	const requestedIdentifier = page.params.pubkey ?? '';
	const resolvedIdentifierQuery = createQuery({
		queryKey: ['server-identifier', requestedIdentifier, page.url.hostname],
		queryFn: () => resolveServerIdentifier(requestedIdentifier, page.url.hostname)
	});
	const resolvedIdentifier = $derived($resolvedIdentifierQuery.data ?? null);
	const pubkey = $derived(resolvedIdentifier?.pubkey ?? requestedIdentifier);
	const bootstrapRelayHints = $derived(resolvedIdentifier?.relayHints ?? []);
	const connectionIdentifier = $derived.by(() =>
		resolvedIdentifier?.format === 'nprofile'
			? resolvedIdentifier.original
			: ($serverIdentityQuery?.data?.nprofile ?? pubkey)
	);

	const serversHref = $derived<`/servers`>('/servers');
	const homeHref = $derived<`/`>('/');
	const logoBlackSrc = asset('/logo-black.svg');

	// Dynamic SEO data for server pages
	let seoTitle = $state('Loading server...');
	let seoDescription = $state('Loading server information...');
	let seoImage = $state(logoBlackSrc);
	let seoUrl = $state(`https://contextvm.com/s/${requestedIdentifier}`);
	let seoType = $state('website' as 'website' | 'article');

	const serverQuery = $derived(
		resolvedIdentifier ? useServerAnnouncement(pubkey, bootstrapRelayHints) : undefined
	);
	const serverIdentityQuery = $derived(
		resolvedIdentifier ? useServerIdentity(pubkey, bootstrapRelayHints) : undefined
	);
	const effectiveRelayHints = $derived(
		$serverIdentityQuery?.data?.relayHints?.length
			? $serverIdentityQuery.data.relayHints
			: bootstrapRelayHints
	);

	const notesFilter = $derived(createServerNotesFilter(pubkey));
	const notes = $derived(eventStore.model(TimelineModel, notesFilter));
	const jumbleProfileUrl = $derived(`https://jumble.social/users/${npubEncode(pubkey)}`);

	// Trigger notes loader
	$effect(() => {
		if (!resolvedIdentifier || !pubkey) return;

		const sub = createServerNotesLoader(pubkey, effectiveRelayHints).subscribe();
		return () => sub.unsubscribe();
	});

	// Get available capabilities when server data is loaded
	let availableCapabilities = $derived(
		$serverQuery?.data?.server ? getAvailableCapabilities($serverQuery.data.server) : []
	);

	const hasNotes = $derived($notes.length > 0);

	// Update SEO data when server loads
	$effect(() => {
		if ($serverQuery?.data?.server) {
			const server = $serverQuery.data.server;
			const serverName = server.name || 'Unnamed Server';
			const serverAbout = server.about || 'No description available for this server.';
			const serverPicture = server.picture || logoBlackSrc;

			seoTitle = serverName;
			seoDescription =
				serverAbout.length > 160 ? serverAbout.substring(0, 160) + '...' : serverAbout;
			seoImage = serverPicture;
			seoUrl = `https://contextvm.com/s/${requestedIdentifier}`;
			seoType = 'website';
		}
	});

	// Only load queries for capabilities that are actually available
	let toolsQuery = $derived(
		$serverQuery?.isFetched && availableCapabilities.includes('tools')
			? $serverQuery.data?.isPublic
				? useServerTools(pubkey, true, effectiveRelayHints)
				: useServerTools(pubkey, false, effectiveRelayHints)
			: undefined
	);

	let resourcesQuery = $derived(
		$serverQuery?.isFetched && availableCapabilities.includes('resources')
			? $serverQuery.data?.isPublic
				? useServerResources(pubkey, true, effectiveRelayHints)
				: useServerResources(pubkey, false, effectiveRelayHints)
			: undefined
	);
	let resourceTemplatesQuery = $derived(
		$serverQuery?.isFetched && availableCapabilities.includes('resources')
			? $serverQuery.data?.isPublic
				? useServerResourceTemplates(pubkey, true, effectiveRelayHints)
				: useServerResourceTemplates(pubkey, false, effectiveRelayHints)
			: undefined
	);
	let promptsQuery = $derived(
		$serverQuery?.isFetched && availableCapabilities.includes('prompts')
			? $serverQuery.data?.isPublic
				? useServerPrompts(pubkey, true, effectiveRelayHints)
				: useServerPrompts(pubkey, false, effectiveRelayHints)
			: undefined
	);

	$effect(() => {
		if (connectionIdentifier) {
			mcpClientService.setServerIdentifier(connectionIdentifier);
		}
	});

	// Connection state
	const connectionState = $derived<McpConnectionState>(mcpClientService.getConnectionState(pubkey));

	// Server capabilities data
	const serverData = $derived({
		tools: $toolsQuery?.data || null,
		resources: $resourcesQuery?.data || null,
		resourceTemplates: $resourceTemplatesQuery?.data || null,
		prompts: $promptsQuery?.data || null
	});
	const announcementTags = $derived($serverQuery?.data?.server?.tags ?? []);

	let activeTab = $state('about');

	// Connect to server (public or private)
	async function connectToServer() {
		if (!resolvedIdentifier || !pubkey || !$serverQuery) return;
		try {
			// For public servers, just get the client
			if ($serverQuery.data?.isPublic) {
				await mcpClientService.getClient(connectionIdentifier);

				if (availableCapabilities.includes('tools')) {
					await mcpClientService.listTools(connectionIdentifier);
				}
				if (availableCapabilities.includes('resources')) {
					await Promise.all([
						mcpClientService.listResources(connectionIdentifier),
						mcpClientService.listResourcesTemplates(connectionIdentifier)
					]);
				}
				if (availableCapabilities.includes('prompts')) {
					await mcpClientService.listPrompts(connectionIdentifier);
				}

				// Refetch all queries after connection, but only if they exist
				$serverQuery.refetch();
				if ($toolsQuery) $toolsQuery.refetch();
				if ($resourcesQuery) $resourcesQuery.refetch();
				if ($resourceTemplatesQuery) $resourceTemplatesQuery.refetch();
				if ($promptsQuery) $promptsQuery.refetch();
				return;
			} else {
				const client = await mcpClientService.getClient(connectionIdentifier);
				if (!client) return null;

				const initializeEvent = mcpClientService.getServerInitializeEvent(connectionIdentifier);
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
		if (!$serverQuery?.data?.server) return;

		try {
			await mcpClientService.disconnect(connectionIdentifier);
		} catch (err) {
			console.error('Disconnection error:', err);
		}
	}
</script>

<Seo title={seoTitle} description={seoDescription} image={seoImage} url={seoUrl} type={seoType} />

{#if $resolvedIdentifierQuery.isLoading}
	<div class="container mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-4 py-12">
		<div class="flex items-center gap-3 text-muted-foreground">
			<LoadingSpinner />
			<span>Resolving server identifier...</span>
		</div>
	</div>
{:else if $resolvedIdentifierQuery.isError || !resolvedIdentifier}
	<div
		class="container mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-12 text-center"
	>
		<div>
			<h1 class="mb-4 text-2xl font-bold">Unable to resolve this server identifier</h1>
			<p class="mb-6 text-muted-foreground">{requestedIdentifier}</p>
			<Button variant="outline" onclick={() => goto(resolve(serversHref))}>Back to servers</Button>
		</div>
	</div>
{:else if $serverQuery?.data?.server}
	<article class="container mx-auto max-w-6xl px-4 py-6 sm:py-8 md:py-12">
		<!-- Back to servers link -->
		<button
			onclick={() => goto(resolve(serversHref))}
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
				<div class="mb-6 flex flex-col gap-6">
					<div>
						<h2 class="mb-1 text-2xl leading-none font-bold sm:text-3xl md:text-4xl">
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
					<div class="w-full">
						{#if connectionState.connected}
							<div class="flex flex-col items-center gap-3">
								<div
									class="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400"
								>
									<span class="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
									Connected
								</div>
								<Button
									variant="outline"
									class="w-full"
									onclick={disconnectFromServer}
									disabled={connectionState.loading}
								>
									Disconnect
								</Button>
							</div>
						{:else if !$activeAccount}
							<div class="flex w-full gap-4">
								<Button
									variant="outline"
									class="flex-1 gap-2"
									onclick={() => (dialogState.dialogId = DIALOG_IDS.LOGIN)}
								>
									<CircleUserRound class="h-4 w-4" />
									Login to Connect
								</Button>
								<Button
									class="flex-1"
									onclick={connectToServer}
									disabled={connectionState.loading || !$activeAccount}
								>
									{#if connectionState.loading}
										Connecting...
									{:else}
										Connect to Server
									{/if}
								</Button>
							</div>
						{:else}
							<Button
								class="w-full"
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
					<Card.Root class="mb-6 border-destructive p-0">
						<Card.Content class="p-5">
							<p class="text-sm text-destructive">{connectionState.error}</p>
						</Card.Content>
					</Card.Root>
				{/if}

				<!-- Tabs for server information -->
				<Tabs.Root bind:value={activeTab}>
					<Tabs.List class="flex w-full">
						<Tabs.Trigger value="about" class="capitalize">About</Tabs.Trigger>
						{#each availableCapabilities as capability (capability)}
							{#if (capability === 'tools' && serverData.tools?.length) || (capability === 'resources' && (serverData.resources?.length || serverData.resourceTemplates?.length)) || (capability === 'prompts' && serverData.prompts?.length)}
								<Tabs.Trigger value={capability} class="capitalize">{capability}</Tabs.Trigger>
							{/if}
						{/each}
					</Tabs.List>

					<!-- About tab -->
					<Tabs.Content value="about" class="mt-4">
						<Card.Root class="p-0">
							<Card.Content class="p-5">
								{#if $serverQuery.data.server.about}
									<p class="text-sm">{$serverQuery.data.server.about}</p>
								{:else}
									<p class="text-sm text-muted-foreground">
										No description available for this server.
									</p>
								{/if}
							</Card.Content>
						</Card.Root>

						<ServerReviewsSection {pubkey} relayHints={effectiveRelayHints} />

						<!-- Raw server data section -->
						<Collapsible.Root class="mt-6">
							<Collapsible.Trigger
								class="flex w-full items-center justify-between pb-4 text-left text-sm font-medium text-muted-foreground hover:text-primary"
							>
								<h3 class="text-lg font-semibold">Raw Server Data</h3>
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
											copyToClipboard(
												JSON.stringify($serverQuery.data?.server?.capabilities, null, 2)
											)}
										class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
										aria-label="Copy raw server data"
									>
										<CopyIcon class="h-4 w-4" />
									</button>
								</div>
							</Collapsible.Content>
						</Collapsible.Root>
					</Tabs.Content>

					<!-- Tools tab -->
					{#if availableCapabilities.includes('tools')}
						<Tabs.Content value="tools" class="mt-4 flex flex-col gap-2">
							{#if serverData.tools}
								{#each serverData.tools as tool (tool.name)}
									<ToolCallForm
										{tool}
										serverPubkey={connectionIdentifier}
										{connectionState}
										{announcementTags}
									/>
								{/each}
							{:else}
								<Card.Root class="p-0">
									<Card.Content class="p-5">
										<p class="text-center text-sm text-muted-foreground">
											Connect to the server to view available tools.
										</p>
									</Card.Content>
								</Card.Root>
							{/if}

							<!-- Raw tools data section -->
							{#if serverData.tools}
								<Collapsible.Root>
									<Collapsible.Trigger
										class="flex w-full items-center justify-between pb-4 text-left text-sm font-medium text-muted-foreground hover:text-primary"
									>
										<h3 class="text-lg font-semibold">Raw Tools Data</h3>
										<ChevronsUpDownIcon />
									</Collapsible.Trigger>
									<Collapsible.Content>
										<div class="relative">
											<pre
												class="overflow-x-auto rounded bg-muted p-4 pr-12 text-xs">{JSON.stringify(
													serverData.tools,
													null,
													2
												)}</pre>
											<button
												onclick={() => copyToClipboard(JSON.stringify(serverData.tools, null, 2))}
												class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
												aria-label="Copy raw tools data"
											>
												<CopyIcon class="h-4 w-4" />
											</button>
										</div>
									</Collapsible.Content>
								</Collapsible.Root>
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
											serverPubkey={connectionIdentifier}
											{connectionState}
											{announcementTags}
										/>
									{/each}
								{/if}
							{:else}
								<Card.Root class="p-0">
									<Card.Content class="p-5">
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
											serverPubkey={connectionIdentifier}
											{connectionState}
										/>
									{/each}
								{/if}
							{:else if $serverQuery.data}
								<Card.Root class="p-0">
									<Card.Content class="p-5">
										<p class="text-center text-sm text-muted-foreground">
											No resource templates available.
										</p>
									</Card.Content>
								</Card.Root>
							{/if}

							<!-- Raw resources data section -->
							{#if serverData.resources || serverData.resourceTemplates}
								<Collapsible.Root>
									<Collapsible.Trigger
										class="flex w-full items-center justify-between pb-4 text-left text-sm font-medium text-muted-foreground hover:text-primary"
									>
										<h3 class="text-lg font-semibold">Raw Resources Data</h3>
										<ChevronsUpDownIcon />
									</Collapsible.Trigger>
									<Collapsible.Content>
										<div class="relative">
											<pre
												class="overflow-x-auto rounded bg-muted p-4 pr-12 text-xs">{JSON.stringify(
													{
														resources: serverData.resources,
														resourceTemplates: serverData.resourceTemplates
													},
													null,
													2
												)}</pre>
											<button
												onclick={() =>
													copyToClipboard(
														JSON.stringify(
															{
																resources: serverData.resources,
																resourceTemplates: serverData.resourceTemplates
															},
															null,
															2
														)
													)}
												class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
												aria-label="Copy raw resources data"
											>
												<CopyIcon class="h-4 w-4" />
											</button>
										</div>
									</Collapsible.Content>
								</Collapsible.Root>
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
										serverPubkey={connectionIdentifier}
										{announcementTags}
									/>
								{/each}
							{:else}
								<Card.Root class="p-0">
									<Card.Content class="p-5">
										<p class="text-center text-sm text-muted-foreground">
											Connect to the server to view available prompts.
										</p>
									</Card.Content>
								</Card.Root>
							{/if}

							<!-- Raw prompts data section -->
							{#if serverData.prompts}
								<Collapsible.Root>
									<Collapsible.Trigger
										class="flex w-full items-center justify-between pb-4 text-left text-sm font-medium text-muted-foreground hover:text-primary"
									>
										<h3 class="text-lg font-semibold">Raw Prompts Data</h3>
										<ChevronsUpDownIcon />
									</Collapsible.Trigger>
									<Collapsible.Content>
										<div class="relative">
											<pre
												class="overflow-x-auto rounded bg-muted p-4 pr-12 text-xs">{JSON.stringify(
													serverData.prompts,
													null,
													2
												)}</pre>
											<button
												onclick={() => copyToClipboard(JSON.stringify(serverData.prompts, null, 2))}
												class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
												aria-label="Copy raw prompts data"
											>
												<CopyIcon class="h-4 w-4" />
											</button>
										</div>
									</Collapsible.Content>
								</Collapsible.Root>
							{/if}
						</Tabs.Content>
					{/if}
				</Tabs.Root>
			</div>

			<!-- Right column (1/3 width) -->
			<div class="lg:col-span-1">
				<div class="mb-6">
					<ProfileCard {pubkey} mode="extended" />
				</div>

				<!-- Server Information Tabs -->
				<Tabs.Root value="info" class="mb-6">
					<Tabs.List class={hasNotes ? 'grid w-full grid-cols-3' : 'grid w-full grid-cols-2'}>
						<Tabs.Trigger value="info">Information</Tabs.Trigger>
						<Tabs.Trigger value="use">Use</Tabs.Trigger>
						{#if hasNotes}
							<Tabs.Trigger value="notes">Notes</Tabs.Trigger>
						{/if}
					</Tabs.List>

					<!-- Information Tab -->
					<Tabs.Content value="info" class="mt-4">
						<ServerInformationCard
							server={$serverQuery.data.server}
							identity={$serverIdentityQuery?.data}
						/>
					</Tabs.Content>

					<!-- Connection Tab -->
					<Tabs.Content value="use" class="mt-4">
						<ServerConnectionCard
							server={$serverQuery.data.server}
							serverIdentifier={connectionIdentifier}
							identity={$serverIdentityQuery?.data}
						/>
					</Tabs.Content>

					{#if hasNotes}
						<Tabs.Content value="notes" class="mt-4 flex flex-col gap-4">
							{#each $notes as note (note.id)}
								<ServerNoteCard {note} />
							{/each}
							<a
								href={jumbleProfileUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
							>
								Open profile
							</a>
						</Tabs.Content>
					{/if}
				</Tabs.Root>
			</div>
		</div>
	</article>
{:else}
	<div class="container mx-auto px-4 py-16 text-center">
		{#if $serverQuery?.isLoading}
			<LoadingSpinner />
			<h1 class="mt-6 mb-4 text-2xl font-bold">Searching...</h1>
			<p class="mb-6 text-muted-foreground">Looking for: {pubkey}</p>
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button onclick={connectToServer} disabled={connectionState.loading || !$activeAccount}>
					{#if connectionState.loading}
						Connecting...
					{:else}
						Attempt Connect To Server
					{/if}
				</Button>
				<button
					onclick={() => goto(resolve(homeHref))}
					class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Back to servers
				</button>
			</div>
		{:else}
			<h1 class="mb-4 text-2xl font-bold">No public announcement</h1>
			<p class="mb-6 text-muted-foreground">
				This server isn't publicly announced. Try connecting directly if it's a private server.
			</p>
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				{#if !$activeAccount}
					<Alert.Root variant="destructive" class="w-fit">
						<Alert.Title>Log in to connect</Alert.Title>
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
				<Button
					variant="outline"
					onclick={() => goto(resolve(serversHref))}
					class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Back to servers
				</Button>
			</div>
		{/if}
		{#if connectionState.error}
			<Card.Root class="mx-auto mt-6 max-w-md border-destructive p-0">
				<Card.Content class="p-5">
					<p class="text-sm text-destructive">{connectionState.error}</p>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
{/if}
