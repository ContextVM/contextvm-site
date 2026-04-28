<script lang="ts">
	import Seo from '$lib/components/SEO.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { copyToClipboard } from '$lib/utils';
</script>

<Seo
	title="Self-Host a Server"
	description="A complete guide to hosting a ContextVM server on the Nostr network. Choose your path — no-code CLI with CVMI or custom integration with the TypeScript SDK."
/>

<main class="min-h-screen bg-background px-4 py-8">
	<div class="container mx-auto">

		<!-- Hero -->
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<span class="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
				Self-hosting guide
			</span>
			<h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
				Host your own ContextVM server
			</h1>
			<p class="text-lg text-muted-foreground">
				Expose any MCP server to the decentralised Nostr network in minutes.
				Pick your path below.
			</p>
		</div>

		<!-- Path tabs -->
		<div class="mx-auto max-w-3xl">
			<Tabs value="cvmi">
				<TabsList class="mb-8 w-full">
					<TabsTrigger value="cvmi" class="flex-1">
						⚡ CVMI — Quick Setup
					</TabsTrigger>
					<TabsTrigger value="ts" class="flex-1">
						🛠 TypeScript SDK
					</TabsTrigger>
				</TabsList>

				<!-- ── CVMI PATH ──────────────────────────────────────────── -->
				<TabsContent value="cvmi">
					<p class="mb-8 text-muted-foreground">
						The quickest way to get a server running. No code required — CVMI handles
						keys, relays, and encryption for you with a single terminal command.
					</p>

					<div class="space-y-8">

						<!-- Step 1 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									1
								</div>
								<div class="mt-2 w-px flex-1 bg-border"></div>
							</div>
							<div class="pb-8">
								<h3 class="mb-2 font-semibold">Check prerequisites</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									You need Node.js 18 or higher installed. That's it — no global installs required.
								</p>
								<div class="grid grid-cols-2 gap-3">
									<div class="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm">
										<span class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">✓</span>
										Node.js 18 or higher
									</div>
									<div class="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm">
										<span class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">✓</span>
										npm, yarn, pnpm, or bun
									</div>
								</div>
								<blockquote class="mt-3">
									Check your Node version: <code>node --version</code>
								</blockquote>
							</div>
						</div>

						<!-- Step 2 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									2
								</div>
								<div class="mt-2 w-px flex-1 bg-border"></div>
							</div>
							<div class="pb-8">
								<h3 class="mb-2 font-semibold">Verify CVMI works</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									No installation needed. Run this once to confirm everything is set up correctly.
								</p>
								<div class="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
									<code class="text-sm">npx cvmi --help</code>
									<button
										onclick={() => copyToClipboard('npx cvmi --help')}
										class="ml-4 shrink-0 rounded border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
									>
										copy
									</button>
								</div>
								<blockquote class="mt-3">
									You should see a list of available commands. If you do, you're ready.
								</blockquote>
							</div>
						</div>

						<!-- Step 3 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									3
								</div>
								<div class="mt-2 w-px flex-1 bg-border"></div>
							</div>
							<div class="pb-8">
								<h3 class="mb-2 font-semibold">Start your server</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									This exposes a local filesystem MCP server to the Nostr network.
									A cryptographic key pair is auto-generated for you.
								</p>
								<div class="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
									<code class="break-all text-sm">npx cvmi serve -- npx -y @modelcontextprotocol/server-filesystem /tmp</code>
									<button
										onclick={() => copyToClipboard('npx cvmi serve -- npx -y @modelcontextprotocol/server-filesystem /tmp')}
										class="ml-4 shrink-0 rounded border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
									>
										copy
									</button>
								</div>
								<blockquote class="mt-3">
									Your server's public key (<code>npub1...</code>) will print in the terminal.
									Save it — you'll need it to connect clients.
								</blockquote>
							</div>
						</div>

						<!-- Step 4 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									4
								</div>
								<div class="mt-2 w-px flex-1 bg-border"></div>
							</div>
							<div class="pb-8">
								<h3 class="mb-2 font-semibold">Connect a client</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									From any machine with CVMI installed, connect to your server using its public key.
									This creates a local stdio proxy that bridges your Nostr-hosted server to any
									standard MCP client.
								</p>
								<div class="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
									<code class="text-sm">npx cvmi use npub1q...</code>
									<button
										onclick={() => copyToClipboard('npx cvmi use npub1q...')}
										class="ml-4 shrink-0 rounded border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
									>
										copy
									</button>
								</div>
							</div>
						</div>

						<!-- Step 5 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									5
								</div>
							</div>
							<div class="pb-2">
								<h3 class="mb-2 font-semibold">Optional: configure your server</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									Create a <code>.cvmi.json</code> in your project folder to use a persistent
									private key, specific relays, or required encryption.
								</p>
								<pre>{`{
  "serve": {
    "privateKey": "nsec1...",
    "relays": ["wss://relay.damus.io"],
    "encryption": "required",
    "public": true
  }
}`}</pre>
								<blockquote class="mt-3">
									Full reference:
									<a href="https://docs.contextvm.org/cvmi/configuration/" target="_blank" rel="noopener">
										docs.contextvm.org/cvmi/configuration
									</a>
								</blockquote>
							</div>
						</div>

					</div>
				</TabsContent>

				<!-- ── TYPESCRIPT SDK PATH ────────────────────────────────── -->
				<TabsContent value="ts">
					<p class="mb-8 text-muted-foreground">
						For building custom servers or embedding ContextVM directly into your application.
						The SDK gives you full control over transport, signing, and relay management.
					</p>

					<div class="space-y-8">

						<!-- Step 1 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									1
								</div>
								<div class="mt-2 w-px flex-1 bg-border"></div>
							</div>
							<div class="pb-8">
								<h3 class="mb-2 font-semibold">Install the SDK</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									Add the ContextVM TypeScript SDK to your project.
								</p>
								<div class="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
									<code class="text-sm">npm install @contextvm/sdk</code>
									<button
										onclick={() => copyToClipboard('npm install @contextvm/sdk')}
										class="ml-4 shrink-0 rounded border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
									>
										copy
									</button>
								</div>
							</div>
						</div>

						<!-- Step 2 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									2
								</div>
								<div class="mt-2 w-px flex-1 bg-border"></div>
							</div>
							<div class="pb-8">
								<h3 class="mb-2 font-semibold">Understand the core building blocks</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									Before writing code, get familiar with the three concepts every ContextVM
									integration is built on: <strong>transports</strong>, <strong>signers</strong>,
									and <strong>relay handlers</strong>.
								</p>
								<blockquote>
									Start with the
									<a href="https://docs.contextvm.org/ts-sdk/quick-overview/" target="_blank" rel="noopener">
										SDK Quick Overview
									</a>
									— it maps out what each module does and how they fit together.
								</blockquote>
							</div>
						</div>

						<!-- Step 3 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									3
								</div>
								<div class="mt-2 w-px flex-1 bg-border"></div>
							</div>
							<div class="pb-8">
								<h3 class="mb-2 font-semibold">Choose the right transport for your use case</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									The SDK provides two Nostr transports for hosting:
								</p>
								<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
									<div class="rounded-lg border border-border bg-card p-4">
										<p class="mb-1 font-medium text-card-foreground">NostrServerTransport</p>
										<p class="text-sm text-muted-foreground">
											Used by MCP servers to expose their capabilities through Nostr.
											Use this when building a custom server from scratch.
										</p>
										<a
											href="https://docs.contextvm.org/ts-sdk/transports/nostr-server-transport/"
											target="_blank"
											rel="noopener"
											class="mt-2 block text-sm text-primary hover:underline"
										>
											Server transport docs →
										</a>
									</div>
									<div class="rounded-lg border border-border bg-card p-4">
										<p class="mb-1 font-medium text-card-foreground">NostrClientTransport</p>
										<p class="text-sm text-muted-foreground">
											Used by MCP clients to connect to remote servers exposed via Nostr.
											Use this when building a custom client.
										</p>
										<a
											href="https://docs.contextvm.org/ts-sdk/transports/nostr-client-transport/"
											target="_blank"
											rel="noopener"
											class="mt-2 block text-sm text-primary hover:underline"
										>
											Client transport docs →
										</a>
									</div>
								</div>
								<blockquote class="mt-4">
									If you want to expose an <strong>already-existing</strong> MCP server to Nostr
									without rewriting it, use
									<a href="https://docs.contextvm.org/ts-sdk/gateway/overview/" target="_blank" rel="noopener">NostrMCPGateway</a>
									instead. To consume a CVM server in a standard MCP host, use
									<a href="https://docs.contextvm.org/ts-sdk/proxy/overview/" target="_blank" rel="noopener">NostrMCPProxy</a>.
								</blockquote>
							</div>
						</div>

						<!-- Step 4 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									4
								</div>
								<div class="mt-2 w-px flex-1 bg-border"></div>
							</div>
							<div class="pb-8">
								<h3 class="mb-2 font-semibold">Follow the client-server tutorial</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									Work through the hands-on example to see a full server and client interaction
									in TypeScript before writing your own.
								</p>
								<blockquote>
									Found under Tutorials →
									<a
										href="https://docs.contextvm.org/ts-sdk/tutorials/client-server-communication/"
										target="_blank"
										rel="noopener"
									>
										Client-Server Communication
									</a>
									in the docs sidebar.
								</blockquote>
							</div>
						</div>

						<!-- Step 5 -->
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									5
								</div>
							</div>
							<div class="pb-2">
								<h3 class="mb-2 font-semibold">Go live</h3>
								<p class="mb-4 text-sm text-muted-foreground">
									Once built, configure your server with a Nostr private key and relay list
									and pass them into your transport options to go live on the network.
								</p>
								<blockquote>
									Want to charge clients for access? Set up
									<a href="https://docs.contextvm.org/ts-sdk/payments/overview/" target="_blank" rel="noopener">
										Lightning payments via CEP-8
									</a>.
								</blockquote>
							</div>
						</div>

					</div>
				</TabsContent>
			</Tabs>

			<!-- What's next -->
			<div class="mt-12 border-t border-border pt-10">
				<p class="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
					What's next
				</p>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div class="rounded-lg border border-border bg-card p-4">
						<h4 class="mb-2 font-semibold text-card-foreground">Add skills</h4>
						<p class="mb-3 text-sm text-muted-foreground">
							Install reference implementations and templates to accelerate development.
						</p>
						<a
							href="https://docs.contextvm.org/cvmi/skills/overview/"
							target="_blank"
							rel="noopener"
							class="text-sm text-primary hover:underline"
						>
							Learn about skills →
						</a>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<h4 class="mb-2 font-semibold text-card-foreground">Publish your server</h4>
						<p class="mb-3 text-sm text-muted-foreground">
							Make your server publicly discoverable on the Nostr network.
						</p>
						<a
							href="https://docs.contextvm.org/spec/ceps/cep-6/"
							target="_blank"
							rel="noopener"
							class="text-sm text-primary hover:underline"
						>
							Server announcements →
						</a>
					</div>
					<div class="rounded-lg border border-border bg-card p-4">
						<h4 class="mb-2 font-semibold text-card-foreground">Add payments</h4>
						<p class="mb-3 text-sm text-muted-foreground">
							Charge clients for using your server via the Lightning Network.
						</p>
						<a
							href="https://docs.contextvm.org/ts-sdk/payments/overview/"
							target="_blank"
							rel="noopener"
							class="text-sm text-primary hover:underline"
						>
							Set up payments →
						</a>
					</div>
				</div>
			</div>

		</div>
	</div>
</main>