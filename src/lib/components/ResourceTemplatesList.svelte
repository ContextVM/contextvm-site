<script lang="ts">
	import type { ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';

	let {
		resourceTemplates,
		loading,
		error
	}: {
		resourceTemplates: ResourceTemplate[] | null;
		loading: boolean;
		error: string | null;
	} = $props();
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
		<span class="ml-3">Loading resource templates...</span>
	</div>
{:else if error}
	<Card>
		<CardContent class="pt-6">
			<div class="text-center text-destructive">
				<p>{error}</p>
			</div>
		</CardContent>
	</Card>
{:else if resourceTemplates && resourceTemplates.length > 0}
	<div class="space-y-4">
		{#each resourceTemplates as template (template.uriTemplate)}
			<Card>
				<CardHeader>
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<CardTitle class="text-lg">{template.name || template.uriTemplate}</CardTitle>
							{#if template.description}
								<CardDescription>{template.description}</CardDescription>
							{/if}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						<div>
							<h4 class="text-sm font-medium">URI Template:</h4>
							<p class="font-mono text-sm break-all text-muted-foreground">
								{template.uriTemplate}
							</p>
						</div>
						{#if template.mimeType}
							<div>
								<h4 class="text-sm font-medium">MIME Type:</h4>
								<p class="text-sm text-muted-foreground">{template.mimeType}</p>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{/if}
