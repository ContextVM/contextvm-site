<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

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
								you're using TypeScript, our SDK provides native Nostr transports that plug directly
								into MCP servers. For existing servers, use CVMI or the Gateway to expose them over
								Nostr.
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
								If your client is in TypeScript, use our SDK to build a client with Nostr transport.
								Want to use remote ContextVM servers from a standard MCP host? Use CVMI or the Proxy
								pattern to bridge Nostr transport to regular MCP workflows.
							</p>
						</div>
					</div>
				</div>

				<div class="mt-8 rounded-lg border bg-card p-6 text-left shadow-sm">
					<h3 class="mb-3 text-lg font-semibold">Start with CVMI</h3>
					<p class="text-sm text-muted-foreground sm:text-base">
						CVMI is the practical entry point into the ecosystem. Use it to install ContextVM
						skills, expose MCP servers to Nostr with <code>cvmi serve</code>, and connect to remote
						ContextVM servers from standard MCP clients with <code>cvmi use</code>.
					</p>
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
					<Button
						variant="outline"
						href="https://github.com/contextvm/cvmi"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-transform duration-200 hover:scale-105"
					>
						Get CVMI cli
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>
