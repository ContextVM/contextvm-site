<script lang="ts">
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
</script>

<section class="relative border-t bg-muted/30 py-12 sm:py-16">
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-4xl text-center">
			<div class="mb-8">
				<h2 class="mb-3 px-4 text-2xl font-bold tracking-tight sm:px-0 sm:text-3xl lg:text-4xl">
					Why?
				</h2>
				<p class="text-lg font-medium text-muted-foreground">
					Sovereign infrastructure. Permissionless by design.
				</p>
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
						Run services from anywhere—laptop, Raspberry Pi, or phone. No domains, DNS, or static
						IPs needed.
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
						Your keys, your identity. Public key cryptography replaces OAuth and API keys.
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
					<h3 class="mb-2 text-lg font-semibold">Encrypted by Default</h3>
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
						Move backends across networks and geographic locations without breaking clients. Your
						public key stays the same.
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
					<h3 class="mb-2 text-lg font-semibold">Direct Value Exchange</h3>
					<p class="text-sm text-muted-foreground">
						Monetize with Bitcoin micropayments. Creators connect directly with users—no
						intermediaries. This can be extended to any custom payment method.
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
					<h3 class="mb-2 text-lg font-semibold">No Gatekeepers</h3>
					<p class="text-sm text-muted-foreground">
						Decentralized discovery on Nostr. Build, deploy, and earn without asking permission.
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
					<h3 class="mb-2 text-lg font-semibold">Organic Reputation</h3>
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
