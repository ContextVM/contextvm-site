#!/usr/bin/env bun
import { devKey1 } from '$lib/fixtures';
import { devRelay } from '$lib/services/relay-pool';
import { NostrMCPGateway, PrivateKeySigner, SimpleRelayPool } from '@contextvm/sdk';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main(): Promise<void> {
	const relayUrl = devRelay;
	const clientPrivateKey = devKey1;

	if (!clientPrivateKey) {
		console.error('CLIENT_PRIVATE_KEY environment variable is required');
		process.exit(1);
	}

	const transport = new StdioClientTransport({
		command: 'npx',
		args: ['@modelcontextprotocol/server-everything'],
		stderr: 'pipe'
	});

	const signer = new PrivateKeySigner(clientPrivateKey);
	const relayPool = new SimpleRelayPool(relayUrl);

	const gateway = new NostrMCPGateway({
		mcpServerTransport: transport,
		nostrTransportOptions: {
			signer,
			relayHandler: relayPool,
			isPublicServer: true,
			serverInfo: {
				name: 'MCP Gateway',
				about: 'MCP Gateway description'
			}
		}
	});

	process.on('SIGINT', async () => {
		await gateway.stop();
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		await gateway.stop();
		process.exit(0);
	});

	await gateway.start();
	console.error('Gateway server started and connected to stdio');
}

main().catch((error) => {
	console.error('Gateway server error:', error);
	process.exit(1);
});
