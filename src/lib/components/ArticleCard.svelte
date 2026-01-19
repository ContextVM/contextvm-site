<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatUnixTimestamp } from '$lib/utils';
	import { getArticleImage, getArticleSummary, getArticleTitle } from 'applesauce-common/helpers';
	import { getTagValue } from 'applesauce-core/helpers';
	import type { Event } from 'nostr-tools';

	let { article }: { article: Event } = $props();

	const href = $derived<`/blog/${string}`>(`/blog/${getTagValue(article, 'd')}`);
	const title = $derived(getArticleTitle(article));
	const summary = $derived(getArticleSummary(article));
	const image = $derived(getArticleImage(article));
	const date = $derived(formatUnixTimestamp(article.created_at, true));
</script>

<a
	href={resolve(href)}
	class="group block h-full overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md hover:shadow-primary/10"
>
	<div class="grid h-full grid-rows-[auto_auto_1fr_auto]">
		{#if image}
			<div class="aspect-video overflow-hidden bg-muted">
				<img
					src={image}
					alt={title}
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			</div>
		{/if}
		<div class="p-6">
			<div class="mb-2 flex items-center text-sm text-muted-foreground">
				<time datetime={formatUnixTimestamp(article.created_at, true)}>{date}</time>
			</div>
			<h3
				class="mb-2 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary md:text-2xl"
			>
				{title}
			</h3>
			<div class="mb-4 overflow-hidden text-muted-foreground">
				<p class="line-clamp-3 text-sm">{summary}</p>
			</div>
			<div class="flex items-center text-sm font-medium text-primary">
				Read more
				<span class="ml-1 transition-transform group-hover:translate-x-1">→</span>
			</div>
		</div>
	</div>
</a>
