<script lang="ts">
	import {
		isAutoMode,
		isUsingDefaultKey,
		type ChatMessage,
		type LLMConfig
	} from '$lib/types/chat-types';
	import {
		createConversation,
		getConversation,
		updateConversation
	} from '$lib/services/conversation-store.svelte';
	import { LLMService } from '$lib/services/llm';
	import { AgentOrchestrator } from '$lib/services/agent-orchestrator';
	import { mcpClientService } from '$lib/services/mcpClient.svelte';
	import ChatBubble from '$lib/components/chat/ChatBubble.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import AutoModeBanner from '$lib/components/chat/AutoModeBanner.svelte';
	import { cn } from '$lib/utils.js';
	import ServerIcon from '@lucide/svelte/icons/server';
	import GitBranchIcon from '@lucide/svelte/icons/git-branch';
	import PlugIcon from '@lucide/svelte/icons/plug';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

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

	const shuffleArray = <T,>(items: T[]) => {
		const result = [...items];
		for (let i = result.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
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
	let isPreparingTools = $state(false);
	let errorMessage = $state<string | null>(null);
	let llmService: LLMService | null = null;
	let orchestrator: AgentOrchestrator | null = null;
	let abortController: AbortController | null = null;
	let scrollRef = $state<HTMLDivElement | null>(null);
	// Intentionally non-reactive: used only as a stale-update guard token.
	let conversationToken = 0;
	let loadedConversationId: string | null = null;
	let isNearBottom = $state(true);
	let starterPrompts = $state<PromptItem[]>(shuffleArray(PROMPT_POOL).slice(0, 3));
	let persistTimeout: ReturnType<typeof setTimeout> | null = null;
	let pendingPersist: { id: string; messages: ChatMessage[] } | null = null;

	const autoModeEnabled = $derived(isAutoMode(config));
	const usingDefaultKey = $derived(isUsingDefaultKey(config));

	const approveToolCall = (toolCallId: string) => {
		orchestrator?.approveToolCall(toolCallId);
	};

	const rejectToolCall = (toolCallId: string) => {
		orchestrator?.rejectToolCall(toolCallId);
	};

	const rejectPendingApprovals = (reason: Error) => {
		orchestrator?.rejectPendingApprovals(reason);
	};

	$effect(() => {
		if (!llmService) {
			llmService = new LLMService(config);
		} else {
			llmService.reconfigure(config);
		}

		if (llmService && !orchestrator) {
			orchestrator = new AgentOrchestrator({
				llmService,
				mcpClientService
			});
		}
	});

	$effect(() => {
		const activeId = conversationId ?? null;
		if (activeId === loadedConversationId) {
			return;
		}

		loadedConversationId = activeId;
		conversationToken += 1;
		const token = conversationToken;
		abortController?.abort();
		rejectPendingApprovals(new Error('Conversation changed'));
		abortController = null;
		isStreaming = false;
		isPreparingTools = false;
		errorMessage = null;
		lastUsedModel = '';

		if (!activeId) {
			messages = [];
			return;
		}

		(async () => {
			try {
				const conversation = await getConversation(activeId);
				if (token !== conversationToken) {
					return;
				}

				messages = conversation?.messages ?? [];
			} catch (error) {
				if (token !== conversationToken) {
					return;
				}

				errorMessage =
					error instanceof Error ? error.message : 'Failed to load conversation messages.';
				messages = [];
			}
		})();

		return () => {
			abortController?.abort();
			rejectPendingApprovals(new Error('Conversation changed'));
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

	const debouncedPersist = (id: string, nextMessages: ChatMessage[], ms = 1000) => {
		pendingPersist = { id, messages: nextMessages };
		if (persistTimeout) {
			return;
		}

		persistTimeout = setTimeout(() => {
			const pending = pendingPersist;
			persistTimeout = null;
			pendingPersist = null;

			if (!pending) {
				return;
			}

			updateConversation(pending.id, pending.messages).catch((error) => {
				console.error('Failed to persist conversation:', error);
			});
		}, ms);
	};

	const clearDebouncedPersist = (id: string) => {
		if (pendingPersist?.id !== id) {
			return;
		}

		pendingPersist = null;
		if (persistTimeout) {
			clearTimeout(persistTimeout);
			persistTimeout = null;
		}
	};

	const handleStop = () => {
		abortController?.abort();
		isPreparingTools = false;
		rejectPendingApprovals(new Error('Tool execution stopped'));
	};

	const handleSend = async (content: string) => {
		if (!content.trim() || !llmService || !orchestrator || isStreaming) {
			return;
		}

		let activeId = conversationId;
		if (!activeId) {
			try {
				const newConv = await createConversation();
				activeId = newConv.id;
				messages = [];
				loadedConversationId = activeId;
				conversationId = activeId;
			} catch (error) {
				errorMessage = error instanceof Error ? error.message : 'Failed to create conversation.';
				return;
			}
		}

		if (!activeId) {
			return;
		}

		errorMessage = null;
		const token = conversationToken;
		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			content,
			role: 'user',
			timestamp: new Date()
		};

		const streamMessages = messages;
		streamMessages.push(userMessage);
		starterPrompts = [];
		isStreaming = true;

		try {
			await updateConversation(activeId, streamMessages);
		} catch (error) {
			if (token === conversationToken) {
				errorMessage = error instanceof Error ? error.message : 'Failed to save message.';
				isStreaming = false;
			}
			return;
		}

		if (token !== conversationToken) {
			return;
		}

		const controller = new AbortController();
		abortController = controller;

		try {
			if (!orchestrator) {
				throw new Error('Agent orchestrator is not ready.');
			}

			const result = await orchestrator.run({
				messages: streamMessages,
				signal: controller.signal,
				callbacks: {
					onPreparingToolsChange: (preparing) => {
						if (token !== conversationToken) {
							return;
						}

						isPreparingTools = preparing;
					},
					onAssistantDelta: () => {
						if (token !== conversationToken) {
							return;
						}

						debouncedPersist(activeId, streamMessages);
						if (isNearBottom) {
							scrollToBottom('auto');
						}
					},
					onAssistantReset: (_assistant, model) => {
						if (token !== conversationToken) {
							return;
						}

						debouncedPersist(activeId, streamMessages);
						lastUsedModel = model;
					},
					onAssistantUpdated: () => {
						if (token !== conversationToken) {
							return;
						}

						debouncedPersist(activeId, streamMessages);
					},
					onToolStatusUpdated: () => {
						if (token !== conversationToken) {
							return;
						}

						debouncedPersist(activeId, streamMessages);
					},
					onToolResultsAdded: () => {
						if (token !== conversationToken) {
							return;
						}

						debouncedPersist(activeId, streamMessages);
					},
					onMessageAdded: () => {
						if (token !== conversationToken) {
							return;
						}

						debouncedPersist(activeId, streamMessages);
					},
					onMessageRemoved: () => {
						if (token !== conversationToken) {
							return;
						}

						debouncedPersist(activeId, streamMessages);
					},
					onModelUpdate: (model) => {
						if (token !== conversationToken) {
							return;
						}

						lastUsedModel = model;
					}
				}
			});

			if (token !== conversationToken || controller.signal.aborted) {
				return;
			}

			if (result.lastModel && token === conversationToken) {
				lastUsedModel = result.lastModel;
			}
			if (result.error && token === conversationToken) {
				errorMessage = result.error;
			}
		} catch (error) {
			if (controller.signal.aborted) {
				return;
			}

			const errorText = error instanceof Error ? error.message : 'Something went wrong.';
			if (token === conversationToken) {
				errorMessage = errorText;
			}
		} finally {
			clearDebouncedPersist(activeId);
			rejectPendingApprovals(new Error('Tool approval cancelled'));
			isPreparingTools = false;
			if (token === conversationToken) {
				isStreaming = false;
				abortController = null;
			}
			try {
				await updateConversation(activeId, streamMessages);
			} catch (_error) {
				// Conversation might have been deleted mid-stream, safe to ignore.
			}
		}
	};
</script>

<div class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
	{#if autoModeEnabled}
		<div class="border-b border-border bg-background/80 px-4 py-3">
			<AutoModeBanner {usingDefaultKey} />
		</div>
	{/if}
	<div
		class="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto"
		bind:this={scrollRef}
		onscroll={updateIsNearBottom}
	>
		{#if !conversationId}
			<div class="flex h-full items-center justify-center px-6">
				<p class="max-w-sm text-center text-sm text-muted-foreground">
					Choose a conversation or start a new one to begin chatting.
				</p>
			</div>
		{:else if messages.length === 0}
			<div
				class="animate-fade-in-up mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center"
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
			<div class="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
				{#each messages as message (message.id)}
					<ChatBubble
						{message}
						onApproveToolCall={approveToolCall}
						onRejectToolCall={rejectToolCall}
					/>
				{/each}
				{#if isPreparingTools}
					<div class="flex items-center gap-2 pl-10 text-[11px] text-muted-foreground">
						<LoaderCircleIcon class="h-3 w-3 animate-spin" />
						<span>Fetching tool capabilities...</span>
					</div>
				{/if}
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
