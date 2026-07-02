import { activeAccount } from '$lib/services/accountManager.svelte';
import { NostrClientTransport } from '@contextvm/sdk';
import {
	PAYMENT_ACCEPTED_METHOD,
	PAYMENT_REJECTED_METHOD
} from '@contextvm/sdk/payments/constants';
import { Client } from '@contextvm/mcp-sdk/client/index.js';
import {
	type ListPromptsResult,
	type ListResourcesResult,
	type ListResourceTemplatesResult,
	type ListToolsResult,
	type CallToolResult,
	type ReadResourceResult,
	type GetPromptResult
} from '@contextvm/mcp-sdk/types.js';
import { SvelteMap } from 'svelte/reactivity';
import { paymentNotificationsService } from '$lib/services/payments/payment-notifications.svelte';
import { withClientPayments } from '@contextvm/sdk';
import type { Transport } from '@contextvm/mcp-sdk/shared/transport.js';
import type { ProgressCallback } from '@contextvm/mcp-sdk/shared/protocol.js';
import { decodeServerIdentifier } from '$lib/utils';
import type { PaymentAcceptedNotification, PaymentRejectedNotification } from '@contextvm/sdk';
import { z } from 'zod';

export type PaymentInteractionMode = 'transparent' | 'explicit_gating';
type PaymentNegotiatingTransport = NostrClientTransport & {
	getEffectivePaymentInteraction?: () => PaymentInteractionMode | undefined;
};

const PaymentAcceptedNotificationSchema = z.object({
	jsonrpc: z.literal('2.0').optional(),
	method: z.literal(PAYMENT_ACCEPTED_METHOD),
	params: z.record(z.string(), z.unknown()).optional()
});

const PaymentRejectedNotificationSchema = z.object({
	jsonrpc: z.literal('2.0').optional(),
	method: z.literal(PAYMENT_REJECTED_METHOD),
	params: z.record(z.string(), z.unknown()).optional()
});

function getRequestEventIdFromNotification(notification: {
	params?: Record<string, unknown>;
}): string | undefined {
	const meta = notification.params?.['_meta'];
	if (typeof meta !== 'object' || meta === null || !('requestEventId' in meta)) {
		return undefined;
	}

	return typeof meta.requestEventId === 'string' ? meta.requestEventId : undefined;
}

export interface McpConnectionState {
	connected: boolean;
	loading: boolean;
	error: string | null;
}

export class McpClientService {
	public clients = new SvelteMap<string, Client>();
	private clientTransports = new SvelteMap<string, NostrClientTransport>();
	private connectionStates = new SvelteMap<string, McpConnectionState>();
	private serverIdentifiers = new SvelteMap<string, string>();
	private connectionModes = new SvelteMap<string, PaymentInteractionMode>();
	private static readonly clientConfig = {
		name: 'ContextVM Web Client',
		version: '1.0.0'
	};
	private static readonly defaultConnectionState: Readonly<McpConnectionState> = {
		connected: false,
		loading: false,
		error: null
	};
	private static readonly DEFAULT_REQUEST_TIMEOUT_MS = 5 * 60 * 1000;

	private getServerKey(serverIdentifier: string): string {
		return decodeServerIdentifier(serverIdentifier)?.pubkey ?? serverIdentifier;
	}

	public setServerIdentifier(serverIdentifier: string): string {
		const serverKey = this.getServerKey(serverIdentifier);
		this.serverIdentifiers.set(serverKey, serverIdentifier);
		return serverKey;
	}

	private getPreferredServerIdentifier(serverIdentifier: string): string {
		const serverKey = this.getServerKey(serverIdentifier);
		return this.serverIdentifiers.get(serverKey) ?? serverIdentifier;
	}

	private async getConnectedClientOrThrow(serverIdentifier: string): Promise<Client> {
		const client = await this.getClient(serverIdentifier);
		if (!client) {
			throw new Error('Not connected to server');
		}

		return client;
	}

	private setConnectionState(serverIdentifier: string, state: McpConnectionState): void {
		this.connectionStates.set(this.getServerKey(serverIdentifier), state);
	}

	private registerPaymentNotificationHandlers(client: Client, serverIdentifier: string): void {
		client.setNotificationHandler(PaymentAcceptedNotificationSchema, async (notification) => {
			const requestEventId = getRequestEventIdFromNotification(notification);
			if (!requestEventId) return;

			paymentNotificationsService.set({
				serverPubkey: serverIdentifier,
				requestEventId,
				status: 'payment_accepted',
				notification: {
					type: 'payment_accepted',
					...(notification as PaymentAcceptedNotification)
				},
				timestamp: Date.now()
			});
		});

		client.setNotificationHandler(PaymentRejectedNotificationSchema, async (notification) => {
			const requestEventId = getRequestEventIdFromNotification(notification);
			if (!requestEventId) return;

			paymentNotificationsService.set({
				serverPubkey: serverIdentifier,
				requestEventId,
				status: 'payment_rejected',
				notification: {
					type: 'payment_rejected',
					...(notification as PaymentRejectedNotification)
				},
				timestamp: Date.now()
			});
		});
	}

	private clearServerState(serverIdentifier: string): void {
		const preferredIdentifier = this.getPreferredServerIdentifier(serverIdentifier);
		paymentNotificationsService.clearServer(preferredIdentifier);
		paymentNotificationsService.clearServer(this.getServerKey(serverIdentifier));
	}

	private createTransport(
		serverIdentifier: string,
		paymentInteraction?: PaymentInteractionMode
	): Transport {
		// Check if user is logged in
		const currentAccount = activeAccount.getValue();
		if (!currentAccount) {
			throw new Error('Please log in to connect to servers');
		}

		const signer = currentAccount.signer;
		if (!signer) {
			throw new Error('Failed to get signer from account');
		}

		const serverKey = this.setServerIdentifier(serverIdentifier);
		const preferredIdentifier = this.getPreferredServerIdentifier(serverIdentifier);

		const baseTransport = new NostrClientTransport({
			signer,
			serverPubkey: preferredIdentifier
		});
		this.clientTransports.set(serverKey, baseTransport);

		return withClientPayments(baseTransport, {
			...(paymentInteraction ? { paymentInteraction } : {})
		} as Parameters<typeof withClientPayments>[1]);
	}

	/**
	 * Accessor for the last known server initialize event for a connected server.
	 *
	 * NOTE: `client.transport` may be wrapped (payments middleware), so callers should not
	 * depend on `client.transport.getServerInitializeEvent()`.
	 */
	public getServerInitializeEvent(serverIdentifier: string) {
		return this.clientTransports
			.get(this.getServerKey(serverIdentifier))
			?.getServerInitializeEvent();
	}

	public getServerToolsListEvent(serverIdentifier: string) {
		return this.clientTransports
			.get(this.getServerKey(serverIdentifier))
			?.getServerToolsListEvent();
	}

	public getServerResourcesListEvent(serverIdentifier: string) {
		return this.clientTransports
			.get(this.getServerKey(serverIdentifier))
			?.getServerResourcesListEvent();
	}

	public getServerResourceTemplatesListEvent(serverIdentifier: string) {
		return this.clientTransports
			.get(this.getServerKey(serverIdentifier))
			?.getServerResourceTemplatesListEvent();
	}

	public getServerPromptsListEvent(serverIdentifier: string) {
		return this.clientTransports
			.get(this.getServerKey(serverIdentifier))
			?.getServerPromptsListEvent();
	}

	public setConnectionMode(serverIdentifier: string, mode: PaymentInteractionMode): void {
		this.connectionModes.set(this.getServerKey(serverIdentifier), mode);
	}

	public getConnectionMode(serverIdentifier: string): PaymentInteractionMode {
		return this.connectionModes.get(this.getServerKey(serverIdentifier)) ?? 'transparent';
	}

	public getEffectivePaymentMode(serverIdentifier: string): PaymentInteractionMode | undefined {
		return (
			this.clientTransports.get(this.getServerKey(serverIdentifier)) as
				| PaymentNegotiatingTransport
				| undefined
		)?.getEffectivePaymentInteraction?.();
	}

	public async reconnectWithMode(
		serverIdentifier: string,
		mode: PaymentInteractionMode
	): Promise<void> {
		this.setConnectionMode(serverIdentifier, mode);
		await this.disconnect(serverIdentifier, { keepMode: true });
		await this.getClient(serverIdentifier);
	}

	// Reconnect all existing clients using their preferred server identifier.
	public async reconnectAllClients(): Promise<void> {
		for (const [serverPubkey, client] of this.clients) {
			try {
				this.setConnectionState(serverPubkey, {
					connected: false,
					loading: true,
					error: null
				});

				await client.close();

				const transport = this.createTransport(
					this.getPreferredServerIdentifier(serverPubkey),
					this.connectionModes.get(serverPubkey)
				);

				await client.connect(transport);

				this.setConnectionState(serverPubkey, {
					connected: true,
					loading: false,
					error: null
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to reconnect to server';
				this.setConnectionState(serverPubkey, {
					connected: false,
					loading: false,
					error: errorMessage
				});
			}
		}
	}

	// Get or create a client for a specific server
	async getClient(serverIdentifier: string): Promise<Client | null> {
		const serverKey = this.setServerIdentifier(serverIdentifier);
		// Check if we already have a client for this server
		const existingClient = this.clients.get(serverKey);
		if (existingClient) {
			return existingClient;
		}

		try {
			this.setConnectionState(serverKey, {
				connected: false,
				loading: true,
				error: null
			});

			const transport = this.createTransport(serverIdentifier, this.connectionModes.get(serverKey));
			const client = new Client(McpClientService.clientConfig);
			await client.connect(transport);

			this.registerPaymentNotificationHandlers(client, serverIdentifier);

			this.clients.set(serverKey, client);

			this.setConnectionState(serverKey, {
				connected: true,
				loading: false,
				error: null
			});

			return client;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to connect to server';
			this.setConnectionState(serverKey, {
				connected: false,
				loading: false,
				error: errorMessage
			});
			return null;
		}
	}

	// Disconnect from a server
	async disconnect(serverIdentifier: string, options: { keepMode?: boolean } = {}): Promise<void> {
		const serverKey = this.getServerKey(serverIdentifier);
		const client = this.clients.get(serverKey);
		if (!client && !options.keepMode) {
			this.connectionModes.delete(serverKey);
		}
		if (client) {
			await client.close();
			this.clients.delete(serverKey);
			this.clientTransports.delete(serverKey);
			this.clearServerState(serverIdentifier);
			this.serverIdentifiers.delete(serverKey);
			if (!options.keepMode) {
				this.connectionModes.delete(serverKey);
			}
			this.setConnectionState(serverKey, { ...McpClientService.defaultConnectionState });
		}
	}

	// Get connection state for a server
	getConnectionState(serverIdentifier: string): McpConnectionState {
		return (
			this.connectionStates.get(this.getServerKey(serverIdentifier)) ??
			McpClientService.defaultConnectionState
		);
	}

	// List tools for a server
	async listTools(serverIdentifier: string, cursor?: string): Promise<ListToolsResult> {
		const client = await this.getConnectedClientOrThrow(serverIdentifier);
		return client.listTools(cursor ? { cursor } : undefined, {
			timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS
		});
	}

	// List resources for a server
	async listResources(serverIdentifier: string): Promise<ListResourcesResult> {
		const client = await this.getConnectedClientOrThrow(serverIdentifier);
		return client.listResources(undefined, {
			timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS
		});
	}

	// List resources for a server
	async listResourcesTemplates(serverIdentifier: string): Promise<ListResourceTemplatesResult> {
		const client = await this.getConnectedClientOrThrow(serverIdentifier);
		return client.listResourceTemplates(undefined, {
			timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS
		});
	}

	// List prompts for a server
	async listPrompts(serverIdentifier: string): Promise<ListPromptsResult> {
		const client = await this.getConnectedClientOrThrow(serverIdentifier);
		return client.listPrompts(undefined, { timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS });
	}

	// Call a tool on a server. Progress is delegated to the SDK via `onprogress`
	// (with `resetTimeoutOnProgress`), so we never inject our own progress token —
	// keeping request `params` deterministic for explicit-gating canonical matching.
	async callTool(
		serverIdentifier: string,
		toolName: string,
		arguments_: Record<string, unknown>,
		signal?: AbortSignal,
		onprogress?: ProgressCallback
	): Promise<CallToolResult> {
		const client = await this.getConnectedClientOrThrow(serverIdentifier);

		if (signal?.aborted) {
			throw new Error('Tool execution stopped');
		}

		const result = await client.callTool({ name: toolName, arguments: arguments_ }, undefined, {
			timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS,
			resetTimeoutOnProgress: true,
			signal,
			onprogress
		});
		return result as CallToolResult;
	}

	// Read a resource from a server
	async readResource(serverIdentifier: string, uri: string): Promise<ReadResourceResult> {
		const client = await this.getConnectedClientOrThrow(serverIdentifier);
		const result = await client.readResource(
			{ uri },
			{ timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS }
		);
		return result as ReadResourceResult;
	}

	// Get a prompt from a server
	async getPrompt(
		serverIdentifier: string,
		promptName: string,
		arguments_: Record<string, string> = {}
	): Promise<GetPromptResult> {
		const client = await this.getConnectedClientOrThrow(serverIdentifier);
		const result = await client.getPrompt(
			{ name: promptName, arguments: arguments_ },
			{ timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS }
		);
		return result as GetPromptResult;
	}

	// Clean up all clients and cached identifier state.
	public async destroy(): Promise<void> {
		for (const [serverPubkey, client] of this.clients) {
			try {
				await client.close();
			} catch (error) {
				console.error(`Error closing client for ${serverPubkey}:`, error);
			}
		}

		this.clients.clear();
		this.clientTransports.clear();
		this.connectionStates.clear();
		this.serverIdentifiers.clear();
		this.connectionModes.clear();
	}
}

// Create a singleton instance
export const mcpClientService = new McpClientService();
