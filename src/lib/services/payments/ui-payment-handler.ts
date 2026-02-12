import type {
	PaymentHandler,
	PaymentHandlerRequest,
	PaymentRequiredNotification
} from '@contextvm/sdk';
import { paymentNotificationsService } from './payment-notifications.svelte';

/**
 * UI-only payment handler.
 *
 * - Lets the SDK advertise a PMI via `pmi` tags (CEP-8 discovery)
 * - Captures `payment_required` (via `handle`) so the UI can render `pay_req`
 * - Does NOT attempt to pay.
 */
export class UiOnlyPaymentHandler implements PaymentHandler {
	public readonly pmi: string;
	private readonly serverPubkey: string;

	constructor(options: { pmi: string; serverPubkey: string }) {
		this.pmi = options.pmi;
		this.serverPubkey = options.serverPubkey;
	}

	canHandle(_req: PaymentHandlerRequest): boolean {
		// We always want to surface the notification in the UI.
		return true;
	}

	async handle(req: PaymentHandlerRequest): Promise<void> {
		// Record a UI state entry. Correlation is available via requestEventId.
		const notification: PaymentRequiredNotification = {
			jsonrpc: '2.0',
			method: 'notifications/payment_required',
			params: {
				amount: req.amount,
				pay_req: req.pay_req,
				pmi: this.pmi,
				description: req.description
			}
		};

		paymentNotificationsService.set({
			serverPubkey: this.serverPubkey,
			requestEventId: req.requestEventId,
			status: 'payment_required',
			notification: { type: 'payment_required', ...notification },
			timestamp: Date.now()
		});
	}
}
