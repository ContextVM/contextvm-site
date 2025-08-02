import { SimpleRelayPool } from '@contextvm/sdk';
import { activeAccount } from '$lib/services/accountManager.svelte';
import { devRelay } from './relay-pool';
import { NostrClientTransport } from '@contextvm/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type {
	ListPromptsResult,
	ListResourcesResult,
	ListToolsResult
} from '@modelcontextprotocol/sdk/types.js';
import { SvelteMap } from 'svelte/reactivity';

export interface McpConnectionState {
	connected: boolean;
	loading: boolean;
	error: string | null;
}

export class McpClientService {
	private clients = new SvelteMap<string, Client>();
	private connectionStates = new SvelteMap<string, McpConnectionState>();
	private relayPool = new SimpleRelayPool(devRelay);
	private static readonly clientConfig = {
		name: 'ContextVM Web Client',
		version: '1.0.0'
	};
	private static readonly defaultConnectionState = {
		connected: false,
		loading: false,
		error: null
	};

	// Get or create a client for a specific server
	async getClient(serverPubkey: string): Promise<Client | null> {
		// Check if we already have a client for this server
		const existingClient = this.clients.get(serverPubkey);
		if (existingClient) {
			return existingClient;
		}

		try {
			this.updateConnectionState(serverPubkey, {
				connected: false,
				loading: true,
				error: null
			});

			// Check if user is logged in
			const currentAccount = activeAccount.getValue();
			if (!currentAccount) {
				throw new Error('Please log in to connect to servers');
			}

			const signer = currentAccount.signer;
			if (!signer) {
				throw new Error('Failed to get signer from account');
			}

			const transport = new NostrClientTransport({
				signer,
				relayHandler: this.relayPool,
				serverPubkey
			});

			const client = new Client(McpClientService.clientConfig);
			await client.connect(transport);
			this.clients.set(serverPubkey, client);

			this.updateConnectionState(serverPubkey, {
				connected: true,
				loading: false,
				error: null
			});

			return client;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to connect to server';
			this.updateConnectionState(serverPubkey, {
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
			this.updateConnectionState(serverPubkey, McpClientService.defaultConnectionState);
		}
	}

	// Get connection state for a server
	getConnectionState(serverPubkey: string): McpConnectionState {
		return this.connectionStates.get(serverPubkey) || McpClientService.defaultConnectionState;
	}

	// Update connection state
	private updateConnectionState(serverPubkey: string, state: McpConnectionState): void {
		this.connectionStates.set(serverPubkey, state);
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

	// List prompts for a server
	async listPrompts(serverPubkey: string): Promise<ListPromptsResult> {
		const client = await this.getClient(serverPubkey);
		if (!client) {
			throw new Error('Not connected to server');
		}
		return client.listPrompts();
	}
}

// Create a singleton instance
export const mcpClientService = new McpClientService();
