<script lang="ts">
	import type { Conversation } from '$lib/types/chat-types';
	import {
		conversationStore,
		createConversation,
		deleteConversation,
		renameConversation
	} from '$lib/services/conversation-store.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { cn } from '$lib/utils.js';
	import { toast } from 'svelte-sonner';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';

	let { activeId = $bindable(null) }: { activeId?: string | null } = $props();

	let editingId = $state<string | null>(null);
	let editingTitle = $state('');

	let deleteTarget = $state<Conversation | null>(null);
	let deleteOpen = $state(false);
	let isCreating = $state(false);
	let renamingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);

	const handleCreate = async () => {
		if (isCreating) {
			return;
		}

		isCreating = true;
		try {
			const conversation = await createConversation();
			activeId = conversation.id;
		} catch (error) {
			console.error('Failed to create conversation:', error);
			toast.error('Failed to create conversation.');
		} finally {
			isCreating = false;
		}
	};

	const handleSelect = (id: string) => {
		activeId = id;
	};

	const startRename = (conversation: Conversation) => {
		editingId = conversation.id;
		editingTitle = conversation.title;
	};

	const commitRename = async () => {
		if (!editingId || renamingId) {
			return;
		}

		const nextId = editingId;
		const nextTitle = editingTitle;
		renamingId = nextId;

		try {
			await renameConversation(nextId, nextTitle);
			if (editingId === nextId) {
				editingId = null;
				editingTitle = '';
			}
		} catch (error) {
			console.error('Failed to rename conversation:', error);
			toast.error('Failed to rename conversation.');
		} finally {
			if (renamingId === nextId) {
				renamingId = null;
			}
		}
	};

	const cancelRename = () => {
		if (renamingId) {
			return;
		}

		editingId = null;
		editingTitle = '';
	};

	const openDeleteDialog = (conversation: Conversation) => {
		deleteTarget = conversation;
		deleteOpen = true;
	};

	const confirmDelete = async () => {
		if (!deleteTarget || deletingId) {
			return;
		}

		const targetId = deleteTarget.id;
		deletingId = targetId;

		try {
			await deleteConversation(targetId);
			deleteOpen = false;
			deleteTarget = null;

			if (activeId === targetId) {
				const fallback = conversationStore.conversations[0]?.id ?? null;
				if (fallback) {
					activeId = fallback;
					return;
				}

				const conversation = await createConversation();
				activeId = conversation.id;
			}
		} catch (error) {
			console.error('Failed to delete conversation:', error);
			toast.error('Failed to delete conversation.');
		} finally {
			if (deletingId === targetId) {
				deletingId = null;
			}
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
		class="h-8 gap-1.5 border-transparent bg-gradient-to-r from-primary/90 to-primary px-2.5 text-xs text-primary-foreground shadow-sm hover:from-primary hover:to-primary/80 hover:shadow-md"
		disabled={isCreating}
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
		<div class="rounded-lg border border-dashed border-border bg-background/35 px-3 py-6">
			<div class="flex flex-col items-center gap-2 text-center">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
				>
					<MessageSquareIcon class="h-4 w-4" />
				</div>
				<p class="text-sm font-medium">No conversations yet</p>
				<p class="text-xs leading-5 text-muted-foreground">Start a new chat to save it here.</p>
				<Button size="sm" class="mt-1 h-8" disabled={isCreating} onclick={handleCreate}>
					<PlusIcon class="mr-1.5 h-3.5 w-3.5" />
					Start new chat
				</Button>
			</div>
		</div>
	{:else}
		<div class="space-y-1 px-1 pb-2">
			{#each conversationStore.conversations as conversation (conversation.id)}
				<div
					class={cn(
						'group flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition-all',
						activeId === conversation.id
							? 'border-primary/40 bg-sidebar-accent text-sidebar-accent-foreground shadow-md shadow-primary/10'
							: 'border-transparent text-sidebar-foreground/80 hover:border-sidebar-border/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground hover:shadow-sm'
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
							<Button
								variant="ghost"
								size="icon"
								class="h-7 w-7"
								disabled={renamingId === conversation.id}
								onclick={cancelRename}
							>
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
								onclick={() => openDeleteDialog(conversation)}
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

<Dialog.Root
	bind:open={deleteOpen}
	onOpenChange={(open) => {
		deleteOpen = open;
		if (!open) {
			deleteTarget = null;
		}
	}}
>
	<Dialog.Content class="sm:max-w-[420px]">
		<Dialog.Header>
			<Dialog.Title>Delete conversation</Dialog.Title>
			<Dialog.Description>
				This will permanently remove
				<strong class="font-semibold"> {deleteTarget?.title ?? 'this conversation'} </strong>.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex gap-2 sm:justify-end">
			<Button variant="outline" onclick={() => (deleteOpen = false)}>Cancel</Button>
			<Button
				variant="destructive"
				disabled={deletingId === deleteTarget?.id}
				onclick={confirmDelete}
			>
				Delete
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
