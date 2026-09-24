import { canonicalUrl } from '$lib/seo';

export const prerender = true;

const publicPages = ['/', '/about', '/blog', '/faqs', '/servers', '/slides'];

export function GET() {
	const urls = publicPages
		.map((path) => `  <url><loc>${canonicalUrl(path)}</loc></url>`)
		.join('\n');
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(sitemap, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
}
