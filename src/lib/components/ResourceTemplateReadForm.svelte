<script lang="ts">
	import { mcpClientService, type McpConnectionState } from '$lib/services/mcpClient.svelte';
	import { copyToClipboard } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { ReadResourceResult, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import LoadingSpinner from './ui/LoadingSpinner.svelte';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';

	let {
		resourceTemplate,
		serverPubkey,
		connectionState
	}: {
		resourceTemplate: ResourceTemplate;
		serverPubkey: string;
		connectionState: McpConnectionState;
	} = $props();

	// Form state
	let formResult = $state<ReadResourceResult | null>(null);
	let formError = $state<string | null>(null);
	let showResult = $state(false);
	let loading = $state(false);

	// Collapsible state
	let open = $state(false);
	let rawOpen = $state(false);

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
		loading = true;
		try {
			if (!connectionState.connected) {
				await mcpClientService.getClient(serverPubkey);
			}

			formError = null;
			formResult = null;
			showResult = false;

			const result = await mcpClientService.readResource(serverPubkey, getFinalUri());
			formResult = result;
			showResult = true;
		} catch (error) {
			formError = error instanceof Error ? error.message : 'Failed to read resource';
		} finally {
			loading = false;
		}
	}

	// Reset form
	function resetForm() {
		formResult = null;
		formError = null;
		showResult = false;
		loading = false;
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
		<ChevronsUpDownIcon
			class={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
		/>
	</Collapsible.Trigger>
	<Collapsible.Content
		class="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 overflow-hidden"
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
							{#each formResult.contents as content, i (i + '-' + content.uri)}
								<div class="relative rounded-md bg-muted p-3">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm font-medium">{content.uri}</span>
										{#if content.mimeType}
											<span class="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
												{content.mimeType}
											</span>
										{/if}
									</div>

									{#if 'text' in content}
										<div class="pr-8 text-sm whitespace-pre-wrap">{content.text}</div>
									{:else if 'blob' in content}
										<div class="text-sm text-muted-foreground">
											<p>Binary content</p>
											<p class="mt-1 text-xs">Size: {content.blob.length || 0} bytes</p>
										</div>
									{:else}
										<div class="text-sm text-muted-foreground">No content available</div>
									{/if}

									{#if 'text' in content}
										<button
											onclick={() => copyToClipboard(content.text as BlobPart)}
											class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
											aria-label="Copy resource text"
										>
											<CopyIcon class="h-4 w-4" />
										</button>
									{:else if 'blob' in content}
										<button
											onclick={() => copyToClipboard(content.blob as BlobPart)}
											class="absolute top-2 right-2 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
											aria-label="Copy resource info"
										>
											<CopyIcon class="h-4 w-4" />
										</button>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
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
				</div>
			{:else if loading}
				<LoadingSpinner />
			{:else if $activeAccount}
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
								<Button onclick={handleSubmit} disabled={loading || templateInput === ''} size="sm">
									Read
								</Button>
							</div>
							<p class="text-xs text-muted-foreground">
								Enter the parameter values to complete the URI
							</p>
						</div>
					{:else}
						<!-- Submit Button for templates with no parameters -->
						<Button onclick={handleSubmit} disabled={loading} class="w-full">Read Resource</Button>
					{/if}
				</div>
			{:else if !$activeAccount}
				<Alert.Root variant="destructive">
					<Alert.Title>Please log in to read capabilities</Alert.Title>
				</Alert.Root>
			{/if}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
