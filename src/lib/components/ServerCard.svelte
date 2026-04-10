<script lang="ts">
	import { resolve } from '$app/paths';
	import { truncateString } from '$lib/utils';
	import type { ServerAnnouncement } from '$lib/models/serverAnnouncements';

	let {
		server,
		serverIdentifier
	}: {
		server: ServerAnnouncement;
		serverIdentifier?: string;
	} = $props();

	const activeSinceDate = $derived.by(() => {
		const d = new Date(server.created_at * 1000);
		const day = d.getDate();
		const month = d.getMonth() + 1;
		const year = d.getFullYear().toString().slice(-2);
		return `${day}.${month}.${year}`;
	});
	const activeSinceDateTime = $derived.by(() => new Date(server.created_at * 1000).toISOString());
	const serverHref = $derived<`/s/${string}`>(`/s/${serverIdentifier ?? server.pubkey}`);
</script>

<a
	href={resolve(serverHref)}
	class="group block h-full min-h-[220px] overflow-hidden rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] active:shadow-sm sm:min-h-[250px] lg:min-h-[282px] lg:p-8"
>
	<div class="flex h-full min-w-0 flex-col justify-between gap-6">
		<div class="min-w-0 space-y-4">
			<h3 class="truncate text-xl font-semibold tracking-tight">{server.name}</h3>
			{#if server.about}
				<p class="line-clamp-3 text-sm text-muted-foreground">
					{truncateString(server.about)}
				</p>
			{/if}
		</div>
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div class="flex min-w-0 flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
					<span class="text-xs uppercase tracking-wide text-muted-foreground">Live</span>
				</div>
				<time class="text-xs tracking-wide text-muted-foreground" datetime={activeSinceDateTime}>
					Active since {activeSinceDate}
				</time>
			</div>
			<span class="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-primary sm:self-end">
				Visit server <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
			</span>
		</div>
	</div>
</a>
