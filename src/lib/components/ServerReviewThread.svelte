<script lang="ts">
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import ServerReviewThread from '$lib/components/ServerReviewThread.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { formatUnixTimestamp } from '$lib/utils';
	import type { Comment } from 'applesauce-common/casts';
	import { COMMENT_KIND } from 'applesauce-common/helpers';
	import type { NostrEvent } from 'applesauce-core/helpers/event';

	let {
		comment,
		onReply,
		depth = 0,
		canReply = false
	}: {
		comment: Comment;
		onReply: (parent: NostrEvent, content: string) => Promise<void>;
		depth?: number;
		canReply?: boolean;
	} = $props();

	let replies = $state<Comment[]>([]);
	let parentEvent = $state<NostrEvent | undefined>(undefined);
	let showReplyForm = $state(false);
	let replyContent = $state('');
	let replyError = $state<string | null>(null);
	let isSubmittingReply = $state(false);

	const formattedDate = $derived(formatUnixTimestamp(comment.event.created_at, true));
	const isNested = $derived(depth > 0);

	$effect(() => {
		const subscription = comment.replies$.subscribe((value) => {
			replies = value;
		});

		return () => subscription.unsubscribe();
	});

	$effect(() => {
		const subscription = comment.parent$.subscribe((value) => {
			parentEvent = value;
		});

		return () => subscription.unsubscribe();
	});

	async function submitReply() {
		const content = replyContent.trim();
		if (!content || isSubmittingReply) return;

		try {
			isSubmittingReply = true;
			replyError = null;
			await onReply(comment.event, content);
			replyContent = '';
			showReplyForm = false;
		} catch (error) {
			replyError = error instanceof Error ? error.message : 'Failed to publish reply';
		} finally {
			isSubmittingReply = false;
		}
	}
</script>

<div
	class:ml-6={isNested}
	class:border-l={isNested}
	class:pl-4={isNested}
	class:border-border={isNested}
>
	<Card.Root class="p-0">
		<Card.Content class="p-4 sm:p-5">
			<div class="flex flex-col gap-3">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<ProfileCard pubkey={comment.event.pubkey} mode="compact" />
					</div>
					<time datetime={formattedDate} class="shrink-0 text-xs text-muted-foreground">
						{formattedDate}
					</time>
				</div>

				{#if parentEvent && parentEvent.kind === COMMENT_KIND}
					<div
						class="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
					>
						Replying to <ProfileCard pubkey={parentEvent.pubkey} mode="inline" />
					</div>
				{/if}

				<p class="text-sm break-words whitespace-pre-wrap text-foreground">
					{comment.event.content}
				</p>

				<div class="flex items-center justify-between gap-2">
					<div class="text-xs text-muted-foreground">
						{#if replies.length}
							{replies.length} {replies.length === 1 ? 'reply' : 'replies'}
						{/if}
					</div>
					{#if canReply}
						<Button variant="ghost" size="sm" onclick={() => (showReplyForm = !showReplyForm)}>
							{showReplyForm ? 'Cancel' : 'Reply'}
						</Button>
					{/if}
				</div>

				{#if showReplyForm}
					<div class="space-y-3 rounded-md border border-border bg-muted/20 p-3">
						<Textarea
							bind:value={replyContent}
							rows={3}
							placeholder="Write a reply to this review"
							disabled={isSubmittingReply}
						/>
						{#if replyError}
							<p class="text-sm text-destructive">{replyError}</p>
						{/if}
						<div class="flex justify-end">
							<Button onclick={submitReply} disabled={!replyContent.trim() || isSubmittingReply}>
								{isSubmittingReply ? 'Posting…' : 'Post reply'}
							</Button>
						</div>
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	{#if replies.length}
		<div class="mt-3 space-y-3">
			{#each replies as reply (reply.event.id)}
				<ServerReviewThread comment={reply} {onReply} depth={depth + 1} {canReply} />
			{/each}
		</div>
	{/if}
</div>
