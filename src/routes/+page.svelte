<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { useServerAnnouncements } from '$lib/queries/serverQueries';
	import { eventStore } from '$lib/services/eventStore';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import Seo from '$lib/components/SEO.svelte';
	import { Button } from '$lib/components/ui/button';
	import ValuePropsSection from '$lib/components/landing/ValuePropsSection.svelte';
	import DualApiSection from '$lib/components/landing/DualApiSection.svelte';
	import UseCasesSection from '$lib/components/landing/UseCasesSection.svelte';
	import HowItWorksSection from '$lib/components/landing/HowItWorksSection.svelte';
	import GettingStartedSection from '$lib/components/landing/GettingStartedSection.svelte';
	import EcosystemSection from '$lib/components/landing/EcosystemSection.svelte';

	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);
	const serverAnnouncementsQuery = useServerAnnouncements();

	// Get top 4 newest servers for preview
	const latestServers = $derived.by(() => {
		return $serverAnnouncements?.slice(0, 4) ?? [];
	});

	const loading = $derived.by(() => $serverAnnouncementsQuery.isFetching);

	const faqsHref = $derived<`/faqs`>('/faqs');
	const aboutHref = $derived<`/about`>('/about');
	const blogHref = $derived<`/blog`>('/blog');
	const logoBlackSrc = asset('/logo-black.svg');
	const logoWhiteSrc = asset('/logo-white.svg');
</script>

<Seo
	title="ContextVM"
	description="Decentralized transport for MCP servers on Nostr. No domains, no OAuth, no port forwarding—just keys, relays, and optional Lightning payments."
/>

<main class="relative overflow-x-hidden bg-background">
	<!-- Hero Section -->
	<section class="relative flex min-h-screen items-center justify-center">
		<!-- Subtle Background Gradients -->
		<div class="bg-gradients">
			<div class="bg-gradient bg-gradient-1"></div>
			<div class="bg-gradient bg-gradient-2"></div>
			<div class="bg-gradient bg-gradient-3"></div>
		</div>

		<!-- 3D Background Shapes -->
		<div class="isometric-bg bg-mask">
			<!-- Rectangles - varied sizes -->
			<div class="isometric-square shape-rect" data-size="xl"></div>
			<div class="isometric-square shape-rect" data-size="sm"></div>
			<div class="isometric-square shape-rect" data-size="lg"></div>
			<div class="isometric-square shape-rect" data-size="xs"></div>

			<!-- Squares - varied sizes -->
			<div class="isometric-square shape-square" data-size="md"></div>
			<div class="isometric-square shape-square" data-size="xs"></div>
			<div class="isometric-square shape-square" data-size="sm"></div>

			<!-- Circles - varied sizes -->
			<div class="isometric-square shape-circle" data-size="lg"></div>
			<div class="isometric-square shape-circle" data-size="xs"></div>
			<div class="isometric-square shape-circle" data-size="xl"></div>

			<!-- Blobs - varied sizes -->
			<div class="isometric-square shape-blob" data-size="xl"></div>
			<div class="isometric-square shape-blob" data-size="md"></div>
			<div class="isometric-square shape-blob" data-size="sm"></div>
		</div>

		<div class="animate-fade-in-up z-10 mx-auto max-w-4xl px-4 text-center sm:px-0">
			<img
				src={logoBlackSrc}
				alt="ContextVM Logo"
				class="mx-auto mb-6 h-24 w-auto sm:mb-8 sm:h-32 dark:hidden"
			/>
			<img
				src={logoWhiteSrc}
				alt="ContextVM Logo"
				class="mx-auto mb-6 hidden h-24 w-auto sm:mb-8 sm:h-32 dark:block"
			/>

			<h1 class="mb-4 text-4xl font-bold tracking-tight sm:mb-6 sm:text-5xl lg:text-7xl">
				ContextVM
			</h1>

			<p
				class="mx-auto mb-6 max-w-2xl px-4 text-base leading-relaxed text-muted-foreground sm:mb-8 sm:px-0 sm:text-lg"
			>
				A transport layer for MCP over the Nostr network—an open communication network built on
				cryptographic, censorship-resistant, and permissionless foundations. No domains, no OAuth,
				no port forwarding—just keys, relays, and optional payments.
			</p>

			<p class="mx-auto mb-6 max-w-2xl px-4 text-lg font-semibold text-foreground sm:mb-8 sm:px-0">
				Your backend can move—your address stays. Your infrastructure, your rules.
			</p>

			<div
				class="flex w-full flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-4 sm:px-0"
			>
				<Button
					size="lg"
					class="w-full px-6 text-base transition-transform duration-200 hover:scale-105 sm:w-auto sm:px-8"
					href="https://docs.contextvm.org"
					target="_blank"
				>
					Read docs
				</Button>
				<Button
					size="lg"
					variant="outline"
					class="w-full px-6 text-base transition-transform duration-200 hover:scale-105 sm:w-auto sm:px-8"
					href="/servers"
				>
					Browse public servers
				</Button>
			</div>

			<div
				class="mt-8 flex flex-wrap items-center justify-center gap-3 px-4 text-sm text-muted-foreground sm:gap-4 sm:px-0"
			>
				<a
					href="https://jumble.social/npub1dvmcpmefwtnn6dctsj3728n64xhrf06p9yude77echmrkgs5zmyqw33jdm"
					target="_blank"
					rel="noopener noreferrer"
					class="transition-colors hover:text-foreground"
				>
					Nostr
				</a>
				<span>•</span>
				<a href={resolve(faqsHref)} class="transition-colors hover:text-foreground">FAQs</a>
				<span>•</span>
				<a href={resolve(aboutHref)} class="transition-colors hover:text-foreground">About</a>
				<span>•</span>
				<a href={resolve(blogHref)} class="transition-colors hover:text-foreground">Blog</a>
			</div>
		</div>
	</section>

	<ValuePropsSection />
	<DualApiSection />
	<UseCasesSection />
	<HowItWorksSection />

	<!-- Servers Preview Section -->
	{#if latestServers.length > 0}
		<section class="border-t py-12 sm:py-16">
			<div class="container mx-auto px-4">
				<div class="mx-auto max-w-6xl">
					<div class="mb-8 text-center sm:mb-12">
						<h2
							class="mb-3 px-4 text-2xl font-bold tracking-tight sm:mb-4 sm:px-0 sm:text-3xl lg:text-4xl"
						>
							Latest public servers
						</h2>
						<p class="px-4 text-base text-muted-foreground sm:px-0 sm:text-lg">
							Discover public servers running on the Nostr network
						</p>
					</div>

					<div
						class="grid grid-cols-1 justify-items-center gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4"
					>
						{#each latestServers as server (server.id)}
							<div class="w-full max-w-sm">
								<ServerCard {server} />
							</div>
						{/each}
					</div>

					<div class="mt-10 text-center sm:mt-12">
						<Button size="lg" href="/servers">View all public servers</Button>
					</div>
				</div>
			</div>
		</section>
	{:else if loading}
		<section class="border-t py-12 sm:py-16">
			<div class="container mx-auto px-4">
				<div class="mx-auto max-w-6xl">
					<div class="mb-8 text-center sm:mb-12">
						<h2
							class="mb-3 px-4 text-2xl font-bold tracking-tight sm:mb-4 sm:px-0 sm:text-3xl lg:text-4xl"
						>
							Latest public servers
						</h2>
					</div>

					<div
						class="grid grid-cols-1 justify-items-center gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4"
					>
						{#each Array(4) as _, i (i)}
							<div class="w-full max-w-sm">
								<LoadingCard layout="article" />
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>
	{/if}

	<GettingStartedSection />
	<EcosystemSection />
</main>
