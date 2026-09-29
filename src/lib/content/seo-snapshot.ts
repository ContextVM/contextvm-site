import { decode } from 'nostr-tools/nip19';
import type { Event } from 'nostr-tools';
import snapshotData from './seo-snapshot.json';

export interface ServerSnapshot {
	event: Event;
	relays: string[];
}

export interface SeoSnapshot {
	schemaVersion: 1;
	generatedAt: string;
	articles: Event[];
	servers: ServerSnapshot[];
}

export const seoSnapshot = snapshotData as SeoSnapshot;

export function getArticleIdentifier(event: Event): string | null {
	return event.tags.find((tag) => tag[0] === 'd')?.[1] || null;
}

export function getSnapshotArticle(identifier: string): Event | null {
	return (
		seoSnapshot.articles.find((article) => getArticleIdentifier(article) === identifier) ?? null
	);
}

export function decodeServerPubkey(identifier: string): string | null {
	if (/^[0-9a-f]{64}$/.test(identifier)) return identifier;

	try {
		const decoded = decode(identifier);
		if (decoded.type === 'npub') return decoded.data;
		if (decoded.type === 'nprofile') return decoded.data.pubkey;
	} catch {
		return null;
	}

	return null;
}

export function getSnapshotServer(identifier: string): ServerSnapshot | null {
	const pubkey = decodeServerPubkey(identifier);
	if (!pubkey) return null;

	return seoSnapshot.servers.find((server) => server.event.pubkey === pubkey) ?? null;
}
