<script lang="ts">
	import { asset, base, resolve } from '$app/paths';
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
	import SEO from '$lib/components/SEO.svelte';
	import { relayStore } from '$lib/stores/relay-store.svelte';
	import { commonRelays } from '$lib/services/relay-pool';
	import {
		getArticleImage,
		getArticlePublished,
		getArticleSummary,
		getArticleTitle
	} from 'applesauce-common/helpers';
	import type { Event } from 'nostr-tools';
	import type { PageData } from './$types';
	import { absoluteSiteUrl, canonicalUrl, SITE_ORIGIN } from '$lib/seo';

	let { data }: { data: PageData } = $props();

	const pointer: AddressPointer = $derived({
		kind: LongFormArticle,
		pubkey: CONTEXTVM_PUBKEY,
		identifier: page.params.id ?? '',
		relays: relayStore.selectedRelays.some((url) => commonRelays.includes(url))
			? relayStore.selectedRelays
			: commonRelays
	});

	let relayLoading = $state(true);
	let embeddedNotes = $state<Record<string, Event | undefined>>({});
	const article = $derived(addressLoader(pointer));
	const storedArticle = $derived(eventStore.model(ReplaceableModel, pointer));
	const articleEvent = $derived($storedArticle ?? data.article);
	const blogHref = $derived<`/blog`>('/blog');

	type ArticleSegment =
		| { type: 'html'; value: string }
		| { type: 'profile'; token: string; pubkey: string }
		| { type: 'event'; value: string; id: string; relays?: string[] };

	const PROFILE_TOKEN_PREFIX = 'CVM_PROFILE_TOKEN_';
	const NOSTR_URI_REGEX =
		/nostr:(?:npub|nprofile|note|nevent)1[023456789acdefghjklmnpqrstuvwxyz]+/gi;
	const NOSTR_EVENT_URI_REGEX = /nostr:(?:note|nevent)1[023456789acdefghjklmnpqrstuvwxyz]+/gi;

	$effect(() => {
		const sub = article.subscribe({
			error: () => {
				relayLoading = false;
			},
			complete: () => {
				relayLoading = false;
			}
		});
		if (articleEvent) relayLoading = false;
		return () => {
			sub.unsubscribe();
		};
	});

	const logoBlackSrc = asset('/logo-black.svg');
	const seoTitle = $derived(
		articleEvent ? getArticleTitle(articleEvent) || 'Untitled Article' : 'Loading...'
	);
	const seoDescription = $derived(
		articleEvent
			? (getArticleSummary(articleEvent) || articleEvent.content).replace(/\s+/g, ' ').slice(0, 160)
			: 'Loading article...'
	);
	const seoImage = $derived(
		articleEvent ? getArticleImage(articleEvent) || logoBlackSrc : logoBlackSrc
	);
	const articleUrl = $derived(canonicalUrl(`/blog/${page.params.id ?? ''}`, base));
	const articleImageUrl = $derived(absoluteSiteUrl(seoImage, base));
	const articleStructuredData = $derived.by(() =>
		articleEvent
			? [
					{
						'@type': 'Article',
						'@id': `${articleUrl}#article`,
						headline: seoTitle,
						description: seoDescription,
						image: [articleImageUrl],
						datePublished: new Date(getArticlePublished(articleEvent) * 1000).toISOString(),
						dateModified: new Date(articleEvent.created_at * 1000).toISOString(),
						author: { '@id': `${SITE_ORIGIN}/#organization` },
						publisher: { '@id': `${SITE_ORIGIN}/#organization` },
						mainEntityOfPage: articleUrl
					},
					{
						'@type': 'BreadcrumbList',
						itemListElement: [
							{
								'@type': 'ListItem',
								position: 1,
								name: 'Blog',
								item: canonicalUrl('/blog')
							},
							{
								'@type': 'ListItem',
								position: 2,
								name: seoTitle,
								item: articleUrl
							}
						]
					}
				]
			: []
	);

	function escapeRegex(value: string): string {
		return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function escapeHtml(value: string): string {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function isSafeMarkdownUrl(value: string, image: boolean): boolean {
		try {
			const protocol = new URL(value, SITE_ORIGIN).protocol;
			return image
				? protocol === 'http:' || protocol === 'https:'
				: protocol === 'http:' ||
						protocol === 'https:' ||
						protocol === 'mailto:' ||
						protocol === 'nostr:';
		} catch {
			return false;
		}
	}

	const markdownRenderer = new marked.Renderer();
	markdownRenderer.html = ({ text }) => escapeHtml(text);
	markdownRenderer.link = function ({ href, title, tokens }) {
		const label = this.parser.parseInline(tokens);
		if (!isSafeMarkdownUrl(href, false)) return label;

		const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
		const externalAttribute = /^https?:\/\//i.test(href) ? ' rel="external"' : '';
		return `<a href="${escapeHtml(href)}"${titleAttribute}${externalAttribute}>${label}</a>`;
	};
	markdownRenderer.image = ({ href, title, text }) => {
		if (!isSafeMarkdownUrl(href, true)) return escapeHtml(text);

		const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
		return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttribute}>`;
	};

	function parseEmbeddedEvents(content: string): Extract<ArticleSegment, { type: 'event' }>[] {
		return Array.from(content.matchAll(NOSTR_EVENT_URI_REGEX))
			.map((match) => {
				const value = match[0];
				const identifier = value.slice(6);

				try {
					const decoded = decode(identifier);

					if (decoded.type === 'note') {
						return { type: 'event' as const, value, id: decoded.data };
					}

					if (decoded.type === 'nevent') {
						return {
							type: 'event' as const,
							value,
							id: decoded.data.id,
							relays: decoded.data.relays
						};
					}
				} catch {
					return null;
				}

				return null;
			})
			.filter(
				(segment): segment is Extract<ArticleSegment, { type: 'event' }> =>
					segment?.type === 'event'
			);
	}

	function parseArticleContent(content: string): ArticleSegment[] {
		const matches = Array.from(content.matchAll(NOSTR_URI_REGEX));
		const segments: ArticleSegment[] = [];
		const profiles: Array<Extract<ArticleSegment, { type: 'profile' }>> = [];
		let markdownContent = content.replace(/\]\(\[(https?:\/\/[^\]\s]+)\]\(\1\)\)/g, ']($1)');

		for (const [index, match] of matches.entries()) {
			const value = match[0];
			const identifier = value.slice(6);

			try {
				const decoded = decode(identifier);

				if (decoded.type === 'npub' || decoded.type === 'nprofile') {
					const token = `${PROFILE_TOKEN_PREFIX}${index}__`;
					profiles.push({
						type: 'profile',
						token,
						pubkey: decoded.type === 'npub' ? decoded.data : decoded.data.pubkey
					});
					markdownContent = markdownContent.replace(value, ` ${token} `);
				} else if (decoded.type === 'note') {
					segments.push({ type: 'event', value, id: decoded.data });
				} else if (decoded.type === 'nevent') {
					segments.push({
						type: 'event',
						value,
						id: decoded.data.id,
						relays: decoded.data.relays
					});
				}
			} catch {
				continue;
			}
		}

		const html = renderMarkdown(markdownContent);
		const tokens = profiles.map((profile) => escapeRegex(profile.token));
		if (!tokens.length) {
			return [{ type: 'html', value: html }, ...segments];
		}

		const tokenRegex = new RegExp(`(${tokens.join('|')})`, 'g');
		return [
			...html
				.split(tokenRegex)
				.filter(Boolean)
				.map(
					(part) =>
						profiles.find((profile) => profile.token === part) ?? {
							type: 'html' as const,
							value: part
						}
				),
			...segments
		];
	}

	const articleSegments = $derived(parseArticleContent(articleEvent?.content ?? ''));
	const articleEventSegments = $derived.by(() => parseEmbeddedEvents(articleEvent?.content ?? ''));

	$effect(() => {
		if (!articleEventSegments.length) return;

		const subscriptions = articleEventSegments
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

	function renderMarkdown(content: string): string {
		const html = marked.parse(content, {
			async: false,
			breaks: true,
			gfm: true,
			renderer: markdownRenderer
		});
		return browser ? DOMPurify.sanitize(html) : html;
	}
</script>

{#if articleEvent}
	<SEO
		title={seoTitle}
		description={seoDescription}
		image={seoImage}
		type="article"
		canonicalPath={`/blog/${page.params.id ?? ''}`}
		structuredData={articleStructuredData}
	/>
	{@const image = getArticleImage(articleEvent)}
	{@const title = getArticleTitle(articleEvent)}
	{@const publishedAt = formatUnixTimestamp(getArticlePublished(articleEvent), true)}

	<article class="container mx-auto max-w-4xl px-4 py-6 sm:py-8 md:py-12">
		<nav aria-label="Breadcrumb" class="mb-4 text-sm text-muted-foreground sm:mb-6">
			<ol class="flex flex-wrap items-center gap-2">
				<li><a href={resolve(blogHref)} class="font-medium hover:text-primary">Blog</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page" class="truncate">{seoTitle}</li>
			</ol>
		</nav>

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
				<time datetime={new Date(getArticlePublished(articleEvent) * 1000).toISOString()}>
					{publishedAt}
				</time>
			</div>
		</header>

		<!-- Article content -->
		<div
			class="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none [&>*:not(:first-child)]:mt-6"
		>
			{#each articleSegments as segment, index (index)}
				{#if segment.type === 'html'}
					{#if segment.value.trim()}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html segment.value}
					{/if}
				{:else if segment.type === 'profile'}
					<span class="not-prose inline align-baseline text-foreground">
						<ProfileCard pubkey={segment.pubkey} mode="inline" />
					</span>
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
{:else if relayLoading}
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
		<a
			href={resolve(blogHref)}
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			Back to blog
		</a>
	</div>
{/if}
