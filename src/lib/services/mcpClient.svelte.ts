import { activeAccount } from '$lib/services/accountManager.svelte';
import { NostrClientTransport } from '@contextvm/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
	type ListPromptsResult,
	type ListResourcesResult,
	type ListResourceTemplatesResult,
	type ListToolsResult,
	type CallToolResult,
	type ReadResourceResult,
	type GetPromptResult,
	ProgressNotificationSchema
} from '@modelcontextprotocol/sdk/types.js';
import { SvelteMap } from 'svelte/reactivity';
import { paymentNotificationsService } from '$lib/services/payments/payment-notifications.svelte';
import { withClientPayments, PMI_BITCOIN_LIGHTNING_BOLT11 } from '@contextvm/sdk';
import { UiOnlyPaymentHandler } from '$lib/services/payments/ui-payment-handler';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { decodeServerIdentifier } from '$lib/utils';

export interface McpConnectionState {
	connected: boolean;
	loading: boolean;
	error: string | null;
}

export interface McpProgressNotification {
	progressToken: string;
	serverPubkey: string;
	progress: number;
	message?: string;
	timestamp: number;
}

export class McpClientService {
	public clients = new SvelteMap<string, Client>();
	private clientTransports = new SvelteMap<string, NostrClientTransport>();
	private connectionStates = new SvelteMap<string, McpConnectionState>();
	private progressNotifications = new SvelteMap<string, McpProgressNotification[]>();
	private serverIdentifiers = new SvelteMap<string, string>();
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

	constructor() {}

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

	// Helper method to create a new transport for a client
	private createTransport(serverIdentifier: string): Transport {
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

		// UI-only payments integration using the SDK middleware.
		// - advertises PMIs via `pmi` tags
		// - captures payment_required in our handler
		// - does not attempt to pay
		const uiHandler = new UiOnlyPaymentHandler({
			pmi: PMI_BITCOIN_LIGHTNING_BOLT11,
			serverPubkey: serverKey
		});
		return withClientPayments(baseTransport, { handlers: [uiHandler] });
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

	// Reconnect all existing clients using their preferred server identifier.
	public async reconnectAllClients(): Promise<void> {
		for (const [serverPubkey, client] of this.clients) {
			try {
				// Set loading state
				this.connectionStates.set(serverPubkey, {
					connected: false,
					loading: true,
					error: null
				});

				await client.close();

				const transport = this.createTransport(this.getPreferredServerIdentifier(serverPubkey));

				await client.connect(transport);

				this.connectionStates.set(serverPubkey, {
					connected: true,
					loading: false,
					error: null
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to reconnect to server';
				this.connectionStates.set(serverPubkey, {
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
			this.connectionStates.set(serverKey, {
				connected: false,
				loading: true,
				error: null
			});

			const transport = this.createTransport(serverIdentifier);
			const client = new Client(McpClientService.clientConfig);
			await client.connect(transport);

			// CEP-8 `payment_required` is captured by the payments middleware handler.
			client.setNotificationHandler(ProgressNotificationSchema, async (req) => {
				if (req.params?.progressToken) {
					const notification: McpProgressNotification = {
						progressToken: req.params.progressToken as string,
						serverPubkey: serverKey,
						progress: req.params.progress || 0,
						message: req.params.message,
						timestamp: Date.now()
					};

					const existingNotifications = this.progressNotifications.get(serverKey) || [];
					const existingIndex = existingNotifications.findIndex(
						(n) => n.progressToken === notification.progressToken
					);

					if (existingIndex >= 0) {
						existingNotifications[existingIndex] = notification;
					} else {
						existingNotifications.push(notification);
					}
					this.progressNotifications.set(serverKey, existingNotifications);
				}
			});
			this.clients.set(serverKey, client);

			this.connectionStates.set(serverKey, {
				connected: true,
				loading: false,
				error: null
			});

			return client;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to connect to server';
			this.connectionStates.set(serverKey, {
				connected: false,
				loading: false,
				error: errorMessage
			});
			return null;
		}
	}

	// Disconnect from a server
	async disconnect(serverIdentifier: string): Promise<void> {
		const serverKey = this.getServerKey(serverIdentifier);
		const client = this.clients.get(serverKey);
		if (client) {
			await client.close();
			this.clients.delete(serverKey);
			this.clientTransports.delete(serverKey);
			this.serverIdentifiers.delete(serverKey);
			paymentNotificationsService.clearServer(serverKey);
			this.connectionStates.set(serverKey, { ...McpClientService.defaultConnectionState });
		}
	}

	// Get connection state for a server
	getConnectionState(serverIdentifier: string): McpConnectionState {
		return (
			this.connectionStates.get(this.getServerKey(serverIdentifier)) ??
			McpClientService.defaultConnectionState
		);
	}

	// Get progress notifications for a server
	getProgressNotifications(serverIdentifier: string): McpProgressNotification[] {
		return this.progressNotifications.get(this.getServerKey(serverIdentifier)) || [];
	}

	// Get all progress notifications across all servers
	getAllProgressNotifications(): McpProgressNotification[] {
		const allNotifications: McpProgressNotification[] = [];
		for (const notifications of this.progressNotifications.values()) {
			allNotifications.push(...notifications);
		}
		return allNotifications.sort((a, b) => b.timestamp - a.timestamp);
	}

	// Clear progress notifications for a server
	clearProgressNotifications(serverIdentifier: string): void {
		this.progressNotifications.delete(this.getServerKey(serverIdentifier));
	}

	// Clear a specific progress notification
	clearProgressNotification(serverIdentifier: string, progressToken: string): void {
		const serverKey = this.getServerKey(serverIdentifier);
		const notifications = this.progressNotifications.get(serverKey);
		if (notifications) {
			const filteredNotifications = notifications.filter((n) => n.progressToken !== progressToken);
			if (filteredNotifications.length > 0) {
				this.progressNotifications.set(serverKey, filteredNotifications);
			} else {
				this.progressNotifications.delete(serverKey);
			}
		}
	}

	// List tools for a server
	async listTools(serverIdentifier: string): Promise<ListToolsResult> {
		const client = await this.getClient(serverIdentifier);
		if (!client) {
			throw new Error('Not connected to server');
		}
		return client.listTools(undefined, { timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS });
	}

	// List resources for a server
	async listResources(serverIdentifier: string): Promise<ListResourcesResult> {
		const client = await this.getClient(serverIdentifier);
		if (!client) {
			throw new Error('Not connected to server');
		}
		return client.listResources(undefined, {
			timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS
		});
	}

	// List resources for a server
	async listResourcesTemplates(serverIdentifier: string): Promise<ListResourceTemplatesResult> {
		const client = await this.getClient(serverIdentifier);
		if (!client) {
			throw new Error('Not connected to server');
		}
		return client.listResourceTemplates(undefined, {
			timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS
		});
	}

	// List prompts for a server
	async listPrompts(serverIdentifier: string): Promise<ListPromptsResult> {
		const client = await this.getClient(serverIdentifier);
		if (!client) {
			throw new Error('Not connected to server');
		}
		return client.listPrompts(undefined, { timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS });
	}

	// Call a tool on a server
	async callTool(
		serverIdentifier: string,
		toolName: string,
		arguments_: Record<string, unknown>
	): Promise<CallToolResult> {
		const client = await this.getClient(serverIdentifier);
		if (!client) {
			throw new Error('Not connected to server');
		}

		const result = await client.callTool(
			{
				name: toolName,
				arguments: arguments_,
				_meta: { progressToken: Math.random().toString(36).substring(2, 15) }
			},
			undefined,
			{ timeout: McpClientService.DEFAULT_REQUEST_TIMEOUT_MS, resetTimeoutOnProgress: true }
		);
		return result as CallToolResult;
	}

	// Read a resource from a server
	async readResource(serverIdentifier: string, uri: string): Promise<ReadResourceResult> {
		const client = await this.getClient(serverIdentifier);
		if (!client) {
			throw new Error('Not connected to server');
		}
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
		const client = await this.getClient(serverIdentifier);
		if (!client) {
			throw new Error('Not connected to server');
		}
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
		this.progressNotifications.clear();
		this.serverIdentifiers.clear();
	}
}

// Create a singleton instance
export const mcpClientService = new McpClientService();
