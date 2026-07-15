import { describe, expect, it } from 'bun:test';
import {
	PAYMENT_PENDING_ERROR_CODE,
	PAYMENT_REQUIRED_ERROR_CODE,
	extractExplicitGatingError,
	isPaymentPendingError,
	isPaymentRequiredError,
	serializeExplicitGatingError
} from './payment-errors';

describe('explicit gating payment errors', () => {
	it('extracts and serializes payment-required errors without changing data', () => {
		const data = {
			instructions: 'Pay before retrying',
			payment_options: [{ pmi: 'bitcoin-lightning-bolt11', amount: 21, pay_req: 'lnbc...' }]
		};
		const error = Object.assign(new Error('Payment required'), {
			code: PAYMENT_REQUIRED_ERROR_CODE,
			data
		});

		const extracted = extractExplicitGatingError(error);

		expect(extracted).toEqual({
			code: PAYMENT_REQUIRED_ERROR_CODE,
			message: 'Payment required',
			data
		});
		expect(extracted?.data).toBe(data);
		expect(extracted && isPaymentRequiredError(extracted)).toBe(true);
		expect(extracted && serializeExplicitGatingError(extracted)).toBe(
			JSON.stringify({ code: PAYMENT_REQUIRED_ERROR_CODE, message: 'Payment required', data })
		);
	});

	it('extracts payment-pending errors', () => {
		const extracted = extractExplicitGatingError({
			code: PAYMENT_PENDING_ERROR_CODE,
			message: 'Payment pending',
			data: { retry_after: 2 }
		});

		expect(extracted && isPaymentPendingError(extracted)).toBe(true);
		expect(extracted?.data).toEqual({ retry_after: 2 });
	});

	it('ignores unrelated errors', () => {
		expect(extractExplicitGatingError(new Error('No payment'))).toBeNull();
		expect(extractExplicitGatingError({ code: -32000, message: 'Generic error' })).toBeNull();
	});
});
