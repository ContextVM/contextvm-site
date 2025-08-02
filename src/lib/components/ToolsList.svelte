<script lang="ts">
	import type { Tool } from '@modelcontextprotocol/sdk/types.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';

	let {
		tools,
		loading,
		error
	}: {
		tools: Tool[] | null;
		loading: boolean;
		error: string | null;
	} = $props();
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
		<span class="ml-3">Loading tools...</span>
	</div>
{:else if error}
	<Card>
		<CardContent class="pt-6">
			<div class="text-center text-destructive">
				<p>{error}</p>
			</div>
		</CardContent>
	</Card>
{:else if tools && tools.length > 0}
	<div class="space-y-4">
		{#each tools as tool (tool.name)}
			<Card>
				<CardHeader>
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<CardTitle class="text-lg">{tool.name}</CardTitle>
							{#if tool.description}
								<CardDescription>{tool.description}</CardDescription>
							{/if}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{#if tool.inputSchema}
						<div class="space-y-3">
							<h4 class="text-sm font-medium">Input Schema:</h4>
							<div class="rounded-md bg-muted p-3">
								<pre class="overflow-x-auto text-xs">{JSON.stringify(
										tool.inputSchema,
										null,
										2
									)}</pre>
							</div>
						</div>
					{/if}
				</CardContent>
			</Card>
		{/each}
	</div>
{:else}
	<Card>
		<CardContent class="pt-6">
			<div class="text-center text-muted-foreground">
				<p>No tools available on this server.</p>
			</div>
		</CardContent>
	</Card>
{/if}
