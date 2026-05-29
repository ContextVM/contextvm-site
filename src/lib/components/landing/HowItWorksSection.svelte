<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

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
						Relays forward encrypted messages. If one dies, switch routes—the protocol keeps moving.
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
