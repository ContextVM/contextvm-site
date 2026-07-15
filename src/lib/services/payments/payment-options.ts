/**
 * Normalized, UI-facing shape for a single payment option.
 *
 * CEP-8 uses the same fields in two places: a transparent `payment_required`
 * notification `params`, and an explicit-gating `payment_options[]` entry. This
 * view lets one component render both.
 */
export interface PaymentOptionView {
	amount?: number;
	pmi?: string;
	pay_req?: string;
	description?: string;
	ttl?: number;
}

function asView(raw: unknown): PaymentOptionView | null {
	if (typeof raw !== 'object' || raw === null) return null;
	const o = raw as Record<string, unknown>;
	const view: PaymentOptionView = {};
	if (typeof o.amount === 'number') view.amount = o.amount;
	if (typeof o.pmi === 'string') view.pmi = o.pmi;
	if (typeof o.pay_req === 'string') view.pay_req = o.pay_req;
	if (typeof o.description === 'string') view.description = o.description;
	if (typeof o.ttl === 'number') view.ttl = o.ttl;
	return view.pay_req ? view : null;
}

/**
 * Normalize raw `payment_options` (e.g. explicit-gating `error.data.payment_options`,
 * or transparent notification `params`) into renderable views. Entries without a
 * `pay_req` are dropped — there's nothing to render or pay.
 */
export function toOptionViews(options: unknown): PaymentOptionView[] {
	if (!Array.isArray(options)) return [];
	return options.map(asView).filter((view): view is PaymentOptionView => view !== null);
}
