import { seoSnapshot } from '$lib/content/seo-snapshot';
import type { PageLoad } from './$types';

export const load = (() => ({
	servers: seoSnapshot.servers,
	generatedAt: seoSnapshot.generatedAt
})) satisfies PageLoad;
