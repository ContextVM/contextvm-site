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

<main class="min-h-screen bg-background relative overflow-x-hidden">
	<!-- Subtle Background Elements -->
	<div class="absolute inset-0 -z-10">
		<div class="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background"></div>
		<div class="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent"></div>
	</div>

	<!-- Hero Section -->
	<section class="container mx-auto px-4 py-16 sm:py-20 relative">
		<div class="mx-auto max-w-4xl text-center animate-fade-in-up">
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

			<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
				ContextVM
			</h1>

			<p class="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
				ContextVM lets clients and services communicate through Nostr relays acting as a message bus.
				No domains, no inbound ports—just keys, transport, and fun.
			</p>

			<p class="mx-auto mb-8 max-w-2xl text-lg font-medium text-muted-foreground">
				Deploy from your room, access from anywhere.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button size="lg" class="px-8 text-base hover:scale-105 transition-transform duration-200" href="/servers">
					Browse public servers
				</Button>
				<Button size="lg" variant="outline" class="px-8 text-base hover:scale-105 transition-transform duration-200" href="https://docs.contextvm.org" target="_blank">
					Read docs
				</Button>
			</div>

			<div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
				<a href="https://github.com/contextvm" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors">
					GitHub
				</a>
				<span>•</span>
				<a href="/faqs" class="hover:text-foreground transition-colors">FAQs</a>
				<span>•</span>
				<a href="/about" class="hover:text-foreground transition-colors">About</a>
			</div>
		</div>
	</section>

	<!-- Value Props Section -->
	<section class="border-t bg-muted/30 py-16 relative">
		<div class="absolute inset-0 bg-grid-pattern"></div>
		<div class="container mx-auto px-4 relative">
			<div class="mx-auto max-w-4xl text-center">
				<h2 class="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">
					Why relay-native services?
				</h2>

				<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					<div class="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-200">
						<div class="mb-4 rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
							<Globe class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">No infrastructure</h3>
						<p class="text-sm text-muted-foreground">
							No domains or inbound ports. Relays carry traffic like a message bus.
						</p>
					</div>

					<div class="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-200">
						<div class="mb-4 rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
							<Key class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Keys as identity</h3>
						<p class="text-sm text-muted-foreground">
							Address and authorize services with cryptographic keys—no OAuth required.
						</p>
					</div>

					<div class="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-200">
						<div class="mb-4 rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
							<Lock class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Encrypted by default</h3>
						<p class="text-sm text-muted-foreground">
							Signed requests + end-to-end encryption (NIP-44).
						</p>
					</div>

					<div class="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-200">
						<div class="mb-4 rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
							<Zap class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Public or private</h3>
						<p class="text-sm text-muted-foreground">
							Announce publicly—or stay private and share only a pubkey.
						</p>
					</div>

					<div class="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-200">
						<div class="mb-4 rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
							<CheckCircle class="h-6 w-6 text-primary" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Works with existing MCP</h3>
						<p class="text-sm text-muted-foreground">
							Gateway/Proxy lets you reuse MCP servers and clients without rewrites.
						</p>
					</div>

					<div class="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-200">
						<div class="mb-4 rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
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
	<section class="border-t py-16 relative">
		<div class="absolute inset-0 bg-dot-pattern"></div>
		<div class="container mx-auto px-4 relative">
			<div class="mx-auto max-w-5xl">
				<div class="text-center">
					<h2 class="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">
						What you can build
					</h2>
				</div>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<div class="rounded-lg border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
						<h3 class="mb-3 text-lg font-semibold group-hover:text-primary transition-colors">Composable tool services</h3>
						<p class="text-sm text-muted-foreground">
							Wrap scripts, APIs, or agents as reusable services you can chain together.
						</p>
					</div>

					<div class="rounded-lg border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
						<h3 class="mb-3 text-lg font-semibold group-hover:text-primary transition-colors">Private org tooling</h3>
						<p class="text-sm text-muted-foreground">
							Ship internal services with pubkey-only access—no public endpoint required.
						</p>
					</div>

					<div class="rounded-lg border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
						<h3 class="mb-3 text-lg font-semibold group-hover:text-primary transition-colors">Monetized endpoints</h3>
						<p class="text-sm text-muted-foreground">
							Charge per call with Lightning—no payment processor, no accounts.
						</p>
					</div>

					<div class="rounded-lg border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
						<h3 class="mb-3 text-lg font-semibold group-hover:text-primary transition-colors">Community infrastructure</h3>
						<p class="text-sm text-muted-foreground">
							Publish shared services communities can discover and use (opt-in public).
						</p>
					</div>

					<div class="rounded-lg border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
						<h3 class="mb-3 text-lg font-semibold group-hover:text-primary transition-colors">Automation & CI runners</h3>
						<p class="text-sm text-muted-foreground">
							Trigger workflows from anywhere; integrate with bots and pipelines.
						</p>
					</div>

					<div class="rounded-lg border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
						<h3 class="mb-3 text-lg font-semibold group-hover:text-primary transition-colors">Data transforms & validation</h3>
						<p class="text-sm text-muted-foreground">
							Offer normalization, scoring, redaction, or analysis as a callable service.
						</p>
					</div>
				</div>

				<div class="mt-8 text-center">
					<a
						href="https://github.com/contextvm/awesome-contextvm"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center group"
					>
						Discover more use cases in the Awesome list
						<span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="border-t bg-muted/30 py-16 relative">
		<div class="absolute inset-0 bg-grid-pattern"></div>
		<div class="container mx-auto px-4 relative">
			<div class="mx-auto max-w-4xl text-center">
				<h2 class="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>

				<div class="mb-8">
					<div class="mb-6 inline-block rounded-lg bg-primary/10 px-6 py-3 text-lg font-mono">
						Client ⇄ Relay(s) ⇄ Server
					</div>
				</div>

				<div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
					<div class="text-center group hover:scale-105 transition-transform duration-200">
						<div class="mb-4 text-2xl font-bold text-primary group-hover:scale-110 transition-transform">1</div>
						<h3 class="mb-3 text-lg font-semibold">Run</h3>
						<p class="text-sm text-muted-foreground">
							Start a ContextVM-enabled server (or wrap an existing MCP server via Gateway).
						</p>
					</div>

					<div class="text-center group hover:scale-105 transition-transform duration-200">
						<div class="mb-4 text-2xl font-bold text-primary group-hover:scale-110 transition-transform">2</div>
						<h3 class="mb-3 text-lg font-semibold">Connect</h3>
						<p class="text-sm text-muted-foreground">
							Clients can discover public servers via relays—or connect directly using the server's pubkey.
						</p>
					</div>

					<div class="text-center group hover:scale-105 transition-transform duration-200">
						<div class="mb-4 text-2xl font-bold text-primary group-hover:scale-110 transition-transform">3</div>
						<h3 class="mb-3 text-lg font-semibold">Relay</h3>
						<p class="text-sm text-muted-foreground">
							Relays forward signed, encrypted requests and responses. They don't interpret
							your protocol or auth—they just route messages.
						</p>
					</div>
				</div>

				<div class="mt-8">
					<Button variant="outline" href="/faqs#how-does-contextvm-achieve-decentralization" class="text-sm hover:scale-105 transition-transform duration-200">
						Learn more about the protocol
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Servers Preview Section -->
	{#if latestServers.length > 0}
		<section class="border-t py-16">
			<div class="container mx-auto px-4">
				<div class="mx-auto max-w-6xl">
					<div class="mb-12 text-center">
						<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							Latest public servers
						</h2>
						<p class="text-lg text-muted-foreground">
							Discover public servers running on the Nostr network
						</p>
					</div>

					<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
						{#each latestServers as server (server.id)}
							<div class="w-full max-w-sm">
								<ServerCard {server} />
							</div>
						{/each}
					</div>

					<div class="mt-12 text-center">
						<Button size="lg" href="/servers">
							View all public servers
						</Button>
					</div>
				</div>
			</div>
		</section>
	{:else if loading}
		<section class="border-t py-16">
			<div class="container mx-auto px-4">
				<div class="mx-auto max-w-6xl">
					<div class="mb-12 text-center">
						<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							Latest public servers
						</h2>
					</div>

					<div class="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
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
	<section class="border-t bg-muted/30 py-16 relative">
		<div class="absolute inset-0 bg-dot-pattern"></div>
		<div class="container mx-auto px-4 relative">
			<div class="mx-auto max-w-5xl">
				<div class="text-center">
					<h2 class="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">Get started</h2>
				</div>

				<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<div class="rounded-lg border bg-card p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
						<h3 class="mb-4 text-xl font-semibold group-hover:text-primary transition-colors">Run a server</h3>
						<p class="mb-6 text-sm text-muted-foreground">
							Use the ContextVM Gateway to expose any existing MCP server over Nostr.
						</p>
						<div class="mb-6 rounded-lg bg-muted p-4 group-hover:bg-muted/80 transition-colors">
							<pre class="overflow-x-auto text-xs"><code>gateway-cli \
	 --private-key "your-key" \
	 --relays "wss://relay.nostr.org" \
	 --server "python my-mcp-server.py"</code></pre>
						</div>
						<div class="flex flex-col gap-3 sm:flex-row">
							<Button size="sm" href="https://github.com/contextvm/gateway-cli" target="_blank" class="hover:scale-105 transition-transform duration-200">
								Gateway repo
							</Button>
							<Button size="sm" variant="outline" href="https://docs.contextvm.org" target="_blank" class="hover:scale-105 transition-transform duration-200">
								Docs
							</Button>
						</div>
					</div>

					<div class="rounded-lg border bg-card p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
						<h3 class="mb-4 text-xl font-semibold group-hover:text-primary transition-colors">Connect a client</h3>
						<p class="mb-6 text-sm text-muted-foreground">
							Use the ContextVM Proxy to let any MCP client access Nostr-hosted services.
						</p>
						<div class="mb-6 rounded-lg bg-muted p-4 group-hover:bg-muted/80 transition-colors">
							<pre class="overflow-x-auto text-xs"><code>proxy-cli \
	 --private-key "your-key" \
	 --relays "wss://relay.nostr.org" \
	 --server-pubkey "npub1..."</code></pre>
						</div>
						<div class="flex flex-col gap-3 sm:flex-row">
							<Button size="sm" href="https://github.com/contextvm/proxy-cli" target="_blank" class="hover:scale-105 transition-transform duration-200">
								Proxy repo
							</Button>
							<Button size="sm" variant="outline" href="https://docs.contextvm.org" target="_blank" class="hover:scale-105 transition-transform duration-200">
								Docs
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Ecosystem Links Section -->
	<section class="border-t py-16 relative">
		<div class="absolute inset-0 bg-grid-pattern"></div>
		<div class="container mx-auto px-4 relative">
			<div class="mx-auto max-w-4xl text-center">
				<h2 class="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">Explore the ecosystem</h2>

				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					<a
						href="https://docs.contextvm.org"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-1 group duration-200"
					>
						<div class="text-lg font-medium group-hover:text-primary transition-colors">Documentation</div>
						<div class="text-xs text-muted-foreground">Full protocol docs</div>
					</a>

					<a
						href="https://github.com/contextvm/ts-sdk"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-1 group duration-200"
					>
						<div class="text-lg font-medium group-hover:text-primary transition-colors">TypeScript SDK</div>
						<div class="text-xs text-muted-foreground">Native Nostr transport</div>
					</a>

					<a
						href="https://github.com/contextvm/gateway-cli"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-1 group duration-200"
					>
						<div class="text-lg font-medium group-hover:text-primary transition-colors">Gateway</div>
						<div class="text-xs text-muted-foreground">Expose MCP servers</div>
					</a>

					<a
						href="https://github.com/contextvm/proxy-cli"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-1 group duration-200"
					>
						<div class="text-lg font-medium group-hover:text-primary transition-colors">Proxy</div>
						<div class="text-xs text-muted-foreground">Connect MCP clients</div>
					</a>

					<a
						href="https://github.com/contextvm/awesome-contextvm"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-1 group duration-200"
					>
						<div class="text-lg font-medium group-hover:text-primary transition-colors">Awesome list</div>
						<div class="text-xs text-muted-foreground">Resources & tools</div>
					</a>

					<a
						href="https://github.com/contextvm"
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-1 group duration-200"
					>
						<div class="text-lg font-medium group-hover:text-primary transition-colors">GitHub org</div>
						<div class="text-xs text-muted-foreground">All repositories</div>
					</a>

					<a
						href="/blog"
						class="rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-1 group duration-200"
					>
						<div class="text-lg font-medium group-hover:text-primary transition-colors">Blog</div>
						<div class="text-xs text-muted-foreground">Updates & tutorials</div>
					</a>

					<a
						href="/faqs"
						class="rounded-lg border bg-card p-4 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-1 group duration-200"
					>
						<div class="text-lg font-medium group-hover:text-primary transition-colors">FAQs</div>
						<div class="text-xs text-muted-foreground">Common questions</div>
					</a>
				</div>
			</div>
		</div>
	</section>
</main>