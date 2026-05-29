<script lang="ts">
	import { resolve } from '$app/paths';

	const faqsHref = $derived<`/faqs`>('/faqs');
	const blogHref = $derived<`/blog`>('/blog');
</script>

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
					<div class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
						Documentation
					</div>
					<div class="text-xs text-muted-foreground">Full protocol docs</div>
				</a>

				<a
					href="https://github.com/contextvm/cvmi"
					target="_blank"
					rel="noopener noreferrer"
					class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
				>
					<div class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
						CVMI
					</div>
					<div class="text-xs text-muted-foreground">CLI for skills, serve, and use</div>
				</a>

				<a
					href="https://github.com/contextvm/ts-sdk"
					target="_blank"
					rel="noopener noreferrer"
					class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
				>
					<div class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
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
					<div class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
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
					<div class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
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
					<div class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
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
					<div class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
						CtxCN
					</div>
					<div class="text-xs text-muted-foreground">Build clients faster</div>
				</a>

				<a
					href={resolve(blogHref)}
					class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
				>
					<div class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
						Blog
					</div>
					<div class="text-xs text-muted-foreground">Updates & tutorials</div>
				</a>

				<a
					href={resolve(faqsHref)}
					class="group rounded-lg border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-lg sm:p-6"
				>
					<div class="text-base font-medium transition-colors group-hover:text-primary sm:text-lg">
						FAQs
					</div>
					<div class="text-xs text-muted-foreground">Common questions</div>
				</a>
			</div>
		</div>
	</div>
</section>
