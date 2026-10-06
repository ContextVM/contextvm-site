import { describe, expect, it } from 'bun:test';
import { absoluteSiteUrl, canonicalUrl } from './seo';

describe('canonicalUrl', () => {
	it('uses the production origin and strips the GitHub Pages base path', () => {
		expect(canonicalUrl('/contextvm-site/about', '/contextvm-site')).toBe(
			'https://contextvm.org/about'
		);
	});

	it('preserves encoded path segments', () => {
		expect(canonicalUrl('/blog/an%20article')).toBe('https://contextvm.org/blog/an%20article');
	});

	it('keeps the root URL canonical', () => {
		expect(canonicalUrl('/contextvm-site', '/contextvm-site')).toBe('https://contextvm.org/');
	});
});

describe('absoluteSiteUrl', () => {
	it('resolves site assets and preserves remote URLs', () => {
		expect(absoluteSiteUrl('/apple-touch-icon-180x180.png')).toBe(
			'https://contextvm.org/apple-touch-icon-180x180.png'
		);
		expect(absoluteSiteUrl('https://cdn.example.com/image.png')).toBe(
			'https://cdn.example.com/image.png'
		);
	});
});
