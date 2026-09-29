import { getArticleIdentifier, getSnapshotArticle, seoSnapshot } from '$lib/content/seo-snapshot';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	seoSnapshot.articles.flatMap((article) => {
		const id = getArticleIdentifier(article);
		return id ? [{ id }] : [];
	});

export const load = (({ params }) => ({
	article: getSnapshotArticle(params.id),
	generatedAt: seoSnapshot.generatedAt
})) satisfies PageLoad;
