<script lang="ts">
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import ServerReviewThread from '$lib/components/ServerReviewThread.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { activeAccount } from '$lib/services/accountManager.svelte';
	import { eventStore } from '$lib/services/eventStore';
	import { createServerReviewsLoader } from '$lib/services/loaders.svelte';
	import { commonRelays, relayPool } from '$lib/services/relay-pool';
	import { DIALOG_IDS, dialogState } from '$lib/stores/dialog-state.svelte';
	import { mergeRelaySets } from 'applesauce-core/helpers/relays';
	import { EventFactory } from 'applesauce-core/event-factory';
	import type { NostrEvent } from 'applesauce-core/helpers/event';
	import { SERVER_ANNOUNCEMENT_KIND } from '@contextvm/sdk';
	import { Comment } from 'applesauce-common/casts';
	import { CommentsModel } from 'applesauce-common/models';
	import { castTimelineStream } from 'applesauce-common/observable';
	import type { CommentPointer } from 'applesauce-common/helpers';
	import 'applesauce-common/blueprints/comment';

	let {
		pubkey,
		relayHints = []
	}: {
		pubkey: string;
		relayHints?: string[];
	} = $props();

	const rootPointer = $derived<CommentPointer>({
		type: 'address',
		kind: SERVER_ANNOUNCEMENT_KIND,
		pubkey,
		identifier: ''
	});

	const publishRelays = $derived(mergeRelaySets(relayHints, commonRelays));
	const factory = new EventFactory();

	let reviews = $state<Comment[]>([]);
	let isLoading = $state(true);
	let composerContent = $state('');
	let composerError = $state<string | null>(null);
	let isPublishing = $state(false);
	let refreshCount = $state(0);
	let isRefreshing = $state(false);

	$effect(() => {
		refreshCount;
		isLoading = true;
		isRefreshing = true;
		const loaderSubscription = createServerReviewsLoader(pubkey, relayHints).subscribe();
		const commentsSubscription = eventStore
			.model(CommentsModel, rootPointer)
			.pipe(castTimelineStream(Comment, eventStore))
			.subscribe((value) => {
				reviews = value;
				isLoading = false;
				isRefreshing = false;
			});

		return () => {
			loaderSubscription.unsubscribe();
			commentsSubscription.unsubscribe();
		};
	});

	async function publish(parent: NostrEvent | CommentPointer, content: string) {
		const account = activeAccount.getValue();
		if (!account) {
			throw new Error('Please log in to publish a review');
		}

		factory.setSigner(account.signer);
		const draft = await factory.comment(parent, content);
		const signedEvent = await account.signEvent(draft);
		eventStore.add(signedEvent);

		await relayPool.publish(publishRelays, signedEvent);
	}

	function refreshReviews() {
		refreshCount += 1;
	}

	async function submitTopLevelReview() {
		const content = composerContent.trim();
		if (!content || isPublishing) return;

		try {
			isPublishing = true;
			composerError = null;
			await publish(rootPointer, content);
			composerContent = '';
		} catch (error) {
			composerError = error instanceof Error ? error.message : 'Failed to publish review';
		} finally {
			isPublishing = false;
		}
	}
</script>

<section class="mt-6 space-y-4">
	<div class="flex items-start justify-between gap-3">
		<div>
			<h3 class="text-lg font-semibold">Server reviews</h3>
			<p class="mt-1 text-sm text-muted-foreground">
				Comments are published as CEP-24 reviews using NIP-22 kind 1111 threads.
			</p>
		</div>
		<Button
			variant="outline"
			size="icon"
			class={isRefreshing ? 'animate-spin' : ''}
			onclick={refreshReviews}
			disabled={isRefreshing}
			aria-label="Refresh reviews"
		>
			<RefreshCw class="h-4 w-4" />
		</Button>
	</div>

	<Card.Root class="p-0">
		<Card.Content class="space-y-4 p-5">
			{#if $activeAccount}
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<ProfileCard pubkey={$activeAccount.pubkey} mode="compact" />
					</div>
					<Textarea
						bind:value={composerContent}
						rows={4}
						placeholder="Share your experience with this server"
						disabled={isPublishing}
					/>
					{#if composerError}
						<p class="text-sm text-destructive">{composerError}</p>
					{/if}
					<div class="flex justify-end">
						<Button
							onclick={submitTopLevelReview}
							disabled={!composerContent.trim() || isPublishing}
						>
							{isPublishing ? 'Publishing…' : 'Publish review'}
						</Button>
					</div>
				</div>
			{:else}
				<Alert.Root>
					<Alert.Title>Login required</Alert.Title>
					<Alert.Description
						class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
					>
						<span>Log in to publish a review or reply to an existing thread.</span>
						<Button
							variant="outline"
							class="gap-2"
							onclick={() => (dialogState.dialogId = DIALOG_IDS.LOGIN)}
						>
							<CircleUserRound class="h-4 w-4" />
							Login
						</Button>
					</Alert.Description>
				</Alert.Root>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if isLoading}
		<Card.Root class="p-0">
			<Card.Content class="p-5 text-sm text-muted-foreground">Loading reviews…</Card.Content>
		</Card.Root>
	{:else if !reviews.length}
		<Card.Root class="p-0">
			<Card.Content class="p-5 text-sm text-muted-foreground">
				No reviews yet. Be the first to share feedback about this server.
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="space-y-4">
			{#each reviews as review (review.event.id)}
				<ServerReviewThread comment={review} onReply={publish} canReply={!!$activeAccount} />
			{/each}
		</div>
	{/if}
</section>
