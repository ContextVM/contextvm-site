import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { InitializeResult } from '@modelcontextprotocol/sdk/types.js';
import type { ServerAnnouncement } from './models/serverAnnouncements';
import { toast } from 'svelte-sonner';

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
