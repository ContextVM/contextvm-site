<script lang="ts">
	import { resolve } from '$app/paths';
	import Github from '@lucide/svelte/icons/github';
	import Mail from '@lucide/svelte/icons/mail';

	const serversHref = $derived<`/servers`>('/servers');
	const blogHref = $derived<`/blog`>('/blog');
	const aboutHref = $derived<`/about`>('/about');
	const faqsHref = $derived<`/faqs`>('/faqs');
</script>

<footer class="border-t bg-muted/30">
	<div class="container mx-auto px-4 py-8 sm:py-12">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Brand Section -->
			<div class="space-y-4">
				<div class="flex items-center space-x-2">
					<img src="/logo-black.svg" alt="ContextVM Logo" class="h-8 w-auto dark:hidden" />
					<img src="/logo-white.svg" alt="ContextVM Logo" class="hidden h-8 w-auto dark:block" />
					<span class="text-lg font-bold">ContextVM</span>
				</div>
				<p class="text-sm text-muted-foreground">
					Decentralized transport for MCP servers on Nostr. No domains, no OAuth, no port
					forwarding—just keys, relays, and optional Lightning payments.
				</p>
				<div class="flex items-center space-x-4">
					<a
						href="https://github.com/contextvm"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground transition-colors hover:text-foreground"
						aria-label="GitHub"
					>
						<Github class="h-5 w-5" />
					</a>
					<a
						href="mailto:ctxvm@proton.me"
						class="text-muted-foreground transition-colors hover:text-foreground"
						aria-label="Email"
					>
						<Mail class="h-5 w-5" />
					</a>
				</div>
			</div>

			<!-- Navigation Links -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold">Navigation</h3>
				<nav class="flex flex-col space-y-2">
					<a
						href={resolve(serversHref)}
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Servers
					</a>
					<a
						href={resolve(blogHref)}
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Blog
					</a>
					<a
						href={resolve(aboutHref)}
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						About
					</a>
					<a
						href={resolve(faqsHref)}
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						FAQs
					</a>
				</nav>
			</div>

			<!-- Resources -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold">Resources</h3>
				<nav class="flex flex-col space-y-2">
					<a
						href="https://docs.contextvm.org"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Documentation
					</a>
					<a
						href="https://github.com/contextvm/ts-sdk"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						TypeScript SDK
					</a>
					<a
						href="https://github.com/contextvm/gateway-cli"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Gateway CLI
					</a>
					<a
						href="https://github.com/contextvm/proxy-cli"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Proxy CLI
					</a>
				</nav>
			</div>

			<!-- Community -->
			<div class="space-y-4">
				<h3 class="text-sm font-semibold">Community</h3>
				<nav class="flex flex-col space-y-2">
					<a
						href="https://github.com/contextvm/awesome"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Awesome List
					</a>
					<a
						href="https://github.com/contextvm"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						GitHub Organization
					</a>
					<a
						href="mailto:ctxvm@proton.me"
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Contact Us
					</a>
					<a
						href="https://njump.me/npub1dvmcpmefwtnn6dctsj3728n64xhrf06p9yude77echmrkgs5zmyqw33jdm"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Follow us
					</a>
				</nav>
			</div>
		</div>
	</div>
</footer>
