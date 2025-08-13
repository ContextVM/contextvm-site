<script lang="ts">
	import Github from '@lucide/svelte/icons/github';
	import Menu from '@lucide/svelte/icons/menu';
	import ThemeToggle from './theme-toggle.svelte';
	import AccountLoginDialog from './AccountLoginDialog.svelte';
	import ProfileCard from './ProfileCard.svelte';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import { buttonVariants } from './ui/button/index.js';
	import * as Sheet from './ui/sheet/index.js';
</script>

<header
	class="fixed top-0 right-0 left-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="flex h-14 items-center justify-between px-4 py-4 sm:px-6">
		<!-- Logo -->
		<a
			href="/"
			class="flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
		>
			<img
				src="/logo-black.svg"
				alt="ContextVM Logo"
				class="h-6 min-h-[24px] w-auto max-w-[120px] transition-opacity duration-200 hover:opacity-90 sm:h-8 dark:hidden"
			/>
			<img
				src="/logo-white.svg"
				alt="ContextVM Logo"
				class="hidden h-6 min-h-[24px] w-auto max-w-[120px] transition-opacity duration-200 hover:opacity-90 sm:h-8 dark:block"
			/>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden items-center space-x-4 sm:flex sm:space-x-6">
			<!-- Navigation Links -->
			<nav class="flex items-center space-x-4 text-sm font-medium sm:space-x-6">
				<a href="/blog" class="text-foreground/60 transition-colors hover:text-foreground/80">
					Blog
				</a>
				<a href="/about" class="text-foreground/60 transition-colors hover:text-foreground/80">
					About
				</a>
				<a href="/faqs" class="text-foreground/60 transition-colors hover:text-foreground/80">
					FAQs
				</a>
				<a
					href="https://docs.contextvm.org"
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
			<div class="flex items-center gap-2 sm:gap-4">
				{#if $activeAccount}
					<div class="hidden items-center gap-2 sm:flex sm:gap-3">
						<ProfileCard pubkey={$activeAccount.pubkey} />
					</div>
				{:else}
					<div class="hidden sm:block">
						<AccountLoginDialog />
					</div>
				{/if}
			</div>
			<!-- Theme Toggle -->
			<div class="flex items-center space-x-2">
				<ThemeToggle />
			</div>
		</div>

		<!-- Mobile Menu Button -->
		<div class="flex items-center space-x-2 sm:hidden">
			<ThemeToggle />
			<Sheet.Root>
				<Sheet.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Menu">
					<Menu class="h-5 w-5" />
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-[300px] p-6 sm:w-[400px]">
					<div class="py-4">
						<nav class="flex flex-col space-y-1">
							<a
								href="/blog"
								class="rounded-md px-4 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
							>
								Blog
							</a>
							<a
								href="/about"
								class="rounded-md px-4 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
							>
								About
							</a>
							<a
								href="/faqs"
								class="rounded-md px-4 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
							>
								FAQs
							</a>
							<a
								href="https://docs.contextvm.org"
								target="_blank"
								rel="noopener noreferrer"
								class="rounded-md px-4 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
							>
								Docs
							</a>
							<a
								href="https://github.com/contextvm"
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-2 rounded-md px-4 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
								aria-label="GitHub"
							>
								<Github class="h-4 w-4" />
								GitHub
							</a>
						</nav>
						<div class="mt-8 border-t pt-6">
							{#if $activeAccount}
								<div class="flex flex-col gap-4 px-2">
									<ProfileCard pubkey={$activeAccount.pubkey} />
								</div>
							{:else}
								<div class="px-2">
									<AccountLoginDialog />
								</div>
							{/if}
						</div>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</header>
