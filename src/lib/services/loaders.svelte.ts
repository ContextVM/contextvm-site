import {
	createAddressLoader,
	createEventLoader,
	createTimelineLoader
} from 'applesauce-loaders/loaders';
import { commonRelays, defaultRelays, relayPool } from './relay-pool';
import { eventStore } from './eventStore';
import { articlesFilter, createServerNotesFilter, serverAnnouncementsFilter } from '$lib/constants';
import { relayStore } from '../stores/relay-store.svelte';
import {
	PROMPTS_LIST_KIND,
	RESOURCES_LIST_KIND,
	RESOURCETEMPLATES_LIST_KIND,
	SERVER_ANNOUNCEMENT_KIND,
	TOOLS_LIST_KIND
} from '@contextvm/sdk';
import { kinds } from 'nostr-tools';
import { mergeRelaySets } from 'applesauce-core/helpers/relays';

// Create address loader
export const addressLoader = createAddressLoader(relayPool, { eventStore });
export const eventLoader = createEventLoader(relayPool, {
	eventStore,
	extraRelays: commonRelays
});

// Function to create a blog articles loader with dynamic relays
export const createBlogArticlesLoader = (relays: string[] = defaultRelays) => {
	const loader = createTimelineLoader(relayPool, relays, articlesFilter, {
		eventStore
	});
	return loader();
};

// Function to create a server announcements loader with dynamic relays
export const createServerAnnouncementsLoader = (relays?: string[]) => {
	const selectedRelays = relays || relayStore.selectedRelays;
	const loader = createTimelineLoader(relayPool, selectedRelays, serverAnnouncementsFilter, {
		eventStore
	});
	return loader();
};

// Function to create a server announcement loader by pubkey with dynamic relays
export const createServerAnnouncementByPubkeyLoader = (pubkey: string, relays?: string[]) => {
	const selectedRelays = relays || relayStore.selectedRelays;
	return addressLoader({
		pubkey,
		kind: SERVER_ANNOUNCEMENT_KIND,
		relays: selectedRelays
	});
};

// Function to create a tools announcement loader by pubkey with dynamic relays
export const createToolsAnnouncementByPubkeyLoader = (pubkey: string, relays?: string[]) => {
	const selectedRelays = relays || relayStore.selectedRelays;
	return addressLoader({
		pubkey,
		kind: TOOLS_LIST_KIND,
		relays: selectedRelays
	});
};

// Function to create a resources announcement loader by pubkey with dynamic relays
export const createResourcesAnnouncementByPubkeyLoader = (pubkey: string, relays?: string[]) => {
	const selectedRelays = relays || relayStore.selectedRelays;
	return addressLoader({
		pubkey,
		kind: RESOURCES_LIST_KIND,
		relays: selectedRelays
	});
};

// Function to create a resources templates announcement loader by pubkey with dynamic relays
export const createResourcesTemplatesAnnouncementByPubkeyLoader = (
	pubkey: string,
	relays?: string[]
) => {
	const selectedRelays = relays || relayStore.selectedRelays;
	return addressLoader({
		pubkey,
		kind: RESOURCETEMPLATES_LIST_KIND,
		relays: selectedRelays
	});
};

// Function to create a prompts announcement loader by pubkey with dynamic relays
export const createPromptsAnnouncementByPubkeyLoader = (pubkey: string, relays?: string[]) => {
	const selectedRelays = relays || relayStore.selectedRelays;
	return addressLoader({
		pubkey,
		kind: PROMPTS_LIST_KIND,
		relays: selectedRelays
	});
};

// Function to create a server relay list loader by pubkey with dynamic relays
export const createServerRelayListByPubkeyLoader = (pubkey: string, relays?: string[]) => {
	const selectedRelays = relays || relayStore.selectedRelays;
	return addressLoader({
		pubkey,
		kind: kinds.RelayList,
		relays: selectedRelays
	});
};

// Function to create a server notes loader (kind:1) by pubkey with dynamic relays
export const createServerNotesLoader = (pubkey: string, relays?: string[]) => {
	const selectedRelays = mergeRelaySets(relays || relayStore.selectedRelays, commonRelays);
	const loader = createTimelineLoader(relayPool, selectedRelays, createServerNotesFilter(pubkey), {
		eventStore
	});
	return loader();
};

export const createNoteEventLoader = (id: string, relays?: string[]) => {
	return eventLoader({
		id,
		relays: relays && relays.length > 0 ? mergeRelaySets(relays, commonRelays) : commonRelays
	});
};
