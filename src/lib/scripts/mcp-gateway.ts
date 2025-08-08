#!/usr/bin/env bun
import { devRelay } from '$lib/services/relay-pool';
import { NostrMCPGateway, PrivateKeySigner, SimpleRelayPool } from '@contextvm/sdk';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { generateSecretKey } from 'nostr-tools';
import { bytesToHex } from 'nostr-tools/utils';

function parseArgs(): { instances: number } {
	const args = process.argv.slice(2);
	const instancesArg = args.find((arg) => arg.startsWith('--instances='));

	let instances = 1;

	if (instancesArg) {
		const instancesValue = parseInt(instancesArg.split('=')[1]);
		if (!isNaN(instancesValue) && instancesValue > 0) {
			instances = instancesValue;
		} else {
			console.error('Invalid value for --instances. Please provide a positive integer.');
			process.exit(1);
		}
	}

	return { instances };
}

async function createGatewayInstance(instanceIndex: number): Promise<NostrMCPGateway> {
	const relayUrl = devRelay;

	const transport = new StdioClientTransport({
		command: 'npx',
		args: ['@modelcontextprotocol/server-everything']
	});

	const signer = new PrivateKeySigner(bytesToHex(generateSecretKey()));
	const relayPool = new SimpleRelayPool(relayUrl);

	const gateway = new NostrMCPGateway({
		mcpServerTransport: transport,
		nostrTransportOptions: {
			signer,
			relayHandler: relayPool,
			isPublicServer: true,
			serverInfo: {
				name: `MCP Gateway ${instanceIndex + 1}`,
				about: `MCP Gateway description (Instance ${instanceIndex + 1})`
			}
		}
	});

	return gateway;
}

async function main(): Promise<void> {
	const { instances } = parseArgs();
	const gatewayInstances: NostrMCPGateway[] = [];

	console.error(`Starting ${instances} gateway instance(s)...`);

	for (let i = 0; i < instances; i++) {
		console.error(`Creating gateway instance ${i + 1}/${instances}...`);
		const instance = await createGatewayInstance(i);
		await instance.start();
		gatewayInstances.push(instance);
		console.error(`Gateway instance ${i + 1} started`);
	}

	console.error(`All ${instances} gateway instance(s) started successfully`);

	const cleanup = async () => {
		console.error('\nShutting down gateway instances...');
		for (let i = 0; i < gatewayInstances.length; i++) {
			try {
				console.error(`Stopping gateway instance ${i + 1}...`);
				await gatewayInstances[i].stop();
				console.error(`Gateway instance ${i + 1} stopped`);
			} catch (error) {
				console.error(`Error stopping gateway instance ${i + 1}:`, error);
			}
		}
		console.error('All gateway instances stopped');
		process.exit(0);
	};

	process.on('SIGINT', cleanup);
	process.on('SIGTERM', cleanup);
}

main().catch((error) => {
	console.error('Gateway server error:', error);
	process.exit(1);
});
