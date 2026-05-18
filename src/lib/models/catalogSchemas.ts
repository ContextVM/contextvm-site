import { map } from 'rxjs/operators';
import type { Model } from 'applesauce-core';
import type { Event } from 'nostr-tools';
import { extractCategories, extractCommonSchemas } from '$lib/utils/cep15';
import { TOOLS_LIST_KIND } from '@contextvm/sdk';

export interface CatalogSchemaGroup {
	hash: string;
	name: string;
	categories: string[];
	providers: string[]; // array of pubkeys
}

export function CatalogSchemasModel(): Model<CatalogSchemaGroup[]> {
	return (events) =>
		events.timeline({ kinds: [TOOLS_LIST_KIND] }).pipe(
			map((events: Event[]) => {
				const latestEventsByPubkey = new Map<string, Event>();
				
				for (const event of events) {
					const existing = latestEventsByPubkey.get(event.pubkey);
					if (!existing || event.created_at > existing.created_at) {
						latestEventsByPubkey.set(event.pubkey, event);
					}
				}

				const groups = new Map<string, CatalogSchemaGroup>();

				for (const event of latestEventsByPubkey.values()) {
					const schemas = extractCommonSchemas(event);
					const categories = extractCategories(event);
					
					for (const schema of schemas) {
						let group = groups.get(schema.hash);
						if (!group) {
							group = {
								hash: schema.hash,
								name: schema.name,
								categories: [],
								providers: []
							};
							groups.set(schema.hash, group);
						}

						if (!group.providers.includes(event.pubkey)) {
							group.providers.push(event.pubkey);
						}

						for (const cat of categories) {
							if (!group.categories.includes(cat)) {
								group.categories.push(cat);
							}
						}
					}
				}

				return Array.from(groups.values());
			})
		);
}

export function SchemaProvidersModel(hash: string): Model<string[]> {
	return (events) =>
		events.timeline({ kinds: [TOOLS_LIST_KIND] }).pipe(
			map((events: Event[]) => {
				const latestEventsByPubkey = new Map<string, Event>();
				for (const event of events) {
					const existing = latestEventsByPubkey.get(event.pubkey);
					if (!existing || event.created_at > existing.created_at) {
						latestEventsByPubkey.set(event.pubkey, event);
					}
				}

				const providers: string[] = [];
				for (const event of latestEventsByPubkey.values()) {
					const schemas = extractCommonSchemas(event);
					if (schemas.some((s) => s.hash === hash)) {
						providers.push(event.pubkey);
					}
				}
				return providers;
			})
		);
}
