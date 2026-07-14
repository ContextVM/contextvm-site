import { SvelteMap } from 'svelte/reactivity';
import type { PaymentRequiredNotification } from '@contextvm/sdk';
import { decode } from 'nostr-tools/nip19';
import { isHexKey } from 'applesauce-core/helpers';

/**
 * Canonical key for a server: the hex pubkey, regardless of whether the caller passes
 * hex / npub / nprofile. Callers arrive with different identifier forms — the orchestrator
 * uses the clients-map key, while server-page forms use the reactive `connectionIdentifier`,
 * which flips hex→nprofile as the identity query resolves. The notification handler captures
 * whichever form `getClient` was first called with. Normalizing both storage and lookup to
 * the hex pubkey keeps them in sync instead of racing on identifier form.
 *
 * Inlined here (rather than reusing `$lib/utils`'s `decodeServerIdentifier`) so this service
 * doesn't drag `svelte-sonner`/`runed` into non-browser test runs.
 */
function canonicalServerKey(serverPubkey: string): string {
	const value = serverPubkey.trim();
	if (isHexKey(value)) return value.toLowerCase();
	try {
		const decoded = decode(value);
		if (decoded.type === 'npub' && typeof decoded.data === 'string') return decoded.data;
		if (decoded.type === 'nprofile' && decoded.data?.pubkey) return decoded.data.pubkey;
	} catch {
		// Not a decodable identifier — fall back to the raw value.
	}
	return serverPubkey;
}

/** Input record produced by the transport `payment_required` notification handler. */
export interface PaymentUiState {
	serverPubkey: string;
	/** Correlation key for the request: the Nostr event id when available, else `pay_req`. */
	requestEventId: string;
	notification: PaymentRequiredNotification;
	timestamp: number;
}

/**
 * All payment-required alternatives for one request.
 *
 * CEP-8: a server MAY emit multiple `notifications/payment_required` for the same
 * request (one per PMI) when the client advertised no PMIs. Those are *alternatives*
 * (pay one), so they are grouped by `requestEventId`.
 */
export interface PaymentRequestGroup {
	serverPubkey: string;
	requestEventId: string;
	options: PaymentRequiredNotification[];
	timestamp: number;
}

/**
 * Minimal payment UI state registry.
 *
 * This does not attempt to pay. It only records `payment_required` notifications so the
 * UI can render them without losing alternatives or concurrent requests. `payment_accepted`
 * / `payment_rejected` are not recorded: the SDK doesn't expose the request correlation
 * app-side, so they can't be matched to a group, and the panel hides once the tool resolves.
 */
export class PaymentNotificationsService {
	private readonly groupsByRequest = new SvelteMap<string, PaymentRequestGroup>();

	set(state: PaymentUiState): void {
		const serverKey = canonicalServerKey(state.serverPubkey);
		const existing = this.groupsByRequest.get(state.requestEventId);
		if (existing) {
			// Dedup by pay_req: relays may redeliver, and when requestEventId is unavailable
			// we key by pay_req, so duplicates would otherwise pile up.
			if (!existing.options.some((o) => o.params.pay_req === state.notification.params.pay_req)) {
				existing.options.push(state.notification);
			}
			existing.timestamp = state.timestamp;
		} else {
			this.groupsByRequest.set(state.requestEventId, {
				serverPubkey: serverKey,
				requestEventId: state.requestEventId,
				options: [state.notification],
				timestamp: state.timestamp
			});
		}
	}

	/** Latest group for a server (by timestamp). Used by single-call forms. */
	getLatestForServer(serverPubkey: string): PaymentRequestGroup | undefined {
		const serverKey = canonicalServerKey(serverPubkey);
		let latest: PaymentRequestGroup | undefined;
		for (const group of this.groupsByRequest.values()) {
			if (group.serverPubkey !== serverKey) continue;
			if (!latest || group.timestamp > latest.timestamp) latest = group;
		}
		return latest;
	}

	/** All active payment-required groups for a server, oldest first. */
	getActiveGroupsForServer(serverPubkey: string): PaymentRequestGroup[] {
		const serverKey = canonicalServerKey(serverPubkey);
		const active: PaymentRequestGroup[] = [];
		for (const group of this.groupsByRequest.values()) {
			if (group.serverPubkey === serverKey && group.options.length > 0) {
				active.push(group);
			}
		}
		return active.sort((a, b) => a.timestamp - b.timestamp);
	}

	clearServer(serverPubkey: string): void {
		const serverKey = canonicalServerKey(serverPubkey);
		for (const [requestEventId, group] of this.groupsByRequest) {
			if (group.serverPubkey === serverKey) {
				this.groupsByRequest.delete(requestEventId);
			}
		}
	}
}

export const paymentNotificationsService = new PaymentNotificationsService();
