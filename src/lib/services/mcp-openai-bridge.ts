import type { ToolApprovalTier } from '$lib/types/chat-types';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import Ajv, { type ValidateFunction } from 'ajv';

const MAX_SERVER_PREFIX_LENGTH = 30;
const MAX_FUNCTION_NAME_LENGTH = 64;
const MAX_TOOL_ARGS_CHARS = 64 * 1024;
const DISAMBIGUATOR_LENGTH = 8;
const ajv = new Ajv({ allErrors: true, strict: false });

interface ToolMapping {
	serverPubkey: string;
	serverName: string;
	originalName: string;
	tier: ToolApprovalTier;
	openAITool: ChatCompletionTool;
	inputSchema?: Tool['inputSchema'];
	validator?: ValidateFunction<unknown>;
}

type ParsedArguments =
	| { ok: true; value: Record<string, unknown> }
	| { ok: false; error: string };

export type ToolResolveResult =
	| { ok: true; value: ResolvedToolCall }
	| { ok: false; reason: 'unknown_tool' | 'invalid_arguments'; error: string };

export interface ResolvedToolCall {
	serverPubkey: string;
	serverName: string;
	originalToolName: string;
	args: Record<string, unknown>;
	tier: ToolApprovalTier;
}

function sanitizeFunctionSegment(value: string, fallback: string, maxLength?: number): string {
	const sanitized = value
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_+|_+$/g, '');

	const segment = sanitized || fallback;
	return maxLength ? segment.slice(0, maxLength).replace(/_+$/g, '') || fallback : segment;
}

function toParameters(inputSchema: Tool['inputSchema']): Record<string, unknown> {
	const rawSchema =
		inputSchema && typeof inputSchema === 'object' && !Array.isArray(inputSchema)
			? (inputSchema as Record<string, unknown>)
			: { type: 'object', properties: {} };
	const { $schema: _schema, ...parameters } = rawSchema;

	return Object.keys(parameters).length > 0 ? parameters : { type: 'object', properties: {} };
}

function withFunctionName(tool: ChatCompletionTool, name: string): ChatCompletionTool {
	if (tool.type !== 'function') {
		return tool;
	}

	return {
		...tool,
		function: {
			...tool.function,
			name
		}
	};
}

function classifyToolTier(_tool: Tool): ToolApprovalTier {
	return 'prompt';
}


function parseToolArguments(rawArgs: string): ParsedArguments {
	if (!rawArgs.trim()) {
		return { ok: true, value: {} };
	}

	if (rawArgs.length > MAX_TOOL_ARGS_CHARS) {
		return {
			ok: false,
			error: `Arguments payload exceeds ${MAX_TOOL_ARGS_CHARS} characters.`
		};
	}

	try {
		const parsed = JSON.parse(rawArgs) as unknown;
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? { ok: true, value: parsed as Record<string, unknown> }
			: { ok: false, error: 'Tool arguments must be a JSON object.' };
	} catch (_error) {
		return { ok: false, error: 'Arguments are not valid JSON.' };
	}
}

function buildNamespacedName(serverName: string, toolName: string, suffix = ''): string {
	const prefix = sanitizeServerName(serverName);
	const sanitizedToolName = sanitizeFunctionSegment(toolName, 'tool');
	const reservedLength = prefix.length + 1 + suffix.length;
	const maxToolLength = Math.max(1, MAX_FUNCTION_NAME_LENGTH - reservedLength);
	const truncatedToolName = sanitizedToolName.slice(0, maxToolLength).replace(/_+$/g, '') || 'tool';

	return `${prefix}_${truncatedToolName}${suffix}`;
}

export function sanitizeServerName(name: string): string {
	return sanitizeFunctionSegment(name, 'mcp_server', MAX_SERVER_PREFIX_LENGTH);
}

export function mcpToolToOpenAI(tool: Tool, serverName: string): ChatCompletionTool {
	return {
		type: 'function',
		function: {
			name: buildNamespacedName(serverName, tool.name),
			description: tool.description || `Tool from ${serverName}`,
			parameters: toParameters(tool.inputSchema)
		}
	};
}

export class ToolRegistry {
	private mappings = new Map<string, ToolMapping>();
	private baseNameIndex = new Map<string, Set<string>>();

	public register(
		serverPubkey: string,
		serverName: string,
		tools: Tool[],
		tierOverrides?: Map<string, ToolApprovalTier>
	): void {
		for (const tool of tools) {
			const baseName = buildNamespacedName(serverName, tool.name);
			const existingNames = this.baseNameIndex.get(baseName);
			const disambiguator = `_${serverPubkey
				.slice(0, DISAMBIGUATOR_LENGTH)
				.toLowerCase() || 'srv'}`;

			let namespacedName = baseName;
			if (!existingNames) {
				this.baseNameIndex.set(baseName, new Set([baseName]));
			} else {
				const existingBase = this.mappings.get(baseName);
				const isSameTool =
					existingBase &&
					existingBase.serverPubkey === serverPubkey &&
					existingBase.originalName === tool.name;

				if (!isSameTool) {
					if (existingNames.has(baseName)) {
						const existing = this.mappings.get(baseName);
						if (existing) {
							const origDisambiguator = `_${existing.serverPubkey
								.slice(0, DISAMBIGUATOR_LENGTH)
								.toLowerCase() || 'srv'}`;
							const origNewName = buildNamespacedName(
								existing.serverName,
								existing.originalName,
								origDisambiguator
							);

							this.mappings.delete(baseName);
							this.mappings.set(origNewName, {
								...existing,
								openAITool: withFunctionName(existing.openAITool, origNewName)
							});
							existingNames.delete(baseName);
							existingNames.add(origNewName);
						} else {
							existingNames.delete(baseName);
						}
					}

					namespacedName = buildNamespacedName(serverName, tool.name, disambiguator);
					existingNames.add(namespacedName);
				}
			}

			let validator: ValidateFunction<unknown> | undefined;
			if (tool.inputSchema && typeof tool.inputSchema === 'object') {
				try {
					validator = ajv.compile(tool.inputSchema as Record<string, unknown>);
				} catch (error) {
					console.warn(`Failed to compile schema for ${tool.name}:`, error);
				}
			}

			const openAITool = withFunctionName(mcpToolToOpenAI(tool, serverName), namespacedName);
			const tier =
				tierOverrides?.get(tool.name) ??
				tierOverrides?.get(namespacedName) ??
				classifyToolTier(tool);

			this.mappings.set(namespacedName, {
				serverPubkey,
				serverName,
				originalName: tool.name,
				tier,
				openAITool,
				inputSchema: tool.inputSchema,
				validator
			});
		}
	}

	public resolve(namespacedName: string, rawArgs: string): ToolResolveResult {
		const mapping = this.mappings.get(namespacedName);
		const args = parseToolArguments(rawArgs);
		const snippet = rawArgs.slice(0, 200);

		if (!mapping) {
			return {
				ok: false,
				reason: 'unknown_tool',
				error: `Unknown tool: ${namespacedName}`
			};
		}

		if (!args.ok) {
			return {
				ok: false,
				reason: 'invalid_arguments',
				error: `Malformed arguments JSON for ${namespacedName}: ${args.error}${
					snippet ? ` :: ${snippet}` : ''
				}`
			};
		}

		if (mapping.validator && !mapping.validator(args.value)) {
			return {
				ok: false,
				reason: 'invalid_arguments',
				error: `Schema validation failed for ${namespacedName}: ${
					ajv.errorsText(mapping.validator.errors)
				}`
			};
		}

		return {
			ok: true,
			value: {
				serverPubkey: mapping.serverPubkey,
				serverName: mapping.serverName,
				originalToolName: mapping.originalName,
				args: args.value,
				tier: mapping.tier
			}
		};
	}

	public getOpenAITools(): ChatCompletionTool[] {
		return [...this.mappings.values()].map((mapping) => mapping.openAITool);
	}

	public getSystemContext(): string {
		const serverLines: string[] = [];
		const serverTools = new Map<string, { name: string; tools: string[] }>();

		for (const [name, mapping] of this.mappings.entries()) {
			const existing = serverTools.get(mapping.serverPubkey);
			if (existing) {
				existing.tools.push(name);
			} else {
				serverTools.set(mapping.serverPubkey, {
					name: mapping.serverName,
					tools: [name]
				});
			}
		}

		for (const entry of serverTools.values()) {
			entry.tools.sort();
			serverLines.push(`- "${entry.name}": ${entry.tools.join(', ')}`);
		}

		if (serverLines.length === 0) {
			return '';
		}

		return [
			'You have access to tools from connected Model Context Protocol (MCP) servers:',
			...serverLines,
			'',
			'Use these tools when the user asks to interact with, query, or manage these servers.',
			'Always explain what you are doing before and after calling a tool.'
		].join('\n');
	}

	public clear(): void {
		this.mappings.clear();
		this.baseNameIndex.clear();
	}
}
