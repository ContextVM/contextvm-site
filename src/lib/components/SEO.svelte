<script lang="ts">
	import { asset, base } from '$app/paths';
	import { page } from '$app/stores';
	import { absoluteSiteUrl, canonicalUrl, SITE_ORIGIN } from '$lib/seo';

	const favicon32Src = asset('/favicon-32x32.png');
	const favicon16Src = asset('/favicon-16x16.png');
	const appleTouchIconSrc = asset('/apple-touch-icon-180x180.png');

	let {
		title = 'ContextVM',
		description = 'Discover and connect with Model Context Protocol (MCP) servers on Nostr.',
		image = '/apple-touch-icon-180x180.png',
		type = 'website' as 'website' | 'article',
		siteName = 'ContextVM',
		locale = 'en_US',
		robots = 'index, follow'
	} = $props();

	const fullTitle = $derived(
		`${title || 'Untitled'} ${title === siteName ? '' : `| ${siteName}`}`.trim()
	);
	const url = $derived(canonicalUrl($page.url.pathname, base));
	const imageUrl = $derived(absoluteSiteUrl(image, base));
	const structuredData = $derived.by(() =>
		JSON.stringify({
			'@context': 'https://schema.org',
			'@graph': [
				{
					'@type': 'Organization',
					'@id': `${SITE_ORIGIN}/#organization`,
					name: siteName,
					url: `${SITE_ORIGIN}/`,
					logo: {
						'@type': 'ImageObject',
						url: `${SITE_ORIGIN}/apple-touch-icon-180x180.png`
					}
				},
				{
					'@type': 'WebSite',
					'@id': `${SITE_ORIGIN}/#website`,
					name: siteName,
					url: `${SITE_ORIGIN}/`,
					publisher: { '@id': `${SITE_ORIGIN}/#organization` }
				}
			]
		})
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />

	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content={locale} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={url} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />

	<meta name="author" content={siteName} />
	<meta name="robots" content={robots} />

	<link rel="icon" href={favicon32Src} sizes="32x32" />
	<link rel="icon" href={favicon16Src} sizes="16x16" />
	<link rel="apple-touch-icon" href={appleTouchIconSrc} />
	<link rel="canonical" href={url} />

	{@html `<script type="application/ld+json">${structuredData}<\/script>`}
</svelte:head>
