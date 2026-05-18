export interface ChatMessage {
	id: string;
	content: string;
	role: 'user' | 'assistant' | 'system';
	timestamp: Date;
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

export const DEFAULT_OPENROUTER_KEY =
	typeof window !== 'undefined'
		? atob('c2stb3ItdjEtY2Y5ZWE3MjJiY2FmZThiMTAyMDRiYTBhMTVkODBiZGZmMjE5ZTM2NDQ1MDRjZjAxZGY0YjBmYjM3MGRjNGUyYg==')
		: '';

export const DEFAULT_LLM_CONFIG: LLMConfig = {
	provider: 'openrouter',
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: DEFAULT_OPENROUTER_KEY,
	model: 'auto'
};
