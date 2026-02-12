<script lang="ts">
	import { createForm, BasicForm, type Schema } from '@sjsf/form';
	import { formDefaults } from '$lib/form-defaults';
	import {
		mcpClientService,
		type McpConnectionState,
		type McpProgressNotification
	} from '$lib/services/mcpClient.svelte';
	import { copyToClipboard } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
	import LoadingSpinner from './ui/LoadingSpinner.svelte';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import PaymentStatusPanel from '$lib/components/PaymentStatusPanel.svelte';
	import { paymentNotificationsService } from '$lib/services/payments/payment-notifications.svelte';
	import {
		findCapTagForTool,
		formatCapTagPrice,
		parseCapTagsFromEvent
	} from '$lib/services/payments/cep8-tags';
	let {
		tool,
		connectionState,
		serverPubkey
	}: {
		tool: Tool;
		connectionState: McpConnectionState;
		serverPubkey: string;
	} = $props();
	// TODO: improve the display of notifications
	// Form state
	let formResult = $state<CallToolResult | null>(null);
	let formError = $state<string | null>(null);
	let showResult = $state(false);
	let progressNotifications = $derived<McpProgressNotification[]>(
		mcpClientService.getProgressNotifications(serverPubkey)
	);
	let paymentState = $derived(paymentNotificationsService.getLatestForServer(serverPubkey));
	let paymentOpen = $state(true);

	const initializeEvent = $derived(mcpClientService.getServerToolsListEvent(serverPubkey));
	const capTags = $derived(parseCapTagsFromEvent(initializeEvent));
	const toolCap = $derived(findCapTagForTool(capTags, tool.name));

	$effect(() => {
		// Auto-collapse when we have a final result.
		if (showResult && formResult) paymentOpen = false;
	});

	// Collapsible state
	let open = $state(false);
	let rawOpen = $state(false);
	let loading = $state(false);
	// Create form instance
	const form = $derived(
		createForm({
			...formDefaults,
			schema: tool.inputSchema as Schema,
			onSubmit: async (data) => {
				loading = true;
				// Ensure the payment UI is visible for subsequent calls.
				paymentOpen = true;
				paymentNotificationsService.clearServer(serverPubkey);
				try {
					if (!connectionState.connected) {
						await mcpClientService.getClient(serverPubkey);
					}
					formError = null;
					formResult = null;
					// Re-open the main collapsible so the user can see payment status / loading.
					open = true;

					// Call the tool with the form data
					const result = await mcpClientService.callTool(
						serverPubkey,
						tool.name,
						data as Record<string, unknown>
					);
					formResult = result;
					showResult = true;
					loading = false;
				} catch (error) {
					formError = error instanceof Error ? error.message : 'Failed to call tool';
					loading = false;
				}
			}
		})
	);

	// Reset form
	function resetForm() {
		form.reset(new Event('reset'));
		formResult = null;
		formError = null;
		showResult = false;
		paymentNotificationsService.clearServer(serverPubkey);
		// Keep payment panel visible for the next invocation.
		paymentOpen = true;
		open = true;
	}
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger
		class="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left shadow-sm hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
	>
		<div class="flex flex-col space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="text-lg leading-none font-semibold tracking-tight">{tool.name}</h3>
				{#if toolCap}
					<span class="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
						Paid · {formatCapTagPrice(toolCap)}
					</span>
				{/if}
			</div>
			{#if tool.description}
				<p class="text-sm text-muted-foreground">{tool.description}</p>
			{/if}
		</div>
		<ChevronsUpDownIcon
			class={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
		/>
	</Collapsible.Trigger>
	<Collapsible.Content
		class="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 overflow-hidden"
	>
		<div class="border-t bg-muted/50 p-4">
			{#if paymentState}
				<div class="mb-4">
					<PaymentStatusPanel payment={paymentState} open={paymentOpen} />
				</div>
			{/if}
			{#if formError}
				<div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{formError}
				</div>
			{/if}

			{#if showResult && formResult}
				<div class="mb-4 space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="text-sm font-medium">Result</h3>
						<Button variant="outline" size="sm" onclick={resetForm}>Call Again</Button>
					</div>

					{#if formResult.content && formResult.content.length > 0}
						<div class="space-y-2">
							<span class="text-sm">Content</span>
							{#each formResult.content as content, i (i + '-' + content.type)}
								<div class="relative rounded-md bg-muted p-3">
									{#if content.type === 'text'}
										<div class="pr-8 text-sm">
											{content.text}
										</div>
									{:else if content.type === 'image'}
										<div class="text-sm">
											<p class="mb-2 font-medium">Image ({content.mimeType})</p>
											<img
												src={`data:${content.mimeType};base64,${content.data}`}
												alt="result_img"
												class="max-w-full rounded-md"
											/>
										</div>
									{:else}
										<div class="text-sm">
											<p class="mb-1 font-medium">Content Type: {content.type}</p>
											<pre class="overflow-x-auto pr-8 text-xs">{JSON.stringify(
													content,
													null,
													2
												)}</pre>
										</div>
									{/if}

									{#if content.type === 'text'}
										<button
											onclick={() => copyToClipboard(content.text)}
											class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
											aria-label="Copy text result"
										>
											<CopyIcon class="h-4 w-4" />
										</button>
									{:else if content.type !== 'image'}
										<button
											onclick={() => copyToClipboard(JSON.stringify(content, null, 2))}
											class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
											aria-label="Copy content"
										>
											<CopyIcon class="h-4 w-4" />
										</button>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
					{#if formResult.structuredContent && Object.keys(formResult.structuredContent).length > 0}
						<div class="space-y-2">
							<span class="text-sm">Structured Content</span>
							<div class="relative rounded-md bg-muted p-3">
								<div class="pr-8 text-sm">
									<pre class="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(
											formResult.structuredContent,
											null,
											2
										)}</pre>
								</div>
								<button
									onclick={() =>
										copyToClipboard(JSON.stringify(formResult!.structuredContent, null, 2))}
									class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
									aria-label="Copy structured content"
								>
									<CopyIcon class="h-4 w-4" />
								</button>
							</div>
						</div>
					{/if}
					{#if !formResult.content && !formResult.structuredContent}
						<div class="rounded-md bg-muted p-3 text-sm text-muted-foreground">
							No content returned
						</div>
					{/if}

					<Collapsible.Root bind:open={rawOpen}>
						<Collapsible.Trigger
							class="flex w-full items-center justify-between rounded-md bg-muted/30 p-2 text-left text-sm transition-colors hover:bg-muted/50"
						>
							<div class="flex items-center gap-2">
								<ChevronsUpDownIcon
									class={`h-4 w-4 transition-transform duration-200 ${rawOpen ? 'rotate-180' : ''}`}
								/> <span class="font-medium">Show Raw Result</span>
							</div>
						</Collapsible.Trigger>
						<Collapsible.Content
							class="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 overflow-hidden"
						>
							<div class="relative mt-2 rounded-md bg-muted p-3">
								<div class="mb-2 flex items-center justify-between">
									<h4 class="text-sm font-medium">Raw JSON Response</h4>
									<button
										onclick={() => copyToClipboard(JSON.stringify(formResult, null, 2))}
										class="rounded p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
										aria-label="Copy raw result"
									>
										<CopyIcon class="h-4 w-4" />
									</button>
								</div>
								<pre class="overflow-x-auto pr-8 text-xs">{JSON.stringify(
										formResult,
										null,
										2
									)}</pre>
							</div>
						</Collapsible.Content>
					</Collapsible.Root>

					{#if formResult.isError}
						<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							Tool returned an error
						</div>
					{/if}
				</div>
			{:else if loading}
				<div class="flex items-center gap-3 py-2">
					<LoadingSpinner />
					<span class="text-sm text-muted-foreground">
						Waiting for the server… if payment is required, it will appear above.
					</span>
				</div>
			{:else if $activeAccount}
				<BasicForm {form} />
			{:else if !$activeAccount}
				<Alert.Root variant="destructive">
					<Alert.Title>Please log in to call capabilities</Alert.Title>
				</Alert.Root>
			{/if}
			{#if progressNotifications.length > 0}
				Notifications length: {progressNotifications.length}
				<div class="space-y-2">
					<h4 class="text-sm font-medium text-muted-foreground">Progress</h4>
					{#each progressNotifications as notification (notification.timestamp)}
						<div class="rounded-md bg-muted p-3">
							<div class="mb-2 flex items-center justify-between">
								{#if notification.message}
									<span class="text-xs text-muted-foreground">
										{notification.message}
									</span>
								{/if}
							</div>
							<div class="h-2 w-full rounded-full bg-background">
								<div
									class="h-2 rounded-full bg-primary transition-all duration-300"
									style="width: {notification.progress}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
