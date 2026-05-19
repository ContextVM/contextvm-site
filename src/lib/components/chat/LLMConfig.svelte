<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import ProviderCombobox from '$lib/components/chat/ProviderCombobox.svelte';
	import ModelCombobox from '$lib/components/chat/ModelCombobox.svelte';
	import {
		DEFAULT_LLM_CONFIG,
		DEFAULT_OPENROUTER_KEY,
		PROVIDER_PRESETS,
		type LLMConfig,
		type ProviderPreset
	} from '$lib/types/chat-types';

	const STORAGE_KEY = 'contextvm.chat.config';
	const sanitizeConfig = (current: LLMConfig) => ({ ...current, apiKey: '' });

	let { config = $bindable({ ...DEFAULT_LLM_CONFIG }) }: { config?: LLMConfig } = $props();
	let hasLoadedStoredConfig = $state(false);
	let lastStoredConfig = $state('');
	const selectedProvider = $derived(
		PROVIDER_PRESETS.find((preset) => preset.key === config.provider) ?? PROVIDER_PRESETS[0]
	);
	const usingDefaultKey = $derived(
		config.provider === 'openrouter' && config.apiKey === DEFAULT_OPENROUTER_KEY
	);
	const keyStatus = $derived.by(() => {
		if (usingDefaultKey) {
			return 'Bundled public key';
		}

		if (config.apiKey.trim()) {
			return 'Custom key';
		}

		return selectedProvider?.requiresKey ? 'Key required' : 'No key';
	});
	const modelStatus = $derived(
		config.model === 'auto' ? 'Auto free models' : config.model || 'No model selected'
	);

	const handleProviderSelect = (preset: ProviderPreset) => {
		const nextModel =
			preset.key === 'openrouter' ? 'auto' : config.model === 'auto' ? '' : config.model;
		const nextApiKey =
			preset.key === 'openrouter'
				? config.apiKey || DEFAULT_OPENROUTER_KEY
				: config.apiKey === DEFAULT_OPENROUTER_KEY
					? ''
					: config.apiKey;
		const nextBaseURL = preset.key === 'custom' ? config.baseURL : preset.baseURL;

		config = {
			...config,
			provider: preset.key,
			baseURL: nextBaseURL,
			apiKey: nextApiKey,
			model: nextModel
		};
	};

	const resetConfig = () => {
		config = { ...DEFAULT_LLM_CONFIG };
	};

	const useDefaultKey = () => {
		config = { ...config, apiKey: DEFAULT_OPENROUTER_KEY };
	};

	const handleBaseUrlInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		config = { ...config, baseURL: target.value };
	};

	const handleApiKeyInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		config = { ...config, apiKey: target.value };
	};

	const handleModelChange = (modelId: string) => {
		config = { ...config, model: modelId };
	};

	onMount(() => {
		if (!browser) {
			return;
		}

		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			hasLoadedStoredConfig = true;
			return;
		}

		try {
			const stored = JSON.parse(raw) as Partial<LLMConfig>;
			const { apiKey: _ignored, ...storedSafe } = stored;
			const nextConfig = { ...DEFAULT_LLM_CONFIG, ...storedSafe };
			if (nextConfig.provider === 'openrouter' && !nextConfig.apiKey) {
				nextConfig.apiKey = DEFAULT_OPENROUTER_KEY;
			}
			if (nextConfig.provider !== 'openrouter' && nextConfig.model === 'auto') {
				nextConfig.model = '';
			}
			config = nextConfig;
		} catch (_error) {
			config = { ...DEFAULT_LLM_CONFIG };
		} finally {
			hasLoadedStoredConfig = true;
		}
	});

	$effect(() => {
		if (!browser || !hasLoadedStoredConfig) {
			return;
		}

		const serialized = JSON.stringify(sanitizeConfig(config));
		if (serialized === lastStoredConfig) {
			return;
		}

		localStorage.setItem(STORAGE_KEY, serialized);
		lastStoredConfig = serialized;
	});
</script>

<Sheet.Root>
	<Sheet.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
		<SettingsIcon class="h-4 w-4" />
		<span class="sr-only">Open settings</span>
	</Sheet.Trigger>
	<Sheet.Content side="right" class="w-full max-w-md">
		<Sheet.Header>
			<Sheet.Title>Chat settings</Sheet.Title>
			<Sheet.Description>
				Choose the provider, model, and key used for this browser.
			</Sheet.Description>
		</Sheet.Header>
		<div class="space-y-5 py-6">
			<div class="rounded-xl border border-border bg-muted/30 p-3">
				<div class="grid gap-2 text-sm">
					<div class="flex items-center justify-between gap-3">
						<span class="text-muted-foreground">Provider</span>
						<span class="truncate font-medium">{selectedProvider?.label ?? config.provider}</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<span class="text-muted-foreground">Model</span>
						<span class="truncate font-medium">{modelStatus}</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<span class="text-muted-foreground">Key</span>
						<span
							class="inline-flex max-w-[13rem] items-center gap-1.5 truncate rounded-md border border-border bg-background px-2 py-1 text-xs"
							class:text-primary={usingDefaultKey}
							class:text-destructive={selectedProvider?.requiresKey && !config.apiKey.trim()}
						>
							<KeyRoundIcon class="h-3.5 w-3.5 shrink-0" />
							<span class="truncate">{keyStatus}</span>
						</span>
					</div>
				</div>
			</div>
			<div class="space-y-2">
				<Label>Provider</Label>
				<ProviderCombobox value={config.provider} onSelect={handleProviderSelect} />
			</div>
			<div class="space-y-2">
				<Label>Base URL</Label>
				<Input
					value={config.baseURL}
					oninput={handleBaseUrlInput}
					placeholder="https://api.example.com/v1"
				/>
				<p class="text-xs leading-5 text-muted-foreground">
					Pasted completion endpoints are normalized automatically.
				</p>
			</div>
			<div class="space-y-2">
				<Label>API key</Label>
				<Input
					type="password"
					value={config.apiKey}
					oninput={handleApiKeyInput}
					placeholder="sk-..."
				/>
				{#if config.provider === 'openrouter' && !usingDefaultKey}
					<Button variant="ghost" size="sm" class="h-7 px-0 text-xs" onclick={useDefaultKey}>
						Use default OpenRouter key
					</Button>
				{:else if usingDefaultKey}
					<p class="text-xs leading-5 text-muted-foreground">
						The default key is public and limited to free-model usage.
					</p>
				{:else if selectedProvider?.requiresKey && !config.apiKey.trim()}
					<p class="text-xs leading-5 text-destructive">This provider needs your API key.</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label>Model</Label>
				<ModelCombobox
					provider={config.provider}
					baseURL={config.baseURL}
					apiKey={config.apiKey}
					value={config.model}
					onChange={handleModelChange}
				/>
			</div>
			<div class="flex items-center justify-between border-t border-border pt-4">
				<p class="text-xs text-muted-foreground">Provider and model persist on this device.</p>
				<Button variant="outline" size="sm" class="gap-1.5" onclick={resetConfig}>
					<RotateCcwIcon class="h-3.5 w-3.5" />
					Reset
				</Button>
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
