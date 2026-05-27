<script lang="ts">
	import {
		isAutoMode,
		isUsingDefaultKey,
		type ChatMessage,
		type LLMConfig,
		type ToolCallData
	} from '$lib/types/chat-types';
	import {
		createConversation,
		getConversation,
		updateConversation
	} from '$lib/services/conversation-store.svelte';
	import { LLMService, type SendMessageResult } from '$lib/services/llm';
	import { ToolRegistry } from '$lib/services/mcp-openai-bridge';
	import { mcpClientService } from '$lib/services/mcpClient.svelte';
	import ChatBubble from '$lib/components/chat/ChatBubble.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import AutoModeBanner from '$lib/components/chat/AutoModeBanner.svelte';
	import { cn } from '$lib/utils.js';
	import ServerIcon from '@lucide/svelte/icons/server';
	import GitBranchIcon from '@lucide/svelte/icons/git-branch';
	import PlugIcon from '@lucide/svelte/icons/plug';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

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

	const MAX_TOOL_ROUNDS = 5;

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
	let errorMessage = $state<string | null>(null);
	let llmService: LLMService | null = null;
	let abortController: AbortController | null = null;
	let scrollRef = $state<HTMLDivElement | null>(null);
	// Intentionally non-reactive: used only as a stale-update guard token.
	let conversationToken = 0;
	let loadedConversationId: string | null = null;
	let isNearBottom = $state(true);
	let starterPrompts = $state<PromptItem[]>(shuffleArray(PROMPT_POOL).slice(0, 3));
	let persistTimeout: ReturnType<typeof setTimeout> | null = null;
	let pendingPersist: { id: string; messages: ChatMessage[] } | null = null;
	let pendingApprovals = $state(
		new Map<
			string,
			{
				resolve: () => void;
				reject: (reason: Error) => void;
			}
		>()
	);

	const autoModeEnabled = $derived(isAutoMode(config));
	const usingDefaultKey = $derived(isUsingDefaultKey(config));

	function waitForUserApproval(toolCallId: string): Promise<void> {
		return new Promise((resolve, reject) => {
			pendingApprovals.set(toolCallId, { resolve, reject });
		});
	}

	function approveToolCall(toolCallId: string) {
		pendingApprovals.get(toolCallId)?.resolve();
		pendingApprovals.delete(toolCallId);
	}

	function rejectToolCall(toolCallId: string) {
		pendingApprovals.get(toolCallId)?.reject(new Error('User rejected tool call'));
		pendingApprovals.delete(toolCallId);
	}

	function rejectPendingApprovals(reason: Error) {
		for (const approval of pendingApprovals.values()) {
			approval.reject(reason);
		}
		pendingApprovals.clear();
	}

	$effect(() => {
		if (llmService) {
			llmService.reconfigure(config);
			return;
		}

		llmService = new LLMService(config);
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

	const buildToolRegistry = async (): Promise<ToolRegistry> => {
		const registry = new ToolRegistry();
		const connectedServers = [...mcpClientService.clients.entries()];

		await Promise.all(
			connectedServers.map(async ([pubkey, client]) => {
				const serverName = client.getServerVersion()?.name ?? 'mcp_server';

				try {
					const toolsResult = await mcpClientService.listTools(pubkey);
					registry.register(pubkey, serverName, toolsResult.tools);
				} catch (error) {
					console.warn(`Failed to list tools for ${serverName}:`, error);
				}
			})
		);

		return registry;
	};

	const withToolSystemContext = (
		baseMessages: ChatMessage[],
		systemContext: string
	): ChatMessage[] => {
		if (!systemContext) {
			return [...baseMessages];
		}

		return [
			{
				id: 'mcp-tool-system-context',
				content: systemContext,
				role: 'system',
				timestamp: new Date()
			},
			...baseMessages
		];
	};

	const makeToolResultMessage = (
		toolCallId: string,
		toolName: string,
		content: string
	): ChatMessage => ({
		id: crypto.randomUUID(),
		content,
		role: 'tool',
		timestamp: new Date(),
		toolCallId,
		toolName
	});

	const updateToolCallStatus = (
		message: ChatMessage,
		toolCallId: string,
		status: ToolCallData['status'],
		result?: string
	) => {
		const toolCall = message.toolCalls?.find((candidate) => candidate.id === toolCallId);
		if (!toolCall) {
			return;
		}

		toolCall.status = status;
		if (result !== undefined) {
			toolCall.result = result;
		}
	};

	const serializeToolResult = (result: CallToolResult): string => {
		const hasStructuredContent =
			result.structuredContent && Object.keys(result.structuredContent).length > 0;

		if (
			result.content?.length === 1 &&
			result.content[0].type === 'text' &&
			!hasStructuredContent &&
			!result.isError
		) {
			return result.content[0].text;
		}

		return JSON.stringify(
			{
				content: result.content ?? [],
				...(hasStructuredContent ? { structuredContent: result.structuredContent } : {}),
				...(result.isError ? { isError: result.isError } : {})
			},
			null,
			2
		);
	};

	const applyToolCallsToAssistantMessage = (
		registry: ToolRegistry,
		assistantMessage: ChatMessage,
		toolCalls: NonNullable<SendMessageResult['toolCalls']>
	) => {
		assistantMessage.toolCalls = toolCalls.map((toolCall) => {
			const resolved = registry.resolve(toolCall.functionName, toolCall.arguments);

			return {
				id: toolCall.id,
				name: toolCall.functionName,
				arguments: toolCall.arguments,
				status: resolved?.tier === 'auto' ? 'running' : 'pending',
				serverName: resolved?.serverName
			};
		});
	};

	const executeToolCalls = async (
		registry: ToolRegistry,
		assistantMessage: ChatMessage,
		toolCalls: NonNullable<SendMessageResult['toolCalls']>
	): Promise<ChatMessage[]> => {
		const executions = toolCalls.map(async (toolCall) => {
			const resolved = registry.resolve(toolCall.functionName, toolCall.arguments);
			if (!resolved) {
				const error = 'Error: Unknown tool or invalid tool arguments.';
				updateToolCallStatus(assistantMessage, toolCall.id, 'error', error);
				return makeToolResultMessage(toolCall.id, toolCall.functionName, error);
			}

			try {
				if (resolved.tier !== 'auto') {
					updateToolCallStatus(assistantMessage, toolCall.id, 'pending');
					await waitForUserApproval(toolCall.id);
					updateToolCallStatus(assistantMessage, toolCall.id, 'approved');
				}

				updateToolCallStatus(assistantMessage, toolCall.id, 'running');
				const result = await mcpClientService.callTool(
					resolved.serverPubkey,
					resolved.originalToolName,
					resolved.args
				);
				const serialized = serializeToolResult(result);
				updateToolCallStatus(assistantMessage, toolCall.id, 'completed', serialized);
				return makeToolResultMessage(toolCall.id, toolCall.functionName, serialized);
			} catch (error) {
				const errorText = error instanceof Error ? error.message : 'Tool call failed';
				const serialized = `Error: ${errorText}`;
				updateToolCallStatus(assistantMessage, toolCall.id, 'error', serialized);
				return makeToolResultMessage(toolCall.id, toolCall.functionName, serialized);
			}
		});

		const results = await Promise.allSettled(executions);
		return results.map((result, index) =>
			result.status === 'fulfilled'
				? result.value
				: makeToolResultMessage(
						toolCalls[index]?.id ?? crypto.randomUUID(),
						toolCalls[index]?.functionName ?? 'unknown_tool',
						'Error: Tool execution failed.'
					)
		);
	};

	const handleStop = () => {
		abortController?.abort();
		rejectPendingApprovals(new Error('Tool execution stopped'));
	};

	const handleSend = async (content: string) => {
		if (!content.trim() || !llmService || isStreaming) {
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
			const registry = await buildToolRegistry();
			const tools = registry.getOpenAITools();
			const systemContext = registry.getSystemContext();
			let outgoingMessages = withToolSystemContext(streamMessages, systemContext);
			let done = false;
			let round = 0;

			while (!done && round < MAX_TOOL_ROUNDS) {
				round += 1;

				const assistant: ChatMessage = {
					id: crypto.randomUUID(),
					content: '',
					role: 'assistant',
					timestamp: new Date()
				};
				streamMessages.push(assistant);

				const result = await llmService.sendMessage(outgoingMessages, {
					signal: controller.signal,
					tools: tools.length > 0 ? tools : undefined,
					onDelta: (delta) => {
						if (token !== conversationToken) {
							return;
						}

						assistant.content += delta;
						debouncedPersist(activeId, streamMessages);
						if (isNearBottom) {
							scrollToBottom('auto');
						}
					},
					onReset: (model) => {
						if (token !== conversationToken) {
							return;
						}

						assistant.content = '';
						assistant.toolCalls = undefined;
						debouncedPersist(activeId, streamMessages);
						lastUsedModel = model;
					}
				});

				if (token !== conversationToken || controller.signal.aborted) {
					return;
				}

				if (result.content && result.content !== assistant.content) {
					assistant.content = result.content;
				}
				lastUsedModel = result.model;

				if (result.finishReason === 'tool_calls') {
					if (!result.toolCalls?.length) {
						assistant.content =
							assistant.content ||
							'Error: The model requested a tool call but did not provide a complete tool call.';
						done = true;
						break;
					}

					applyToolCallsToAssistantMessage(registry, assistant, result.toolCalls);
					debouncedPersist(activeId, streamMessages);

					const toolResultMessages = await executeToolCalls(registry, assistant, result.toolCalls);
					if (token !== conversationToken || controller.signal.aborted) {
						return;
					}

					for (const toolResultMessage of toolResultMessages) {
						streamMessages.push(toolResultMessage);
					}

					debouncedPersist(activeId, streamMessages);
					outgoingMessages = withToolSystemContext(streamMessages, systemContext);
					continue;
				}

				if (!assistant.content.trim()) {
					const assistantIndex = streamMessages.findIndex((message) => message.id === assistant.id);
					if (assistantIndex >= 0) {
						streamMessages.splice(assistantIndex, 1);
					}
				}

				done = true;
			}

			if (!done && token === conversationToken && !controller.signal.aborted) {
				streamMessages.push({
					id: crypto.randomUUID(),
					content: `Stopped after ${MAX_TOOL_ROUNDS} tool rounds to avoid a runaway loop.`,
					role: 'assistant',
					timestamp: new Date()
				});
			}
		} catch (error) {
			const latestAssistant = [...streamMessages]
				.reverse()
				.find((message) => message.role === 'assistant');

			if (controller.signal.aborted) {
				if (latestAssistant && !latestAssistant.content && !latestAssistant.toolCalls?.length) {
					const assistantIndex = streamMessages.findIndex(
						(message) => message.id === latestAssistant.id
					);
					if (assistantIndex >= 0) {
						streamMessages.splice(assistantIndex, 1);
					}
				}
				return;
			}

			const errorText = error instanceof Error ? error.message : 'Something went wrong.';
			if (token === conversationToken) {
				errorMessage = errorText;
			}

			if (latestAssistant) {
				latestAssistant.content = `Error: ${errorText}`;
			}
		} finally {
			clearDebouncedPersist(activeId);
			rejectPendingApprovals(new Error('Tool execution finished'));
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
