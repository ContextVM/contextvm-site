<script lang="ts">
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { ReadResourceResult, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';

	let {
		resourceTemplate,
		serverPubkey,
		connectionState
	}: {
		resourceTemplate: ResourceTemplate;
		serverPubkey: string;
		connectionState: McpConnectionState;
	} = $props();

	// Form state - consolidated into a single state object
	let formState = $state<{
		result: ReadResourceResult | null;
		error: string | null;
		isSubmitting: boolean;
		showResult: boolean;
	}>({
		result: null,
		error: null,
		isSubmitting: false,
		showResult: false
	});

	// Collapsible state
	let open = $state(false);

	// Template part input state
	let templateInput = $state('');

	// Memoized derived values - computed once and reused
	const uriTemplateInfo = $derived(() => {
		const firstParamIndex = resourceTemplate.uriTemplate.indexOf('{');
		const hasParameters = firstParamIndex !== -1;

		return {
			hasParameters,
			baseUri: hasParameters
				? resourceTemplate.uriTemplate.substring(0, firstParamIndex)
				: resourceTemplate.uriTemplate,
			templatePart: hasParameters ? resourceTemplate.uriTemplate.substring(firstParamIndex) : '',
			parameters: hasParameters
				? resourceTemplate.uriTemplate.match(/\{([^}]+)\}/g)?.map((match) => match.slice(1, -1)) ||
					[]
				: []
		};
	});

	// Get the final URI by combining base with template input
	const getFinalUri = (): string => {
		const { baseUri, hasParameters } = uriTemplateInfo();
		return hasParameters ? baseUri + templateInput : baseUri;
	};

	// Handle form submission
	async function handleSubmit() {
		try {
			if (!connectionState.connected) {
				await mcpClientService.getClient(serverPubkey);
			}

			formState = {
				result: null,
				error: null,
				isSubmitting: true,
				showResult: false
			};

			const result = await mcpClientService.readResource(serverPubkey, getFinalUri());
			formState = {
				result,
				error: null,
				isSubmitting: false,
				showResult: true
			};
		} catch (error) {
			formState = {
				result: null,
				error: error instanceof Error ? error.message : 'Failed to read resource',
				isSubmitting: false,
				showResult: true
			};
		}
	}

	// Reset form
	function resetForm() {
		formState = {
			result: null,
			error: null,
			isSubmitting: false,
			showResult: false
		};
		templateInput = '';
	}
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger
		class="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left shadow-sm hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
	>
		<div class="flex flex-col space-y-1">
			<h3 class="text-lg leading-none font-semibold tracking-tight">
				{resourceTemplate.name || resourceTemplate.uriTemplate}
			</h3>
			{#if resourceTemplate.description}
				<p class="text-sm text-muted-foreground">{resourceTemplate.description}</p>
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
			{#if formState.error}
				<div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{formState.error}
				</div>
			{/if}

			{#if formState.showResult && formState.result}
				<div class="mb-4 space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="text-sm font-medium">Resource Content</h3>
						<Button variant="outline" size="sm" onclick={resetForm}>Read Again</Button>
					</div>

					{#if formState.result.contents && formState.result.contents.length > 0}
						<div class="space-y-2">
							{#each formState.result.contents as content (content.uri)}
								<div class="rounded-md bg-muted p-3">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm font-medium">{content.uri}</span>
									</div>

									{#if content.text}
										<div class="text-sm whitespace-pre-wrap">{content.text}</div>
									{:else if content.blob}
										<div class="text-sm text-muted-foreground">
											<p>Binary content</p>
											<p class="mt-1 text-xs">Size: {(content.blob as any)?.length || 0} bytes</p>
										</div>
									{:else}
										<div class="text-sm text-muted-foreground">No content available</div>
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
				<div class="space-y-4">
					<!-- URI Template Display -->
					<div class="space-y-2">
						<span class="text-sm font-medium">URI Template</span>
						<div class="rounded-md bg-muted p-3 font-mono text-sm">
							{resourceTemplate.uriTemplate}
						</div>
					</div>

					<!-- Template Part Input -->
					{#if uriTemplateInfo().parameters.length > 0}
						<div class="space-y-2">
							<label for="template-input" class="text-sm font-medium">Template Part</label>
							<div class="flex space-x-2">
								<Input
									id="template-input"
									bind:value={templateInput}
									placeholder={uriTemplateInfo().templatePart}
									class="flex-1 font-mono text-sm"
								/>
								<Button
									onclick={handleSubmit}
									disabled={formState.isSubmitting || templateInput === ''}
									size="sm"
								>
									{#if formState.isSubmitting}
										Reading...
									{:else}
										Read
									{/if}
								</Button>
							</div>
							<p class="text-xs text-muted-foreground">
								Enter the parameter values to complete the URI
							</p>
						</div>
					{:else}
						<!-- Submit Button for templates with no parameters -->
						<Button onclick={handleSubmit} disabled={formState.isSubmitting} class="w-full">
							{#if formState.isSubmitting}
								Reading...
							{:else}
								Read Resource
							{/if}
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
