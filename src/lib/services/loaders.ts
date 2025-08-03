import { createAddressLoader, createTimelineLoader } from 'applesauce-loaders/loaders';
import { defaultRelays, devRelay, relayPool } from './relay-pool';
import { eventStore } from './eventStore';
import { articlesFilter, serverAnnouncementsFilter } from '$lib/constants';
import {
	PROMPTS_LIST_KIND,
	RESOURCES_LIST_KIND,
	RESOURCETEMPLATES_LIST_KIND,
	SERVER_ANNOUNCEMENT_KIND,
	TOOLS_LIST_KIND
} from '@contextvm/sdk';

// Create address loader
export const addressLoader = createAddressLoader(relayPool, { eventStore });

export const blogArticlesLoader = createTimelineLoader(relayPool, defaultRelays, articlesFilter, {
	eventStore
});

export const serverAnnouncementsLoader = createTimelineLoader(
	relayPool,
	devRelay,
	serverAnnouncementsFilter,
	{
		eventStore
	}
);

export const serverAnnouncementByPubkeyLoader = (pubkey: string) =>
	addressLoader({
		pubkey,
		kind: SERVER_ANNOUNCEMENT_KIND,
		relays: devRelay
	});

export const toolsAnnouncementByPubkeyLoader = (pubkey: string) =>
	addressLoader({
		pubkey,
		kind: TOOLS_LIST_KIND,
		relays: devRelay
	});

export const resourcesAnnouncementByPubkeyLoader = (pubkey: string) =>
	addressLoader({
		pubkey,
		kind: RESOURCES_LIST_KIND,
		relays: devRelay
	});

export const resourcesTemplatesAnnouncementByPubkeyLoader = (pubkey: string) =>
	addressLoader({
		pubkey,
		kind: RESOURCETEMPLATES_LIST_KIND,
		relays: devRelay
	});

export const promptsAnnouncementByPubkeyLoader = (pubkey: string) =>
	addressLoader({
		pubkey,
		kind: PROMPTS_LIST_KIND,
		relays: devRelay
	});
