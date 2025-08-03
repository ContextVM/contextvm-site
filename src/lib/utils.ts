import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { InitializeResult } from '@modelcontextprotocol/sdk/types.js';
import type { ServerAnnouncement } from './models/serverAnnouncements';

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
