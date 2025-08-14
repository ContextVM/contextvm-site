<script lang="ts">
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { useServerAnnouncements } from '$lib/queries/serverQueries';
	import { eventStore } from '$lib/services/eventStore';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import Seo from '$lib/components/SEO.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { isHexKey } from 'applesauce-core/helpers';

	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);

	const serverAnnouncementsQuery = useServerAnnouncements();

	let loading = $state($serverAnnouncementsQuery.isFetching);
	let searchTerm = $state('');

	const filteredServerAnnouncements = $derived.by(() => {
		if (!searchTerm.trim()) {
			return $serverAnnouncements;
		}

		const term = searchTerm.toLowerCase().trim();
		return (
			$serverAnnouncements?.filter(
				(server) =>
					server.name.toLowerCase().includes(term) ||
					server.about?.toLowerCase().includes(term) ||
					server.website?.toLowerCase().includes(term) ||
					server.pubkey.includes(term)
			) ?? []
		);
	});
</script>

<Seo
	title="Home"
	description="Discover and connect with Model Context Protocol (MCP) servers on Nostr."
/>
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

			<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">ContextVM</h1>
		</div>

		<!-- Server Announcements Section -->
		<div class="mx-auto max-w-6xl">
			<!-- Search Section -->
			<div class="mb-12 flex flex-col items-center justify-center gap-4">
				<Input
					bind:value={searchTerm}
					type="text"
					placeholder="🔎 Search servers by name, about, website, or pubkey..."
					class="w-full max-w-md"
				/>
			</div>

			{#if filteredServerAnnouncements?.length > 0}
				<div class="mb-12 text-center">
					<h2 class="mb-4 text-3xl font-bold">
						Available MCP Servers
						{#if searchTerm}
							<span class="ml-2 text-lg font-normal text-muted-foreground">
								({filteredServerAnnouncements.length} results)
							</span>
						{/if}
					</h2>
				</div>
				<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each filteredServerAnnouncements as server (server.id)}
						<div class="w-full max-w-sm">
							<ServerCard {server} />
						</div>
					{/each}
				</div>
			{:else if searchTerm && !loading}
				{@const isValidPubkey = isHexKey(searchTerm)}
				{#if filteredServerAnnouncements?.length === 0}
					<div class="mt-12 text-center">
						<p class="mb-4 text-muted-foreground">No servers found matching "{searchTerm}"</p>
						{#if isValidPubkey}
							<p class="mb-4 text-muted-foreground">
								This seems to be a valid pubkey. Go to the server page to connect.
							</p>
							<Button class="px-6" href="/s/{searchTerm}">Go</Button>
						{/if}
					</div>
				{:else}
					<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each Array(3) as _, i (i)}
							<div class="w-full max-w-sm">
								<LoadingCard layout="article" />
							</div>
						{/each}
					</div>
				{/if}
			{:else if !$serverAnnouncements?.length && !loading}
				<div class="mt-12 text-center text-muted-foreground">
					<p>No MCP servers found. Check back later for server announcements.</p>
				</div>
			{:else if loading}
				<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each Array(3) as _, i (i)}
						<div class="w-full max-w-sm">
							<LoadingCard layout="article" />
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>
