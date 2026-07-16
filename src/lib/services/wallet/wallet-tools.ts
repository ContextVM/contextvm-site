import type { NwcClient } from '@contextvm/sdk';
import type { ToolRegistry } from '$lib/services/mcp-openai-bridge';

/** Runs a NIP-47 method, throwing on error and returning the result as JSON. */
async function nwcJson(
	nwc: NwcClient,
	method: string,
	params: Record<string, unknown>
): Promise<string> {
	const res = await nwc.request({ method, resultType: method, request: { method, params } });
	if (res.error) throw new Error(`${res.error.code}: ${res.error.message}`);
	return JSON.stringify(res.result ?? {});
}

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

/**
 * Registers Lightning wallet (NWC) tools as built-in local tools the agent can call,
 * mirroring how MCP server tools are exposed. Only registered when the user enables
 * "Allow wallet" — the switch is the sole gate.
 */
export function registerWalletTools(registry: ToolRegistry, nwc: NwcClient): void {
	registry.registerLocal(
		'wallet_get_balance',
		"Get the current balance of the user's connected Lightning (NWC) wallet in millisatoshis.",
		{ type: 'object', properties: {}, additionalProperties: false },
		() => nwcJson(nwc, 'get_balance', {})
	);

	registry.registerLocal(
		'wallet_pay_invoice',
		"Pay a Lightning bolt11 invoice from the user's connected wallet. Use this to settle a payment request (lnbc...) returned by another tool so it can proceed.",
		{
			type: 'object',
			properties: { invoice: { type: 'string', description: 'A Lightning bolt11 invoice (starts with lnbc).' } },
			required: ['invoice'],
			additionalProperties: false
		},
		(args) => {
			const invoice = str(args.invoice).trim();
			if (!invoice) throw new Error('invoice is required');
			return nwcJson(nwc, 'pay_invoice', { invoice });
		}
	);

	registry.registerLocal(
		'wallet_make_invoice',
		"Create a Lightning invoice to receive funds into the user's connected wallet. `amount` is in millisatoshis (1 sat = 1000 msat).",
		{
			type: 'object',
			properties: {
				amount: { type: 'number', description: 'Amount in millisatoshis.' },
				description: { type: 'string', description: 'Optional invoice memo.' }
			},
			required: ['amount'],
			additionalProperties: false
		},
		(args) => {
			const amount = typeof args.amount === 'number' ? args.amount : Number.NaN;
			if (!Number.isFinite(amount) || amount <= 0) {
				throw new Error('amount must be a positive number of millisatoshis');
			}
			const params: Record<string, unknown> = { amount };
			const description = str(args.description);
			if (description) params.description = description;
			return nwcJson(nwc, 'make_invoice', params);
		}
	);

	registry.registerLocal(
		'wallet_lookup_invoice',
		"Look up the status of a Lightning invoice in the user's connected wallet by invoice string or payment hash.",
		{
			type: 'object',
			properties: {
				invoice: { type: 'string', description: 'A Lightning bolt11 invoice.' },
				payment_hash: { type: 'string', description: 'The payment hash of the invoice.' }
			},
			additionalProperties: false
		},
		(args) => {
			const params: Record<string, unknown> = {};
			const invoice = str(args.invoice);
			const paymentHash = str(args.payment_hash);
			if (invoice) params.invoice = invoice;
			if (paymentHash) params.payment_hash = paymentHash;
			return nwcJson(nwc, 'lookup_invoice', params);
		}
	);
}
