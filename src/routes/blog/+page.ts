import { seoSnapshot } from '$lib/content/seo-snapshot';
import type { PageLoad } from './$types';

export const load = (() => ({
	articles: seoSnapshot.articles,
	generatedAt: seoSnapshot.generatedAt
})) satisfies PageLoad;
