import OpenAI from 'openai';
import type {
	ChatCompletionMessageParam,
	ChatCompletionTool
} from 'openai/resources/chat/completions';
import { isAutoMode, type ChatMessage, type LLMConfig } from '$lib/types/chat-types';
import { FreeModelRotator, isRetryableError } from '$lib/services/auto-mode';

export interface SendMessageOptions {
	signal?: AbortSignal;
	onDelta?: (delta: string) => void;
	onReset?: (model: string) => void;
	tools?: ChatCompletionTool[];
}

export interface SendMessageResult {
	content: string;
	model: string;
	finishReason?: string;
	toolCalls?: Array<{
		id: string;
		functionName: string;
		arguments: string;
	}>;
}

export { APIError } from 'openai';

export function normalizeBaseURL(baseURL: string): string {
	let trimmed = baseURL.trim().replace(/\/+$/, '');

	if (!trimmed) {
		return '';
	}

	for (const suffix of ['/chat/completions', '/completions']) {
		if (trimmed.endsWith(suffix)) {
			trimmed = trimmed.slice(0, -suffix.length);
		}
	}

	if (/\/v\d+$/.test(trimmed)) {
		return trimmed;
	}

	return `${trimmed}/v1`;
}

function toOpenAiMessages(messages: ChatMessage[]): ChatCompletionMessageParam[] {
	return messages.map((message) => {
		if (message.role === 'tool') {
			return {
				role: 'tool' as const,
				tool_call_id: message.toolCallId ?? message.id,
				content: message.content
			};
		}

		if (message.role === 'assistant' && message.toolCalls?.length) {
			return {
				role: 'assistant' as const,
				content: message.content || null,
				tool_calls: message.toolCalls.map((toolCall) => ({
					id: toolCall.id,
					type: 'function' as const,
					function: {
						name: toolCall.name,
						arguments: toolCall.arguments
					}
				}))
			};
		}

		return {
			role: message.role,
			content: message.content
		};
	});
}

function getDefaultHeaders(baseURL: string): Record<string, string> | undefined {
	const isOpenRouter = baseURL.includes('openrouter.ai');
	return isOpenRouter && typeof window !== 'undefined'
		? {
				'HTTP-Referer': window.location.origin,
				'X-Title': 'ContextVM'
			}
		: undefined;
}

export class LLMService {
	private config: LLMConfig;
	private client: OpenAI;
	private autoMode: FreeModelRotator | null = null;
	private lastUsedModel: string | null = null;

	constructor(config: LLMConfig) {
		this.config = config;
		this.client = this.createClient(config);
		this.autoMode = isAutoMode(config) ? new FreeModelRotator(this.client) : null;
	}

	public reconfigure(config: LLMConfig): void {
		this.config = config;
		this.client = this.createClient(config);
		this.autoMode = isAutoMode(config) ? new FreeModelRotator(this.client) : null;
	}

	public getConfig(): LLMConfig {
		return this.config;
	}

	public getActiveModel(): string | null {
		return this.lastUsedModel;
	}

	public async fetchModels(signal?: AbortSignal): Promise<string[]> {
		const response = signal
			? await this.client.models.list({}, { signal })
			: await this.client.models.list();
		return response.data.map((model) => model.id);
	}

	public async testConnection(): Promise<void> {
		await this.client.models.list();
	}

	public async sendMessage(
		messages: ChatMessage[],
		options: SendMessageOptions = {}
	): Promise<SendMessageResult> {
		const { onDelta, onReset, signal, tools } = options;

		if (!this.autoMode || this.config.model !== 'auto') {
			if (!this.config.model.trim()) {
				throw new Error('Select a model before sending a message.');
			}

			return this.streamChat(this.config.model, messages, onDelta, signal, tools);
		}

		const models = await this.autoMode.getModels();
		if (models.length === 0) {
			throw new Error('No free models available');
		}

		let model = await this.autoMode.getCurrentModel();
		let lastError: unknown;
		const maxAttempts = Math.min(models.length, 3);

		for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
			if (!model) {
				break;
			}

			if (attempt > 0) {
				onReset?.(model);
			}

			try {
				return await this.streamChat(model, messages, onDelta, signal, tools);
			} catch (error) {
				lastError = error;

				if (!isRetryableError(error)) {
					throw error;
				}

				model = await this.autoMode.advanceModel();
			}
		}

		throw lastError instanceof Error
			? lastError
			: new Error('Failed to send message with free models');
	}

	private createClient(config: LLMConfig): OpenAI {
		const baseURL = normalizeBaseURL(config.baseURL);

		return new OpenAI({
			apiKey: config.apiKey,
			baseURL,
			defaultHeaders: getDefaultHeaders(baseURL),
			dangerouslyAllowBrowser: true
		});
	}

	private async streamChat(
		model: string,
		messages: ChatMessage[],
		onDelta: ((delta: string) => void) | undefined,
		signal: AbortSignal | undefined,
		tools: ChatCompletionTool[] | undefined
	): Promise<SendMessageResult> {
		const stream = await this.client.chat.completions.create(
			{
				model,
				messages: toOpenAiMessages(messages),
				stream: true,
				...(tools?.length ? { tools } : {})
			},
			{
				signal
			}
		);

		let content = '';
		let finishReason = 'stop';
		const toolCallAccumulator = new Map<number, { id: string; name: string; args: string }>();

		for await (const chunk of stream) {
			const choice = chunk.choices[0];
			if (!choice) {
				continue;
			}

			if (choice.finish_reason) {
				finishReason = choice.finish_reason;
			}

			const delta = choice.delta;
			if (delta?.content) {
				content += delta.content;
				onDelta?.(delta.content);
			}

			if (delta?.tool_calls) {
				for (const toolCall of delta.tool_calls) {
					const existing = toolCallAccumulator.get(toolCall.index) ?? {
						id: '',
						name: '',
						args: ''
					};

					if (toolCall.id) {
						existing.id = toolCall.id;
					}
					if (toolCall.function?.name) {
						existing.name += toolCall.function.name;
					}
					if (toolCall.function?.arguments) {
						existing.args += toolCall.function.arguments;
					}

					toolCallAccumulator.set(toolCall.index, existing);
				}
			}
		}

		const toolCalls =
			toolCallAccumulator.size > 0
				? [...toolCallAccumulator.values()]
						.filter((toolCall) => toolCall.id && toolCall.name)
						.map((toolCall) => ({
							id: toolCall.id,
							functionName: toolCall.name,
							arguments: toolCall.args
						}))
				: undefined;

		this.lastUsedModel = model;
		return { content, model, finishReason, toolCalls };
	}
}
