<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import QrCode from '$lib/components/QrCode.svelte';
	import { walletStore } from '$lib/services/wallet/wallet-store.svelte';
	import { cn, copyToClipboard } from '$lib/utils.js';
	import { toast } from 'svelte-sonner';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import ArrowDownToLineIcon from '@lucide/svelte/icons/arrow-down-to-line';
	import ArrowUpFromLineIcon from '@lucide/svelte/icons/arrow-up-from-line';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import UnplugIcon from '@lucide/svelte/icons/unplug';

	let open = $state(false);
	let draft = $state('');
	let connecting = $state(false);
	let mode = $state<'receive' | 'pay' | null>(null);

	let recvAmount = $state('');
	let recvDesc = $state('');
	let recvBusy = $state(false);
	let recvInvoice = $state('');
	let recvError = $state<string | null>(null);

	let payInput = $state('');
	let payBusy = $state(false);
	let payResult = $state<string | null>(null);
	let payError = $state<string | null>(null);

	$effect(() => {
		if (!open) return;
		if (walletStore.isConfigured) {
			void walletStore.refreshBalance();
		} else {
			draft = '';
		}
	});

	const balanceSats = $derived(
		walletStore.balance !== null ? Math.floor(walletStore.balance / 1000) : null
	);
	const pubkeyPreview = $derived(walletStore.connection?.walletPubkey ?? '');

	async function handleConnect() {
		connecting = true;
		try {
			walletStore.save(draft);
			if (walletStore.isConfigured) {
				toast.success('Wallet connected');
				draft = '';
			} else {
				toast.error(walletStore.balanceError ?? 'Invalid NWC connection string');
			}
		} finally {
			connecting = false;
		}
	}

	function handleDisconnect() {
		walletStore.save('');
		mode = null;
		recvInvoice = '';
		recvAmount = '';
		recvDesc = '';
		payInput = '';
		payResult = null;
		toast.success('Wallet disconnected');
	}

	async function handleReceive() {
		recvBusy = true;
		recvError = null;
		recvInvoice = '';
		try {
			const sats = Number.parseInt(recvAmount, 10);
			if (!Number.isFinite(sats) || sats <= 0) {
				throw new Error('Enter a positive amount in sats');
			}
			recvInvoice = await walletStore.makeInvoice(sats * 1000, recvDesc || undefined);
		} catch (error) {
			recvError = error instanceof Error ? error.message : 'Failed to create invoice';
		} finally {
			recvBusy = false;
		}
	}

	async function handlePay() {
		payBusy = true;
		payError = null;
		payResult = null;
		try {
			const invoice = payInput.trim();
			if (!invoice) throw new Error('Paste an invoice to pay');
			const res = await walletStore.payInvoice(invoice);
			payResult = res.preimage ? `Paid · preimage ${res.preimage.slice(0, 16)}…` : 'Payment sent';
			toast.success('Payment sent');
			payInput = '';
			void walletStore.refreshBalance();
		} catch (error) {
			payError = error instanceof Error ? error.message : 'Payment failed';
		} finally {
			payBusy = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={cn(
			'relative inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
			walletStore.isConfigured
				? 'text-primary hover:bg-primary/10'
				: 'text-foreground/60 hover:bg-accent hover:text-foreground'
		)}
		aria-label="Wallet"
	>
		<WalletIcon class="h-4 w-4" />
		{#if walletStore.isConfigured}
			<span class="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
		{/if}
	</Dialog.Trigger>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<WalletIcon class="h-4 w-4" />
				Lightning Wallet
			</Dialog.Title>
			<Dialog.Description>
				{walletStore.isConfigured
					? 'Connected via Nostr Wallet Connect (NWC).'
					: 'Connect your wallet with a Nostr Wallet Connect (NWC) string.'}
			</Dialog.Description>
		</Dialog.Header>

		{#if !walletStore.isConfigured}
			<div class="space-y-3 py-1">
				<div class="space-y-1.5">
					<Label for="nwc-string" class="text-xs">NWC connection string</Label>
					<Textarea
						id="nwc-string"
						bind:value={draft}
						placeholder="nostr+walletconnect://…"
						class="font-mono text-xs break-all"
						rows={3}
					/>
					<p class="text-[11px] text-muted-foreground">
						Found in your wallet (Alby, Mutiny, NWC.dev, …) as a connection secret with
						<code class="font-mono">pay_invoice</code> and <code class="font-mono">get_balance</code>
						permissions.
					</p>
				</div>
				<Button class="w-full" disabled={!draft.trim() || connecting} onclick={handleConnect}>
					{#if connecting}
						<LoaderCircleIcon class="h-4 w-4 animate-spin" />
					{/if}
					Connect
				</Button>
			</div>
		{:else}
			<div class="space-y-4 py-1">
				<!-- Balance -->
				<div class="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
					<div class="min-w-0">
						<p class="text-[11px] text-muted-foreground">Balance</p>
						{#if balanceSats !== null}
							<p class="font-mono text-lg font-semibold">{balanceSats.toLocaleString()} sats</p>
						{:else if walletStore.balanceError}
							<p class="text-xs text-destructive">{walletStore.balanceError}</p>
						{:else}
							<p class="text-xs text-muted-foreground">—</p>
						{/if}
					</div>
					<Button
						variant="ghost"
						size="sm"
						class="h-8 px-2"
						onclick={() => walletStore.refreshBalance()}
						aria-label="Refresh balance"
					>
						<RefreshCwIcon class="h-3.5 w-3.5" />
					</Button>
				</div>

				{#if pubkeyPreview}
					<p class="truncate font-mono text-[10px] text-muted-foreground">{pubkeyPreview}</p>
				{/if}

				<!-- Mode toggles -->
				<div class="grid grid-cols-2 gap-2">
					<Button
						variant={mode === 'receive' ? 'default' : 'outline'}
						size="sm"
						onclick={() => {
							mode = mode === 'receive' ? null : 'receive';
							recvInvoice = '';
						}}
					>
						<ArrowDownToLineIcon class="h-3.5 w-3.5" />
						Receive
					</Button>
					<Button
						variant={mode === 'pay' ? 'default' : 'outline'}
						size="sm"
						onclick={() => {
							mode = mode === 'pay' ? null : 'pay';
							payResult = null;
							payError = null;
						}}
					>
						<ArrowUpFromLineIcon class="h-3.5 w-3.5" />
						Pay
					</Button>
				</div>

				{#if mode === 'receive'}
					<div class="space-y-2 rounded-lg border border-border/60 p-3">
						<div class="grid grid-cols-[7rem_1fr] gap-2">
							<div class="space-y-1">
								<Label for="recv-amount" class="text-xs">Amount (sats)</Label>
								<Input id="recv-amount" type="number" min="1" bind:value={recvAmount} class="h-8 text-xs" />
							</div>
							<div class="space-y-1">
								<Label for="recv-desc" class="text-xs">Memo</Label>
								<Input id="recv-desc" bind:value={recvDesc} class="h-8 text-xs" placeholder="optional" />
							</div>
						</div>
						<Button size="sm" class="w-full" disabled={recvBusy} onclick={handleReceive}>
							{#if recvBusy}
								<LoaderCircleIcon class="h-3.5 w-3.5 animate-spin" />
							{/if}
							Generate invoice
						</Button>
						{#if recvError}
							<p class="text-xs text-destructive">{recvError}</p>
						{/if}
						{#if recvInvoice}
							<div class="space-y-2">
								<div class="flex justify-center">
									<QrCode data={recvInvoice} size={180} />
								</div>
								<div class="relative rounded-md bg-muted p-2">
									<pre class="max-h-24 overflow-auto pr-8 text-[10px] whitespace-pre-wrap break-all">{recvInvoice}</pre>
									<button
										type="button"
										onclick={() => copyToClipboard(recvInvoice)}
										class="absolute top-1 right-1 rounded p-1 text-muted-foreground hover:bg-background hover:text-primary"
										aria-label="Copy invoice"
									>
										<CopyIcon class="h-3 w-3" />
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				{#if mode === 'pay'}
					<div class="space-y-2 rounded-lg border border-border/60 p-3">
						<Label for="pay-input" class="text-xs">Bolt11 invoice</Label>
						<Textarea id="pay-input" bind:value={payInput} placeholder="lnbc…" class="font-mono text-xs break-all" rows={3} />
						<Button size="sm" class="w-full" disabled={payBusy || !payInput.trim()} onclick={handlePay}>
							{#if payBusy}
								<LoaderCircleIcon class="h-3.5 w-3.5 animate-spin" />
							{/if}
							Pay invoice
						</Button>
						{#if payResult}
							<p class="text-xs text-emerald-600 dark:text-emerald-400">{payResult}</p>
						{/if}
						{#if payError}
							<p class="text-xs text-destructive">{payError}</p>
						{/if}
					</div>
				{/if}

				<Button variant="ghost" size="sm" class="w-full text-muted-foreground" onclick={handleDisconnect}>
					<UnplugIcon class="h-3.5 w-3.5" />
					Disconnect wallet
				</Button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
