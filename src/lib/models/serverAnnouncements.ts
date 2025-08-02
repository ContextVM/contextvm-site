import { map } from 'rxjs/operators';
import type { Model } from 'applesauce-core';
import { getTagValue } from 'applesauce-core/helpers';
import { InitializeResultSchema, type InitializeResult } from '@modelcontextprotocol/sdk/types.js';
import type { Event } from 'nostr-tools';
import { SERVER_ANNOUNCEMENT_KIND } from '@contextvm/sdk';

export interface ServerAnnouncement {
	id: string;
	pubkey: string;
	created_at: number;
	name: string;
	website?: string;
	picture?: string;
	about?: string;
	supportsEncryption: boolean;
	capabilities: InitializeResult;
}

/** A helper function to parse server announcement events */
export function parseServerAnnouncement(event: Event): ServerAnnouncement | null {
	try {
		// Parse the content to get server capabilities
		const content = JSON.parse(event.content);
		const parsed = InitializeResultSchema.safeParse(content);

		if (!parsed.success) {
			console.error('Invalid server capabilities:', parsed.error);
			return null;
		}

		// Extract metadata from tags
		const name = getTagValue(event, 'name') || parsed.data.serverInfo.name || 'Unknown Server';
		const website = getTagValue(event, 'website');
		const picture = getTagValue(event, 'picture');
		const about = getTagValue(event, 'about');
		const supportsEncryption = event.tags.some((tag) => tag[0] === 'support_encryption');

		return {
			id: event.id,
			pubkey: event.pubkey,
			created_at: event.created_at,
			name,
			website,
			picture,
			about,
			supportsEncryption,
			capabilities: parsed.data
		};
	} catch (error) {
		console.error('Error parsing server announcement:', error);
		return null;
	}
}

/** A model that gets and parses server announcements */
export function ServerAnnouncementsModel(): Model<ServerAnnouncement[]> {
	return (events) =>
		events.timeline({ kinds: [SERVER_ANNOUNCEMENT_KIND] }).pipe(
			map((events: Event[]) => {
				// Parse each event and filter out invalid ones
				const announcements = events
					.map(parseServerAnnouncement)
					.filter((announcement): announcement is ServerAnnouncement => announcement !== null);

				// Sort by creation date (newest first)
				return announcements.sort(
					(a: ServerAnnouncement, b: ServerAnnouncement) => b.created_at - a.created_at
				);
			})
		);
}

/** A model that gets and parses a server announcement by pubkey */
export function ServerAnnouncementModel(pubkey: string): Model<ServerAnnouncement | undefined> {
	return (events) =>
		events.timeline({ kinds: [SERVER_ANNOUNCEMENT_KIND], authors: [pubkey] }).pipe(
			map((events: Event[]) => {
				// Parse each event and return the first valid one
				const announcements = events
					.map(parseServerAnnouncement)
					.filter((announcement): announcement is ServerAnnouncement => announcement !== null);

				// Return the newest announcement or undefined if none found
				return announcements.sort(
					(a: ServerAnnouncement, b: ServerAnnouncement) => b.created_at - a.created_at
				)[0];
			})
		);
}
