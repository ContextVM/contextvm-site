export const PAYMENT_REQUIRED_ERROR_CODE = -32042;
export const PAYMENT_PENDING_ERROR_CODE = -32043;

export interface PaymentRequiredError {
	code: typeof PAYMENT_REQUIRED_ERROR_CODE;
	message: string;
	data: Record<string, unknown>;
}

export interface PaymentPendingError {
	code: typeof PAYMENT_PENDING_ERROR_CODE;
	message: string;
	data: Record<string, unknown>;
}

export type ExplicitGatingError = PaymentRequiredError | PaymentPendingError;

type ErrorCandidate = {
	code?: unknown;
	message?: unknown;
	data?: unknown;
};

function isErrorCandidate(error: unknown): error is ErrorCandidate {
	return typeof error === 'object' && error !== null;
}

function isExplicitGatingCode(
	code: unknown
): code is typeof PAYMENT_REQUIRED_ERROR_CODE | typeof PAYMENT_PENDING_ERROR_CODE {
	return code === PAYMENT_REQUIRED_ERROR_CODE || code === PAYMENT_PENDING_ERROR_CODE;
}

export function extractExplicitGatingError(error: unknown): ExplicitGatingError | null {
	if (!isErrorCandidate(error) || !isExplicitGatingCode(error.code)) {
		return null;
	}

	return {
		code: error.code,
		message: typeof error.message === 'string' ? error.message : 'Payment required',
		data:
			typeof error.data === 'object' && error.data !== null
				? (error.data as Record<string, unknown>)
				: {}
	};
}

export function serializeExplicitGatingError(error: ExplicitGatingError): string {
	return JSON.stringify({
		code: error.code,
		message: error.message,
		data: error.data
	});
}

export function isPaymentRequiredError(error: ExplicitGatingError): error is PaymentRequiredError {
	return error.code === PAYMENT_REQUIRED_ERROR_CODE;
}

export function isPaymentPendingError(error: ExplicitGatingError): error is PaymentPendingError {
	return error.code === PAYMENT_PENDING_ERROR_CODE;
}
