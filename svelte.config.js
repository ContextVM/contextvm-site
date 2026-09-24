import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const githubPagesBasePath = '/contextvm-site';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base: isGitHubPages ? githubPagesBasePath : '',
			relative: false
		},
		alias: {
			'@/*': './path/to/lib/*'
		},
		prerender: {
			crawl: true,
			origin: isGitHubPages ? 'https://contextvm.github.io' : 'https://contextvm.org'
		}
	}
};

export default config;
