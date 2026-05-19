<script lang="ts">
	import { onMount } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChatSidebar from '$lib/components/chat/ChatSidebar.svelte';
	import Chat from '$lib/components/chat/Chat.svelte';
	import LLMConfig from '$lib/components/chat/LLMConfig.svelte';
	import { createConversation, listConversations } from '$lib/services/conversation-store.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import {
		DEFAULT_LLM_CONFIG,
		DEFAULT_OPENROUTER_KEY,
		PROVIDER_PRESETS,
		type LLMConfig as ChatLLMConfig
	} from '$lib/types/chat-types';

	let activeConversationId = $state<string | null>(null);
	let config = $state<ChatLLMConfig>({ ...DEFAULT_LLM_CONFIG });
	const selectedProvider = $derived(
		PROVIDER_PRESETS.find((preset) => preset.key === config.provider) ?? PROVIDER_PRESETS[0]
	);
	const modelLabel = $derived(
		config.model === 'auto' ? 'Auto free models' : config.model || 'No model'
	);
	const keyLabel = $derived(
		config.apiKey === DEFAULT_OPENROUTER_KEY ? 'Default key' : 'Custom key'
	);

	onMount(async () => {
		const conversations = await listConversations();
		if (conversations.length) {
			activeConversationId = conversations[0].id;
			return;
		}

		const conversation = await createConversation();
		activeConversationId = conversation.id;
	});
</script>

<SEO
	title="Chat"
	description="Try ContextVM with an LLM chat. Zero config with free models or bring your own API key."
	url="https://contextvm.com/chat"
/>

<Sidebar.Provider class="h-[calc(100vh-3.5rem)] overflow-hidden">
	<ChatSidebar bind:activeId={activeConversationId} />
	<main
		class="relative flex h-full flex-1 flex-col bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden"
	>
		<div
			class="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur"
		>
			<div class="flex items-center gap-2">
				<Sidebar.Trigger class="lg:hidden" />
				<div class="flex flex-col">
					<span class="text-sm font-semibold">Chat</span>
					<span class="text-xs text-muted-foreground">Context-aware LLM workspace</span>
				</div>
			</div>
			<div class="flex min-w-0 items-center gap-2">
				<div class="hidden min-w-0 items-center gap-2 md:flex">
					<span
						class="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground"
					>
						{selectedProvider?.label ?? config.provider}
					</span>
					<span
						class="max-w-[14rem] truncate rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground"
					>
						{modelLabel}
					</span>
					<span
						class="rounded-md border border-border bg-background/70 px-2 py-1 text-xs"
						class:text-primary={config.apiKey === DEFAULT_OPENROUTER_KEY}
						class:text-muted-foreground={config.apiKey !== DEFAULT_OPENROUTER_KEY}
					>
						{keyLabel}
					</span>
				</div>
				<LLMConfig bind:config />
			</div>
		</div>
		<div class="flex-1 min-h-0 overflow-hidden">
			<Chat bind:conversationId={activeConversationId} {config} />
		</div>
	</main>
</Sidebar.Provider>
