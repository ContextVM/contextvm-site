import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { InitializeResult } from '@modelcontextprotocol/sdk/types.js';
import type { ServerAnnouncement } from './models/serverAnnouncements';
import { toast } from 'svelte-sonner';
import { decode, npubEncode, nprofileEncode, type ProfilePointer } from 'nostr-tools/nip19';
import { isNip05, queryProfile, type Nip05 } from 'nostr-tools/nip05';
import { isHexKey } from 'applesauce-core/helpers';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function formatUnixTimestamp(
	timestamp: number,
	showTime?: boolean,
	showDate: boolean = true,
	locale?: string
): string {
	const date = new Date(timestamp * 1000);
	const options: Intl.DateTimeFormatOptions = {};

	if (showDate) {
		options.dateStyle = 'medium';
	}

	if (showTime) {
		options.timeStyle = 'short';
	}

	return date.toLocaleString(locale, options);
}

// Server capability utilities
export function hasCapability(server: InitializeResult, capability: string): boolean {
	return capability in server.capabilities;
}

export function getAvailableCapabilities(server: ServerAnnouncement): string[] {
	return ['tools', 'resources', 'prompts'].filter((capability) =>
		hasCapability(server.capabilities, capability)
	);
}

export const isEmptyObj = (obj: object) => Object.keys(obj).length === 0;

/**
 * Generate a hex color from a hexadecimal string pubkey
 * Takes the first 6 characters and prepends '#' to create a valid hex color
 */
export function pubkeyToHexColor(pubkey: string): string {
	if (!pubkey) {
		throw new Error('Pubkey is required');
	}

	const hexColor = pubkey.slice(0, 6);

	return `#${hexColor}`;
}

/**
 * Copy data to clipboard
 */
export async function copyToClipboard(data: BlobPart, mimeType = 'text/plain') {
	try {
		// Always use text/plain for maximum compatibility
		const textData = String(data);

		if (navigator.clipboard.write) {
			await navigator.clipboard.write([
				new ClipboardItem({
					[mimeType]: new Blob([textData], {
						type: mimeType
					}),
					['text/plain']: new Blob([textData], {
						type: 'text/plain'
					})
				})
			]);
		} else {
			await new Promise((resolve) => {
				resolve(navigator.clipboard.writeText(textData));
			});
		}
		toast.success('Copied 👍');
	} catch (e) {
		toast.error(`Error: ${e}`);
		console.log(e);
	}
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
	return text
		.toString() // Convert to string (just in case)
		.toLowerCase() // Lowercase all characters
		.trim() // Remove leading/trailing spaces
		.normalize('NFD') // Normalize the string to decompose accented characters
		.replace(/[\u0300-\u036f]/g, '') // Remove all combining diacritical marks
		.replace(/[^a-z0-9\s-]/g, '') // Remove all non-word characters (allows letters, numbers, spaces, dashes)
		.replace(/[\s-]+/g, '-') // Replace spaces and dashes with a single dash
		.replace(/^-+|-+$/g, ''); // Trim dashes from the beginning and the end
}

/**
 * Trucate a string to a specified length if it exceeds the limit
 */
export function truncateString(str: string, limit: number = 164): string {
	return str.length > limit ? str.slice(0, limit) + '...' : str;
}

export interface ServerIdentity {
	pubkey: string;
	npub: string;
	nprofile: string;
	relayHints: string[];
	relaySource: 'kind10002' | 'announcement' | 'nprofile' | 'selected';
	hasPublishedRelayList: boolean;
}

export function encodeServerIdentity(pubkey: string, relayHints: string[]): ServerIdentity {
	const pointer: ProfilePointer = {
		pubkey,
		relays: relayHints.length > 0 ? relayHints : undefined
	};

	return {
		pubkey,
		npub: npubEncode(pubkey),
		nprofile: nprofileEncode(pointer),
		relayHints,
		relaySource: 'selected',
		hasPublishedRelayList: false
	};
}

export interface DecodedServerIdentifier {
	original: string;
	pubkey: string;
	relayHints: string[];
	format: 'hex' | 'npub' | 'nprofile' | 'nip05' | 'shortname';
	nip05?: string;
	domain?: string;
}

export function decodeServerIdentifier(identifier: string): DecodedServerIdentifier | null {
	const value = identifier.trim();

	if (!value) return null;

	if (isHexKey(value)) {
		return { original: value, pubkey: value, relayHints: [], format: 'hex' };
	}

	try {
		const decoded = decode(value);

		if (decoded.type === 'npub' && typeof decoded.data === 'string') {
			return { original: value, pubkey: decoded.data, relayHints: [], format: 'npub' };
		}

		if (decoded.type === 'nprofile') {
			return {
				original: value,
				pubkey: decoded.data.pubkey,
				relayHints: decoded.data.relays ?? [],
				format: 'nprofile'
			};
		}
	} catch (_error) {
		return null;
	}

	return null;
}

function toShortnameNip05(identifier: string, defaultDomain?: string | null): Nip05 | null {
	const value = identifier.trim();
	const domain = defaultDomain?.trim().toLowerCase();

	if (!value || !domain || value.includes('@')) {
		return null;
	}

	const candidate = `${value}@${domain}`;

	return isNip05(candidate) ? candidate : null;
}

export async function resolveServerIdentifier(
	identifier: string,
	defaultDomain?: string | null
): Promise<DecodedServerIdentifier | null> {
	const decoded = decodeServerIdentifier(identifier);

	if (decoded) {
		return decoded;
	}

	const value = identifier.trim();
	const nip05 = isNip05(value) ? value : toShortnameNip05(value, defaultDomain);

	if (!nip05) {
		return null;
	}

	const pointer = await queryProfile(nip05);
	const pubkey = pointer?.pubkey;

	if (!pubkey || !isHexKey(pubkey) || pubkey !== pubkey.toLowerCase()) {
		throw new Error(`No valid public key found for ${nip05}`);
	}

	const [, name = '_', domain = ''] = nip05.match(/^(?:([^@]+)@)?([^@]+)$/) ?? [];

	return {
		original: value,
		pubkey,
		relayHints: pointer?.relays ?? [],
		format: isNip05(value) ? 'nip05' : 'shortname',
		nip05: `${name}@${domain}`,
		domain
	};
}
