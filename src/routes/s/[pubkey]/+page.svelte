<script lang="ts">
	import { page } from '$app/state';
	import { eventStore } from '$lib/services/eventStore';
	import { serverAnnouncementByPubkeyLoader } from '$lib/services/loaders';
	import {
		ServerAnnouncementModel,
		type ServerAnnouncement
	} from '$lib/models/serverAnnouncements';
	import { formatUnixTimestamp } from '$lib/utils';
	import { goto } from '$app/navigation';

	const pubkey = page.params.pubkey ?? '';

	const server = eventStore.model(ServerAnnouncementModel, pubkey);

	$effect(() => {
		if ($server) return;
		const sub = serverAnnouncementByPubkeyLoader(pubkey).subscribe();
		return () => {
			sub.unsubscribe();
		};
	});

	function hasCapability(server: ServerAnnouncement, capability: string): boolean {
		return capability in server.capabilities.capabilities;
	}
</script>

{#if $server}
	{@const publishedAt = formatUnixTimestamp($server.created_at, true)}

	<article class="container mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12">
		<!-- Back to servers link -->
		<button
			onclick={() => goto('/')}
			class="mb-4 flex items-center text-sm font-medium text-muted-foreground hover:text-primary sm:mb-6"
		>
			← Back to servers
		</button>

		<!-- Server header -->
		<header class="mb-6 sm:mb-8">
			{#if $server.picture}
				<div class="mb-4 aspect-video overflow-hidden rounded-lg bg-muted sm:mb-6">
					<img src={$server.picture} alt={$server.name} class="h-full w-full object-cover" />
				</div>
			{/if}

			<div class="flex items-start justify-between">
				<div>
					<h1
						class="mb-3 text-2xl leading-tight font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl"
					>
						{$server.name}
					</h1>
					<div class="flex items-center gap-4 text-sm text-muted-foreground">
						<time datetime={new Date($server.created_at * 1000).toISOString()}>
							{publishedAt}
						</time>
						{#if $server.supportsEncryption}
							<span
								class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
							>
								Supports Encryption
							</span>
						{/if}
					</div>
				</div>
				{#if $server.website}
					<a
						href={$server.website}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Visit Server
					</a>
				{/if}
			</div>
		</header>

		<!-- Server details -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Server info -->
			<div class="rounded-lg border border-border bg-card p-6">
				<h2 class="mb-4 text-xl font-semibold">Server Information</h2>
				<div class="space-y-3">
					<div>
						<p class="text-sm font-medium text-muted-foreground">Version</p>
						<p class="text-sm">{$server.capabilities.serverInfo?.version || 'Unknown'}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-muted-foreground">Protocol Version</p>
						<p class="text-sm">{$server.capabilities.protocolVersion || 'Unknown'}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-muted-foreground">Public Key</p>
						<p class="font-mono text-sm break-all">{$server.pubkey}</p>
					</div>
					{#if $server.website}
						<div>
							<p class="text-sm font-medium text-muted-foreground">Website</p>
							<a
								href={$server.website}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm text-primary hover:underline"
							>
								{$server.website}
							</a>
						</div>
					{/if}
				</div>
			</div>

			<!-- Capabilities -->
			<div class="rounded-lg border border-border bg-card p-6">
				<h2 class="mb-4 text-xl font-semibold">Capabilities</h2>
				<div class="space-y-3">
					{#if hasCapability($server, 'tools')}
						<div>
							<p class="text-sm font-medium text-muted-foreground">Tools</p>
							<p class="text-sm">Supported</p>
						</div>
					{/if}
					{#if hasCapability($server, 'resources')}
						<div>
							<p class="text-sm font-medium text-muted-foreground">Resources</p>
							<p class="text-sm">Supported</p>
						</div>
					{/if}
					{#if hasCapability($server, 'completions')}
						<div>
							<p class="text-sm font-medium text-muted-foreground">Completions</p>
							<p class="text-sm">Supported</p>
						</div>
					{/if}
					{#if !hasCapability($server, 'tools') && !hasCapability($server, 'resources') && !hasCapability($server, 'completions')}
						<p class="text-sm text-muted-foreground">No specific capabilities listed</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Raw data -->
		<div class="mt-8 rounded-lg border border-border bg-card p-6">
			<h2 class="mb-4 text-xl font-semibold">Raw Server Data</h2>
			<pre class="overflow-x-auto rounded bg-muted p-4 text-xs">{JSON.stringify(
					$server.capabilities,
					null,
					2
				)}</pre>
		</div>
	</article>
{:else}
	<div class="container mx-auto px-4 py-16 text-center">
		<h1 class="mb-4 text-2xl font-bold">Server not found</h1>
		<p class="mb-6 text-muted-foreground">
			The server you're looking for doesn't exist or couldn't be loaded.
		</p>
		<button
			onclick={() => goto('/')}
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			Back to servers
		</button>
	</div>
{/if}
