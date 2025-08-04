<script lang="ts">
	import { createForm, BasicForm, type Schema } from '@sjsf/form';
	import { formDefaults } from '$lib/form-defaults';
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import type { Prompt, GetPromptResult } from '@modelcontextprotocol/sdk/types.js';

	// FIXME: There is an error reading parametrized prompts Uncaught Svelte error: each_key_duplicate Keyed each block has duplicate key `user` at indexes 0 and 2
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

	// Create form schema from prompt arguments
	const properties: Record<string, any> = {};
	const required: string[] = [];

	if (prompt.arguments) {
		for (const arg of prompt.arguments) {
			properties[arg.name] = {
				type: 'string',
				title: arg.name,
				description: arg.description || undefined
			};
			if (arg.required) {
				required.push(arg.name);
			}
		}
	}

	const formSchema: Schema = {
		type: 'object',
		title: prompt.name,
		description: prompt.description || `Get prompt "${prompt.name}"`,
		properties,
		required
	};

	// Create form instance
	const form = createForm({
		...formDefaults,
		schema: formSchema,
		onSubmit: async (data) => {
			try {
				if (!connectionState.connected) {
					await mcpClientService.getClient(serverPubkey);
				}
				formError = null;
				formResult = null;

				// Get the prompt with the form data
				const result = await mcpClientService.getPrompt(
					serverPubkey,
					prompt.name,
					data as Record<string, string>
				);
				formResult = result;
				showResult = true;
			} catch (error) {
				formError = error instanceof Error ? error.message : 'Failed to get prompt';
			}
		}
	});

	// Reset form
	function resetForm() {
		form.reset(new Event('reset'));
		formResult = null;
		formError = null;
		showResult = false;
	}
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger
		class="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left shadow-sm hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
	>
		<div class="flex flex-col space-y-1">
			<h3 class="text-lg leading-none font-semibold tracking-tight">{prompt.name}</h3>
			{#if prompt.description}
				<p class="text-sm text-muted-foreground">{prompt.description}</p>
			{/if}
		</div>
		<ChevronDownIcon
			class={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
		/>
	</Collapsible.Trigger>
	<Collapsible.Content
		class="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
	>
		<div class="border-t bg-muted/50 p-4">
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
							{#each formResult.messages as message (message.role)}
								<div class="rounded-md bg-muted p-3">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm font-medium capitalize">{message.role}</span>
										{#if message.content?.type}
											<span class="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
												{message.content.type}
											</span>
										{/if}
									</div>

									{#if message.content?.type === 'text'}
										<div class="text-sm">
											{message.content.text}
										</div>
									{:else if message.content?.type === 'image'}
										<div class="text-sm">
											<p class="mb-2">Image: {message.content.data}</p>
											{#if message.content.mimeType}
												<p class="text-xs text-muted-foreground">
													MIME type: {message.content.mimeType}
												</p>
											{/if}
										</div>
									{:else}
										<div class="text-sm">
											<pre class="overflow-x-auto text-xs">{JSON.stringify(
													message.content,
													null,
													2
												)}</pre>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-md bg-muted p-3 text-sm text-muted-foreground">
							No messages returned
						</div>
					{/if}
				</div>
			{:else}
				<BasicForm {form} />
			{/if}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
