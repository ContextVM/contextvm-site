<script lang="ts">
	import { resolve } from '$app/paths';
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
	import { walletStore } from '$lib/services/wallet/wallet-store.svelte';
	import { eventStore } from '$lib/services/eventStore';
	import { ServerAnnouncementsModel } from '$lib/models/serverAnnouncements';
	import { createServerAnnouncementsLoader } from '$lib/services/loaders.svelte';
	import ChatBubble from '$lib/components/chat/ChatBubble.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import AutoModeBanner from '$lib/components/chat/AutoModeBanner.svelte';
	import { cn } from '$lib/utils.js';
	import ServerIcon from '@lucide/svelte/icons/server';
	import PlugIcon from '@lucide/svelte/icons/plug';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	let {
		conversationId = $bindable(null),
		config,
		lastUsedModel = $bindable(''),
		autoApproveTools = false
	}: {
		conversationId?: string | null;
		config: LLMConfig;
		lastUsedModel?: string;
		autoApproveTools?: boolean;
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

	// ── Server catalog ──────────────────────────────────────────────────
	const serverAnnouncements = eventStore.model(ServerAnnouncementsModel);

	// Subscribe to the announcements loader so relay events populate the
	// event store regardless of whether the sidebar ServerPanel is mounted.
	$effect(() => {
		const sub = createServerAnnouncementsLoader().subscribe();
		return () => sub.unsubscribe();
	});

	const connectedPubkeys = $derived(new Set([...mcpClientService.clients.keys()]));

	const availableServers = $derived(
		($serverAnnouncements ?? []).filter((s) => !connectedPubkeys.has(s.pubkey)).slice(0, 6)
	);

	let connectingPubkey = $state<string | null>(null);

	async function connectToServer(identifier: string) {
		connectingPubkey = identifier;
		try {
			await mcpClientService.getClient(identifier);
		} finally {
			connectingPubkey = null;
		}
	}

	let persistTimeout: ReturnType<typeof setTimeout> | null = null;
	let pendingPersist: { id: string; messages: ChatMessage[] } | null = null;

	const autoModeEnabled = $derived(isAutoMode(config));
	const usingDefaultKey = $derived(isUsingDefaultKey(config));

	// Auto-approve pending tool calls when the toggle is enabled.
	$effect(() => {
		if (!autoApproveTools) {
			return;
		}

		for (const message of messages) {
			if (message.role !== 'assistant' || !message.toolCalls?.length) {
				continue;
			}

			for (const toolCall of message.toolCalls) {
				if (toolCall.status === 'pending') {
					approveToolCall(toolCall.id);
				}
			}
		}
	});

	const approveToolCall = (toolCallId: string) => {
		orchestrator?.approveToolCall(toolCallId);
	};

	const rejectToolCall = (toolCallId: string) => {
		orchestrator?.rejectToolCall(toolCallId);
	};

	const retryToolCall = async (toolCallId: string) => {
		if (!orchestrator) return;
		let target;
		for (const message of messages) {
			const found = message.toolCalls?.find((tc) => tc.id === toolCallId);
			if (found) {
				target = found;
				break;
			}
		}
		if (!target) return;
		await orchestrator.retryToolCall(target);
		if (conversationId) {
			debouncedPersist(conversationId, messages);
		}
	};

	const rejectPendingApprovals = (reason: Error) => {
		orchestrator?.rejectPendingApprovals(reason);
	};

	// Keep LLMService in sync with config changes without recreating the orchestrator.
	$effect(() => {
		if (!llmService) {
			llmService = new LLMService(config);
			orchestrator = new AgentOrchestrator({
				llmService,
				mcpClientService,
				wallet: walletStore
			});
		} else {
			llmService.reconfigure(config);
		}
	});

	// Invalidate cached tool registry when servers connect/disconnect.
	$effect(() => {
		void mcpClientService.clients.size;
		void walletStore.isConfigured;
		void walletStore.allowInChat;
		orchestrator?.invalidateRegistry();
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
			clearTimeout(persistTimeout);
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

		messages = [...messages, userMessage];
		const streamMessages = messages;
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
				{#if availableServers.length > 0}
					<div class="grid w-full gap-3 sm:grid-cols-2">
						{#each availableServers as server (server.pubkey)}
							{@const isConnecting = connectingPubkey === server.pubkey}
							<div
								class="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-3.5 py-3 text-left shadow-sm backdrop-blur transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card/80"
							>
								<a
									href={resolve(`/s/${server.pubkey}`)}
									class="flex min-w-0 flex-1 items-center gap-3"
								>
									<span
										class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
									>
										<ServerIcon class="h-4 w-4" />
									</span>
									<span class="min-w-0">
										<span class="block truncate text-sm font-medium">{server.name}</span>
										<span class="block truncate font-mono text-[10px] text-muted-foreground">
											{server.pubkey.slice(0, 12)}...
										</span>
									</span>
								</a>
								<button
									type="button"
									class="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
									disabled={isConnecting}
									onclick={() => connectToServer(server.pubkey)}
									aria-label="Connect to {server.name}"
								>
									{#if isConnecting}
										<LoaderCircleIcon class="h-4 w-4 animate-spin" />
									{:else}
										<PlugIcon class="h-4 w-4" />
									{/if}
								</button>
							</div>
						{/each}
					</div>
					<a
						href={resolve('/servers')}
						class="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						Browse all servers
						<ExternalLinkIcon class="h-3 w-3" />
					</a>
				{:else}
					<div class="flex items-center gap-2 text-xs text-muted-foreground">
						<LoaderCircleIcon class="h-3 w-3 animate-spin" />
						Loading servers...
					</div>
				{/if}
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
						onRetryToolCall={retryToolCall}
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
