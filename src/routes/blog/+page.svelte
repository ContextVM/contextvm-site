<script lang="ts">
	import { articlesFilter } from '$lib/constants';
	import { eventStore } from '$lib/services/eventStore';
	import { TimelineModel } from 'applesauce-core/models';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { createBlogArticlesLoader } from '$lib/services/loaders.svelte';

	const blogArticles = eventStore.model(TimelineModel, articlesFilter);

	$effect(() => {
		const sub = createBlogArticlesLoader().subscribe();
		return () => {
			sub.unsubscribe();
		};
	});
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">Blog</h1>

	{#if $blogArticles.length}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each $blogArticles as article (article.id)}
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
