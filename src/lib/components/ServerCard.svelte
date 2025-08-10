<script lang="ts">
	import { formatUnixTimestamp, pubkeyToHexColor } from '$lib/utils';
	import type { ServerAnnouncement } from '$lib/models/serverAnnouncements';

	let { server }: { server: ServerAnnouncement } = $props();

	const date = formatUnixTimestamp(server.created_at, true);
	const serverHref = `/s/${server.pubkey}`;
</script>

<a
	href={serverHref}
	class="group block h-full overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md hover:shadow-primary/10"
>
	<div class="grid h-full grid-rows-[auto_auto_1fr_auto]">
		{#if server.picture}
			<div class="aspect-video overflow-hidden bg-muted">
				<img
					src={server.picture}
					alt={server.name}
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			</div>
		{:else}
			<div
				class="flex aspect-video items-center justify-center overflow-hidden bg-muted"
				style="background-color: {pubkeyToHexColor(server.pubkey)}"
			></div>
		{/if}
		<div class="p-6">
			<div class="mb-2 flex items-center justify-between text-sm text-muted-foreground">
				<time datetime={formatUnixTimestamp(server.created_at, true)}>{date}</time>
				{#if server.supportsEncryption}
					<span
						class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
					>
						🔒
					</span>
				{/if}
			</div>
			<h3
				class="mb-2 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary md:text-2xl"
			>
				{server.name}
			</h3>
			<div class="mb-4 overflow-hidden text-muted-foreground">
				<p class="line-clamp-3 text-sm">
					Version: {server.capabilities?.serverInfo?.version || 'Unknown'}
				</p>
			</div>
			<div class="flex items-center text-sm font-medium text-primary">
				{#if server.website}
					Visit server
					<span class="ml-1 transition-transform group-hover:translate-x-1">→</span>
				{:else}
					View details
					<span class="ml-1 transition-transform group-hover:translate-x-1">→</span>
				{/if}
			</div>
		</div>
	</div>
</a>
