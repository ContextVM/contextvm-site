<script lang="ts">
	import { resolve } from '$app/paths';
	import ServerCard from '$lib/components/ServerCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { useServerAnnouncements } from '$lib/queries/serverQueries';
	import { eventStore } from '$lib/services/eventStore';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import Seo from '$lib/components/SEO.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		CheckCircle,
		Lock,
		Zap,
		Globe,
		Key,
		Bitcoin,
		Users,
		TrendingUp
	} from '@lucide/svelte/icons';

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
				src="/logo-black.svg"
				alt="ContextVM Logo"
				class="mx-auto mb-6 h-24 w-auto sm:mb-8 sm:h-32 dark:hidden"
			/>
			<img
				src="/logo-white.svg"
				alt="ContextVM Logo"
				class="mx-auto mb-6 hidden h-24 w-auto sm:mb-8 sm:h-32 dark:block"
			/>

			<h1 class="mb-4 text-4xl font-bold tracking-tight sm:mb-6 sm:text-5xl lg:text-7xl">
				ContextVM
			</h1>

			<p
				class="mx-auto mb-6 max-w-2xl px-4 text-base leading-relaxed text-muted-foreground sm:mb-8 sm:px-0 sm:text-lg"
			>
				A protocol built on MCP that enables servers and clients to communicate over the Nostr
				network. Servers are addressed by public keys, and requests are signed and encrypted. Relays
				act as a distributed message bus. No domains, DNS, IPs, or complex configurations. Deploy
				with ease <br /> Fun and permissionless.
			</p>

			<p class="mx-auto mb-6 max-w-2xl px-4 text-lg font-semibold text-foreground sm:mb-8 sm:px-0">
				Your backend can move—your address stays.
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

	<!-- Value Props Section -->
	<section class="relative border-t bg-muted/30 py-12 sm:py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-4xl text-center">
				<div class="mb-8">
					<h2 class="mb-3 px-4 text-2xl font-bold tracking-tight sm:px-0 sm:text-3xl lg:text-4xl">
						Why?
					</h2>
					<p class="text-lg font-medium text-muted-foreground">Permissionless by design</p>
				</div>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
					<div
						class="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
					>
						<div
							class="mb-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20"
						>
							<Globe class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">No centralized dependencies</h3>
						<p class="text-sm text-muted-foreground">
							No domains, DNS, static IPs, or port forwarding—just relays acting as a distributed
							message bus.
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
						<h3 class="mb-2 text-lg font-semibold">Public keys, no accounts</h3>
						<p class="text-sm text-muted-foreground">
							Identity and authorization via public key cryptography—no OAuth, no API keys. Just
							permissionless math.
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
							End-to-end encryption (NIP-44). Relays just relay—they can't read or mutate your
							messages.
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
						<h3 class="mb-2 text-lg font-semibold">Rolling services</h3>
						<p class="text-sm text-muted-foreground">
							Move backends across networks and jurisdictions without breaking clients. Your public
							key stays the same.
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
						<h3 class="mb-2 text-lg font-semibold">Works with any MCP server</h3>
						<p class="text-sm text-muted-foreground">
							Build servers and clients using the official MCP SDK and our TypeScript SDK. Reuse
							existing MCP servers and clients using the Gateway/Proxy.
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
						<h3 class="mb-2 text-lg font-semibold">Payments</h3>
						<p class="text-sm text-muted-foreground">
							Monetize services with Bitcoin micropayments. This can be extended to any custom
							payment method.
						</p>
					</div>

					<div
						class="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
					>
						<div
							class="mb-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20"
						>
							<Users class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">No gatekeepers</h3>
						<p class="text-sm text-muted-foreground">
							Decentralized registry of servers on Nostr. Discover and use services organically—no
							gated registries.
						</p>
					</div>

					<div
						class="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
					>
						<div
							class="mb-4 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20"
						>
							<TrendingUp class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Organic reputation</h3>
						<p class="text-sm text-muted-foreground">
							Servers and providers grow reputation. Users curate and share lists—trust emerges from
							the network, not authorities.
						</p>
					</div>
				</div>
				<div class="mt-10 text-center">
					<Button
						variant="outline"
						href="/faqs"
						class="transition-transform duration-200 hover:scale-105"
					>
						Find more answers in our FAQs
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Not Just for AI Section -->
	<section class="relative border-t py-12 sm:py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-4xl text-center">
				<h2
					class="mb-8 px-4 text-2xl font-bold tracking-tight sm:mb-12 sm:px-0 sm:text-3xl lg:text-4xl"
				>
					Not just for AI
				</h2>

				<div class="mx-auto max-w-3xl">
					<p class="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
						While ContextVM allows you to connect AI agents to services over Nostr, MCP servers are
						far more versatile. They provide a common language for servers to define their APIs and
						clients to consume them—creating shared semantics that solve interoperability.
					</p>

					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
						<div class="group text-center transition-transform duration-200 hover:scale-105">
							<div
								class="rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
							>
								<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
									Dual API
								</h3>
								<p class="text-sm text-muted-foreground">
									Write your server once and use it through a custom interface or let an LLM operate
									it—one protocol for humans and machines.
								</p>
							</div>
						</div>

						<div class="group text-center transition-transform duration-200 hover:scale-105">
							<div
								class="rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
							>
								<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
									Universal Semantics
								</h3>
								<p class="text-sm text-muted-foreground">
									MCP's natural language descriptions make servers self-documenting. Both humans and
									LLMs understand what services do without complex documentation.
								</p>
							</div>
						</div>
					</div>

					<p class="mt-8 text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
						Build once, deploy everywhere. Your service becomes a reusable component in any language
						or platform—accessible through code, web interfaces, or AI agents.
					</p>
				</div>
				<div class="mt-10 text-center">
					<Button
						variant="outline"
						href="/blog/HeekLEB1p4rU61ngbuFrH"
						class="transition-transform duration-200 hover:scale-105"
					>
						Discover CtxCN
					</Button>
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

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Composable micro-backends
						</h3>
						<p class="text-sm text-muted-foreground">
							Wrap scripts, APIs, or agents as reusable services you can chain together. The
							possibilities are endless.
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Private org tooling
						</h3>
						<p class="text-sm text-muted-foreground">
							Ship internal services with public key-only access—no public endpoint required.
							Secured by public key cryptography.
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Monetized endpoints
						</h3>
						<p class="text-sm text-muted-foreground">
							Charge per call with Lightning or other payment methods—permissionless, no accounts
							required.
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							IoT Command Hub
						</h3>
						<p class="text-sm text-muted-foreground">
							Trigger physical actions from anywhere—"turn on lights," "open garage," all private,
							secure, and addressable by a public key.
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Code Sandbox
						</h3>
						<p class="text-sm text-muted-foreground">
							Execute untrusted code safely and return results. Isolated, auditable, sovereign.
						</p>
					</div>

					<div
						class="group rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					>
						<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
							Multi-jurisdiction apps
						</h3>
						<p class="text-sm text-muted-foreground">
							Static frontends anywhere; backend moves like a caravan. Deploy resilient,
							geographically distributed applications.
						</p>
					</div>
				</div>

				<div class="mt-10 flex flex-col items-center gap-4 text-center">
					<p class="text-lg font-medium text-muted-foreground">And much more</p>

					<Button
						variant="outline"
						href="https://github.com/contextvm/awesome"
						target="_blank"
						rel="noopener noreferrer"
						class="w-fit transition-transform duration-200 hover:scale-105"
					>
						Discover more use cases in the Awesome list
					</Button>
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

				<div class="mb-8 sm:mb-12">
					<div
						class="inline-block rounded-lg bg-primary/10 px-4 py-2 font-mono text-base sm:px-6 sm:py-3 sm:text-lg"
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
							Start a ContextVM-enabled server (or wrap an existing MCP server via the Gateway).
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
							public key.
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
							Relays forward encrypted messages. If one dies, switch routes—the protocol keeps
							moving.
						</p>
					</div>
				</div>

				<div class="mt-10">
					<Button
						variant="outline"
						href="https://docs.contextvm.org"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-transform duration-200 hover:scale-105"
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

	<!-- Getting Started as Developer Section -->
	<section class="relative border-t bg-muted/30 py-12 sm:py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-4xl text-center">
				<h2
					class="mb-8 px-4 text-2xl font-bold tracking-tight sm:mb-12 sm:px-0 sm:text-3xl lg:text-4xl"
				>
					Getting started as a developer
				</h2>

				<div class="mx-auto max-w-3xl">
					<div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
						<div class="group text-center transition-transform duration-200 hover:scale-105">
							<div
								class="rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
							>
								<div class="mb-3 text-2xl font-bold text-primary">1</div>
								<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
									Build or pick a server
								</h3>
								<p class="text-sm text-muted-foreground">
									Use the official MCP SDK to build a server, or pick any existing MCP server. If
									you're using TypeScript, our SDK provides native Nostr transports that plug
									directly into MCP servers. For existing servers, use the Gateway CLI to expose
									them—just define your private key and relays.
								</p>
							</div>
						</div>

						<div class="group text-center transition-transform duration-200 hover:scale-105">
							<div
								class="rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
							>
								<div class="mb-3 text-2xl font-bold text-primary">2</div>
								<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
									Build or connect a client
								</h3>
								<p class="text-sm text-muted-foreground">
									If your client is in TypeScript, use our SDK to build a client with Nostr
									transport. Want to use your server with AI models? Use the Proxy CLI to expose it
									as a regular MCP server in any MCP host application.
								</p>
							</div>
						</div>
					</div>

					<div class="mt-10 text-center">
						<Button
							variant="outline"
							href="https://docs.contextvm.org"
							target="_blank"
							rel="noopener noreferrer"
							class="transition-transform duration-200 hover:scale-105"
						>
							Read the docs for detailed instructions
						</Button>
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

				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
					<a
						href="https://docs.contextvm.org"
						target="_blank"
						rel="noopener noreferrer"
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
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
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
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
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
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
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
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
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							Awesome list
						</div>
						<div class="text-xs text-muted-foreground">Resources & tools</div>
					</a>

					<a
						href="https://github.com/ContextVM/ctxcn"
						target="_blank"
						rel="noopener noreferrer"
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							CtxCN
						</div>
						<div class="text-xs text-muted-foreground">Build clients faster</div>
					</a>

					<a
						href={resolve(blogHref)}
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
					>
						<div
							class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg"
						>
							Blog
						</div>
						<div class="text-xs text-muted-foreground">Updates & tutorials</div>
					</a>

					<a
						href={resolve(faqsHref)}
						class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
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
