export type ToolApprovalTier = 'auto' | 'prompt' | 'payment';

export interface ToolCallData {
	id: string;
	name: string;
	arguments: string;
	status: 'pending' | 'running' | 'approved' | 'completed' | 'rejected' | 'error';
	result?: string;
	serverName?: string;
}

export interface ChatMessage {
	id: string;
	content: string;
	role: 'user' | 'assistant' | 'system' | 'tool';
	timestamp: Date;
	toolCalls?: ToolCallData[];
	toolCallId?: string;
	toolName?: string;
}

export interface Conversation {
	id: string;
	title: string;
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
}

export interface LLMConfig {
	provider: string;
	baseURL: string;
	apiKey: string;
	model: string;
}

export interface ProviderPreset {
	key: string;
	label: string;
	baseURL: string;
	requiresKey: boolean;
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
	{
		key: 'openrouter',
		label: 'OpenRouter',
		baseURL: 'https://openrouter.ai/api/v1',
		requiresKey: false
	},
	{
		key: 'openai',
		label: 'OpenAI',
		baseURL: 'https://api.openai.com/v1',
		requiresKey: true
	},
	{
		key: 'ollama',
		label: 'Ollama',
		baseURL: 'http://localhost:11434/v1',
		requiresKey: false
	},
	{
		key: 'lmstudio',
		label: 'LM Studio',
		baseURL: 'http://localhost:1234/v1',
		requiresKey: false
	},
	{
		key: 'custom',
		label: 'Custom',
		baseURL: '',
		requiresKey: false
	}
];

const ENV_OPENROUTER_KEY = (import.meta.env.PUBLIC_OPENROUTER_KEY ?? '').trim();

// Public demo key is intentionally obfuscated; users should provide their own.
export const DEFAULT_OPENROUTER_KEY =
	ENV_OPENROUTER_KEY ||
	(typeof window !== 'undefined'
		? atob(
				'c2stb3ItdjEtY2Y5ZWE3MjJiY2FmZThiMTAyMDRiYTBhMTVkODBiZGZmMjE5ZTM2NDQ1MDRjZjAxZGY0YjBmYjM3MGRjNGUyYg=='
			)
		: '');
export const DEFAULT_LLM_CONFIG: LLMConfig = {
	provider: 'openrouter',
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: DEFAULT_OPENROUTER_KEY,
	model: 'auto'
};

export function isAutoMode(config: LLMConfig): boolean {
	return config.model === 'auto' && config.baseURL.toLowerCase().includes('openrouter.ai');
}

export function isUsingDefaultKey(config: LLMConfig): boolean {
	return (
		config.baseURL.toLowerCase().includes('openrouter.ai') &&
		config.apiKey === DEFAULT_OPENROUTER_KEY
	);
}
