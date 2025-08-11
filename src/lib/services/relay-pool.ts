import { RelayPool } from 'applesauce-relay';

// Create a single relay pool instance for the entire application
export const relayPool = new RelayPool();

export const defaultRelays = ['wss://relay.contextvm.org'];

export const metadataRelays = [
	'wss://0.kindpag.es/',
	'wss://relay.nostr.band',
	'wss://nos.lol',
	'wss://relay.damus.io'
];

export const devRelay = ['ws://localhost:10547'];
