import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Add CORS headers for .well-known/nostr.json to allow JavaScript Nostr apps to access it
	if (event.url.pathname === '/.well-known/nostr.json') {
		response.headers.set('Access-Control-Allow-Origin', '*');
		response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
		response.headers.set('Cache-Control', 'public, max-age=3600');
	}

	return response;
};
