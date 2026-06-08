<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

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
						Ship internal services with public key-only access—no public endpoint required. Secured
						by public key cryptography.
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
						Geographically distributed apps
					</h3>
					<p class="text-sm text-muted-foreground">
						Static frontends anywhere; backend moves like a caravan. Deploy resilient,
						location-independent applications across multiple regions.
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
