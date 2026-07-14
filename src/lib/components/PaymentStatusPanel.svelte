<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import PaymentOptionsList from '$lib/components/chat/PaymentOptionsList.svelte';
	import { toOptionViews } from '$lib/services/payments/payment-options';
	import type { PaymentRequestGroup } from '$lib/services/payments/payment-notifications.svelte';

	let { payment, open = true }: { payment: PaymentRequestGroup; open?: boolean } = $props();

	const optionViews = $derived(toOptionViews(payment.options.map((option) => option.params)));
</script>

<Collapsible.Root bind:open>
	<Card.Root class="border-primary/20">
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title>Payment required</Card.Title>
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
				<p class="text-sm text-muted-foreground">
					{optionViews.length > 1
						? 'Multiple payment methods available — pay one to continue.'
						: 'Payment is required to continue.'}
				</p>

				{#if optionViews.length > 0}
					<PaymentOptionsList options={optionViews} />
				{/if}
			</Card.Content>
		</Collapsible.Content>
	</Card.Root>
</Collapsible.Root>
