import { activeAccount } from '$lib/services/accountManager.svelte';
import { ApplesauceRelayPool, NostrClientTransport } from '@contextvm/sdk';
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
import { relayStore, relayActions } from '../stores/relay-store.svelte';
import { DIALOG_IDS, dialogState } from '$lib/stores/dialog-state.svelte';
import { browser } from '$app/environment';

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
// Relay pool is now per-client to avoid subscription conflicts
export class McpClientService {
	public clients = new SvelteMap<string, Client>();
	private connectionStates = new SvelteMap<string, McpConnectionState>();
	private progressNotifications = new SvelteMap<string, McpProgressNotification[]>();
	private clientRelayPools = new SvelteMap<string, ApplesauceRelayPool>();
	private static readonly clientConfig = {
		name: 'ContextVM Web Client',
		version: '1.0.0'
	};
	private static readonly defaultConnectionState: Readonly<McpConnectionState> = {
		connected: false,
		loading: false,
		error: null
	};

	// Create a new relay pool for a specific client
	private createRelayPool(): ApplesauceRelayPool {
		if (!browser) {
			throw new Error('Relay pool can only be created on client side');
		}
		return new ApplesauceRelayPool(relayStore.selectedRelays);
	}

	// Get or create a relay pool for a specific client
	private getRelayPool(serverPubkey: string): ApplesauceRelayPool {
		let relayPool = this.clientRelayPools.get(serverPubkey);
		if (!relayPool) {
			relayPool = this.createRelayPool();
			this.clientRelayPools.set(serverPubkey, relayPool);
		}
		return relayPool;
	}

	// Update relay pool for a specific client
	private updateRelayPoolForClient(serverPubkey: string): void {
		if (!browser) return;

		// Create new relay pool for this client
		const newRelayPool = this.createRelayPool();
		this.clientRelayPools.set(serverPubkey, newRelayPool);
	}

	constructor() {
		// Register callback for relay changes
		if (browser) {
			relayActions.onRelayChange(() => {
				// Update relay pools for all connected clients
				for (const serverPubkey of this.clients.keys()) {
					this.updateRelayPoolForClient(serverPubkey);
				}

				if (this.clients.size > 0) {
					dialogState.dialogId = DIALOG_IDS.RELAY_CHANGE;
				}
			});
		}
	}

	// Helper method to create a new transport for a client
	private createTransport(serverPubkey: string): NostrClientTransport {
		// Check if user is logged in
		const currentAccount = activeAccount.getValue();
		if (!currentAccount) {
			throw new Error('Please log in to connect to servers');
		}

		const signer = currentAccount.signer;
		if (!signer) {
			throw new Error('Failed to get signer from account');
		}

		return new NostrClientTransport({
			signer,
			relayHandler: this.getRelayPool(serverPubkey),
			serverPubkey
		});
	}

	// Reconnect all existing clients with the new relay pool
	public async reconnectAllClients(): Promise<void> {
		for (const [serverPubkey, client] of this.clients) {
			try {
				// Set loading state
				this.connectionStates.set(serverPubkey, {
					connected: false,
					loading: true,
					error: null
				});

				// Close existing client
				await client.close();

				// Create new transport with updated relay pool for this client
				const transport = this.createTransport(serverPubkey);

				// Connect with new transport
				await client.connect(transport);

				// Set connected state
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
	async getClient(serverPubkey: string): Promise<Client | null> {
		// Check if we already have a client for this server
		const existingClient = this.clients.get(serverPubkey);
		if (existingClient) {
			return existingClient;
		}

		try {
			// Set loading state
			this.connectionStates.set(serverPubkey, {
				connected: false,
				loading: true,
				error: null
			});

			const transport = this.createTransport(serverPubkey);
			const client = new Client(McpClientService.clientConfig);
			await client.connect(transport);
			client.setNotificationHandler(ProgressNotificationSchema, async (req) => {
				// Store progress notification
				if (req.params?.progressToken) {
					const notification: McpProgressNotification = {
						progressToken: req.params.progressToken as string,
						serverPubkey: serverPubkey,
						progress: req.params.progress || 0,
						message: req.params.message,
						timestamp: Date.now()
					};

					// Get existing notifications for this server
					const existingNotifications = this.progressNotifications.get(serverPubkey) || [];

					// Update or add the notification
					const existingIndex = existingNotifications.findIndex(
						(n) => n.progressToken === notification.progressToken
					);

					if (existingIndex >= 0) {
						console.log('updating existing progress notification');
						existingNotifications[existingIndex] = notification;
					} else {
						console.log('adding new progress notification');
						existingNotifications.push(notification);
					}
					console.log('existingNotifications', existingNotifications);
					// Store updated notifications
					// TODO: this is not being updated or reactive
					this.progressNotifications.set(serverPubkey, existingNotifications);
				}
			});
			this.clients.set(serverPubkey, client);

			// Set connected state
			this.connectionStates.set(serverPubkey, {
				connected: true,
				loading: false,
				error: null
			});

			return client;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to connect to server';
			this.connectionStates.set(serverPubkey, {
				connected: false,
				loading: false,
				error: errorMessage
			});
			return null;
		}
	}

	// Disconnect from a server
	async disconnect(serverPubkey: string): Promise<void> {
		const client = this.clients.get(serverPubkey);
		if (client) {
			await client.close();
			this.clients.delete(serverPubkey);
			// Reset to default state
			this.connectionStates.set(serverPubkey, { ...McpClientService.defaultConnectionState });
		}
	}

	// Get connection state for a server
	getConnectionState(serverPubkey: string): McpConnectionState {
		return this.connectionStates.get(serverPubkey) ?? McpClientService.defaultConnectionState;
	}

	// Get progress notifications for a server
	getProgressNotifications(serverPubkey: string): McpProgressNotification[] {
		return this.progressNotifications.get(serverPubkey) || [];
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
	clearProgressNotifications(serverPubkey: string): void {
		this.progressNotifications.delete(serverPubkey);
	}

	// Clear a specific progress notification
	clearProgressNotification(serverPubkey: string, progressToken: string): void {
		const notifications = this.progressNotifications.get(serverPubkey);
		if (notifications) {
			const filteredNotifications = notifications.filter((n) => n.progressToken !== progressToken);
			if (filteredNotifications.length > 0) {
				this.progressNotifications.set(serverPubkey, filteredNotifications);
			} else {
				this.progressNotifications.delete(serverPubkey);
			}
		}
	}

	// List tools for a server
	async listTools(serverPubkey: string): Promise<ListToolsResult> {
		const client = await this.getClient(serverPubkey);
		if (!client) {
			throw new Error('Not connected to server');
		}
		return client.listTools();
	}

	// List resources for a server
	async listResources(serverPubkey: string): Promise<ListResourcesResult> {
		const client = await this.getClient(serverPubkey);
		if (!client) {
			throw new Error('Not connected to server');
		}
		return client.listResources();
	}

	// List resources for a server
	async listResourcesTemplates(serverPubkey: string): Promise<ListResourceTemplatesResult> {
		const client = await this.getClient(serverPubkey);
		if (!client) {
			throw new Error('Not connected to server');
		}
		return client.listResourceTemplates();
	}

	// List prompts for a server
	async listPrompts(serverPubkey: string): Promise<ListPromptsResult> {
		const client = await this.getClient(serverPubkey);
		if (!client) {
			throw new Error('Not connected to server');
		}
		return client.listPrompts();
	}

	// Call a tool on a server
	async callTool(
		serverPubkey: string,
		toolName: string,
		arguments_: Record<string, unknown>
	): Promise<CallToolResult> {
		const client = await this.getClient(serverPubkey);
		if (!client) {
			throw new Error('Not connected to server');
		}

		const result = await client.callTool({
			name: toolName,
			arguments: arguments_,
			_meta: { progressToken: Math.random().toString(36).substring(2, 15) }
		});
		return result as CallToolResult;
	}

	// Read a resource from a server
	async readResource(serverPubkey: string, uri: string): Promise<ReadResourceResult> {
		const client = await this.getClient(serverPubkey);
		if (!client) {
			throw new Error('Not connected to server');
		}
		const result = await client.readResource({ uri });
		return result as ReadResourceResult;
	}

	// Get a prompt from a server
	async getPrompt(
		serverPubkey: string,
		promptName: string,
		arguments_: Record<string, string> = {}
	): Promise<GetPromptResult> {
		const client = await this.getClient(serverPubkey);
		if (!client) {
			throw new Error('Not connected to server');
		}
		const result = await client.getPrompt({ name: promptName, arguments: arguments_ });
		return result as GetPromptResult;
	}

	// Clean up all relay pools and clients
	public async destroy(): Promise<void> {
		// Close all clients
		for (const [serverPubkey, client] of this.clients) {
			try {
				await client.close();
			} catch (error) {
				console.error(`Error closing client for ${serverPubkey}:`, error);
			}

			// Clear all data
			this.clients.clear();
			this.connectionStates.clear();
			this.progressNotifications.clear();
			this.clientRelayPools.clear();
		}
	}
}

// Create a singleton instance
export const mcpClientService = new McpClientService();
