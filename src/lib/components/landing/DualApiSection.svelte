<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<section class="relative border-t py-12 sm:py-16">
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-4xl text-center">
			<h2
				class="mb-8 px-4 text-2xl font-bold tracking-tight sm:mb-12 sm:px-0 sm:text-3xl lg:text-4xl"
			>
				One Protocol, Infinite Possibilities
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
								For Developers
							</h3>
							<p class="text-sm text-muted-foreground">
								Use it programmatically to build applications. Call remote functions as if they were
								local. Create web apps, desktop tools, or CLI utilities.
							</p>
						</div>
					</div>

					<div class="group text-center transition-transform duration-200 hover:scale-105">
						<div
							class="rounded-lg border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
						>
							<h3 class="mb-3 text-lg font-semibold transition-colors group-hover:text-primary">
								For AI Agents
							</h3>
							<p class="text-sm text-muted-foreground">
								LLMs operate the same service naturally. MCP is the first common language for large
								language models—no changes needed.
							</p>
						</div>
					</div>
				</div>

				<p class="mt-8 text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
					All MCP power is available out of the box. AI compatibility, schemas, tools, resources,
					prompts, real-time communication—everything works. As MCP advances, ContextVM advances at
					the same pace.
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
