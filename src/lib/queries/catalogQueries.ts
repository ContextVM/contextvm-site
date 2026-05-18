import { createQuery } from '@tanstack/svelte-query';
import { catalogKeys } from './catalogQueryKeys';
import {
	createCommonSchemaAnnouncementsLoader,
	createSchemaProviderLoader
} from '$lib/services/loaders.svelte';
import { lastValueFrom } from 'rxjs';
import type { Event } from 'nostr-tools';

export function useCatalogSchemas() {
	return createQuery({
		queryKey: catalogKeys.all,
		queryFn: async () => {
			return await lastValueFrom(createCommonSchemaAnnouncementsLoader());
		}
	});
}

export function useSchemaProviders(hash: string) {
	return createQuery({
		queryKey: catalogKeys.providers(hash),
		queryFn: async () => {
			return await lastValueFrom(createSchemaProviderLoader(hash));
		}
	});
}
