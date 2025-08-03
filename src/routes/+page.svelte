<script lang="ts">
	import { eventStore } from '$lib/services/eventStore';
	import { serverAnnouncementsLoader } from '$lib/services/loaders';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';

	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);
	let loading = $state(false);
	$effect(() => {
		loading = true;
		const sub = serverAnnouncementsLoader().subscribe({
			complete: () => {
				setTimeout(() => {
					loading = false;
				}, 500);
			}
		});
		return () => {
			sub.unsubscribe();
		};
	});
</script>

<main class="min-h-screen bg-background px-4 py-8">
	<div class="container mx-auto">
		<!-- Header Section -->
		<div class="mx-auto mb-12 max-w-4xl text-center">
			<img
				src="/logo-black.svg"
				alt="ContextVM Logo"
				class="mx-auto mb-8 h-32 w-auto dark:hidden"
			/>
			<img
				src="/logo-white.svg"
				alt="ContextVM Logo"
				class="mx-auto mb-8 hidden h-32 w-auto dark:block"
			/>

			<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">Welcome to ContextVM</h1>
			<p class="mb-8 text-lg text-muted-foreground">
				Discover and connect with Model Context Protocol (MCP) servers on Nostr
			</p>

			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<a
					href="https://contextvm.org"
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Read docs
				</a>
			</div>
		</div>

		<!-- Server Announcements Section -->
		<div class="mx-auto max-w-6xl">
			<h2 class="mb-8 text-3xl font-bold">Available MCP Servers</h2>

			{#if $serverAnnouncements.length}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each $serverAnnouncements as server (server.id)}
						<ServerCard {server} />
					{/each}
				</div>
			{:else if !$serverAnnouncements.length && !loading}
				<div class="mt-8 text-center text-muted-foreground">
					<p>No MCP servers found. Check back later for server announcements.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each Array(3) as _, i (i)}
						<LoadingCard layout="article" />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>
