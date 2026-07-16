import { describe, expect, it } from 'bun:test';
import { ToolRegistry, mcpToolToOpenAI, sanitizeServerName } from './mcp-openai-bridge';
import type { Tool } from '@contextvm/mcp-sdk/types.js';

const makeTool = (overrides: Partial<Tool> = {}): Tool => ({
	name: 'tool_x',
	description: 'Test tool',
	inputSchema: {
		type: 'object',
		properties: {}
	},
	...overrides
});

describe('sanitizeServerName', () => {
	it('falls back for empty or blank values', () => {
		expect(sanitizeServerName('')).toBe('mcp_server');
		expect(sanitizeServerName('   ')).toBe('mcp_server');
	});

	it('strips non-alphanumeric characters and trims length', () => {
		const normalized = sanitizeServerName('\u6d4b\u8bd5 server');
		expect(normalized).toBe('server');

		const longName = 'a'.repeat(40);
		const trimmed = sanitizeServerName(longName);
		expect(trimmed.length).toBeLessThanOrEqual(30);
	});
});

describe('mcpToolToOpenAI', () => {
	it('removes $schema from parameters', () => {
		const tool = makeTool({
			inputSchema: {
				type: 'object',
				properties: { value: { type: 'string' } },
				$schema: 'http://example.com/schema.json'
			}
		});

		const openAiTool = mcpToolToOpenAI(tool, 'Test Server');
		if (openAiTool.type !== 'function') {
			throw new Error('Expected a function tool');
		}

		const parameters = openAiTool.function.parameters as Record<string, unknown>;
		expect(parameters.$schema).toBeUndefined();
		expect(parameters).toMatchObject({
			type: 'object',
			properties: { value: { type: 'string' } }
		});
	});
});

describe('ToolRegistry tiers', () => {
	it('defaults to prompt tier for tools', () => {
		const registry = new ToolRegistry();
		registry.register('abcd1234', 'Server', [
			makeTool({ name: 'delete_user', description: 'delete a user' })
		]);

		const resolved = registry.resolve('server_delete_user', '{}');
		expect(resolved.ok).toBe(true);
		if (resolved.ok) {
			expect(resolved.value.tier).toBe('prompt');
		}
	});

	it('respects tier overrides', () => {
		const registry = new ToolRegistry();
		const overrides = new Map<string, 'auto' | 'prompt'>([['list_status', 'auto']]);
		registry.register('abcd1234', 'Server', [makeTool({ name: 'list_status' })], overrides);

		const resolved = registry.resolve('server_list_status', '{}');
		expect(resolved.ok).toBe(true);
		if (resolved.ok) {
			expect(resolved.value.tier).toBe('auto');
		}
	});
});

describe('ToolRegistry collisions', () => {
	it('disambiguates tool names across 3 servers', () => {
		const registry = new ToolRegistry();
		const serverName = 'Test Server';
		const toolName = 'tool_x';
		const baseName = `${sanitizeServerName(serverName)}_${toolName}`;

		registry.register('aaaa1111', serverName, [makeTool({ name: toolName })]);
		registry.register('bbbb2222', serverName, [makeTool({ name: toolName })]);
		registry.register('cccc3333', serverName, [makeTool({ name: toolName })]);

		const toolNames = registry
			.getOpenAITools()
			.map((tool) => (tool.type === 'function' ? tool.function.name : ''));

		expect(toolNames).not.toContain(baseName);
		expect(toolNames).toEqual(
			expect.arrayContaining([
				`${baseName}_aaaa1111`,
				`${baseName}_bbbb2222`,
				`${baseName}_cccc3333`
			])
		);
	});
});

describe('ToolRegistry resolve', () => {
	it('returns invalid_arguments for malformed JSON', () => {
		const registry = new ToolRegistry();
		const serverName = 'Server';
		const toolName = 'tool_x';
		const baseName = `${sanitizeServerName(serverName)}_${toolName}`;

		registry.register('aaaa1111', serverName, [makeTool({ name: toolName })]);
		const resolved = registry.resolve(baseName, '{"bad_json": }');
		expect(resolved.ok).toBe(false);
		if (!resolved.ok) {
			expect(resolved.reason).toBe('invalid_arguments');
		}
	});

	it('returns unknown_tool for missing mappings', () => {
		const registry = new ToolRegistry();
		const resolved = registry.resolve('missing_tool', '{}');
		expect(resolved.ok).toBe(false);
		if (!resolved.ok) {
			expect(resolved.reason).toBe('unknown_tool');
		}
	});

	it('returns invalid_arguments for schema validation failures', () => {
		const registry = new ToolRegistry();
		const serverName = 'Server';
		const toolName = 'tool_x';
		const baseName = `${sanitizeServerName(serverName)}_${toolName}`;

		registry.register('aaaa1111', serverName, [
			makeTool({
				name: toolName,
				inputSchema: {
					type: 'object',
					properties: {
						name: { type: 'string' }
					},
					required: ['name']
				}
			})
		]);

		const resolved = registry.resolve(baseName, '{}');
		expect(resolved.ok).toBe(false);
		if (!resolved.ok) {
			expect(resolved.reason).toBe('invalid_arguments');
		}
	});
});

describe('ToolRegistry local tools', () => {
	it('registers a built-in tool whose execute flows through resolve', async () => {
		const registry = new ToolRegistry();
		const execute = async (args: Record<string, unknown>) =>
			`ran with ${JSON.stringify(args)}`;

		registry.registerLocal(
			'wallet_pay_invoice',
			'Pay a bolt11 invoice',
			{ type: 'object', properties: { invoice: { type: 'string' } }, required: ['invoice'] },
			execute,
			'auto'
		);

		const tools = registry.getOpenAITools();
		expect(tools).toHaveLength(1);
		expect(tools[0].type).toBe('function');
		if (tools[0].type === 'function') {
			expect(tools[0].function.name).toBe('wallet_pay_invoice');
		}

		const resolved = registry.resolve('wallet_pay_invoice', JSON.stringify({ invoice: 'lnbc1' }));
		expect(resolved.ok).toBe(true);
		if (resolved.ok) {
			expect(resolved.value.tier).toBe('auto');
			expect(resolved.value.execute).toBe(execute);
			expect(await resolved.value.execute?.(resolved.value.args)).toBe(
				'ran with {"invoice":"lnbc1"}'
			);
		}
	});
});
