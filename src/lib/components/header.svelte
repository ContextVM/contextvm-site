<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/stores';
	import Github from '@lucide/svelte/icons/github';
	import Menu from '@lucide/svelte/icons/menu';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import ThemeToggle from './theme-toggle.svelte';
	import AccountLoginDialog from './AccountLoginDialog.svelte';
	import ProfileCard from './ProfileCard.svelte';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import { buttonVariants } from './ui/button/index.js';
	import * as Sheet from './ui/sheet/index.js';

	const homeHref = $derived<`/`>('/');
	const serversHref = $derived<`/servers`>('/servers');
	const blogHref = $derived<`/blog`>('/blog');
	const slidesHref = $derived<`/slides`>('/slides');
	const aboutHref = $derived<`/about`>('/about');
	const faqsHref = $derived<`/faqs`>('/faqs');
	const logoBlackSrc = asset('/logo-black.svg');
	const logoWhiteSrc = asset('/logo-white.svg');

	let isMenuOpen = $state(false);
	let isDropdownOpen = $state(false);
	let isMobileResourcesOpen = $state(false);
	let closeTimeout: ReturnType<typeof setTimeout> | null = null;

	// Check if any resource page is currently active
	const isResourcePageActive = $derived(
		$page.url.pathname.startsWith(resolve(blogHref)) ||
			$page.url.pathname.startsWith(resolve(aboutHref)) ||
			$page.url.pathname.startsWith(resolve(faqsHref)) ||
			$page.url.pathname.startsWith(resolve(slidesHref))
	);

	function openDropdown() {
		if (closeTimeout) {
			clearTimeout(closeTimeout);
			closeTimeout = null;
		}
		isDropdownOpen = true;
	}

	function closeDropdown() {
		closeTimeout = setTimeout(() => {
			isDropdownOpen = false;
		}, 150);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown-container')) {
			isDropdownOpen = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isDropdownOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<header
	class="fixed top-0 right-0 left-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
>
	<div class="flex h-14 items-center justify-between px-4 py-4 sm:px-6">
		<!-- Logo -->
		<a
			href={resolve(homeHref)}
			class="flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
		>
			<img
				src={logoBlackSrc}
				alt="ContextVM Logo"
				class="h-6 min-h-[24px] w-auto max-w-[120px] transition-opacity duration-200 hover:opacity-90 sm:h-8 dark:hidden"
			/>
			<img
				src={logoWhiteSrc}
				alt="ContextVM Logo"
				class="hidden h-6 min-h-[24px] w-auto max-w-[120px] transition-opacity duration-200 hover:opacity-90 sm:h-8 dark:block"
			/>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden items-center space-x-4 sm:flex sm:space-x-6">
			<!-- Navigation Links -->
			<nav class="flex items-center space-x-4 text-sm font-medium sm:space-x-6">
				<a
					href={resolve(serversHref)}
					class="transition-colors {$page.url.pathname.startsWith(resolve(serversHref))
						? 'font-semibold text-primary'
						: 'text-foreground/60 hover:text-primary'}"
				>
					Servers
				</a>

				<!-- Resources Dropdown -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="dropdown-container relative"
					onmouseenter={openDropdown}
					onmouseleave={closeDropdown}
				>
					<button
						class="flex items-center gap-1 transition-colors {isResourcePageActive
							? 'font-semibold text-primary'
							: 'text-foreground/60 hover:text-primary'}"
						onclick={() => (isDropdownOpen = !isDropdownOpen)}
						aria-expanded={isDropdownOpen}
						aria-haspopup="true"
					>
						Resources
						<ChevronDown
							class="h-3.5 w-3.5 transition-transform duration-200 {isDropdownOpen
								? 'rotate-180'
								: ''}"
						/>
					</button>

					{#if isDropdownOpen}
						<div
							class="absolute top-full left-1/2 z-50 mt-2 w-48 -translate-x-1/2 rounded-lg border bg-popover/95 p-1.5 shadow-lg backdrop-blur transition-all duration-200"
							role="menu"
						>
							<a
								href={resolve(blogHref)}
								onclick={() => (isDropdownOpen = false)}
								class="flex items-center rounded-md px-3 py-2 text-sm transition-colors {$page.url.pathname.startsWith(
									resolve(blogHref)
								)
									? 'bg-primary/10 font-medium text-primary'
									: 'text-foreground/80 hover:bg-accent hover:text-foreground'}"
								role="menuitem"
							>
								Blog
							</a>
							<a
								href={resolve(aboutHref)}
								onclick={() => (isDropdownOpen = false)}
								class="flex items-center rounded-md px-3 py-2 text-sm transition-colors {$page.url.pathname.startsWith(
									resolve(aboutHref)
								)
									? 'bg-primary/10 font-medium text-primary'
									: 'text-foreground/80 hover:bg-accent hover:text-foreground'}"
								role="menuitem"
							>
								About
							</a>
							<a
								href={resolve(faqsHref)}
								onclick={() => (isDropdownOpen = false)}
								class="flex items-center rounded-md px-3 py-2 text-sm transition-colors {$page.url.pathname.startsWith(
									resolve(faqsHref)
								)
									? 'bg-primary/10 font-medium text-primary'
									: 'text-foreground/80 hover:bg-accent hover:text-foreground'}"
								role="menuitem"
							>
								FAQs
							</a>
							<a
								href={resolve(slidesHref)}
								onclick={() => (isDropdownOpen = false)}
								class="flex items-center rounded-md px-3 py-2 text-sm transition-colors {$page.url.pathname.startsWith(
									resolve(slidesHref)
								)
									? 'bg-primary/10 font-medium text-primary'
									: 'text-foreground/80 hover:bg-accent hover:text-foreground'}"
								role="menuitem"
							>
								Slides
							</a>
							<div class="my-1 border-t"></div>
							<a
								href="https://docs.contextvm.org"
								target="_blank"
								rel="noopener noreferrer"
								onclick={() => (isDropdownOpen = false)}
								class="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
								role="menuitem"
							>
								Docs
								<ExternalLink class="h-3 w-3 text-muted-foreground" />
							</a>
						</div>
					{/if}
				</div>

				<a
					href="https://github.com/contextvm"
					target="_blank"
					rel="noopener noreferrer"
					class="text-foreground/60 transition-colors hover:text-primary"
					aria-label="GitHub"
				>
					<Github class="h-4 w-4" />
				</a>
			</nav>
			<div class="flex items-center gap-2 sm:gap-4">
				{#if $activeAccount}
					<div class="hidden items-center gap-2 sm:flex sm:gap-3">
						<ProfileCard pubkey={$activeAccount.pubkey} mode="compact" showLogout={true} />
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
			<Sheet.Root bind:open={isMenuOpen}>
				<Sheet.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Menu">
					<Menu class="h-5 w-5" />
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-[300px] p-6 sm:w-[400px]">
					<div class="py-4">
						<nav class="flex flex-col space-y-1">
							<a
								href={resolve(serversHref)}
								onclick={() => (isMenuOpen = false)}
								class="rounded-md px-4 py-3 text-base font-medium transition-colors {$page.url.pathname.startsWith(
									resolve(serversHref)
								)
									? 'bg-primary/10 text-primary'
									: 'text-foreground/80 hover:bg-accent hover:text-foreground'}"
							>
								Servers
							</a>

							<!-- Mobile Resources Section -->
							<div>
								<button
									onclick={() => (isMobileResourcesOpen = !isMobileResourcesOpen)}
									class="flex w-full items-center justify-between rounded-md px-4 py-3 text-base font-medium transition-colors {isResourcePageActive
										? 'bg-primary/10 text-primary'
										: 'text-foreground/80 hover:bg-accent hover:text-foreground'}"
								>
									Resources
									<ChevronDown
										class="h-4 w-4 transition-transform duration-200 {isMobileResourcesOpen
											? 'rotate-180'
											: ''}"
									/>
								</button>

								{#if isMobileResourcesOpen}
									<div class="mt-1 ml-4 flex flex-col space-y-1 border-l-2 border-border pl-3">
										<a
											href={resolve(blogHref)}
											onclick={() => (isMenuOpen = false)}
											class="rounded-md px-3 py-2 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
												resolve(blogHref)
											)
												? 'bg-primary/10 text-primary'
												: 'text-foreground/70 hover:bg-accent hover:text-foreground'}"
										>
											Blog
										</a>
										<a
											href={resolve(aboutHref)}
											onclick={() => (isMenuOpen = false)}
											class="rounded-md px-3 py-2 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
												resolve(aboutHref)
											)
												? 'bg-primary/10 text-primary'
												: 'text-foreground/70 hover:bg-accent hover:text-foreground'}"
										>
											About
										</a>
										<a
											href={resolve(faqsHref)}
											onclick={() => (isMenuOpen = false)}
											class="rounded-md px-3 py-2 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
												resolve(faqsHref)
											)
												? 'bg-primary/10 text-primary'
												: 'text-foreground/70 hover:bg-accent hover:text-foreground'}"
										>
											FAQs
										</a>
										<a
											href={resolve(slidesHref)}
											onclick={() => (isMenuOpen = false)}
											class="rounded-md px-3 py-2 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
												resolve(slidesHref)
											)
												? 'bg-primary/10 text-primary'
												: 'text-foreground/70 hover:bg-accent hover:text-foreground'}"
										>
											Slides
										</a>
										<a
											href="https://docs.contextvm.org"
											target="_blank"
											rel="noopener noreferrer"
											onclick={() => (isMenuOpen = false)}
											class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
										>
											Docs
											<ExternalLink class="h-3 w-3 text-muted-foreground" />
										</a>
									</div>
								{/if}
							</div>

							<a
								href="https://github.com/contextvm"
								target="_blank"
								rel="noopener noreferrer"
								onclick={() => (isMenuOpen = false)}
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
									<ProfileCard pubkey={$activeAccount.pubkey} mode="compact" showLogout={true} />
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
