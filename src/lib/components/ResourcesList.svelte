<script lang="ts">
	import type { Resource } from '@modelcontextprotocol/sdk/types.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';

	let {
		resources,
		loading,
		error
	}: {
		resources: Resource[] | null;
		loading: boolean;
		error: string | null;
	} = $props();
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
		<span class="ml-3">Loading resources...</span>
	</div>
{:else if error}
	<Card>
		<CardContent class="pt-6">
			<div class="text-center text-destructive">
				<p>{error}</p>
			</div>
		</CardContent>
	</Card>
{:else if resources && resources.length > 0}
	<div class="space-y-4">
		{#each resources as resource (resource.uri)}
			<Card>
				<CardHeader>
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<CardTitle class="text-lg">{resource.name || resource.uri}</CardTitle>
							{#if resource.description}
								<CardDescription>{resource.description}</CardDescription>
							{/if}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						<div>
							<h4 class="text-sm font-medium">URI:</h4>
							<p class="font-mono text-sm break-all text-muted-foreground">{resource.uri}</p>
						</div>
						{#if resource.mimeType}
							<div>
								<h4 class="text-sm font-medium">MIME Type:</h4>
								<p class="text-sm text-muted-foreground">{resource.mimeType}</p>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{:else}
	<Card>
		<CardContent class="pt-6">
			<div class="text-center text-muted-foreground">
				<p>No resources available on this server.</p>
			</div>
		</CardContent>
	</Card>
{/if}
