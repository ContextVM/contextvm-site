import {
	createAddressLoader,
	createReactionsLoader,
	createTimelineLoader
} from 'applesauce-loaders/loaders';
import { defaultRelays, relayPool } from './relay-pool';
import { eventStore } from './eventStore';
import { articlesFilter } from '$lib/constants';

// Create address loader
export const addressLoader = createAddressLoader(relayPool, { eventStore });

export const reactionsLoader = createReactionsLoader(relayPool, { eventStore });

export const blogArticlesLoader = createTimelineLoader(relayPool, defaultRelays, articlesFilter, {
	eventStore
});
