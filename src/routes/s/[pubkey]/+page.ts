import { building } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getSnapshotServer, seoSnapshot } from '$lib/content/seo-snapshot';
import { nprofileEncode, npubEncode } from 'nostr-tools/nip19';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	seoSnapshot.servers.flatMap((server) => [
		{ pubkey: server.event.pubkey },
		{ pubkey: npubEncode(server.event.pubkey) },
		{
			pubkey: nprofileEncode({
				pubkey: server.event.pubkey,
				relays: server.relays
			})
		}
	]);

export const load = (({ params }) => {
	const server = getSnapshotServer(params.pubkey);
	if (building && !server) error(404, 'Server is not in the prerender snapshot');

	return {
		server,
		generatedAt: seoSnapshot.generatedAt
	};
}) satisfies PageLoad;
