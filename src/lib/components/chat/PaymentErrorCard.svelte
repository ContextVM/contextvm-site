<script lang="ts">
	import PaymentOptionsList from '$lib/components/chat/PaymentOptionsList.svelte';
	import {
		PAYMENT_PENDING_ERROR_CODE,
		PAYMENT_REQUIRED_ERROR_CODE,
		isPaymentRequiredError,
		type ExplicitGatingError
	} from '$lib/services/payments/payment-errors';
	import { toOptionViews } from '$lib/services/payments/payment-options';

	let { error, onRetry }: { error: ExplicitGatingError; onRetry?: () => void } = $props();

	const paymentOptions = $derived(
		isPaymentRequiredError(error) ? toOptionViews(error.data.payment_options) : []
	);
	const instructions = $derived(
		typeof error.data.instructions === 'string' ? error.data.instructions : null
	);
	const retryAfter = $derived(
		typeof error.data.retry_after === 'number' ? error.data.retry_after : null
	);
	const title = $derived(
		error.code === PAYMENT_REQUIRED_ERROR_CODE ? 'Payment required' : 'Payment pending'
	);
</script>

<div
	class="rounded-lg border border-amber-500/30 bg-amber-50/70 p-3 text-amber-950 shadow-sm dark:bg-amber-950/20 dark:text-amber-50"
>
	<div class="mb-2 flex flex-wrap items-center gap-2">
		<span
			class="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-200"
		>
			{title}
		</span>
		<span class="font-mono text-[10px] text-amber-800/70 dark:text-amber-200/70">
			{error.code === PAYMENT_REQUIRED_ERROR_CODE
				? PAYMENT_REQUIRED_ERROR_CODE
				: PAYMENT_PENDING_ERROR_CODE}
		</span>
		{#if retryAfter !== null}
			<span class="font-mono text-[10px] text-amber-800/70 dark:text-amber-200/70">
				Retry after {retryAfter}s
			</span>
		{/if}
	</div>

	{#if instructions}
		<p class="mb-2 text-sm leading-5">{instructions}</p>
	{:else if error.message}
		<p class="mb-2 text-sm leading-5">{error.message}</p>
	{/if}

	{#if paymentOptions.length > 0}
		<PaymentOptionsList options={paymentOptions} {onRetry} />
	{/if}
</div>
