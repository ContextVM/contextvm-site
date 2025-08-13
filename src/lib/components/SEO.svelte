<script lang="ts">
	let {
		title = 'ContextVM',
		description = 'Discover and connect with Model Context Protocol (MCP) servers on Nostr.',
		url = 'https://contextvm.com',
		image = 'https://contextvm.com/logo-black.svg',
		type = 'website' as 'website' | 'article',
		siteName = 'ContextVM',
		locale = 'en_US'
	} = $props();

	// Generate the full title by combining site name and page title
	const fullTitle = $derived(`${title || 'Untitled'} | ${siteName}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content={locale} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={url} />
	<meta property="twitter:title" content={fullTitle} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={image} />

	<!-- Additional SEO meta tags -->
	<meta name="author" content={siteName} />
	<meta name="robots" content="index, follow" />

	<!-- Favicon references -->
	<link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
	<link rel="icon" href="/favicon-16x16.png" sizes="16x16" />
	<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
	<link rel="canonical" href={url} />
</svelte:head>
