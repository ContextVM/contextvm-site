<script lang="ts">
	import { createForm, BasicForm, type Schema } from '@sjsf/form';
	import { formDefaults } from '$lib/form-defaults';
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import type { Resource, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

	let {
		resource,
		serverPubkey,
		connectionState
	}: {
		resource: Resource;
		serverPubkey: string;
		connectionState: McpConnectionState;
	} = $props();

	// Form state
	let formResult = $state<ReadResourceResult | null>(null);
	let formError = $state<string | null>(null);
	let showResult = $state(false);

	// Collapsible state
	let open = $state(false);

	// Create form schema for reading resource
	const formSchema: Schema = {
		type: 'object',
		title: resource.name || resource.uri,
		description: resource.description || `Read resource at ${resource.uri}`,
		properties: {
			uri: {
				type: 'string',
				title: 'Resource URI',
				description: 'The URI of the resource to read',
				default: resource.uri,
				readOnly: true
			}
		},
		required: ['uri']
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

				// Read the resource
				const result = await mcpClientService.readResource(
					serverPubkey,
					(data as any).uri as string
				);
				formResult = result;
				showResult = true;
			} catch (error) {
				formError = error instanceof Error ? error.message : 'Failed to read resource';
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
			<h3 class="text-lg leading-none font-semibold tracking-tight">
				{resource.name || resource.uri}
			</h3>
			{#if resource.description}
				<p class="text-sm text-muted-foreground">{resource.description}</p>
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
						<h3 class="text-sm font-medium">Resource Content</h3>
						<Button variant="outline" size="sm" onclick={resetForm}>Read Again</Button>
					</div>

					{#if formResult.contents && formResult.contents.length > 0}
						<div class="space-y-2">
							{#each formResult.contents as content (content.uri)}
								<div class="rounded-md bg-muted p-3">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm font-medium">{content.uri}</span>
										{#if content.mimeType}
											<span class="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
												{content.mimeType}
											</span>
										{/if}
									</div>

									{#if content.mimeType?.startsWith('text/')}
										<div class="text-sm">
											<pre class="overflow-x-auto text-xs">{content.text}</pre>
										</div>
									{:else if content.mimeType?.startsWith('image/')}
										<div class="text-sm">
											<img
												src={`data:${content.mimeType};base64,${content.blob}`}
												alt="Resource content"
												class="max-w-full rounded-md"
											/>
										</div>
									{:else}
										<div class="text-sm text-muted-foreground">
											<p>Binary content (MIME type: {content.mimeType})</p>
											<p class="mt-1 text-xs">Size: {(content.blob as any)?.length || 0} bytes</p>
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
				</div>
			{:else}
				<BasicForm {form} />
			{/if}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
