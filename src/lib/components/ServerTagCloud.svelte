<script lang="ts">
	import { extractCommonSchemas, extractCategories } from '$lib/utils/cep15';
	import type { Event } from 'nostr-tools';
	import CatalogBrowseSection from '$lib/components/CatalogBrowseSection.svelte';

	let { tags }: { tags: Event['tags'] } = $props();

	// Build a synthetic event-like object so we can reuse existing extractors
	const fakeEvent = $derived({ tags } as Event);

	const categories = $derived(extractCategories(fakeEvent));
	const schemas = $derived(extractCommonSchemas(fakeEvent));
</script>

<div class="mt-4">
	<CatalogBrowseSection title="Browse Catalog" {categories} {schemas} />
</div>
