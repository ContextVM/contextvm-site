<script lang="ts">
	import { articlesFilter } from '$lib/constants';
	import { getArticleIdentifier } from '$lib/content/seo-snapshot';
	import { eventStore } from '$lib/services/eventStore';
	import { TimelineModel } from 'applesauce-core/models';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { createBlogArticlesLoader } from '$lib/services/loaders.svelte';
	import { commonRelays } from '$lib/services/relay-pool';
	import SEO from '$lib/components/SEO.svelte';
	import type { Event } from 'nostr-tools';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const liveArticles = eventStore.model(TimelineModel, articlesFilter);
	let liveStatus = $state<'connecting' | 'available' | 'unavailable'>('connecting');
	const articles = $derived.by(() => {
		const byIdentifier = new Map<string, Event>();

		for (const article of [...data.articles, ...$liveArticles]) {
			const identifier = getArticleIdentifier(article);
			if (!identifier) continue;

			const current = byIdentifier.get(identifier);
			if (!current || article.created_at > current.created_at) {
				byIdentifier.set(identifier, article);
			}
		}

		return [...byIdentifier.values()].sort((a, b) => b.created_at - a.created_at);
	});

	$effect(() => {
		const sub = createBlogArticlesLoader(commonRelays).subscribe({
			next: () => {
				liveStatus = 'available';
			},
			error: () => {
				liveStatus = 'unavailable';
			}
		});
		return () => {
			sub.unsubscribe();
		};
	});
</script>

<SEO
	title="Blog"
	description="Read articles and updates about ContextVM, the decentralized protocol for MCP servers on Nostr."
/>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-2 text-3xl font-bold">Blog</h1>
	<p class="mb-8 text-sm text-muted-foreground">
		Snapshot refreshed
		<time datetime={data.generatedAt}
			>{new Date(data.generatedAt).toLocaleDateString('en', {
				dateStyle: 'medium',
				timeZone: 'UTC'
			})}</time
		>. Live relay updates are {liveStatus}.
	</p>

	{#if articles.length}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each articles as article (article.id)}
				<ArticleCard {article} />
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(3) as _, i (i)}
				<LoadingCard layout="article" />
			{/each}
		</div>
	{/if}
</div>
