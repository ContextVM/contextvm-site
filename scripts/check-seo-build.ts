import { readFileSync, readdirSync } from 'node:fs';
import { getArticleIdentifier, seoSnapshot } from '../src/lib/content/seo-snapshot';
import { nprofileEncode, npubEncode } from 'nostr-tools/nip19';

const siteOrigin = 'https://contextvm.org';
const staticPages = new Map([
	['index.html', '/'],
	['about.html', '/about'],
	['blog.html', '/blog'],
	['faqs.html', '/faqs'],
	['servers.html', '/servers'],
	['slides.html', '/slides']
]);
const articlePages = new Map(
	seoSnapshot.articles.flatMap((article) => {
		const identifier = getArticleIdentifier(article);
		return identifier
			? [[`blog/${identifier}.html`, `/blog/${encodeURIComponent(identifier)}`] as const]
			: [];
	})
);
const canonicalServerPages = new Map(
	seoSnapshot.servers.map(
		(server) => [`s/${server.event.pubkey}.html`, `/s/${server.event.pubkey}`] as const
	)
);
const serverAliasPages = new Map(
	seoSnapshot.servers.flatMap((server) => {
		const canonicalPath = `/s/${server.event.pubkey}`;
		const nprofile = nprofileEncode({
			pubkey: server.event.pubkey,
			relays: server.relays
		});
		return [
			[`s/${npubEncode(server.event.pubkey)}.html`, canonicalPath] as const,
			[`s/${nprofile}.html`, canonicalPath] as const
		];
	})
);
const serverPages = new Map([...canonicalServerPages, ...serverAliasPages]);
const pages = new Map([...staticPages, ...articlePages, ...serverPages]);

function readBuildFile(path: string): string {
	return readFileSync(new URL(`../build/${path}`, import.meta.url), 'utf8');
}

function schemaTypes(html: string, page: string): string[] {
	const matches = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)];
	if (matches.length !== 1) {
		throw new Error(`${page} contains ${matches.length} JSON-LD blocks; expected 1`);
	}

	const structuredData = JSON.parse(matches[0][1]) as {
		'@graph'?: Array<{ '@type'?: string }>;
	};
	return structuredData['@graph']?.map((entry) => entry['@type'] ?? '') ?? [];
}

for (const [page, path] of pages) {
	const html = readBuildFile(page);
	const expectedCanonical = `${siteOrigin}${path}`;
	const canonicalUrls = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(
		(match) => match[1]
	);
	const titles = [...html.matchAll(/<title>([^<]+)<\/title>/g)].map((match) => match[1]);
	const descriptions = [...html.matchAll(/<meta name="description" content="([^"]+)"/g)].map(
		(match) => match[1]
	);
	const robots = [...html.matchAll(/<meta name="robots" content="([^"]+)"/g)].map(
		(match) => match[1]
	);
	const openGraphUrls = [...html.matchAll(/<meta property="og:url" content="([^"]+)"/g)].map(
		(match) => match[1]
	);
	const types = schemaTypes(html, page);

	if (titles.length !== 1 || !titles[0].trim()) {
		throw new Error(`${page} contains ${titles.length} non-empty titles; expected 1`);
	}
	if (descriptions.length !== 1 || !descriptions[0].trim()) {
		throw new Error(`${page} contains ${descriptions.length} non-empty descriptions; expected 1`);
	}
	if (canonicalUrls.length !== 1 || canonicalUrls[0] !== expectedCanonical) {
		throw new Error(
			`${page} has canonical ${JSON.stringify(canonicalUrls)}; expected ${expectedCanonical}`
		);
	}
	if (robots.length !== 1 || robots[0] !== 'index, follow') {
		throw new Error(
			`${page} has robots directives ${JSON.stringify(robots)}; expected index, follow`
		);
	}
	if (openGraphUrls.length !== 1 || openGraphUrls[0] !== expectedCanonical) {
		throw new Error(
			`${page} has Open Graph URLs ${JSON.stringify(openGraphUrls)}; expected ${expectedCanonical}`
		);
	}
	if (!types.includes('Organization') || !types.includes('WebSite')) {
		throw new Error(`${page} is missing the Organization or WebSite schema`);
	}
	if (html.includes('contextvm.com') || html.includes('sveltekit-prerender')) {
		throw new Error(`${page} contains an obsolete or placeholder SEO URL`);
	}
}

for (const page of articlePages.keys()) {
	const html = readBuildFile(page);
	const types = schemaTypes(html, page);
	const images = [...html.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map(
		(match) => match[1]
	);

	if (!html.includes('<article') || !html.includes('<nav aria-label="Breadcrumb"')) {
		throw new Error(`${page} is missing its prerendered article or visible breadcrumb`);
	}
	if (!types.includes('Article') || !types.includes('BreadcrumbList')) {
		throw new Error(`${page} is missing Article or BreadcrumbList structured data`);
	}
	if (images.length !== 1 || !images[0].startsWith('https://')) {
		throw new Error(`${page} does not have one absolute Open Graph image`);
	}
}

for (const page of serverPages.keys()) {
	const html = readBuildFile(page);
	if (!html.includes('<article') || !html.includes('<nav aria-label="Breadcrumb"')) {
		throw new Error(`${page} is missing its prerendered server profile or visible breadcrumb`);
	}
	if (!/<h1[^>]*>[^<]+<\/h1>/.test(html)) {
		throw new Error(`${page} is missing its server-name heading`);
	}
}

const builtArticlePages = readdirSync(new URL('../build/blog/', import.meta.url))
	.filter((file) => file.endsWith('.html'))
	.sort();
const expectedArticlePages = [...articlePages.keys()]
	.map((page) => page.slice('blog/'.length))
	.sort();
if (JSON.stringify(builtArticlePages) !== JSON.stringify(expectedArticlePages)) {
	throw new Error('The built article routes do not match the reviewed snapshot');
}

const builtServerPages = readdirSync(new URL('../build/s/', import.meta.url))
	.filter((file) => file.endsWith('.html'))
	.sort();
const expectedServerPages = [...serverPages.keys()].map((page) => page.slice('s/'.length)).sort();
if (JSON.stringify(builtServerPages) !== JSON.stringify(expectedServerPages)) {
	throw new Error('The built server routes do not match the curated allowlist');
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

const sitemapPages = new Map([...staticPages, ...articlePages, ...canonicalServerPages]);
const expectedSitemapUrls = [...sitemapPages.values()].map((path) => `${siteOrigin}${path}`);
const sitemapUrls = [...readBuildFile('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
	(match) => match[1]
);
if (JSON.stringify(sitemapUrls) !== JSON.stringify(expectedSitemapUrls)) {
	throw new Error('sitemap.xml does not match the static and snapshot-backed routes');
}

const robots = readBuildFile('robots.txt').trim();
const expectedRobots = `User-agent: *
Allow: /

Sitemap: ${siteOrigin}/sitemap.xml`;
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
