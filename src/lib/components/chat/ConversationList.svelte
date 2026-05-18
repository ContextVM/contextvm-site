<script lang="ts">
	import { onMount } from 'svelte';
	import type { Conversation } from '$lib/types/chat-types';
	import {
		conversationStore,
		createConversation,
		deleteConversation,
		listConversations,
		renameConversation
	} from '$lib/services/conversation-store.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { cn } from '$lib/utils.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';

	let { activeId = $bindable(null) }: { activeId?: string | null } = $props();

	let editingId = $state<string | null>(null);
	let editingTitle = $state('');

	onMount(() => {
		listConversations();
	});

	const handleCreate = async () => {
		const conversation = await createConversation();
		activeId = conversation.id;
	};

	const handleSelect = (id: string) => {
		activeId = id;
	};

	const startRename = (conversation: Conversation) => {
		editingId = conversation.id;
		editingTitle = conversation.title;
	};

	const commitRename = async () => {
		if (!editingId) {
			return;
		}

		const nextId = editingId;
		const nextTitle = editingTitle;
		editingId = null;
		editingTitle = '';
		await renameConversation(nextId, nextTitle);
	};

	const cancelRename = () => {
		editingId = null;
		editingTitle = '';
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm('Delete this conversation?')) {
			return;
		}

		await deleteConversation(id);

		if (activeId === id) {
			activeId = conversationStore.conversations[0]?.id ?? null;
		}
	};

	const handleRenameKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			commitRename();
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			cancelRename();
		}
	};

	const formatConversationMeta = (conversation: Conversation) => {
		const updatedAt = new Date(conversation.updatedAt);
		const dateLabel = Number.isNaN(updatedAt.getTime())
			? ''
			: new Intl.DateTimeFormat(undefined, {
					month: 'short',
					day: 'numeric'
				}).format(updatedAt);
		const messageCount = conversation.messages.length;
		const countLabel = `${messageCount} ${messageCount === 1 ? 'message' : 'messages'}`;

		return dateLabel ? `${countLabel} · ${dateLabel}` : countLabel;
	};
</script>

<div class="flex items-center justify-between gap-2 px-1">
	<p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Conversations</p>
	<Button
		variant="outline"
		size="sm"
		class="h-8 gap-1.5 bg-background/60 px-2.5 text-xs"
		onclick={handleCreate}
	>
		<PlusIcon class="h-3.5 w-3.5" />
		New
	</Button>
</div>

<ScrollArea class="mt-3 h-full">
	{#if conversationStore.loading}
		<div
			class="rounded-lg border border-border/60 bg-background/40 px-3 py-4 text-sm text-muted-foreground"
		>
			Loading conversations...
		</div>
	{:else if conversationStore.conversations.length === 0}
		<div
			class="rounded-lg border border-dashed border-border bg-background/35 px-3 py-5 text-sm leading-6 text-muted-foreground"
		>
			No saved conversations yet.
		</div>
	{:else}
		<div class="space-y-1 px-1 pb-2">
			{#each conversationStore.conversations as conversation (conversation.id)}
				<div
					class={cn(
						'group flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition-colors',
						activeId === conversation.id
							? 'border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
							: 'border-transparent text-sidebar-foreground/80 hover:border-sidebar-border/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
					)}
				>
					{#if editingId === conversation.id}
						<Input
							class="h-8 bg-background/70"
							bind:value={editingTitle}
							onkeydown={handleRenameKeydown}
							onblur={commitRename}
						/>
						<div class="flex items-center gap-1">
							<Button variant="ghost" size="icon" class="h-7 w-7" onclick={commitRename}>
								<CheckIcon class="h-3.5 w-3.5" />
								<span class="sr-only">Save name</span>
							</Button>
							<Button variant="ghost" size="icon" class="h-7 w-7" onclick={cancelRename}>
								<XIcon class="h-3.5 w-3.5" />
								<span class="sr-only">Cancel rename</span>
							</Button>
						</div>
					{:else}
						<button
							class="flex min-w-0 flex-1 items-start gap-2 text-left"
							onclick={() => handleSelect(conversation.id)}
						>
							<MessageSquareIcon class="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							<span class="min-w-0">
								<span class="block truncate font-medium">{conversation.title}</span>
								<span class="block truncate text-xs text-muted-foreground">
									{formatConversationMeta(conversation)}
								</span>
							</span>
						</button>
						<div
							class="flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
						>
							<Button
								variant="ghost"
								size="icon"
								class="h-7 w-7"
								onclick={() => startRename(conversation)}
							>
								<PencilIcon class="h-3.5 w-3.5" />
								<span class="sr-only">Rename conversation</span>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="h-7 w-7 text-destructive"
								onclick={() => handleDelete(conversation.id)}
							>
								<Trash2Icon class="h-3.5 w-3.5" />
								<span class="sr-only">Delete conversation</span>
							</Button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</ScrollArea>
