<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { CONTEXTVM_PUBKEY } from '$lib/constants';
	import { eventStore } from '$lib/services/eventStore';
	import { addressLoader } from '$lib/services/loaders.svelte';
	import { ReplaceableModel } from 'applesauce-core/models';
	import { LongFormArticle } from 'nostr-tools/kinds';
	import { marked } from 'marked';
	import type { AddressPointer } from 'nostr-tools/nip19';
	import DOMPurify from 'dompurify';
	import { formatUnixTimestamp } from '$lib/utils';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import SEO from '$lib/components/SEO.svelte';
	import { relayStore } from '$lib/stores/relay-store.svelte';
	import { commonRelays } from '$lib/services/relay-pool';
	import { getArticleImage, getArticleTitle } from 'applesauce-common/helpers';

	const pointer: AddressPointer = $derived({
		kind: LongFormArticle,
		pubkey: CONTEXTVM_PUBKEY,
		identifier: page.params.id ?? '',
		relays: relayStore.selectedRelays.some((url) => commonRelays.includes(url))
			? relayStore.selectedRelays
			: commonRelays
	});

	let loading = $state(true);
	const article = $derived(addressLoader(pointer));

	const storedArticle = $derived(eventStore.model(ReplaceableModel, pointer));

	const blogHref = $derived<`/blog`>('/blog');

	$effect(() => {
		const sub = article.subscribe({
			error: () => {
				loading = false;
			},
			complete: () => {
				loading = false;
			}
		});
		if ($storedArticle) loading = false;
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

	// Dynamic SEO data for individual blog posts
	let seoTitle = $state('Loading...');
	let seoDescription = $state('Loading article...');
	let seoImage = $state('/logo-black.svg');
	let seoUrl = $state(`https://contextvm.com/blog/${page.params.id}`);
	let seoType = $state('article' as 'website' | 'article');

	// Update SEO data when article loads
	$effect(() => {
		if ($storedArticle) {
			const articleTitle = getArticleTitle($storedArticle) || 'Untitled Article';
			const articleImage = getArticleImage($storedArticle);
			const contentPreview = $storedArticle.content.substring(0, 160) + '...';

			seoTitle = articleTitle;
			seoDescription = contentPreview;
			seoImage = articleImage || '/logo-black.svg';
			seoUrl = `https://contextvm.com/blog/${page.params.id}`;
			seoType = 'article';
		}
	});
</script>

{#if $storedArticle}
	<SEO title={seoTitle} description={seoDescription} image={seoImage} url={seoUrl} type={seoType} />
	{@const image = getArticleImage($storedArticle)}
	{@const title = getArticleTitle($storedArticle)}
	{@const publishedAt = formatUnixTimestamp($storedArticle.created_at, true)}

	<article class="container mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12">
		<!-- Back to blog link -->
		<button
			onclick={() => goto(resolve(blogHref))}
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
				{#if browser}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html DOMPurify.sanitize(html)}
				{/if}
			{/await}
		</div>
	</article>
{:else if loading}
	<div class="container mx-auto px-4 py-16 text-center">
		<div class="aspect-video overflow-hidden bg-muted">
			<div class="h-full w-full animate-pulse bg-muted-foreground/20"></div>
		</div>
		<div class="space-y-4 p-6">
			<div class="flex items-center">
				<div class="h-4 w-20 animate-pulse rounded bg-muted-foreground/40"></div>
			</div>
			<div class="space-y-2">
				<div class="h-6 w-3/4 animate-pulse rounded bg-muted-foreground/40"></div>
				<div class="h-4 w-1/2 animate-pulse rounded bg-muted-foreground/30"></div>
			</div>
			<div class="space-y-2">
				<div class="h-4 w-full animate-pulse rounded bg-muted-foreground/30"></div>
				<div class="h-4 w-5/6 animate-pulse rounded bg-muted-foreground/30"></div>
				<div class="h-4 w-4/6 animate-pulse rounded bg-muted-foreground/30"></div>
			</div>
			<div class="flex items-center">
				<div class="h-4 w-24 animate-pulse rounded bg-muted-foreground/40"></div>
			</div>
		</div>
	</div>
{:else}
	<div class="container mx-auto px-4 py-16 text-center">
		<h1 class="mb-4 text-2xl font-bold">Article not found</h1>
		<p class="mb-6 text-muted-foreground">
			The article you're looking for doesn't exist or couldn't be loaded.
		</p>
		<button
			onclick={() => goto(resolve(blogHref))}
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			Back to blog
		</button>
	</div>
{/if}
