<script lang="ts">
	import QrCode from '$lib/components/QrCode.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import {
		PAYMENT_PENDING_ERROR_CODE,
		PAYMENT_REQUIRED_ERROR_CODE,
		isPaymentRequiredError,
		type ExplicitGatingError
	} from '$lib/services/payments/payment-errors';
	import { copyToClipboard } from '$lib/utils';
	import CopyIcon from '@lucide/svelte/icons/copy';

	let { error }: { error: ExplicitGatingError } = $props();

	const paymentOptions = $derived.by(() => {
		if (!isPaymentRequiredError(error) || !Array.isArray(error.data.payment_options)) {
			return [];
		}

		return error.data.payment_options.filter(
			(option): option is Record<string, unknown> => typeof option === 'object' && option !== null
		);
	});
	const firstOption = $derived(paymentOptions[0] ?? null);
	const payReq = $derived(typeof firstOption?.pay_req === 'string' ? firstOption.pay_req : null);
	const amount = $derived(firstOption?.amount);
	const pmi = $derived(typeof firstOption?.pmi === 'string' ? firstOption.pmi : null);
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
		{#if retryAfter}
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

	{#if firstOption}
		<div class="rounded-md bg-background/70 px-3 py-2 text-foreground">
			<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
				{#if amount !== undefined}
					<span class="text-xs text-muted-foreground">Amount</span>
					<span class="font-mono text-xs">{amount}</span>
				{/if}
				{#if pmi}
					<span class="text-xs text-muted-foreground">PMI</span>
					<span class="min-w-0 font-mono text-xs break-all">{pmi}</span>
				{/if}
			</div>

			{#if payReq}
				<Tabs.Root value="invoice" class="mt-3 w-full">
					<Tabs.List class="grid w-full grid-cols-2">
						<Tabs.Trigger value="invoice">Payment Request</Tabs.Trigger>
						<Tabs.Trigger value="qr">QR</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="invoice" class="mt-2">
						<div class="relative rounded-md bg-muted p-2">
							<pre class="max-h-44 overflow-auto pr-8 text-xs whitespace-pre-wrap">{payReq}</pre>
							<button
								type="button"
								onclick={() => copyToClipboard(payReq)}
								class="absolute top-1.5 right-1.5 rounded p-1 text-muted-foreground transition-colors hover:bg-background hover:text-primary"
								aria-label="Copy payment request"
							>
								<CopyIcon class="h-3.5 w-3.5" />
							</button>
						</div>
					</Tabs.Content>

					<Tabs.Content value="qr" class="mt-2">
						<div class="flex justify-center">
							<QrCode data={payReq} size={180} />
						</div>
					</Tabs.Content>
				</Tabs.Root>
			{/if}
		</div>
	{/if}
</div>
