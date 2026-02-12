<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { copyToClipboard } from '$lib/utils';
	import type { PaymentUiState } from '$lib/services/payments/payment-notifications.svelte';
	import QrCode from '$lib/components/QrCode.svelte';

	let { payment, open = true }: { payment: PaymentUiState; open?: boolean } = $props();
	let rawOpen = $state(false);

	const title = $derived(() => {
		switch (payment.status) {
			case 'payment_required':
				return 'Payment required';
			case 'payment_accepted':
				return 'Payment accepted';
			case 'payment_rejected':
				return 'Payment rejected';
		}
	});
</script>

<Collapsible.Root bind:open>
	<Card.Root class="border-primary/20">
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title>{title()}</Card.Title>
				<Collapsible.Trigger
					class="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-primary"
				>
					<ChevronsUpDownIcon
						class={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
					/>
					<span>{open ? 'Hide' : 'Show'}</span>
				</Collapsible.Trigger>
			</div>
		</Card.Header>
		<Collapsible.Content
			class="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 overflow-hidden"
		>
			<Card.Content class="space-y-2">
				{#if payment.status === 'payment_required'}
					<p class="text-sm text-muted-foreground">Payment is required to continue.</p>
				{:else if payment.status === 'payment_accepted'}
					<Alert.Root>
						<Alert.Title>Payment accepted</Alert.Title>
						<Alert.Description>Waiting for the server to complete the request.</Alert.Description>
					</Alert.Root>
				{:else if payment.status === 'payment_rejected'}
					<Alert.Root variant="destructive">
						<Alert.Title>Payment rejected</Alert.Title>
						<Alert.Description>
							{payment.notification.params.message ?? 'The server rejected the payment request.'}
						</Alert.Description>
					</Alert.Root>
				{/if}

				{#if payment.status === 'payment_required'}
					<div class="rounded-md bg-muted/30 px-3 py-2">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<div class="flex flex-wrap items-center gap-3">
								<span class="text-xs text-muted-foreground">Amount</span>
								<span class="font-mono text-xs">{payment.notification.params.amount}</span>
								<span class="text-xs text-muted-foreground">PMI</span>
								<span class="font-mono text-xs break-all">{payment.notification.params.pmi}</span>
							</div>
							{#if payment.notification.params.ttl}
								<span class="font-mono text-xs text-muted-foreground">
									TTL {payment.notification.params.ttl}s
								</span>
							{/if}
						</div>

						{#if payment.notification.params.description}
							<p class="mt-2 text-sm">{payment.notification.params.description}</p>
						{/if}

						<div class="mt-3">
							<div class="flex items-center justify-between">
								<p class="text-xs font-medium text-muted-foreground">Payment request</p>
								<button
									onclick={() => copyToClipboard(payment.notification.params.pay_req as string)}
									class="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-primary"
									aria-label="Copy pay_req"
								>
									<CopyIcon class="h-4 w-4" />
									<span>Copy</span>
								</button>
							</div>

							<Tabs.Root value="invoice" class="mt-2 w-full">
								<Tabs.List class="grid w-full grid-cols-2">
									<Tabs.Trigger value="invoice">Payment Request</Tabs.Trigger>
									<Tabs.Trigger value="qr">QR</Tabs.Trigger>
								</Tabs.List>

								<Tabs.Content value="invoice" class="mt-3">
									<div class="relative rounded-md bg-muted p-3">
										<pre class="overflow-x-auto pr-8 text-xs">{payment.notification.params
												.pay_req}</pre>
									</div>
								</Tabs.Content>

								<Tabs.Content value="qr" class="mt-3">
									<div class="flex justify-center">
										<QrCode data={payment.notification.params.pay_req as string} size={220} />
									</div>
									<p class="mt-2 text-center text-xs text-muted-foreground">
										Scan with a Lightning wallet to pay.
									</p>
								</Tabs.Content>
							</Tabs.Root>
						</div>
					</div>
				{/if}

				<Collapsible.Root bind:open={rawOpen}>
					<Collapsible.Trigger
						class="flex w-full items-center justify-between rounded-md bg-muted/30 p-2 text-left text-sm transition-colors hover:bg-muted/50"
					>
						<div class="flex items-center gap-2">
							<ChevronsUpDownIcon
								class={`h-4 w-4 transition-transform duration-200 ${rawOpen ? 'rotate-180' : ''}`}
							/>
							<span class="font-medium">Show raw pay_req payload</span>
						</div>
						<button
							onclick={(e) => {
								e.stopPropagation();
								copyToClipboard(JSON.stringify(payment.notification.params, null, 2));
							}}
							class="rounded p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
							aria-label="Copy pay_req payload"
						>
							<CopyIcon class="h-4 w-4" />
						</button>
					</Collapsible.Trigger>
					<Collapsible.Content
						class="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 overflow-hidden"
					>
						<div class="relative mt-2 rounded-md bg-muted p-3">
							<pre class="overflow-x-auto pr-8 text-xs">{JSON.stringify(
									payment.notification.params,
									null,
									2
								)}</pre>
						</div>
					</Collapsible.Content>
				</Collapsible.Root>
			</Card.Content>
		</Collapsible.Content>
	</Card.Root>
</Collapsible.Root>
