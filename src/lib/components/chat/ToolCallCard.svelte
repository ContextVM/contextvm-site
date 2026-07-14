<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import PaymentErrorCard from '$lib/components/chat/PaymentErrorCard.svelte';
	import PaymentStatusPanel from '$lib/components/PaymentStatusPanel.svelte';
	import { paymentNotificationsService } from '$lib/services/payments/payment-notifications.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import type { ToolCallData } from '$lib/types/chat-types';
	import { cn, copyToClipboard } from '$lib/utils.js';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import Clock3Icon from '@lucide/svelte/icons/clock-3';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import XCircleIcon from '@lucide/svelte/icons/x-circle';

	let {
		toolCall,
		onApprove,
		onReject
	}: {
		toolCall: ToolCallData;
		onApprove?: () => void;
		onReject?: () => void;
	} = $props();

	let argsOpen = $state(false);
	let resultOpen = $state(false);
	let formattedArguments = $state('{}');
	let lastArguments = $state('');

	// Transparent-mode payments for this tool's server. Explicit gating uses paymentError below.
	// CEP-8: a server MAY emit several `payment_required` per request (one per PMI) and
	// several requests may be in flight at once. We render every active group so no
	// invoice is lost; per-request correlation stays with the server/SDK.
	const transparentGroups = $derived(
		toolCall.serverPubkey
			? paymentNotificationsService.getActiveGroupsForServer(toolCall.serverPubkey)
			: []
	);
	const title = $derived(toolCall.name.replace(/_/g, ' '));
	const statusLabel = $derived.by(() => {
		switch (toolCall.status) {
			case 'running':
				return 'Running';
			case 'approved':
				return 'Approved';
			case 'completed':
				return 'Completed';
			case 'rejected':
				return 'Rejected';
			case 'error':
				return 'Error';
			case 'payment_required':
				return 'Payment required';
			default:
				return 'Approval needed';
		}
	});
	$effect(() => {
		const rawArguments = toolCall.arguments;
		if (rawArguments === lastArguments) {
			return;
		}

		lastArguments = rawArguments;
		if (!rawArguments.trim()) {
			formattedArguments = '{}';
			return;
		}

		try {
			formattedArguments = JSON.stringify(JSON.parse(rawArguments), null, 2);
		} catch (_error) {
			formattedArguments = rawArguments;
		}
	});
	const resultPreview = $derived(toolCall.result ?? '');
	const canApprove = $derived(toolCall.status === 'pending' && Boolean(onApprove && onReject));
</script>

<div
	class="not-prose rounded-lg border border-border/70 bg-background/80 text-card-foreground shadow-sm"
>
	<div class="flex items-start justify-between gap-3 border-b border-border/60 px-3 py-2.5">
		<div class="min-w-0 space-y-1">
			<div class="flex min-w-0 flex-wrap items-center gap-2">
				<span class="truncate font-mono text-[12px] font-semibold text-foreground">{title}</span>
				{#if toolCall.serverName}
					<span
						class="max-w-36 truncate rounded border border-border bg-muted/70 px-1.5 py-0.5 text-[10px] text-muted-foreground"
					>
						{toolCall.serverName}
					</span>
				{/if}
			</div>
			<div
				class={cn(
					'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
					toolCall.status === 'completed'
						? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
						: toolCall.status === 'payment_required'
							? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
							: toolCall.status === 'error'
								? 'bg-destructive/10 text-destructive'
								: toolCall.status === 'rejected'
									? 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
									: toolCall.status === 'running'
										? 'bg-primary/10 text-primary'
										: 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
				)}
				role="status"
				aria-live="polite"
				aria-atomic="true"
			>
				{#if toolCall.status === 'completed'}
					<CheckCircleIcon class="h-3 w-3" />
				{:else if toolCall.status === 'payment_required'}
					<WalletIcon class="h-3 w-3" />
				{:else if toolCall.status === 'error'}
					<XCircleIcon class="h-3 w-3" />
				{:else if toolCall.status === 'rejected'}
					<XCircleIcon class="h-3 w-3" />
				{:else if toolCall.status === 'running'}
					<LoaderCircleIcon class="h-3 w-3 animate-spin" />
				{:else if toolCall.status === 'approved'}
					<ShieldCheckIcon class="h-3 w-3" />
				{:else}
					<Clock3Icon class="h-3 w-3" />
				{/if}
				{statusLabel}
			</div>
		</div>

		{#if canApprove}
			<div class="flex shrink-0 items-center gap-1.5">
				<Button size="sm" class="h-7 px-2 text-xs" onclick={onApprove}>Approve</Button>
				<Button variant="outline" size="sm" class="h-7 px-2 text-xs" onclick={onReject}>
					Reject
				</Button>
			</div>
		{/if}
	</div>

	<div class="space-y-1.5 px-3 py-2.5">
		<Collapsible.Root bind:open={argsOpen}>
			<Collapsible.Trigger
				class="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
			>
				<span>Arguments</span>
				<ChevronDownIcon class={cn('h-3.5 w-3.5 transition-transform', argsOpen && 'rotate-180')} />
			</Collapsible.Trigger>
			<Collapsible.Content class="overflow-hidden">
				<div class="relative mt-1">
					<pre
						class="max-h-48 overflow-auto rounded-md border border-border/60 bg-muted/60 p-2 pr-8 text-[11px] leading-5 whitespace-pre-wrap text-muted-foreground">{formattedArguments}</pre>
					<button
						type="button"
						class="absolute top-1.5 right-1.5 rounded p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
						aria-label="Copy tool arguments"
						onclick={() => copyToClipboard(formattedArguments)}
					>
						<CopyIcon class="h-3.5 w-3.5" />
					</button>
				</div>
			</Collapsible.Content>
		</Collapsible.Root>

		{#if resultPreview}
			<Collapsible.Root bind:open={resultOpen}>
				<Collapsible.Trigger
					class="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
				>
					<span>Result</span>
					<ChevronDownIcon
						class={cn('h-3.5 w-3.5 transition-transform', resultOpen && 'rotate-180')}
					/>
				</Collapsible.Trigger>
				<Collapsible.Content class="overflow-hidden">
					<div class="relative mt-1">
						<pre
							class="max-h-56 overflow-auto rounded-md border border-border/60 bg-muted/60 p-2 pr-8 text-[11px] leading-5 whitespace-pre-wrap text-muted-foreground">{resultPreview}</pre>
						<button
							type="button"
							class="absolute top-1.5 right-1.5 rounded p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
							aria-label="Copy tool result"
							onclick={() => copyToClipboard(resultPreview)}
						>
							<CopyIcon class="h-3.5 w-3.5" />
						</button>
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}

		{#if toolCall.paymentError}
			<PaymentErrorCard error={toolCall.paymentError} />
		{:else if transparentGroups.length > 0 && (toolCall.status === 'running' || toolCall.status === 'pending' || toolCall.status === 'approved')}
			<div class="space-y-2">
				{#each transparentGroups as group (group.requestEventId)}
					<PaymentStatusPanel payment={group} />
				{/each}
			</div>
		{/if}
	</div>
</div>
