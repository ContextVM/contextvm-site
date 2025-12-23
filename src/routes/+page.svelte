<script lang="ts">
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { useServerAnnouncements } from '$lib/queries/serverQueries';
	import { eventStore } from '$lib/services/eventStore';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import Seo from '$lib/components/SEO.svelte';
	import { Button } from '$lib/components/ui/button';
	import { CheckCircle, Lock, Zap, Globe, Key, Bitcoin } from '@lucide/svelte/icons';

	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);
	const serverAnnouncementsQuery = useServerAnnouncements();

	let loading = $state($serverAnnouncementsQuery.isFetching);

	// Get top 4 newest servers for preview
	const latestServers = $derived.by(() => {
		return $serverAnnouncements?.slice(0, 4) ?? [];
	});
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
		<div class="isometric-bg grid-pattern">
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
				src="/logo-black.svg"
				alt="ContextVM Logo"
				class="mx-auto mb-6 h-24 w-auto sm:mb-8 sm:h-32 dark:hidden"
			/>
			<img
				src="/logo-white.svg"
				alt="ContextVM Logo"
				class="mx-auto mb-6 hidden h-24 w-auto sm:mb-8 sm:h-32 dark:block"
			/>

			<h1 class="mb-4 text-3xl font-bold tracking-tight sm:mb-6 sm:text-4xl lg:text-6xl">
				ContextVM
			</h1>

			<p
				class="mx-auto mb-6 max-w-2xl px-4 text-base leading-relaxed text-muted-foreground sm:mb-8 sm:px-0 sm:text-lg"
			>
				ContextVM lets clients and services communicate through Nostr relays acting as a message
				bus. No domains, no inbound ports—just keys, transport, and fun.
			</p>

			<p
				class="mx-auto mb-6 max-w-2xl px-4 text-base font-medium text-muted-foreground sm:mb-8 sm:px-0 sm:text-lg"
			>
				Deploy from your room, access from anywhere.
			</p>

			<div
				class="flex w-full flex-col items-center justify-center gap-3 px-4 sm:w-auto sm:gap-4 sm:px-0"
			>
				<Button
					size="lg"
					class="w-full px-6 text-base transition-transform duration-200 hover:scale-105 sm:w-auto sm:px-8"
					href="/servers"
				>
					Browse public servers
				</Button>
				<Button
					size="lg"
					variant="outline"
					class="w-full px-6 text-base transition-transform duration-200 hover:scale-105 sm:w-auto sm:px-8"
					href="https://docs.contextvm.org"
					target="_blank"
				>
					Read docs
				</Button>
			</div>

			<div
				class="mt-6 flex flex-wrap items-center justify-center gap-3 px-4 text-sm text-muted-foreground sm:gap-4 sm:px-0"
			>
				<a
					href="https://github.com/contextvm"
					target="_blank"
					rel="noopener noreferrer"
					class="transition-colors hover:text-foreground"
				>
					GitHub
				</a>
				<span>•</span>
				<a href="/faqs" class="transition-colors hover:text-foreground">FAQs</a>
				<span>•</span>
				<a href="/about" class="transition-colors hover:text-foreground">About</a>
			</div>
		</div>
	</section>

	<!-- Value Props Section -->
	<section class="relative border-t bg-muted/30 py-12 sm:py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-4xl text-center">
				<h2
					class="mb-8 px-4 text-2xl font-bold tracking-tight sm:mb-12 sm:px-0 sm:text-3xl lg:text-4xl"
				>
					Why relay-native services?
				</h2>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
					<div
						class="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
					>
						<div
							class="mb-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20"
						>
							<Globe class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">No infrastructure</h3>
						<p class="text-sm text-muted-foreground">
							No domains or inbound ports. Relays carry traffic like a message bus.
						</p>
					</div>

					<div
						class="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
					>
						<div
							class="mb-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20"
						>
							<Key class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Keys as identity</h3>
						<p class="text-sm text-muted-foreground">
							Address and authorize services with cryptographic keys—no OAuth required.
						</p>
					</div>

					<div
						class="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
					>
						<div
							class="mb-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20"
						>
							<Lock class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Encrypted by default</h3>
						<p class="text-sm text-muted-foreground">
							Signed requests + end-to-end encryption (NIP-44).
						</p>
					</div>

					<div
						class="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
					>
						<div
							class="mb-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20"
						>
							<Zap class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Public or private</h3>
						<p class="text-sm text-muted-foreground">
							Announce publicly—or stay private and share only a pubkey.
						</p>
					</div>

					<div
						class="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
					>
						<div
							class="mb-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20"
						>
							<CheckCircle class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Works with existing MCP</h3>
						<p class="text-sm text-muted-foreground">
							Gateway/Proxy lets you reuse MCP servers and clients without rewrites.
						</p>
					</div>

					<div
						class="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
					>
						<div
							class="mb-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20"
						>
							<Bitcoin class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Optional payments</h3>
						<p class="text-sm text-muted-foreground">
							Native Lightning pay-per-call, subscriptions, or free access.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Use Cases Section -->
	<section class="relative border-t py-12 sm:py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-5xl">
				<div class="text-center">
					<h2
						class="mb-8 px-4 text-2xl font-bold tracking-tight sm:mb-12 sm:px-0 sm:text-3xl lg:text-4xl"
					>
						What you can build
					</h2>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Composable tool services
						</h3>
						<p class="text-sm text-muted-foreground">
							Wrap scripts, APIs, or agents as reusable services you can chain together.
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Private org tooling
						</h3>
						<p class="text-sm text-muted-foreground">
							Ship internal services with pubkey-only access—no public endpoint required.
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Monetized endpoints
						</h3>
						<p class="text-sm text-muted-foreground">
							Charge per call with Lightning—no payment processor, no accounts.
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Community infrastructure
						</h3>
						<p class="text-sm text-muted-foreground">
							Publish shared services communities can discover and use (opt-in public).
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Automation & CI runners
						</h3>
						<p class="text-sm text-muted-foreground">
							Trigger workflows from anywhere; integrate with bots and pipelines.
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Data transforms & validation
						</h3>
						<p class="text-sm text-muted-foreground">
							Offer normalization, scoring, redaction, or analysis as a callable service.
						</p>
					</div>
				</div>

				<div class="mt-8 text-center">
					<a
						href="https://github.com/contextvm/awesome"
						target="_blank"
						rel="noopener noreferrer"
						class="group inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Discover more use cases in the Awesome list
						<span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="relative border-t bg-muted/30 py-12 sm:py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-4xl text-center">
				<h2
					class="mb-8 px-4 text-2xl font-bold tracking-tight sm:mb-12 sm:px-0 sm:text-3xl lg:text-4xl"
				>
					How it works
				</h2>

				<div class="mb-6 sm:mb-8">
					<div
						class="mb-4 inline-block rounded-lg bg-primary/10 px-4 py-2 font-mono text-base sm:mb-6 sm:px-6 sm:py-3 sm:text-lg"
					>
						Client ⇄ Relay(s) ⇄ Server
					</div>
				</div>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
					<div class="group text-center transition-transform duration-200 hover:scale-105">
						<div
							class="mb-4 text-2xl font-bold text-primary transition-transform group-hover:scale-110"
						>
							1
						</div>
						<h3 class="mb-3 text-lg font-semibold">Run</h3>
						<p class="text-sm text-muted-foreground">
							Start a ContextVM-enabled server (or wrap an existing MCP server via Gateway).
						</p>
					</div>

					<div class="group text-center transition-transform duration-200 hover:scale-105">
						<div
							class="mb-4 text-2xl font-bold text-primary transition-transform group-hover:scale-110"
						>
							2
						</div>
						<h3 class="mb-3 text-lg font-semibold">Connect</h3>
						<p class="text-sm text-muted-foreground">
							Clients can discover public servers via relays—or connect directly using the server's
							pubkey.
						</p>
					</div>

					<div class="group text-center transition-transform duration-200 hover:scale-105">
						<div
							class="mb-4 text-2xl font-bold text-primary transition-transform group-hover:scale-110"
						>
							3
						</div>
						<h3 class="mb-3 text-lg font-semibold">Relay</h3>
						<p class="text-sm text-muted-foreground">
							Relays forward signed, encrypted requests and responses. They don't interpret your
							protocol or auth—they just route messages.
						</p>
					</div>
				</div>

				<div class="mt-8">
					<Button
						variant="outline"
						href="/faqs#how-does-contextvm-achieve-decentralization"
						class="text-sm transition-transform duration-200 hover:scale-105"
					>
						Learn more about the protocol
					</Button>
				</div>
			</div>
		</div>
	</section>

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

					<div class="mt-8 text-center sm:mt-12">
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

	<!-- Get Started Section -->
	<section class="relative border-t bg-muted/30 py-12 sm:py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-5xl">
				<div class="text-center">
					<h2
						class="mb-8 px-4 text-2xl font-bold tracking-tight sm:mb-12 sm:px-0 sm:text-3xl lg:text-4xl"
					>
						Get started
					</h2>
				</div>

				<div class="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
					<div
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6 lg:p-8"
					>
						<h3
							class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary sm:mb-4 sm:text-xl"
						>
							Run a server
						</h3>
						<p class="mb-4 text-sm text-muted-foreground sm:mb-6">
							Use the ContextVM Gateway to expose any existing MCP server over Nostr.
						</p>
						<div
							class="mb-4 rounded-lg bg-muted p-3 transition-colors group-hover:bg-muted/80 sm:mb-6 sm:p-4"
						>
							<pre class="overflow-x-auto text-xs"><code
									>gateway-cli \
	 --private-key "your-key" \
	 --relays "wss://relay.nostr.org" \
	 --server "python my-mcp-server.py"</code
								></pre>
						</div>
						<div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
							<Button
								size="sm"
								href="https://github.com/contextvm/gateway-cli"
								target="_blank"
								class="transition-transform duration-200 hover:scale-105"
							>
								Gateway repo
							</Button>
							<Button
								size="sm"
								variant="outline"
								href="https://docs.contextvm.org"
								target="_blank"
								class="transition-transform duration-200 hover:scale-105"
							>
								Docs
							</Button>
						</div>
					</div>

					<div
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6 lg:p-8"
					>
						<h3
							class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary sm:mb-4 sm:text-xl"
						>
							Connect a client
						</h3>
						<p class="mb-4 text-sm text-muted-foreground sm:mb-6">
							Use the ContextVM Proxy to let any MCP client access Nostr-hosted services.
						</p>
						<div
							class="mb-4 rounded-lg bg-muted p-3 transition-colors group-hover:bg-muted/80 sm:mb-6 sm:p-4"
						>
							<pre class="overflow-x-auto text-xs"><code
									>proxy-cli \
	 --private-key "your-key" \
	 --relays "wss://relay.nostr.org" \
	 --server-pubkey "npub1..."</code
								></pre>
						</div>
						<div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
							<Button
								size="sm"
								href="https://github.com/contextvm/proxy-cli"
								target="_blank"
								class="transition-transform duration-200 hover:scale-105"
							>
								Proxy repo
							</Button>
							<Button
								size="sm"
								variant="outline"
								href="https://docs.contextvm.org"
								target="_blank"
								class="transition-transform duration-200 hover:scale-105"
							>
								Docs
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Ecosystem Links Section -->
	<section class="relative border-t py-12 sm:py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-4xl text-center">
				<h2
					class="mb-8 px-4 text-2xl font-bold tracking-tight sm:mb-12 sm:px-0 sm:text-3xl lg:text-4xl"
				>
					Explore the ecosystem
				</h2>

				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
					<a
						href="https://docs.contextvm.org"
						target="_blank"
						rel="noopener noreferrer"
						class="group rounded-lg border bg-card p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-4"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							Documentation
						</div>
						<div class="text-xs text-muted-foreground">Full protocol docs</div>
					</a>

					<a
						href="https://github.com/contextvm/ts-sdk"
						target="_blank"
						rel="noopener noreferrer"
						class="group rounded-lg border bg-card p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-4"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							TypeScript SDK
						</div>
						<div class="text-xs text-muted-foreground">Native Nostr transport</div>
					</a>

					<a
						href="https://github.com/contextvm/gateway-cli"
						target="_blank"
						rel="noopener noreferrer"
						class="group rounded-lg border bg-card p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-4"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							Gateway
						</div>
						<div class="text-xs text-muted-foreground">Expose MCP servers</div>
					</a>

					<a
						href="https://github.com/contextvm/proxy-cli"
						target="_blank"
						rel="noopener noreferrer"
						class="group rounded-lg border bg-card p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-4"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							Proxy
						</div>
						<div class="text-xs text-muted-foreground">Connect MCP clients</div>
					</a>

					<a
						href="https://github.com/contextvm/awesome"
						target="_blank"
						rel="noopener noreferrer"
						class="group rounded-lg border bg-card p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-4"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							Awesome list
						</div>
						<div class="text-xs text-muted-foreground">Resources & tools</div>
					</a>

					<a
						href="https://github.com/contextvm"
						target="_blank"
						rel="noopener noreferrer"
						class="group rounded-lg border bg-card p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-4"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							GitHub org
						</div>
						<div class="text-xs text-muted-foreground">All repositories</div>
					</a>

					<a
						href="/blog"
						class="group rounded-lg border bg-card p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-4"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							Blog
						</div>
						<div class="text-xs text-muted-foreground">Updates & tutorials</div>
					</a>

					<a
						href="/faqs"
						class="group rounded-lg border bg-card p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-4"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							FAQs
						</div>
						<div class="text-xs text-muted-foreground">Common questions</div>
					</a>
				</div>
			</div>
		</div>
	</section>
</main>
