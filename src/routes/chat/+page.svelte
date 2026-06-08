<script lang="ts">
	import { onMount } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChatSidebar from '$lib/components/chat/ChatSidebar.svelte';
	import Chat from '$lib/components/chat/Chat.svelte';
	import LLMConfig from '$lib/components/chat/LLMConfig.svelte';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { createConversation, listConversations } from '$lib/services/conversation-store.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import {
		DEFAULT_LLM_CONFIG,
		PROVIDER_PRESETS,
		isUsingDefaultKey,
		type LLMConfig as ChatLLMConfig
	} from '$lib/types/chat-types';
	import { mcpClientService } from '$lib/services/mcpClient.svelte';
	import PlugIcon from '@lucide/svelte/icons/plug';

	let activeConversationId = $state<string | null>(null);
	let config = $state<ChatLLMConfig>({ ...DEFAULT_LLM_CONFIG });
	let lastUsedModel = $state('');
	let autoApproveTools = $state(false);
	const selectedProvider = $derived(
		PROVIDER_PRESETS.find((preset) => preset.key === config.provider) ?? PROVIDER_PRESETS[0]
	);
	const modelLabel = $derived(
		config.model === 'auto' ? 'Auto free models' : config.model || 'No model'
	);
	const usingDefaultKey = $derived(isUsingDefaultKey(config));
	const keyLabel = $derived(usingDefaultKey ? 'Default key' : 'Custom key');
	const connectedServerCount = $derived(mcpClientService.clients.size);

	onMount(async () => {
		try {
			const conversations = await listConversations();
			if (conversations.length) {
				activeConversationId = conversations[0].id;
				return;
			}

			const conversation = await createConversation();
			activeConversationId = conversation.id;
		} catch (error) {
			console.error('Failed to initialize chat:', error);
		}
	});
</script>

<SEO
	title="Chat"
	description="Try ContextVM with an LLM chat. Zero config with free models or bring your own API key."
	url="https://contextvm.com/chat"
/>

<Sidebar.Provider class="h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden">
	<ChatSidebar bind:activeId={activeConversationId} />
	<main
		class="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background"
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
					{#if lastUsedModel}
						<span
							class="max-w-[14rem] truncate rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary"
						>
							Last used: {lastUsedModel}
						</span>
					{/if}
					{#if connectedServerCount > 0}
						<span
							class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-300"
						>
							<PlugIcon class="h-3 w-3" />
							{connectedServerCount} server{connectedServerCount > 1 ? 's' : ''}
						</span>
					{/if}
					<span
						class="rounded-md border border-border bg-background/70 px-2 py-1 text-xs"
						class:text-primary={usingDefaultKey}
						class:text-muted-foreground={!usingDefaultKey}
					>
						{keyLabel}
					</span>
				</div>
				<div class="flex items-center gap-1.5">
					<Switch bind:checked={autoApproveTools} size="sm" />
					<span class="hidden text-[11px] text-muted-foreground sm:inline">Auto-approve</span>
				</div>
				<LLMConfig bind:config />
			</div>
		</div>
		<div class="min-h-0 flex-1 overflow-hidden">
			<Chat
				bind:conversationId={activeConversationId}
				bind:lastUsedModel
				{config}
				{autoApproveTools}
			/>
		</div>
	</main>
</Sidebar.Provider>
