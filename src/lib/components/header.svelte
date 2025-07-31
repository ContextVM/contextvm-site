<script lang="ts">
	import Github from '@lucide/svelte/icons/github';
	import ThemeToggle from './theme-toggle.svelte';
</script>

<header
	class="fixed top-0 right-0 left-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="flex h-14 items-center justify-between px-6 py-4">
		<!-- Logo -->
		<a href="/" class="flex items-center space-x-2">
			<img src="/logo-black.svg" alt="ContextVM Logo" class="h-8 w-auto dark:hidden" />
			<img src="/logo-white.svg" alt="ContextVM Logo" class="hidden h-8 w-auto dark:block" />
		</a>

		<!-- Navigation Links and Theme Toggle -->
		<div class="flex items-center space-x-6">
			<!-- Navigation Links -->
			<nav class="flex items-center space-x-6 text-sm font-medium">
				<a
					href="https://contextvm.org"
					target="_blank"
					rel="noopener noreferrer"
					class="text-foreground/60 transition-colors hover:text-foreground/80"
				>
					Docs
				</a>
				<a
					href="https://github.com/contextvm"
					target="_blank"
					rel="noopener noreferrer"
					class="text-foreground/60 transition-colors hover:text-foreground/80"
					aria-label="GitHub"
				>
					<Github class="h-4 w-4" />
				</a>
			</nav>

			<!-- Theme Toggle -->
			<div class="flex items-center space-x-2">
				<ThemeToggle />
			</div>
		</div>
	</div>
</header>
