import { createAddressLoader, createTimelineLoader } from 'applesauce-loaders/loaders';
import { defaultRelays, devRelay, relayPool } from './relay-pool';
import { eventStore } from './eventStore';
import { articlesFilter, serverAnnouncementsFilter } from '$lib/constants';
import { SERVER_ANNOUNCEMENT_KIND } from '@contextvm/sdk';

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
