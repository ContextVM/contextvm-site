<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import SEO from '$lib/components/SEO.svelte';
	import { faqCategories } from './faq-data';
</script>

<SEO
	title="FAQs"
	description="Find answers to common questions about ContextVM, the decentralized protocol for MCP servers on Nostr. Learn about how it works, security, payments, and getting started."
/>

<article class="container mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12">
	<header class="mb-6 sm:mb-8">
		<h1
			class="mb-3 text-2xl leading-tight font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl"
		>
			Frequently Asked Questions
		</h1>
	</header>

	<div class="flex flex-col gap-4">
		{#each faqCategories as category (category.title)}
			<details class="group overflow-hidden rounded-lg border border-border bg-card">
				<summary
					class="flex cursor-pointer list-none items-center justify-between rounded-lg px-4 py-3.5 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					<h2 class="text-base font-semibold text-foreground sm:text-lg">{category.title}</h2>
					<ChevronDownIcon
						aria-hidden="true"
						class="h-5 w-5 shrink-0 text-foreground transition-transform duration-200 group-open:rotate-180"
					/>
				</summary>

				<div class="flex flex-col gap-1 px-2 py-3">
					{#each category.faqs as faq (faq.question)}
						<details class="group/question">
							<summary
								class="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
							>
								<h3 class="pr-4 text-sm font-semibold text-foreground sm:text-base">
									{faq.question}
								</h3>
								<ChevronDownIcon
									aria-hidden="true"
									class="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open/question:rotate-180"
								/>
							</summary>
							<div
								class="prose prose-sm dark:prose-invert sm:prose-base mx-1 mt-1 mb-2 max-w-none overflow-x-auto rounded-md border-l-2 border-primary/40 bg-muted/30 py-4 pr-4 pl-4 sm:py-5 sm:pr-6 sm:pl-5"
							>
								<!-- FAQ answers are source-controlled static HTML. -->
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html faq.answer}
							</div>
						</details>
					{/each}
				</div>
			</details>
		{/each}
	</div>
</article>
