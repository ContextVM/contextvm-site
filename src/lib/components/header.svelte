<script lang="ts">
	import Github from '@lucide/svelte/icons/github';
	import ThemeToggle from './theme-toggle.svelte';
	import AccountLoginDialog from './AccountLoginDialog.svelte';
	import ProfileCard from './ProfileCard.svelte';
	import { activeAccount, logout } from '$lib/services/accountManager.svelte';
	import Button from './ui/button/button.svelte';
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

		<!-- Navigation Links and Theme Toggle -->
		<div class="flex items-center space-x-4 sm:space-x-6">
			<!-- Navigation Links -->
			<nav class="flex items-center space-x-4 text-sm font-medium sm:space-x-6">
				<a href="/blog" class="text-foreground/60 transition-colors hover:text-foreground/80">
					Blog
				</a>
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
			<div class="flex items-center gap-2 sm:gap-4">
				{#if $activeAccount}
					<div class="hidden items-center gap-2 sm:flex sm:gap-3">
						<ProfileCard pubkey={$activeAccount.pubkey} />
						<Button variant="outline" onclick={logout}>Logout</Button>
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
	</div>
</header>
