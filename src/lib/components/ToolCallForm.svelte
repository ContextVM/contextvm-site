<script lang="ts">
	import { createForm, BasicForm, type Schema } from '@sjsf/form';
	import { formDefaults } from '$lib/form-defaults';
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';

	// FIXME: There is an error reading some tools Uncaught Svelte error: each_key_duplicate Keyed each block has duplicate key `resource_link` at indexes 1 and 2
	let {
		tool,
		connectionState,
		serverPubkey
	}: {
		tool: Tool;
		connectionState: McpConnectionState;
		serverPubkey: string;
	} = $props();

	// Form state
	let formResult = $state<CallToolResult | null>(null);
	let formError = $state<string | null>(null);
	let showResult = $state(false);

	// Collapsible state
	let open = $state(false);

	// Create form schema from tool input schema
	const formSchema: Schema = {
		type: 'object',
		properties: (tool.inputSchema?.properties as Record<string, any>) || {},
		required: tool.inputSchema?.required || []
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

				// Call the tool with the form data
				const result = await mcpClientService.callTool(
					serverPubkey,
					tool.name,
					data as Record<string, unknown>
				);
				formResult = result;
				showResult = true;
			} catch (error) {
				formError = error instanceof Error ? error.message : 'Failed to call tool';
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
			<h3 class="text-lg leading-none font-semibold tracking-tight">{tool.name}</h3>
			{#if tool.description}
				<p class="text-sm text-muted-foreground">{tool.description}</p>
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
						<h3 class="text-sm font-medium">Result</h3>
						<Button variant="outline" size="sm" onclick={resetForm}>Call Again</Button>
					</div>

					{#if formResult.content && formResult.content.length > 0}
						<div class="space-y-2">
							{#each formResult.content as content (content.type)}
								<div class="rounded-md bg-muted p-3">
									{#if content.type === 'text'}
										<div class="text-sm">
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
											<pre class="overflow-x-auto text-xs">{JSON.stringify(content, null, 2)}</pre>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-md bg-muted p-3 text-sm text-muted-foreground">
							No content returned
						</div>
					{/if}

					{#if formResult.isError}
						<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							Tool returned an error
						</div>
					{/if}
				</div>
			{:else}
				<BasicForm {form} />
			{/if}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
