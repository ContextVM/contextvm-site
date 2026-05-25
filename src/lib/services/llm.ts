import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { isAutoMode, type ChatMessage, type LLMConfig } from '$lib/types/chat-types';
import { FreeModelRotator, isRetryableError } from '$lib/services/auto-mode';

export interface SendMessageOptions {
	signal?: AbortSignal;
	onDelta?: (delta: string) => void;
	onReset?: (model: string) => void;
}

export interface SendMessageResult {
	content: string;
	model: string;
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
	return messages.map((message) => ({
		role: message.role,
		content: message.content
	}));
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

	public static async fetchModelList(
		baseURL: string,
		apiKey: string,
		signal?: AbortSignal
	): Promise<string[]> {
		const normalizedBaseURL = normalizeBaseURL(baseURL);
		const client = new OpenAI({
			apiKey,
			baseURL: normalizedBaseURL,
			defaultHeaders: getDefaultHeaders(normalizedBaseURL),
			dangerouslyAllowBrowser: true
		});

		const response = await client.models.list(signal ? { signal } : undefined);
		return response.data.map((model) => model.id);
	}

	public async fetchModels(signal?: AbortSignal): Promise<string[]> {
		const response = await this.client.models.list(signal ? { signal } : undefined);
		return response.data.map((model) => model.id);
	}

	public async testConnection(): Promise<void> {
		await this.client.models.list();
	}

	public async sendMessage(
		messages: ChatMessage[],
		options: SendMessageOptions = {}
	): Promise<SendMessageResult> {
		const { onDelta, onReset, signal } = options;

		if (!this.autoMode || this.config.model !== 'auto') {
			if (!this.config.model.trim()) {
				throw new Error('Select a model before sending a message.');
			}

			return this.streamChat(this.config.model, messages, onDelta, signal);
		}

		const models = await this.autoMode.getModels();
		if (models.length === 0) {
			throw new Error('No free models available');
		}

		let model = await this.autoMode.getCurrentModel();
		let lastError: unknown;
		const maxAttempts = models.length;

		for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
			if (!model) {
				break;
			}

			if (attempt > 0) {
				onReset?.(model);
			}

			try {
				return await this.streamChat(model, messages, onDelta, signal);
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
		signal: AbortSignal | undefined
	): Promise<SendMessageResult> {
		const stream = await this.client.chat.completions.create(
			{
				model,
				messages: toOpenAiMessages(messages),
				stream: true
			},
			{
				signal
			}
		);

		let content = '';

		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta?.content ?? '';

			if (delta) {
				content += delta;
				onDelta?.(delta);
			}
		}

		this.lastUsedModel = model;
		return { content, model };
	}
}
