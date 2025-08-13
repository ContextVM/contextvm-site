<script lang="ts">
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { useServerAnnouncements } from '$lib/queries/serverQueries';
	import { eventStore } from '$lib/services/eventStore';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';

	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);

	const serverAnnouncementsQuery = useServerAnnouncements();

	let loading = $state($serverAnnouncementsQuery.isFetching);
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
		</div>

		<!-- Server Announcements Section -->
		<div class="mx-auto max-w-6xl">
			{#if $serverAnnouncements?.length}
				<h2 class="mb-8 text-3xl font-bold">Available MCP Servers</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each $serverAnnouncements as server (server.id)}
						<ServerCard {server} />
					{/each}
				</div>
			{:else if !$serverAnnouncements?.length && !loading}
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
