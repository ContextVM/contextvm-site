import { readFileSync } from 'node:fs';

const siteOrigin = 'https://contextvm.org';
const pages = new Map([
	['index.html', '/'],
	['about.html', '/about'],
	['blog.html', '/blog'],
	['faqs.html', '/faqs'],
	['servers.html', '/servers'],
	['slides.html', '/slides']
]);

function readBuildFile(path: string): string {
	return readFileSync(new URL(`../build/${path}`, import.meta.url), 'utf8');
}

for (const [page, path] of pages) {
	const html = readBuildFile(page);
	const canonicalUrls = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(
		(match) => match[1]
	);
	const expectedCanonical = `${siteOrigin}${path}`;

	const titles = [...html.matchAll(/<title>([^<]+)<\/title>/g)].map((match) => match[1]);
	if (titles.length !== 1 || !titles[0].trim()) {
		throw new Error(`${page} contains ${titles.length} non-empty titles; expected 1`);
	}

	const descriptions = [...html.matchAll(/<meta name="description" content="([^"]+)"/g)].map(
		(match) => match[1]
	);
	if (descriptions.length !== 1 || !descriptions[0].trim()) {
		throw new Error(`${page} contains ${descriptions.length} non-empty descriptions; expected 1`);
	}

	if (canonicalUrls.length !== 1 || canonicalUrls[0] !== expectedCanonical) {
		throw new Error(
			`${page} has canonical ${JSON.stringify(canonicalUrls)}; expected ${expectedCanonical}`
		);
	}

	const robots = [...html.matchAll(/<meta name="robots" content="([^"]+)"/g)].map(
		(match) => match[1]
	);
	if (robots.length !== 1 || robots[0] !== 'index, follow') {
		throw new Error(
			`${page} has robots directives ${JSON.stringify(robots)}; expected index, follow`
		);
	}

	const openGraphUrls = [...html.matchAll(/<meta property="og:url" content="([^"]+)"/g)].map(
		(match) => match[1]
	);
	if (openGraphUrls.length !== 1 || openGraphUrls[0] !== expectedCanonical) {
		throw new Error(
			`${page} has Open Graph URLs ${JSON.stringify(openGraphUrls)}; expected ${expectedCanonical}`
		);
	}

	const structuredDataMatches = [
		...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)
	];
	if (structuredDataMatches.length !== 1) {
		throw new Error(`${page} contains ${structuredDataMatches.length} JSON-LD blocks; expected 1`);
	}

	const structuredData = JSON.parse(structuredDataMatches[0][1]) as {
		'@graph'?: Array<{ '@type'?: string }>;
	};
	const schemaTypes = structuredData['@graph']?.map((entry) => entry['@type']) ?? [];
	if (!schemaTypes.includes('Organization') || !schemaTypes.includes('WebSite')) {
		throw new Error(`${page} is missing the Organization or WebSite schema`);
	}

	if (html.includes('contextvm.com') || html.includes('sveltekit-prerender')) {
		throw new Error(`${page} contains an obsolete or placeholder SEO URL`);
	}
}

const homepage = readBuildFile('index.html');
if (!homepage.includes('<h1') || !homepage.includes('ContextVM')) {
	throw new Error('index.html does not contain the prerendered homepage');
}

const githubPagesBase = '/contextvm-site';
const isGitHubPagesBuild = homepage.includes(`href="${githubPagesBase}/favicon.ico"`);
if (isGitHubPagesBuild) {
	for (const page of pages.keys()) {
		const internalLinks = [...readBuildFile(page).matchAll(/<a\b[^>]*href="([^"]+)"/g)]
			.map((match) => match[1])
			.filter((href) => href.startsWith('/') && !href.startsWith('//'));
		const linksOutsideBase = internalLinks.filter(
			(href) => href !== githubPagesBase && !href.startsWith(`${githubPagesBase}/`)
		);

		if (linksOutsideBase.length > 0) {
			throw new Error(
				`${page} has internal links outside ${githubPagesBase}: ${JSON.stringify(linksOutsideBase)}`
			);
		}
	}
}

const about = readBuildFile('about.html');
if (!about.includes('Imagine a world where anyone, anywhere')) {
	throw new Error('about.html does not contain the About page copy');
}

const faqs = readBuildFile('faqs.html');
if (
	!faqs.includes('What is ContextVM?') ||
	!faqs.includes('Rather than relying on centralized infrastructure')
) {
	throw new Error('faqs.html does not contain the FAQ questions and answers');
}

const expectedSitemapUrls = [...pages.values()].map((path) => `${siteOrigin}${path}`);
const sitemapUrls = [...readBuildFile('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
	(match) => match[1]
);
if (JSON.stringify(sitemapUrls) !== JSON.stringify(expectedSitemapUrls)) {
	throw new Error(
		`sitemap.xml has URLs ${JSON.stringify(sitemapUrls)}; expected ${JSON.stringify(expectedSitemapUrls)}`
	);
}

const robots = readBuildFile('robots.txt').trim();
const expectedRobots = `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml`;
if (robots !== expectedRobots) {
	throw new Error('robots.txt does not match the expected crawl policy and sitemap URL');
}

const fallback = readBuildFile('404.html');
if (fallback === homepage) {
	throw new Error('404.html duplicates the prerendered homepage');
}

const vercelConfig = JSON.parse(
	readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')
) as { cleanUrls?: boolean; rewrites?: Array<{ source?: string; destination?: string }> };
const hasIndexFallback = vercelConfig.rewrites?.some(
	(rewrite) => rewrite.source === '/(.*)' && rewrite.destination === '/index.html'
);
if (vercelConfig.cleanUrls !== true || hasIndexFallback) {
	throw new Error('vercel.json must use clean URLs without an index.html catch-all rewrite');
}

console.log('SEO build output is valid');
