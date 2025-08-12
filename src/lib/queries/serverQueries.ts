import { createQuery } from '@tanstack/svelte-query';
import { mcpClientService } from '$lib/services/mcpClient.svelte';
import { parseServerInitializeMsg, type ServerAnnouncement } from '$lib/models/serverAnnouncements';
import { serverKeys } from './serverQueryKeys';
import {
	createServerAnnouncementByPubkeyLoader,
	createToolsAnnouncementByPubkeyLoader,
	createResourcesAnnouncementByPubkeyLoader,
	createResourcesTemplatesAnnouncementByPubkeyLoader,
	createPromptsAnnouncementByPubkeyLoader
} from '$lib/services/loaders.svelte';
import type { Tool, Resource, ResourceTemplate, Prompt } from '@modelcontextprotocol/sdk/types.js';
import { lastValueFrom } from 'rxjs';

interface ServerQueryResult {
	isPublic: boolean;
	server: ServerAnnouncement | null;
}

export function useServerAnnouncement(pubkey: string) {
	return createQuery<ServerQueryResult | null>({
		queryKey: serverKeys.announcement(pubkey),
		queryFn: async () => {
			let server: ServerAnnouncement | null = null;
			const event = await lastValueFrom(createServerAnnouncementByPubkeyLoader(pubkey));
			server = parseServerInitializeMsg(event);
			return { server, isPublic: true };
		},
		retry: false
	});
}

export function useServerTools(pubkey: string, isPublic: boolean) {
	return createQuery<Tool[] | null>({
		queryKey: serverKeys.capabilities.tools(pubkey),
		queryFn: async () => {
			if (isPublic) {
				return await fetchToolsFromAnnouncements(pubkey);
			}
			return await fetchToolsFromMCP(pubkey);
		}
	});
}

export function useServerResources(pubkey: string, isPublic: boolean) {
	return createQuery<Resource[] | null>({
		queryKey: serverKeys.capabilities.resources(pubkey),
		queryFn: async () => {
			if (isPublic) {
				return await fetchResourcesFromAnnouncements(pubkey);
			}

			return await fetchResourcesFromMCP(pubkey);
		}
	});
}

export function useServerResourceTemplates(pubkey: string, isPublic: boolean) {
	return createQuery<ResourceTemplate[] | null>({
		queryKey: serverKeys.capabilities.resourceTemplates(pubkey),
		queryFn: async () => {
			if (isPublic) {
				return await fetchResourceTemplatesFromAnnouncements(pubkey);
			}
			return await fetchResourceTemplatesFromMCP(pubkey);
		}
	});
}

export function useServerPrompts(pubkey: string, isPublic: boolean) {
	return createQuery<Prompt[] | null>({
		queryKey: serverKeys.capabilities.prompts(pubkey),
		queryFn: async () => {
			if (isPublic) {
				return await fetchPromptsFromAnnouncements(pubkey);
			}
			return await fetchPromptsFromMCP(pubkey);
		}
	});
}

async function fetchToolsFromAnnouncements(pubkey: string): Promise<Tool[] | null> {
	const event = await lastValueFrom(createToolsAnnouncementByPubkeyLoader(pubkey));
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

async function fetchResourcesFromAnnouncements(pubkey: string): Promise<Resource[] | null> {
	const event = await lastValueFrom(createResourcesAnnouncementByPubkeyLoader(pubkey));
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
	pubkey: string
): Promise<ResourceTemplate[] | null> {
	const event = await lastValueFrom(createResourcesTemplatesAnnouncementByPubkeyLoader(pubkey));
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

async function fetchPromptsFromAnnouncements(pubkey: string): Promise<Prompt[] | null> {
	const event = await lastValueFrom(createPromptsAnnouncementByPubkeyLoader(pubkey));
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
