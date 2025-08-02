import { SERVER_ANNOUNCEMENT_KIND } from '@contextvm/sdk';
import type { Filter } from 'nostr-tools';
import { LongFormArticle } from 'nostr-tools/kinds';

export const CONTEXTVM_PUBKEY = '6b3780ef2972e73d370b84a3e51e7aa9ae34bf412938dcfbd9c5f63b221416c8';

export const articlesFilter: Filter = {
	authors: [CONTEXTVM_PUBKEY],
	kinds: [LongFormArticle]
};

export const serverAnnouncementsFilter: Filter = {
	kinds: [SERVER_ANNOUNCEMENT_KIND]
};
