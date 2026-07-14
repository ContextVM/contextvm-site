import { describe, expect, it } from 'bun:test';
import { nprofileEncode } from 'nostr-tools/nip19';
import { PaymentNotificationsService, type PaymentUiState } from './payment-notifications.svelte';

function required(
	serverPubkey: string,
	requestEventId: string,
	pmi: string,
	timestamp: number
): PaymentUiState {
	return {
		serverPubkey,
		requestEventId,
		notification: {
			jsonrpc: '2.0',
			method: 'notifications/payment_required',
			params: { amount: 100, pay_req: `lnbc-${pmi}`, pmi }
		},
		timestamp
	};
}

describe('PaymentNotificationsService', () => {
	it('groups multiple PMI alternatives for one request instead of overwriting', () => {
		const service = new PaymentNotificationsService();
		service.set(required('srv', 'req-1', 'bitcoin-lightning-bolt11', 1));
		service.set(required('srv', 'req-1', 'bitcoin-cashu', 2));

		const active = service.getActiveGroupsForServer('srv');
		expect(active).toHaveLength(1);
		expect(active[0].options).toHaveLength(2);
		expect(active[0].options.map((o) => o.params.pmi)).toEqual([
			'bitcoin-lightning-bolt11',
			'bitcoin-cashu'
		]);
	});

	it('keeps concurrent requests as separate groups', () => {
		const service = new PaymentNotificationsService();
		service.set(required('srv', 'req-1', 'bitcoin-lightning-bolt11', 1));
		service.set(required('srv', 'req-2', 'bitcoin-lightning-bolt11', 2));

		const active = service.getActiveGroupsForServer('srv');
		expect(active).toHaveLength(2);
		expect(active.map((g) => g.requestEventId)).toEqual(['req-1', 'req-2']);
	});

	it('dedups relay redeliveries by pay_req', () => {
		const service = new PaymentNotificationsService();
		service.set(required('srv', 'req-1', 'bitcoin-lightning-bolt11', 1));
		// Same request, same invoice (e.g. relay redelivery, or pay_req used as the key).
		service.set(required('srv', 'req-1', 'bitcoin-lightning-bolt11', 2));

		const active = service.getActiveGroupsForServer('srv');
		expect(active).toHaveLength(1);
		expect(active[0].options).toHaveLength(1);
	});

	it('clears only the requested server', () => {
		const service = new PaymentNotificationsService();
		service.set(required('srv-a', 'req-1', 'bitcoin-lightning-bolt11', 1));
		service.set(required('srv-b', 'req-2', 'bitcoin-lightning-bolt11', 2));

		service.clearServer('srv-a');
		expect(service.getActiveGroupsForServer('srv-a')).toHaveLength(0);
		expect(service.getActiveGroupsForServer('srv-b')).toHaveLength(1);
	});

	it('matches groups across identifier forms (hex ↔ nprofile)', () => {
		// Regression: the handler stores under whatever form `getClient` captured, while
		// callers query with the clients-map key or the reactive connectionIdentifier.
		// Both must resolve to the same canonical hex pubkey.
		const hex = '65a334b02f5913cf2c1f73376044df11254166676e7d499d0c34e2ca10cf3e16';
		const nprofile = nprofileEncode({ pubkey: hex, relays: [] });
		const service = new PaymentNotificationsService();

		service.set(required(nprofile, 'req-1', 'bitcoin-lightning-bolt11', 1));
		expect(service.getActiveGroupsForServer(hex)).toHaveLength(1);

		service.clearServer(hex);
		service.set(required(hex, 'req-2', 'bitcoin-lightning-bolt11', 2));
		expect(service.getActiveGroupsForServer(nprofile)).toHaveLength(1);
	});
});
