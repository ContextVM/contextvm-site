import { createQuery } from '@tanstack/svelte-query';
import { mcpClientService } from '$lib/services/mcpClient.svelte';
import { parseServerInitializeMsg, type ServerAnnouncement } from '$lib/models/serverAnnouncements';
import { serverKeys } from './serverQueryKeys';
import {
	createServerAnnouncementByPubkeyLoader,
	createServerRelayListByPubkeyLoader,
	createToolsAnnouncementByPubkeyLoader,
	createResourcesAnnouncementByPubkeyLoader,
	createResourcesTemplatesAnnouncementByPubkeyLoader,
	createPromptsAnnouncementByPubkeyLoader,
	createServerAnnouncementsLoader
} from '$lib/services/loaders.svelte';
import type { Tool, Resource, ResourceTemplate, Prompt } from '@modelcontextprotocol/sdk/types.js';
import { lastValueFrom, type Subscription } from 'rxjs';
import type { NostrEvent } from 'nostr-tools';
import { getSeenRelays, mergeRelaySets } from 'applesauce-core/helpers/relays';
import { relayStore } from '$lib/stores/relay-store.svelte';
import { encodeServerIdentity, type ServerIdentity } from '$lib/utils';

interface ServerQueryResult {
	isPublic: boolean;
	server: ServerAnnouncement | null;
}

interface ParsedRelayList {
	relays: string[];
	hasPublishedRelayList: boolean;
}

let serverAnnouncementsSubscription: Subscription | null = null;
let serverAnnouncementsReadyPromise: Promise<boolean> | null = null;

function bootstrapServerAnnouncements(): Promise<boolean> {
	if (serverAnnouncementsReadyPromise) return serverAnnouncementsReadyPromise;

	serverAnnouncementsReadyPromise = new Promise((resolve) => {
		let settled = false;
		const settle = (value: boolean) => {
			if (settled) return;
			settled = true;
			resolve(value);
		};

		// Keep one long-lived stream subscription so the event store can continue
		// collecting announcements instead of stopping after the first emission.
		serverAnnouncementsSubscription = createServerAnnouncementsLoader().subscribe({
			next: () => settle(true),
			error: (error) => {
				console.error('Failed to load server announcements stream:', error);
				settle(false);
			}
		});

		// Unblock UI if no events arrive quickly.
		setTimeout(() => settle(false), 8000);
	});

	return serverAnnouncementsReadyPromise;
}

export function useServerAnnouncement(pubkey: string, relayHints: string[] = []) {
	return createQuery<ServerQueryResult | null>({
		queryKey: serverKeys.announcement(pubkey),
		queryFn: async () => {
			let server: ServerAnnouncement | null = null;
			const event = await lastValueFrom(
				createServerAnnouncementByPubkeyLoader(pubkey, getLookupRelays(relayHints))
			);
			server = parseServerInitializeMsg(event);
			return { server, isPublic: true };
		}
	});
}

export function useServerIdentity(pubkey: string, explicitRelayHints: string[] = []) {
	return createQuery<ServerIdentity>({
		queryKey: serverKeys.identity(pubkey),
		queryFn: async () => {
			const relayListEvent = await fetchServerRelayListEvent(pubkey, explicitRelayHints);
			const publishedRelayList = parseServerRelayList(relayListEvent);
			const announcementEvent = await fetchServerAnnouncementEvent(pubkey, explicitRelayHints);
			const announcementRelays = getEventSeenRelays(announcementEvent);
			const selectedRelays = relayStore.selectedRelays;

			const relayHints =
				publishedRelayList.relays.length > 0
					? publishedRelayList.relays
					: announcementRelays.length > 0
						? announcementRelays
						: explicitRelayHints.length > 0
							? explicitRelayHints
							: selectedRelays;

			const relaySource: ServerIdentity['relaySource'] =
				publishedRelayList.relays.length > 0
					? 'kind10002'
					: announcementRelays.length > 0
						? 'announcement'
						: explicitRelayHints.length > 0
							? 'nprofile'
							: 'selected';

			return {
				...encodeServerIdentity(pubkey, relayHints),
				relayHints,
				relaySource,
				hasPublishedRelayList: publishedRelayList.hasPublishedRelayList
			};
		}
	});
}

export function useServerTools(pubkey: string, isPublic: boolean, relayHints: string[] = []) {
	return createQuery<Tool[] | null>({
		queryKey: serverKeys.capabilities.tools(pubkey),
		queryFn: async () => {
			if (isPublic) {
				return await fetchToolsFromAnnouncements(pubkey, relayHints);
			}
			return await fetchToolsFromMCP(pubkey);
		}
	});
}

export function useServerResources(pubkey: string, isPublic: boolean, relayHints: string[] = []) {
	return createQuery<Resource[] | null>({
		queryKey: serverKeys.capabilities.resources(pubkey),
		queryFn: async () => {
			if (isPublic) {
				return await fetchResourcesFromAnnouncements(pubkey, relayHints);
			}

			return await fetchResourcesFromMCP(pubkey);
		}
	});
}

export function useServerResourceTemplates(
	pubkey: string,
	isPublic: boolean,
	relayHints: string[] = []
) {
	return createQuery<ResourceTemplate[] | null>({
		queryKey: serverKeys.capabilities.resourceTemplates(pubkey),
		queryFn: async () => {
			if (isPublic) {
				return await fetchResourceTemplatesFromAnnouncements(pubkey, relayHints);
			}
			return await fetchResourceTemplatesFromMCP(pubkey);
		}
	});
}

export function useServerPrompts(pubkey: string, isPublic: boolean, relayHints: string[] = []) {
	return createQuery<Prompt[] | null>({
		queryKey: serverKeys.capabilities.prompts(pubkey),
		queryFn: async () => {
			if (isPublic) {
				return await fetchPromptsFromAnnouncements(pubkey, relayHints);
			}
			return await fetchPromptsFromMCP(pubkey);
		}
	});
}

async function fetchToolsFromAnnouncements(
	pubkey: string,
	relayHints: string[] = []
): Promise<Tool[] | null> {
	const event = await lastValueFrom(
		createToolsAnnouncementByPubkeyLoader(pubkey, getLookupRelays(relayHints))
	);
	if (!event) return null;
	try {
		const content = JSON.parse(event.content);
		return content.tools || [];
	} catch (err) {
		console.error('Failed to parse tools announcement:', err);
		return null;
	}
}

async function fetchToolsFromMCP(pubkey: string): Promise<Tool[]> {
	try {
		const result = await mcpClientService.listTools(pubkey);
		return result.tools;
	} catch (error) {
		console.error('Failed to fetch tools from MCP:', error);
		throw error;
	}
}

async function fetchResourcesFromAnnouncements(
	pubkey: string,
	relayHints: string[] = []
): Promise<Resource[] | null> {
	const event = await lastValueFrom(
		createResourcesAnnouncementByPubkeyLoader(pubkey, getLookupRelays(relayHints))
	);
	if (!event) return null;
	try {
		const content = JSON.parse(event.content);
		return content.resources || [];
	} catch (err) {
		console.error('Failed to parse resources announcement:', err);
		return null;
	}
}

async function fetchResourcesFromMCP(pubkey: string): Promise<Resource[]> {
	try {
		const result = await mcpClientService.listResources(pubkey);
		return result.resources;
	} catch (error) {
		console.error('Failed to fetch resources from MCP:', error);
		throw error;
	}
}

async function fetchResourceTemplatesFromAnnouncements(
	pubkey: string,
	relayHints: string[] = []
): Promise<ResourceTemplate[] | null> {
	const event = await lastValueFrom(
		createResourcesTemplatesAnnouncementByPubkeyLoader(pubkey, getLookupRelays(relayHints))
	);
	if (!event) return null;
	try {
		const content = JSON.parse(event.content);
		return content.resourceTemplates || [];
	} catch (err) {
		console.error('Failed to parse resource templates announcement:', err);
		return null;
	}
}

async function fetchResourceTemplatesFromMCP(pubkey: string): Promise<ResourceTemplate[]> {
	try {
		const result = await mcpClientService.listResourcesTemplates(pubkey);
		return result.resourceTemplates;
	} catch (error) {
		console.error('Failed to fetch resource templates from MCP:', error);
		throw error;
	}
}

async function fetchPromptsFromAnnouncements(
	pubkey: string,
	relayHints: string[] = []
): Promise<Prompt[] | null> {
	const event = await lastValueFrom(
		createPromptsAnnouncementByPubkeyLoader(pubkey, getLookupRelays(relayHints))
	);
	if (!event) return null;
	try {
		const content = JSON.parse(event.content);
		return content.prompts || [];
	} catch (err) {
		console.error('Failed to parse prompts announcement:', err);
		return null;
	}
}

async function fetchPromptsFromMCP(pubkey: string): Promise<Prompt[]> {
	try {
		const result = await mcpClientService.listPrompts(pubkey);
		return result.prompts;
	} catch (error) {
		console.error('Failed to fetch prompts from MCP:', error);
		throw error;
	}
}

export function useServerAnnouncements() {
	return createQuery<boolean>({
		queryKey: serverKeys.all,
		queryFn: async () => {
			return await bootstrapServerAnnouncements();
		}
	});
}

async function fetchServerAnnouncementEvent(
	pubkey: string,
	relayHints: string[] = []
): Promise<NostrEvent | null> {
	try {
		return await lastValueFrom(
			createServerAnnouncementByPubkeyLoader(pubkey, getLookupRelays(relayHints))
		);
	} catch (_error) {
		return null;
	}
}

async function fetchServerRelayListEvent(
	pubkey: string,
	relayHints: string[] = []
): Promise<NostrEvent | null> {
	try {
		return await lastValueFrom(
			createServerRelayListByPubkeyLoader(pubkey, getLookupRelays(relayHints))
		);
	} catch (_error) {
		return null;
	}
}

function getLookupRelays(relayHints: string[] = []): string[] {
	return mergeRelaySets(relayHints, relayStore.selectedRelays);
}

function parseServerRelayList(event: NostrEvent | null): ParsedRelayList {
	if (!event) {
		return { relays: [], hasPublishedRelayList: false };
	}

	const unmarkedRelays = event.tags
		.filter(
			(tag) => tag[0] === 'r' && tag[1] && (!tag[2] || tag[2] === 'read' || tag[2] === 'write')
		)
		.map((tag) => tag[1]);

	const preferredRelays = event.tags
		.filter((tag) => tag[0] === 'r' && tag[1] && !tag[2])
		.map((tag) => tag[1]);

	return {
		relays:
			preferredRelays.length > 0 ? mergeRelaySets(preferredRelays) : mergeRelaySets(unmarkedRelays),
		hasPublishedRelayList: true
	};
}

function getEventSeenRelays(event: NostrEvent | null | undefined): string[] {
	return event ? mergeRelaySets(getSeenRelays(event)) : [];
}
