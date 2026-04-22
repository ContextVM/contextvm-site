<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import DOMPurify from 'dompurify';
	import { browser } from '$app/environment';
	import SEO from '$lib/components/SEO.svelte';
	import { faqCategories } from './faq-data';

	let openCategoryIndex = $state<number | null>(null);

	function toggleCategory(index: number) {
		openCategoryIndex = openCategoryIndex === index ? null : index;
	}
</script>

<SEO
	title="FAQs"
	description="Find answers to common questions about ContextVM, the decentralized protocol for MCP servers on Nostr. Learn about how it works, security, payments, and getting started."
/>

<article class="container mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12">
	<!-- FAQ header -->
	<header class="mb-6 sm:mb-8">
		<h1
			class="mb-3 text-2xl leading-tight font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl"
		>
			Frequently Asked Questions
		</h1>
	</header>

	<!-- FAQ categories -->
	<div class="flex flex-col gap-4">
		{#each faqCategories as category, categoryIndex (category.title)}
			<!-- Category accordion -->
			<div class="faq-category overflow-hidden rounded-lg">
				{#if openCategoryIndex === categoryIndex}
					<!-- Expanded state -->
					<div class="rounded-lg bg-card">
						<!-- Category header (expanded) -->
						<button
							class="flex w-full cursor-pointer items-center justify-between rounded-lg bg-accent px-4 py-3.5 text-left transition-colors"
							onclick={() => toggleCategory(categoryIndex)}
						>
							<h2 class="text-base font-semibold text-foreground sm:text-lg">
								{category.title}
							</h2>
							<ChevronDownIcon
								class="h-5 w-5 shrink-0 rotate-180 text-foreground transition-transform duration-200"
							/>
						</button>

						<!-- Questions list -->
						<div class="flex flex-col gap-1 px-2 py-3">
							{#each category.faqs as faq (faq.question)}
								<Collapsible.Root>
									<Collapsible.Trigger
										class="flex w-full items-center justify-between rounded-md px-3 py-3 text-left transition-colors hover:bg-accent/50 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
									>
										<h3 class="pr-4 text-sm font-semibold text-foreground sm:text-base">
											{faq.question}
										</h3>
										<ChevronDownIcon
											class="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180"
										/>
									</Collapsible.Trigger>
									<Collapsible.Content
										class="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 overflow-hidden"
									>
										<div
											class="prose prose-sm dark:prose-invert sm:prose-base mx-1 mt-1 mb-2 max-w-none overflow-x-auto rounded-md border-l-2 border-primary/40 bg-muted/30 py-4 pr-4 pl-4 sm:py-5 sm:pr-6 sm:pl-5"
										>
											{#if browser}
												<!-- eslint-disable-next-line svelte/no-at-html-tags -->
												{@html DOMPurify.sanitize(faq.answer)}
											{/if}
										</div>
									</Collapsible.Content>
								</Collapsible.Root>
							{/each}
						</div>
					</div>
				{:else}
					<!-- Collapsed state -->
					<button
						class="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-accent"
						onclick={() => toggleCategory(categoryIndex)}
					>
						<h2 class="text-base font-semibold text-foreground/60 sm:text-lg">
							{category.title}
						</h2>
						<ChevronDownIcon
							class="h-5 w-5 shrink-0 text-foreground/60 transition-transform duration-200"
						/>
					</button>
				{/if}
			</div>
		{/each}
	</div>
</article>
