import { SvelteMap } from 'svelte/reactivity';
import type {
	PaymentAcceptedNotification,
	PaymentRejectedNotification,
	PaymentRequiredNotification
} from '@contextvm/sdk';

export type PaymentNotification =
	| ({ type: 'payment_required' } & PaymentRequiredNotification)
	| ({ type: 'payment_accepted' } & PaymentAcceptedNotification)
	| ({ type: 'payment_rejected' } & PaymentRejectedNotification);

export interface PaymentUiState {
	serverPubkey: string;
	/** Nostr event id of the correlated *request* (CEP-8 `e` tag) */
	requestEventId: string;
	status: 'payment_required' | 'payment_accepted' | 'payment_rejected';
	/** Raw notification params as received (rendered in UI) */
	notification: PaymentNotification;
	timestamp: number;
}

/**
 * Minimal payment UI state registry.
 *
 * This does not attempt to pay. It only records CEP-8 notifications so the UI can render them.
 */
export class PaymentNotificationsService {
	private readonly latestByServer = new SvelteMap<string, PaymentUiState>();
	private readonly byRequestEventId = new SvelteMap<string, PaymentUiState>();

	set(state: PaymentUiState): void {
		this.latestByServer.set(state.serverPubkey, state);
		this.byRequestEventId.set(state.requestEventId, state);
	}

	getLatestForServer(serverPubkey: string): PaymentUiState | undefined {
		return this.latestByServer.get(serverPubkey);
	}

	getByRequestEventId(requestEventId: string): PaymentUiState | undefined {
		return this.byRequestEventId.get(requestEventId);
	}

	clearServer(serverPubkey: string): void {
		this.latestByServer.delete(serverPubkey);
	}
}

export const paymentNotificationsService = new PaymentNotificationsService();
