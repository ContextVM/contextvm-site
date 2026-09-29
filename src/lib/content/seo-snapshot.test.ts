import { describe, expect, test } from 'bun:test';
import { npubEncode, nprofileEncode } from 'nostr-tools/nip19';
import type { Event } from 'nostr-tools';
import { decodeServerPubkey, getArticleIdentifier } from './seo-snapshot';

const pubkey = '65a334b02f5913cf2c1f73376044df11254166676e7d499d0c34e2ca10cf3e16';

describe('getArticleIdentifier', () => {
	test('returns the addressable event identifier', () => {
		const event = { tags: [['d', 'article-slug']] } as Event;
		expect(getArticleIdentifier(event)).toBe('article-slug');
	});

	test('rejects events without a non-empty identifier', () => {
		const event = { tags: [['d', '']] } as Event;
		expect(getArticleIdentifier(event)).toBeNull();
	});
});

describe('decodeServerPubkey', () => {
	test('normalizes hex, npub, and nprofile identifiers to the same pubkey', () => {
		expect(decodeServerPubkey(pubkey)).toBe(pubkey);
		expect(decodeServerPubkey(npubEncode(pubkey))).toBe(pubkey);
		expect(
			decodeServerPubkey(nprofileEncode({ pubkey, relays: ['wss://relay.contextvm.org'] }))
		).toBe(pubkey);
	});

	test('rejects unsupported and malformed identifiers', () => {
		expect(decodeServerPubkey('relayvm@contextvm.org')).toBeNull();
		expect(decodeServerPubkey('not-a-server-id')).toBeNull();
	});
});
