import {
	ApplesauceRelayPool,
	NwcClient,
	parseNwcConnectionString,
	type NwcConnection
} from '@contextvm/sdk';

const CONNECTION_KEY = 'contextvm.wallet.connection';
const ALLOW_KEY = 'contextvm.wallet.allowInChat';

const isBrowser = typeof window !== 'undefined';

/**
 * Site-wide Lightning wallet backed by a NIP-47 (NWC) connection string.
 *
 * The connection string + allow-in-chat flag persist to localStorage. The NWC
 * client + relay handler are rebuilt when the string changes. Components react
 * to `isConfigured`, `balance`, and `allowInChat`; the raw client is exposed
 * only for agent tool registration.
 */
class WalletStore {
	/** Committed NWC connection string (empty = not configured). */
	connectionString = $state('');
	/** Parsed connection, or null when unconfigured/invalid. */
	connection = $state<NwcConnection | null>(null);
	/** Allow agents to use the wallet in chat. */
	allowInChat = $state(false);

	balance = $state<number | null>(null);
	balanceError = $state<string | null>(null);

	readonly isConfigured = $derived(this.connection !== null);

	private client: NwcClient | null = null;
	private relayHandler: ApplesauceRelayPool | null = null;

	constructor() {
		if (!isBrowser) return;
		const stored = localStorage.getItem(CONNECTION_KEY);
		if (stored) {
			this.connectionString = stored;
			this.applyConnection();
		}
		this.allowInChat = localStorage.getItem(ALLOW_KEY) === '1';
	}

	/** NWC client for agent tool registration; null when unconfigured. */
	getClient(): NwcClient | null {
		return this.client;
	}

	private applyConnection(): void {
		// Tear down the previous relay handler before rebinding.
		void this.relayHandler?.disconnect().catch(() => {});
		this.relayHandler = null;
		this.client = null;
		this.balance = null;

		const value = this.connectionString.trim();
		if (!value) {
			this.connection = null;
			return;
		}

		try {
			const conn = parseNwcConnectionString(value);
			this.connection = conn;
			this.relayHandler = new ApplesauceRelayPool([...conn.relays]);
			this.client = new NwcClient({ relayHandler: this.relayHandler, connection: conn });
		} catch (error) {
			this.connection = null;
			this.balanceError =
				error instanceof Error ? error.message : 'Invalid NWC connection string';
		}
	}

	/** Persist a new connection string and rebuild the client. */
	save(value: string): void {
		this.connectionString = value;
		this.balanceError = null;
		if (isBrowser) {
			const trimmed = value.trim();
			if (trimmed) localStorage.setItem(CONNECTION_KEY, trimmed);
			else localStorage.removeItem(CONNECTION_KEY);
		}
		this.applyConnection();
		if (this.client) void this.refreshBalance();
	}

	setAllowInChat(value: boolean): void {
		this.allowInChat = value;
		if (isBrowser) localStorage.setItem(ALLOW_KEY, value ? '1' : '0');
	}

	private async nwcRequest<M extends string>(
		method: M,
		params: Record<string, unknown>
	): Promise<unknown> {
		const client = this.client;
		if (!client) throw new Error('Wallet not configured');
		const res = await client.request({
			method,
			resultType: method,
			request: { method, params }
		});
		if (res.error) throw new Error(`${res.error.code}: ${res.error.message}`);
		return res.result;
	}

	async refreshBalance(): Promise<void> {
		if (!this.client) {
			this.balance = null;
			return;
		}

		this.balanceError = null;
		try {
			const result = (await this.nwcRequest('get_balance', {})) as { balance?: number } | null;
			this.balance = typeof result?.balance === 'number' ? result.balance : null;
		} catch (error) {
			this.balanceError = error instanceof Error ? error.message : 'Failed to load balance';
			this.balance = null;
		}
	}

	async payInvoice(invoice: string): Promise<{ preimage?: string; fees_paid?: number }> {
		const result = (await this.nwcRequest('pay_invoice', { invoice })) as
			| { preimage?: string; fees_paid?: number }
			| null;
		return result ?? {};
	}

	async makeInvoice(amountMsats: number, description?: string): Promise<string> {
		const params: Record<string, unknown> = { amount: amountMsats };
		if (description) params.description = description;
		const result = (await this.nwcRequest('make_invoice', params)) as { invoice?: string } | null;
		if (!result?.invoice) throw new Error('Wallet did not return an invoice');
		return result.invoice;
	}
}

export const walletStore = new WalletStore();
