import { SERVER_ANNOUNCEMENT_KIND } from '@contextvm/sdk';
import type { Filter } from 'nostr-tools';
import { LongFormArticle, ShortTextNote } from 'nostr-tools/kinds';
import { TOOLS_LIST_KIND } from '@contextvm/sdk';

export const COMMON_SCHEMA_NAMESPACE = 'io.contextvm/common-schema';

export const CONTEXTVM_PUBKEY = '6b3780ef2972e73d370b84a3e51e7aa9ae34bf412938dcfbd9c5f63b221416c8';

export const articlesFilter: Filter = {
	authors: [CONTEXTVM_PUBKEY],
	kinds: [LongFormArticle]
};

export const serverAnnouncementsFilter: Filter = {
	kinds: [SERVER_ANNOUNCEMENT_KIND]
};

export function createServerNotesFilter(pubkey: string): Filter {
	return {
		authors: [pubkey],
		kinds: [ShortTextNote],
		limit: 5
	};
}

export const commonSchemasFilter: Filter = {
	kinds: [TOOLS_LIST_KIND],
	'#k': [COMMON_SCHEMA_NAMESPACE]
};

export function createSchemaProvidersFilter(hash: string): Filter {
	return {
		kinds: [TOOLS_LIST_KIND],
		'#i': [hash]
	};
}

export function createTagServersFilter(tag: string): Filter {
	return {
		kinds: [TOOLS_LIST_KIND],
		'#t': [tag]
	};
}
