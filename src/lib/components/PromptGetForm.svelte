<script lang="ts">
	import { createForm, BasicForm, type Schema } from '@sjsf/form';
	import { formDefaults } from '$lib/form-defaults';
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import { copyToClipboard } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import type {
		Prompt,
		GetPromptResult,
		TextContent,
		ImageContent,
		AudioContent
	} from '@modelcontextprotocol/sdk/types.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import LoadingSpinner from './ui/LoadingSpinner.svelte';
	import { onDestroy } from 'svelte';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import PaymentStatusPanel from '$lib/components/PaymentStatusPanel.svelte';
	import { paymentNotificationsService } from '$lib/services/payments/payment-notifications.svelte';
	import {
		findCapTagForPrompt,
		formatCapTagPrice,
		parseCapTagsFromEvent
	} from '$lib/services/payments/cep8-tags';

	let {
		prompt,
		connectionState,
		serverPubkey
	}: {
		prompt: Prompt;
		connectionState: McpConnectionState;
		serverPubkey: string;
	} = $props();

	// Form state
	let formResult = $state<GetPromptResult | null>(null);
	let formError = $state<string | null>(null);
	let showResult = $state(false);

	// Collapsible state
	let open = $state(false);
	let rawOpen = $state(false);
	let loading = $state(false);
	let paymentState = $derived(paymentNotificationsService.getLatestForServer(serverPubkey));
	let paymentOpen = $state(true);
	const initializeEvent = $derived(mcpClientService.getServerPromptsListEvent(serverPubkey));
	const capTags = $derived(parseCapTagsFromEvent(initializeEvent));
	const promptCap = $derived(findCapTagForPrompt(capTags, prompt.name));

	$effect(() => {
		if (showResult && formResult) paymentOpen = false;
	});

	// Create form schema from prompt arguments
	const formSchema: Schema = (() => {
		const { properties, required } = prompt.arguments?.reduce(
			(acc, arg) => {
				acc.properties[arg.name] = {
					type: 'string',
					title: arg.name,
					description: arg.description || undefined
				};
				if (arg.required) {
					acc.required.push(arg.name);
				}
				return acc;
			},
			{ properties: {} as Record<string, Schema>, required: [] as string[] }
		) || { properties: {}, required: [] };

		return {
			type: 'object',
			title: prompt.name,
			description: prompt.description || `Get prompt "${prompt.name}"`,
			properties,
			required: required.length > 0 ? required : undefined
		};
	})();

	// Create form instance
	const form = createForm({
		...formDefaults,
		schema: formSchema,
		onSubmit: async (value: unknown, _e: SubmitEvent) => {
			const data = value as Record<string, string>;
			loading = true;
			// Ensure payment panel is visible for subsequent calls.
			paymentOpen = true;
			paymentNotificationsService.clearServer(serverPubkey);
			open = true;
			try {
				if (!connectionState.connected) {
					await mcpClientService.getClient(serverPubkey);
				}
				formError = null;
				formResult = null;

				// Get the prompt with the form data
				const result = await mcpClientService.getPrompt(serverPubkey, prompt.name, data);
				formResult = result;
				showResult = true;
			} catch (error) {
				formError = error instanceof Error ? error.message : 'Failed to get prompt';
			} finally {
				loading = false;
			}
		}
	});

	// Reset form
	function resetForm() {
		form.reset(new Event('reset'));
		formResult = null;
		formError = null;
		showResult = false;
		paymentNotificationsService.clearServer(serverPubkey);
		paymentOpen = true;
		open = true;
	}

	// Only reset form on destroy
	onDestroy(() => {
		resetForm();
	});
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger
		class="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left shadow-sm hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
	>
		<div class="flex flex-col space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="text-lg leading-none font-semibold tracking-tight">{prompt.name}</h3>
				{#if promptCap}
					<span class="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
						Paid · {formatCapTagPrice(promptCap)}
					</span>
				{/if}
			</div>
			{#if prompt.description}
				<p class="text-sm text-muted-foreground">{prompt.description}</p>
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
						<h3 class="text-sm font-medium">Prompt Result</h3>
						<Button variant="outline" size="sm" onclick={resetForm}>Get Again</Button>
					</div>

					{#if formResult.description}
						<div class="rounded-md bg-muted p-3">
							<h4 class="mb-2 text-sm font-medium">Description</h4>
							<p class="text-sm">{formResult.description}</p>
						</div>
					{/if}

					{#if formResult.messages && formResult.messages.length > 0}
						<div class="space-y-2">
							<h4 class="text-sm font-medium">Messages</h4>
							{#each formResult.messages as message, i (i + '-' + message.role)}
								<div class="relative rounded-md bg-muted p-3">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm font-medium capitalize">{message.role}</span>
										{#if message.content?.type}
											<span class="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
												{message.content.type}
											</span>
										{/if}
									</div>

									{#if message.content?.type === 'text'}
										<div class="pr-8 text-sm">
											{message.content.text}
										</div>
									{:else if message.content?.type === 'image'}
										<div class="text-sm">
											{#if message.content.mimeType}
												<img
													src={`data:${message.content.mimeType};base64,${message.content.data}`}
													alt="result_img"
													class="max-w-full rounded-md"
												/>
												<p class="text-xs text-muted-foreground">
													MIME type: {message.content.mimeType}
												</p>
											{/if}
										</div>
									{:else if message.content?.type === 'audio'}
										<div class="text-sm">
											<p class="mb-2">Audio: {message.content.data}</p>
											{#if message.content.mimeType}
												<p class="text-xs text-muted-foreground">
													MIME type: {message.content.mimeType}
												</p>
											{/if}
										</div>
									{:else if message.content?.type === 'resource'}
										<div class="text-sm">
											<p class="mb-2">Resource: {message.content.resource?.uri || 'Unknown'}</p>
											{#if message.content.resource?.mimeType}
												<p class="text-xs text-muted-foreground">
													MIME type: {message.content.resource.mimeType}
												</p>
											{/if}
										</div>
									{:else}
										<div class="text-sm">
											<pre class="overflow-x-auto pr-8 text-xs">{JSON.stringify(
													message.content,
													null,
													2
												)}</pre>
										</div>
									{/if}

									{#if message.content?.type === 'text'}
										<button
											onclick={() => copyToClipboard((message.content as TextContent).text)}
											class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
											aria-label="Copy message text"
										>
											<CopyIcon class="h-4 w-4" />
										</button>
									{:else if message.content?.type === 'audio'}
										<button
											onclick={() => copyToClipboard((message.content as AudioContent).data)}
											class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
											aria-label="Copy audio info"
										>
											<CopyIcon class="h-4 w-4" />
										</button>
									{:else if message.content?.type && message.content.type !== 'image'}
										<button
											onclick={() => copyToClipboard((message.content as ImageContent).data)}
											class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
											aria-label="Copy message content"
										>
											<CopyIcon class="h-4 w-4" />
										</button>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-md bg-muted p-3 text-sm text-muted-foreground">
							No messages returned
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
					<Alert.Title>Please log in to get capabilities</Alert.Title>
				</Alert.Root>
			{/if}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
