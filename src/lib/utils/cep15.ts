import type { Event } from 'nostr-tools';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface CEP15SchemaInfo {
	hash: string;
	name: string;
}

export function extractCommonSchemas(event: Event): CEP15SchemaInfo[] {
	const schemas: CEP15SchemaInfo[] = [];
	for (const tag of event.tags) {
		if (tag[0] === 'i' && tag.length >= 3) {
			schemas.push({ hash: tag[1], name: tag[2] });
		}
	}
	return schemas;
}

export function extractCategories(event: Event): string[] {
	const categories = new Set<string>();
	for (const tag of event.tags) {
		if (tag[0] === 't' && tag.length >= 2) {
			categories.add(tag[1]);
		}
	}
	return Array.from(categories);
}

export function getToolSchemaHash(tool: Tool): string | undefined {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const meta = (tool as any)._meta;
	if (
		meta &&
		typeof meta === 'object' &&
		'schemaHash' in meta &&
		typeof meta.schemaHash === 'string'
	) {
		return meta.schemaHash;
	}
	return undefined;
}
