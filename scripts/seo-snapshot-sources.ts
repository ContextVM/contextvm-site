export const ARTICLE_AUTHOR = '6b3780ef2972e73d370b84a3e51e7aa9ae34bf412938dcfbd9c5f63b221416c8';

export const ARTICLE_RELAYS = [
	'wss://relay.damus.io',
	'wss://relay.nostr.net',
	'wss://nos.lol',
	'wss://nostr.mom'
];

// Removing an identifier here deliberately removes it from the next snapshot.
export const EXCLUDED_ARTICLE_IDENTIFIERS: string[] = [];

// This reviewed allowlist is the only source of prerendered server profiles.
export const SERVER_SOURCES = [
	{
		pubkey: '65a334b02f5913cf2c1f73376044df11254166676e7d499d0c34e2ca10cf3e16',
		relays: ['wss://relay.contextvm.org']
	},
	{
		pubkey: '29bd6461f780c07b29c89b4df8017db90973d5608a3cd811a0522b15c1064f15',
		relays: ['wss://nos.lol']
	},
	{
		pubkey: 'e3564bb877adb0c99a7e4973ccb22e516d7d9eca0027d0bd62a04174ed670530',
		relays: ['wss://relay.contextvm.org']
	}
] as const;
