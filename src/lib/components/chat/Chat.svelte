<script lang="ts">
	import { DEFAULT_OPENROUTER_KEY, type ChatMessage, type LLMConfig } from '$lib/types/chat-types';
	import {
		getConversation,
		updateConversation,
		createConversation
	} from '$lib/services/conversation-store.svelte';
	import { LLMService } from '$lib/services/llm';
	import ChatBubble from '$lib/components/chat/ChatBubble.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import AutoModeBanner from '$lib/components/chat/AutoModeBanner.svelte';
	import { cn } from '$lib/utils.js';

	const starterPrompts = [
		'Map a clean MCP server workflow',
		'Compare two tool integration options',
		'Draft a ContextVM server announcement'
	];

	let {
		conversationId = $bindable(null),
		config
	}: {
		conversationId?: string | null;
		config: LLMConfig;
	} = $props();

	let messages = $state<ChatMessage[]>([]);
	let isStreaming = $state(false);
	let errorMessage = $state<string | null>(null);
	let llmService = $state<LLMService | null>(null);
	let abortController = $state<AbortController | null>(null);
	let scrollRef = $state<HTMLDivElement | null>(null);
	let conversationToken = $state(0);
	let isNearBottom = $state(true);
	let skipLoadId: string | null = null;

	const isAutoMode = $derived.by(
		() => config.model === 'auto' && config.baseURL.includes('openrouter.ai')
	);

	const usingDefaultKey = $derived.by(
		() => config.baseURL.includes('openrouter.ai') && config.apiKey === DEFAULT_OPENROUTER_KEY
	);

	$effect(() => {
		if (llmService) {
			llmService.reconfigure(config);
			return;
		}

		llmService = new LLMService(config);
	});

	$effect(() => {
		const activeId = conversationId ?? null;
		if (skipLoadId && activeId === skipLoadId) {
			skipLoadId = null;
			return;
		}
		conversationToken += 1;
		const token = conversationToken;
		abortController?.abort();
		abortController = null;
		isStreaming = false;
		errorMessage = null;

		if (!activeId) {
			messages = [];
			return;
		}

		(async () => {
			const conversation = await getConversation(activeId);
			if (token !== conversationToken) {
				return;
			}

			messages = conversation?.messages ?? [];
		})();

		return () => {
			abortController?.abort();
		};
	});

	$effect(() => {
		void messages.length;
		void isStreaming;
		if (!scrollRef) {
			return;
		}

		queueMicrotask(() => {
			if (isNearBottom) {
				scrollRef?.scrollTo({ top: scrollRef.scrollHeight, behavior: 'smooth' });
			}
		});
	});

	const updateIsNearBottom = () => {
		if (!scrollRef) {
			return;
		}

		const distance = scrollRef.scrollHeight - scrollRef.scrollTop - scrollRef.clientHeight;
		isNearBottom = distance < 160;
	};

	const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
		scrollRef?.scrollTo({ top: scrollRef.scrollHeight, behavior });
	};

	const handleStop = () => {
		abortController?.abort();
	};

	const handleSend = async (content: string) => {
		if (!content.trim() || !llmService || isStreaming) {
			return;
		}

		let activeId = conversationId;
		if (!activeId) {
			const newConv = await createConversation();
			activeId = newConv.id;
			skipLoadId = activeId;
			conversationId = activeId;
		}

		errorMessage = null;
		const token = conversationToken;
		let persistTimeout: ReturnType<typeof setTimeout> | null = null;
		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			content,
			role: 'user',
			timestamp: new Date()
		};

		const outgoingMessages = [...messages, userMessage];
		let workingMessages = outgoingMessages;
		messages = workingMessages;
		await updateConversation(activeId, workingMessages);

		const assistantId = crypto.randomUUID();
		let assistantContent = '';
		let assistantMessage: ChatMessage = {
			id: assistantId,
			content: '',
			role: 'assistant',
			timestamp: new Date()
		};

		const syncMessages = () => {
			if (token !== conversationToken) {
				return;
			}

			messages = [...workingMessages];
		};

		const schedulePersist = () => {
			if (persistTimeout) {
				return;
			}

			persistTimeout = setTimeout(async () => {
				persistTimeout = null;
				await updateConversation(activeId, workingMessages);
			}, 1000);
		};

		workingMessages = [...workingMessages, assistantMessage];
		syncMessages();

		isStreaming = true;
		const controller = new AbortController();
		abortController = controller;

		try {
			const result = await llmService.sendMessage(outgoingMessages, {
				signal: controller.signal,
				onDelta: (delta) => {
					assistantContent += delta;
					assistantMessage = { ...assistantMessage, content: assistantContent };
					workingMessages = workingMessages.map((message) =>
						message.id === assistantId ? assistantMessage : message
					);
					syncMessages();
					schedulePersist();
					if (isNearBottom) {
						scrollToBottom('auto');
					}
				},
				onReset: () => {
					assistantContent = '';
					assistantMessage = { ...assistantMessage, content: '' };
					workingMessages = workingMessages.map((message) =>
						message.id === assistantId ? assistantMessage : message
					);
					syncMessages();
					schedulePersist();
				}
			});

			if (result.content && result.content !== assistantContent) {
				assistantContent = result.content;
				assistantMessage = { ...assistantMessage, content: assistantContent };
				workingMessages = workingMessages.map((message) =>
					message.id === assistantId ? assistantMessage : message
				);
				syncMessages();
			}
		} catch (error) {
			if (controller.signal.aborted) {
				if (!assistantContent) {
					workingMessages = workingMessages.filter((message) => message.id !== assistantId);
					syncMessages();
				}
				return;
			}

			const errorText = error instanceof Error ? error.message : 'Something went wrong.';
			if (token === conversationToken) {
				errorMessage = errorText;
			}
			assistantMessage = { ...assistantMessage, content: `Error: ${errorText}` };
			workingMessages = workingMessages.map((chatMessage) =>
				chatMessage.id === assistantId ? assistantMessage : chatMessage
			);
			syncMessages();
		} finally {
			if (persistTimeout) {
				clearTimeout(persistTimeout);
				persistTimeout = null;
			}
			if (token === conversationToken) {
				isStreaming = false;
				abortController = null;
			}
			await updateConversation(activeId, workingMessages);
		}
	};
</script>

<div class="flex h-full flex-col">
	{#if isAutoMode}
		<div class="border-b border-border bg-background/80 px-4 py-3">
			<AutoModeBanner {usingDefaultKey} />
		</div>
	{/if}
	<div class="flex-1 overflow-auto" bind:this={scrollRef} onscroll={updateIsNearBottom}>
		{#if !conversationId}
			<div class="flex h-full items-center justify-center px-6">
				<p class="max-w-sm text-center text-sm text-muted-foreground">
					Choose a conversation or start a new one to begin chatting.
				</p>
			</div>
		{:else if messages.length === 0}
			<div
				class="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-5 px-6 text-center"
			>
				<div class="space-y-2">
					<p class="text-lg font-semibold text-foreground">Ready when you are.</p>
					<p class="text-sm leading-6 text-muted-foreground">
						Start with a server idea, tool workflow, or integration question.
					</p>
				</div>
				<div class="grid w-full gap-2 sm:grid-cols-3">
					{#each starterPrompts as prompt (prompt)}
						<button
							type="button"
							class="rounded-lg border border-border bg-background/70 px-3 py-3 text-left text-sm leading-5 text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
							disabled={isStreaming}
							onclick={() => handleSend(prompt)}
						>
							{prompt}
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<div class="mx-auto max-w-4xl space-y-4 px-4 py-6">
				{#each messages as message (message.id)}
					<ChatBubble {message} />
				{/each}
			</div>
		{/if}
	</div>
	<div class="border-t border-border bg-background/80 px-4 py-4">
		<div class={cn('mx-auto max-w-4xl space-y-2', errorMessage ? 'pb-2' : '')}>
			{#if errorMessage}
				<p
					class="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive"
				>
					{errorMessage}
				</p>
			{/if}
			<ChatInput {isStreaming} onSend={handleSend} onStop={handleStop} />
		</div>
	</div>
</div>
