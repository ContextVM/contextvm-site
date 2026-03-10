<script lang="ts">
	import Seo from '$lib/components/SEO.svelte';
	import { resolve } from '$app/paths';

	type SlideDeck = {
		title: string;
		description: string;
		href: string;
		status: string;
		category: string;
	};

	const aboutHref = $derived<`/about`>('/about');
	const faqsHref = $derived<`/faqs`>('/faqs');
	const docsHref = 'https://docs.contextvm.org';

	const slideDecks: SlideDeck[] = [
		{
			title: 'ContextVM — Permissionless Infrastructure for MCP',
			description:
				'A technical overview of ContextVM as the transport layer that makes MCP sovereign, relay-routed, and public-key addressed.',
			href: '/slides/contextvm-deck/index.html',
			status: 'Available now',
			category: 'Protocol overview'
		}
	];
</script>

<Seo
	title="Slides"
	description="A collection of ContextVM slide decks and presentation materials."
/>

<svelte:head>
	<title>Slides — ContextVM</title>
</svelte:head>

<main class="relative overflow-x-hidden bg-background text-foreground">
	<section class="relative overflow-hidden border-b bg-muted/30">
		<div class="bg-gradients">
			<div class="bg-gradient bg-gradient-1"></div>
			<div class="bg-gradient bg-gradient-2"></div>
			<div class="bg-gradient bg-gradient-3"></div>
		</div>

		<div class="relative z-10 container mx-auto px-4 py-16 sm:py-20 md:py-24">
			<div class="mx-auto max-w-5xl">
				<p class="mb-4 text-sm font-semibold tracking-[0.18em] text-primary uppercase">Slides</p>
				<h1
					class="max-w-4xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl"
				>
					Talks, briefings, and presentation material for ContextVM
				</h1>
				<p class="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
					A curated set of decks that explain the protocol, its transport model, its ecosystem, and
					the broader argument for sovereign infrastructure.
				</p>

				<div class="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
					<a href={resolve(aboutHref)} class="transition-colors hover:text-foreground">About</a>
					<span>•</span>
					<a href={resolve(faqsHref)} class="transition-colors hover:text-foreground">FAQs</a>
					<span>•</span>
					<a
						href={docsHref}
						target="_blank"
						rel="noopener noreferrer"
						class="transition-colors hover:text-foreground"
					>
						Documentation
					</a>
				</div>
			</div>
		</div>
	</section>

	<section class="container mx-auto px-4 py-12 sm:py-16 md:py-20">
		<div class="mx-auto max-w-5xl">
			<div class="mb-8 flex flex-col gap-3 sm:mb-10">
				<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">Available decks</h2>
				<p class="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
					Portable HTML presentations that can be opened directly, shared as files, or served from
					the site as static assets.
				</p>
			</div>

			<div class="grid gap-6">
				{#each slideDecks as deck}
					<a
						href={deck.href}
						class="group block rounded-2xl border bg-card/80 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
					>
						<div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0 flex-1">
								<div
									class="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.14em] uppercase"
								>
									<span class="rounded-full bg-primary/10 px-3 py-1 text-primary"
										>{deck.status}</span
									>
									<span class="rounded-full bg-muted px-3 py-1 text-muted-foreground"
										>{deck.category}</span
									>
								</div>
								<h3 class="text-2xl font-semibold tracking-tight">{deck.title}</h3>
								<p class="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
									{deck.description}
								</p>
							</div>
							<div
								class="shrink-0 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground"
							>
								Open deck →
							</div>
						</div>
						<p class="mt-5 font-mono text-sm text-muted-foreground">{deck.href}</p>
					</a>
				{/each}
			</div>
		</div>
	</section>
</main>
