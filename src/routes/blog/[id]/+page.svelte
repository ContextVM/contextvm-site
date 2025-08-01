<script lang="ts">
	import { page } from '$app/state';
	import { CONTEXTVM_PUBKEY } from '$lib/constants';
	import { eventStore } from '$lib/services/eventStore';
	import { addressLoader } from '$lib/services/loaders';
	import { defaultRelays } from '$lib/services/relay-pool';
	import { ReplaceableModel } from 'applesauce-core/models';
	import { LongFormArticle } from 'nostr-tools/kinds';
	import { marked } from 'marked';
	import type { AddressPointer } from 'nostr-tools/nip19';
	import { getArticleImage, getArticleTitle, getTagValue } from 'applesauce-core/helpers';
	import DOMPurify from 'dompurify';
	import { formatUnixTimestamp } from '$lib/utils';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const pointer: AddressPointer = {
		kind: LongFormArticle,
		pubkey: CONTEXTVM_PUBKEY,
		identifier: page.params.id ?? '',
		relays: defaultRelays
	};

	const article = addressLoader(pointer);

	const storedArticle = eventStore.model(
		ReplaceableModel,
		pointer.kind,
		pointer.pubkey,
		pointer.identifier
	);

	$effect(() => {
		const sub = article.subscribe();
		return () => {
			sub.unsubscribe();
		};
	});

	// Configure marked options
	onMount(() => {
		marked.setOptions({
			breaks: true,
			gfm: true
		});
	});
</script>

{#if $storedArticle}
	{@const image = getArticleImage($storedArticle)}
	{@const title = getArticleTitle($storedArticle)}
	{@const publishedAt = formatUnixTimestamp($storedArticle.created_at, true)}
	{@const identifier = getTagValue($storedArticle, 'd')}

	<article class="container mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12">
		<!-- Back to blog link -->
		<button
			onclick={() => goto('/blog')}
			class="mb-4 flex items-center text-sm font-medium text-muted-foreground hover:text-primary sm:mb-6"
		>
			← Back to blog
		</button>

		<!-- Article header -->
		<header class="mb-6 sm:mb-8">
			{#if image}
				<div class="mb-4 aspect-video overflow-hidden rounded-lg bg-muted sm:mb-6">
					<img src={image} alt={title} class="h-full w-full object-cover" />
				</div>
			{/if}

			<h1
				class="mb-3 text-2xl leading-tight font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl"
			>
				{title}
			</h1>

			<div class="flex items-center text-sm text-muted-foreground">
				<time datetime={new Date($storedArticle.created_at * 1000).toISOString()}>
					{publishedAt}
				</time>
			</div>
		</header>

		<!-- Article content -->
		<div
			class="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none [&>*:not(:first-child)]:mt-6"
		>
			{#await marked.parse($storedArticle.content) then html}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html DOMPurify.sanitize(html)}
			{/await}
		</div>
	</article>
{:else}
	<div class="container mx-auto px-4 py-16 text-center">
		<h1 class="mb-4 text-2xl font-bold">Article not found</h1>
		<p class="mb-6 text-muted-foreground">
			The article you're looking for doesn't exist or couldn't be loaded.
		</p>
		<button
			onclick={() => goto('/blog')}
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			Back to blog
		</button>
	</div>
{/if}
