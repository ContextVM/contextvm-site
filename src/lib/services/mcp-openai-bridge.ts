import type { ToolApprovalTier } from '$lib/types/chat-types';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

const MAX_SERVER_PREFIX_LENGTH = 30;
const MAX_FUNCTION_NAME_LENGTH = 64;
const PROMPT_TIER_KEYWORDS = ['manage', 'delete', 'publish', 'update', 'create', 'write', 'send'];

interface ToolMapping {
	serverPubkey: string;
	serverName: string;
	originalName: string;
	tier: ToolApprovalTier;
	openAITool: ChatCompletionTool;
}

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
	const { $schema: _schema, ...parameters } = (inputSchema as Record<string, unknown>) ?? {
		type: 'object',
		properties: {}
	};

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

function classifyToolTier(tool: Tool): ToolApprovalTier {
	const searchable = `${tool.name} ${tool.description ?? ''}`.toLowerCase();
	return PROMPT_TIER_KEYWORDS.some((keyword) => searchable.includes(keyword)) ? 'prompt' : 'auto';
}

function parseToolArguments(rawArgs: string): Record<string, unknown> | null {
	if (!rawArgs.trim()) {
		return {};
	}

	try {
		const parsed = JSON.parse(rawArgs) as unknown;
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? (parsed as Record<string, unknown>)
			: null;
	} catch (_error) {
		return null;
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

	public register(
		serverPubkey: string,
		serverName: string,
		tools: Tool[],
		tierOverrides?: Map<string, ToolApprovalTier>
	): void {
		for (const tool of tools) {
			const baseName = buildNamespacedName(serverName, tool.name);
			const existing = this.mappings.get(baseName);
			
			let namespacedName = baseName;
			if (existing && (existing.serverPubkey !== serverPubkey || existing.originalName !== tool.name)) {
				// Relocate original conflicting entry to its disambiguated name
				const origDisambiguator = `_${existing.serverPubkey.slice(0, 4).toLowerCase() || 'srv'}`;
				const origNewName = buildNamespacedName(existing.serverName, existing.originalName, origDisambiguator);
				
				this.mappings.delete(baseName);
				this.mappings.set(origNewName, {
					...existing,
					openAITool: withFunctionName(existing.openAITool, origNewName)
				});
				
				// New tool also gets disambiguated
				const newDisambiguator = `_${serverPubkey.slice(0, 4).toLowerCase() || 'srv'}`;
				namespacedName = buildNamespacedName(serverName, tool.name, newDisambiguator);
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
				openAITool
			});
		}
	}

	public resolve(namespacedName: string, rawArgs: string): ResolvedToolCall | null {
		const mapping = this.mappings.get(namespacedName);
		const args = parseToolArguments(rawArgs);

		if (!mapping || !args) {
			return null;
		}

		return {
			serverPubkey: mapping.serverPubkey,
			serverName: mapping.serverName,
			originalToolName: mapping.originalName,
			args,
			tier: mapping.tier
		};
	}

	public getOpenAITools(): ChatCompletionTool[] {
		return [...this.mappings.values()].map((mapping) => mapping.openAITool);
	}

	public getSystemContext(): string {
		const serverLines: string[] = [];
		const seen = new Set<string>();

		for (const mapping of this.mappings.values()) {
			if (seen.has(mapping.serverPubkey)) {
				continue;
			}

			seen.add(mapping.serverPubkey);
			serverLines.push(`- "${mapping.serverName}": provides tools for MCP operations`);
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
	}
}
