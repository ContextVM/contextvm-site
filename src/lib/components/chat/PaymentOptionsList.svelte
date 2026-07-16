<script lang="ts">
	import QrCode from '$lib/components/QrCode.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { copyToClipboard } from '$lib/utils.js';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import RotateCwIcon from '@lucide/svelte/icons/rotate-cw';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import { PMI_BITCOIN_LIGHTNING_BOLT11 } from '@contextvm/sdk';
	import { walletStore } from '$lib/services/wallet/wallet-store.svelte';
	import { toast } from 'svelte-sonner';
	import type { PaymentOptionView } from '$lib/services/payments/payment-options';

	let {
		options,
		onRetry
	}: { options: PaymentOptionView[]; onRetry?: () => void } = $props();

	let paying = $state(false);
	let paidIndex = $state<number | null>(null);
	let payError = $state<string | null>(null);

	function canPay(option: PaymentOptionView): boolean {
		return (
			walletStore.isConfigured &&
			!paying &&
			paidIndex === null &&
			option.pmi === PMI_BITCOIN_LIGHTNING_BOLT11 &&
			Boolean(option.pay_req)
		);
	}

	async function handlePay(index: number, invoice: string) {
		paying = true;
		payError = null;
		try {
			await walletStore.payInvoice(invoice);
			paidIndex = index;
			toast.success('Invoice paid');
			void walletStore.refreshBalance();
		} catch (error) {
			payError = error instanceof Error ? error.message : 'Payment failed';
		} finally {
			paying = false;
		}
	}
</script>

<div class="rounded-md bg-background/70 px-3 py-2 text-foreground">
	{#each options as option, i (i)}
		<div class={i > 0 ? 'mt-3 border-t border-border/50 pt-3' : ''}>
			<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
				{#if option.amount !== undefined}
					<span class="text-xs text-muted-foreground">Amount</span>
					<span class="font-mono text-xs">{option.amount}</span>
				{/if}
				{#if option.pmi}
					<span class="text-xs text-muted-foreground">PMI</span>
					<span class="min-w-0 font-mono text-xs break-all">{option.pmi}</span>
				{/if}
				{#if option.ttl !== undefined}
					<span class="font-mono text-[10px] text-muted-foreground">TTL {option.ttl}s</span>
				{/if}
			</div>

			{#if option.description}
				<p class="mt-1 text-xs">{option.description}</p>
			{/if}

			{#if option.pmi === PMI_BITCOIN_LIGHTNING_BOLT11 && walletStore.isConfigured}
				<div class="mt-2 flex flex-wrap items-center gap-2">
					{#if paidIndex === i}
						<span class="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
							<CheckCircleIcon class="h-3.5 w-3.5" />
							Paid
						</span>
						{#if onRetry}
							<Button size="sm" class="h-7 px-2 text-xs" onclick={onRetry}>
								<RotateCwIcon class="h-3 w-3" />
								Retry call
							</Button>
						{/if}
					{:else}
						<Button
							size="sm"
							class="h-7 px-2 text-xs"
							disabled={!canPay(option)}
							onclick={() => option.pay_req && handlePay(i, option.pay_req)}
						>
							{#if paying}
								<LoaderCircleIcon class="h-3 w-3 animate-spin" />
							{:else}
								<ZapIcon class="h-3 w-3" />
							{/if}
							Pay
						</Button>
						{#if payError}
							<span class="text-xs text-destructive">{payError}</span>
						{/if}
					{/if}
				</div>
			{/if}

			{#if option.pay_req}
				<Tabs.Root value="invoice" class="mt-3 w-full">
					<Tabs.List class="grid w-full grid-cols-2">
						<Tabs.Trigger value="invoice">Payment Request</Tabs.Trigger>
						<Tabs.Trigger value="qr">QR</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="invoice" class="mt-2">
						<div class="relative rounded-md bg-muted p-2">
							<pre
								class="max-h-44 overflow-auto pr-8 text-xs whitespace-pre-wrap break-all">{option.pay_req}</pre
							>
							<button
								type="button"
								onclick={() => copyToClipboard(option.pay_req!)}
								class="absolute top-1.5 right-1.5 rounded p-1 text-muted-foreground transition-colors hover:bg-background hover:text-primary"
								aria-label="Copy payment request"
							>
								<CopyIcon class="h-3.5 w-3.5" />
							</button>
						</div>
					</Tabs.Content>

					<Tabs.Content value="qr" class="mt-2">
						<div class="flex justify-center">
							<QrCode data={option.pay_req} size={180} />
						</div>
					</Tabs.Content>
				</Tabs.Root>
			{/if}
		</div>
	{/each}
</div>
