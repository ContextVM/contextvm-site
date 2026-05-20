<script lang="ts">
	import { DEFAULT_OPENROUTER_KEY, type ChatMessage, type LLMConfig } from '$lib/types/chat-types';
	import {
		createConversation,
		getConversation,
		updateConversation
	} from '$lib/services/conversation-store.svelte';
	import { LLMService } from '$lib/services/llm';
	import ChatBubble from '$lib/components/chat/ChatBubble.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import AutoModeBanner from '$lib/components/chat/AutoModeBanner.svelte';
	import { cn } from '$lib/utils.js';
	import ServerIcon from '@lucide/svelte/icons/server';
	import GitBranchIcon from '@lucide/svelte/icons/git-branch';
	import PlugIcon from '@lucide/svelte/icons/plug';
	import TerminalIcon from '@lucide/svelte/icons/terminal';

	type PromptItem = { text: string; icon: typeof ServerIcon };

	const PROMPT_POOL: PromptItem[] = [
		{
			text: 'Find MCP servers that offer code analysis tools',
			icon: ServerIcon
		},
		{
			text: 'List all available tools on my connected servers',
			icon: ServerIcon
		},
		{
			text: 'Compare capabilities of two MCP server providers',
			icon: ServerIcon
		},
		{
			text: 'Design a multi-step workflow using MCP tools',
			icon: GitBranchIcon
		},
		{
			text: 'Chain a file reader and a summarizer tool together',
			icon: GitBranchIcon
		},
		{
			text: 'Build an automated code review pipeline with MCP',
			icon: GitBranchIcon
		},
		{
			text: 'Help me connect a new MCP server via Nostr relay',
			icon: PlugIcon
		},
		{
			text: 'Generate a server announcement event for my tools',
			icon: PlugIcon
		},
		{
			text: 'Walk me through setting up a ContextVM transport',
			icon: PlugIcon
		},
		{
			text: 'Use the connected tools to analyze this codebase',
			icon: TerminalIcon
		},
		{
			text: 'Run a tool and explain the output step by step',
			icon: TerminalIcon
		},
		{
			text: 'Draft a Nostr event to publish my MCP server',
			icon: TerminalIcon
		}
	];

	const shuffleWithSeed = <T,>(items: T[], seed: number) => {
		let value = (seed || 1) % 2147483647;
		const random = () => {
			value = (value * 48271) % 2147483647;
			return (value - 1) / 2147483646;
		};

		const result = [...items];
		for (let i = result.length - 1; i > 0; i -= 1) {
			const j = Math.floor(random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}

		return result;
	};

	let {
		conversationId = $bindable(null),
		config,
		lastUsedModel = $bindable('')
	}: {
		conversationId?: string | null;
		config: LLMConfig;
		lastUsedModel?: string;
	} = $props();

	let messages = $state<ChatMessage[]>([]);
	let isStreaming = $state(false);
	let errorMessage = $state<string | null>(null);
	let llmService: LLMService | null = null;
	let abortController: AbortController | null = null;
	let scrollRef = $state<HTMLDivElement | null>(null);
	let conversationToken = $state(0);
	let isNearBottom = $state(true);
	let skipLoadId: string | null = null;
	let promptSeed = $state(0);

	const starterPrompts = $derived.by(() => shuffleWithSeed(PROMPT_POOL, promptSeed).slice(0, 3));

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
		promptSeed += 1;
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
		lastUsedModel = '';

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

		try {
			await updateConversation(activeId, workingMessages);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to save message.';
			return;
		}

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
				onReset: (model) => {
					assistantContent = '';
					assistantMessage = { ...assistantMessage, content: '' };
					workingMessages = workingMessages.map((message) =>
						message.id === assistantId ? assistantMessage : message
					);
					syncMessages();
					schedulePersist();
					if (token === conversationToken) {
						lastUsedModel = model;
					}
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
			if (token === conversationToken) {
				lastUsedModel = result.model;
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
			try {
				await updateConversation(activeId, workingMessages);
			} catch (_error) {
				// Conversation might have been deleted mid-stream, safe to ignore.
			}
		}
	};
</script>

<div class="flex h-full min-h-0 flex-col">
	{#if isAutoMode}
		<div class="border-b border-border bg-background/80 px-4 py-3">
			<AutoModeBanner {usingDefaultKey} />
		</div>
	{/if}
	<div class="min-h-0 flex-1 overflow-auto" bind:this={scrollRef} onscroll={updateIsNearBottom}>
		{#if !conversationId}
			<div class="flex h-full items-center justify-center px-6">
				<p class="max-w-sm text-center text-sm text-muted-foreground">
					Choose a conversation or start a new one to begin chatting.
				</p>
			</div>
		{:else if messages.length === 0}
			<div
				class="animate-fade-in-up mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center"
			>
				<div class="relative">
					<div class="absolute inset-0 rounded-2xl bg-primary/10 blur-2xl"></div>
					<div
						class="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background text-sm font-semibold text-primary"
					>
						CV
					</div>
				</div>
				<div class="space-y-2">
					<p class="text-xl font-semibold text-foreground">What can I help you build?</p>
					<p class="text-sm leading-6 text-muted-foreground">
						Orchestrate MCP servers, explore tools, and manage workflows — all from this chat.
					</p>
				</div>
				<div class="grid w-full gap-3 sm:grid-cols-3">
					{#each starterPrompts as prompt (prompt.text)}
						{@const Icon = prompt.icon}
						<button
							type="button"
							class="group flex h-full items-start gap-3 rounded-xl border border-border/60 bg-card/60 px-3.5 py-3 text-left text-sm leading-5 text-foreground shadow-sm backdrop-blur transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card/80 disabled:cursor-not-allowed disabled:opacity-60"
							disabled={isStreaming}
							onclick={() => handleSend(prompt.text)}
						>
							<span
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
							>
								<Icon class="h-4 w-4" />
							</span>
							<span class="min-w-0 text-left">{prompt.text}</span>
						</button>
					{/each}
				</div>
				<p class="text-[11px] text-muted-foreground/60">
					Press Enter to send · Shift+Enter for new line
				</p>
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
