<script lang="ts">
	import type { Prompt } from '@modelcontextprotocol/sdk/types.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';

	let {
		prompts,
		loading,
		error
	}: {
		prompts: Prompt[] | null;
		loading: boolean;
		error: string | null;
	} = $props();
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
		<span class="ml-3">Loading prompts...</span>
	</div>
{:else if error}
	<Card>
		<CardContent class="pt-6">
			<div class="text-center text-destructive">
				<p>{error}</p>
			</div>
		</CardContent>
	</Card>
{:else if prompts && prompts.length > 0}
	<div class="space-y-4">
		{#each prompts as prompt (prompt.name)}
			<Card>
				<CardHeader>
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<CardTitle class="text-lg">{prompt.name}</CardTitle>
							{#if prompt.description}
								<CardDescription>{prompt.description}</CardDescription>
							{/if}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{#if prompt.arguments && prompt.arguments.length > 0}
						<div class="space-y-3">
							<h4 class="text-sm font-medium">Arguments:</h4>
							<div class="space-y-2">
								{#each prompt.arguments as arg (arg.name)}
									<div class="rounded-md bg-muted p-3">
										<div class="mb-1 flex items-center justify-between">
											<span class="text-sm font-medium">{arg.name}</span>
											{#if arg.required}
												<span class="rounded bg-destructive/10 px-2 py-1 text-xs text-destructive"
													>Required</span
												>
											{/if}
										</div>
										{#if arg.description}
											<p class="text-sm text-muted-foreground">{arg.description}</p>
										{/if}
									</div>
								{/each}
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
				<p>No prompts available on this server.</p>
			</div>
		</CardContent>
	</Card>
{/if}
