<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import ServerNoteCard from '$lib/components/ServerNoteCard.svelte';
	import { CONTEXTVM_PUBKEY } from '$lib/constants';
	import { eventStore } from '$lib/services/eventStore';
	import { addressLoader, createNoteEventLoader } from '$lib/services/loaders.svelte';
	import { ReplaceableModel } from 'applesauce-core/models';
	import { LongFormArticle } from 'nostr-tools/kinds';
	import { marked } from 'marked';
	import { decode, type AddressPointer } from 'nostr-tools/nip19';
	import DOMPurify from 'dompurify';
	import { formatUnixTimestamp } from '$lib/utils';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import SEO from '$lib/components/SEO.svelte';
	import { relayStore } from '$lib/stores/relay-store.svelte';
	import { commonRelays } from '$lib/services/relay-pool';
	import { getArticleImage, getArticleTitle } from 'applesauce-common/helpers';
	import type { Event } from 'nostr-tools';

	const pointer: AddressPointer = $derived({
		kind: LongFormArticle,
		pubkey: CONTEXTVM_PUBKEY,
		identifier: page.params.id ?? '',
		relays: relayStore.selectedRelays.some((url) => commonRelays.includes(url))
			? relayStore.selectedRelays
			: commonRelays
	});

	let loading = $state(true);
	let embeddedNotes = $state<Record<string, Event | undefined>>({});
	const article = $derived(addressLoader(pointer));

	const storedArticle = $derived(eventStore.model(ReplaceableModel, pointer));

	const blogHref = $derived<`/blog`>('/blog');

	type ArticleSegment =
		| { type: 'markdown'; value: string }
		| { type: 'profile'; value: string; pubkey: string; href: string }
		| { type: 'event'; value: string; id: string; relays?: string[] };

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

	const logoBlackSrc = asset('/logo-black.svg');

	// Dynamic SEO data for individual blog posts
	let seoTitle = $state('Loading...');
	let seoDescription = $state('Loading article...');
	let seoImage = $state(logoBlackSrc);
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
			seoImage = articleImage || logoBlackSrc;
			seoUrl = `https://contextvm.com/blog/${page.params.id}`;
			seoType = 'article';
		}
	});

	function parseArticleContent(content: string): ArticleSegment[] {
		const matches = Array.from(
			content.matchAll(/nostr:(?:npub|nprofile|note|nevent)1[023456789acdefghjklmnpqrstuvwxyz]+/gi)
		);
		const segments: ArticleSegment[] = [];
		let lastIndex = 0;

		for (const match of matches) {
			const value = match[0];
			const index = match.index ?? 0;

			if (index > lastIndex) {
				segments.push({ type: 'markdown', value: content.slice(lastIndex, index) });
			}

			try {
				const identifier = value.slice(6);
				const decoded = decode(identifier);

				if (decoded.type === 'npub') {
					segments.push({
						type: 'profile',
						value,
						pubkey: decoded.data,
						href: `https://jumble.social/users/${identifier}`
					});
				} else if (decoded.type === 'nprofile') {
					segments.push({
						type: 'profile',
						value,
						pubkey: decoded.data.pubkey,
						href: `https://jumble.social/users/${identifier}`
					});
				} else if (decoded.type === 'note') {
					segments.push({ type: 'event', value, id: decoded.data });
				} else if (decoded.type === 'nevent') {
					segments.push({
						type: 'event',
						value,
						id: decoded.data.id,
						relays: decoded.data.relays
					});
				} else {
					segments.push({ type: 'markdown', value });
				}
			} catch {
				segments.push({ type: 'markdown', value });
			}

			lastIndex = index + value.length;
		}

		if (lastIndex < content.length) {
			segments.push({ type: 'markdown', value: content.slice(lastIndex) });
		}

		return segments.length > 0 ? segments : [{ type: 'markdown', value: content }];
	}

	const articleSegments = $derived.by(() => parseArticleContent($storedArticle?.content ?? ''));

	$effect(() => {
		const eventSegments = articleSegments.filter(
			(segment): segment is Extract<ArticleSegment, { type: 'event' }> => segment.type === 'event'
		);
		if (!eventSegments.length) return;

		const subscriptions = eventSegments
			.filter((segment) => !embeddedNotes[segment.id])
			.map((segment) =>
				createNoteEventLoader(segment.id, segment.relays).subscribe((event) => {
					embeddedNotes = { ...embeddedNotes, [segment.id]: event };
				})
			);

		return () => {
			for (const subscription of subscriptions) {
				subscription.unsubscribe();
			}
		};
	});

	async function renderMarkdown(content: string): Promise<string> {
		const html = await marked.parse(content);
		return browser ? DOMPurify.sanitize(html) : html;
	}
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
			{#each articleSegments as segment, index (index)}
				{#if segment.type === 'markdown'}
					{#if segment.value.trim()}
						{#await renderMarkdown(segment.value) then html}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html html}
						{/await}
					{/if}
				{:else if segment.type === 'profile'}
					<p>
						<a
							target="_blank"
							href={segment.href}
							class="inline-flex max-w-full align-middle text-primary hover:underline"
						>
							<ProfileCard pubkey={segment.pubkey} mode="inline" />
						</a>
					</p>
				{:else if segment.type === 'event'}
					<div class="not-prose my-6">
						{#if embeddedNotes[segment.id]}
							<ServerNoteCard note={embeddedNotes[segment.id]!} />
						{:else}
							<div
								class="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
							>
								Loading embedded note…
							</div>
						{/if}
					</div>
				{/if}
			{/each}
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
