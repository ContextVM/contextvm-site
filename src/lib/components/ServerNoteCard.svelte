<script lang="ts">
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import ServerNoteCard from '$lib/components/ServerNoteCard.svelte';
	import { createNoteEventLoader } from '$lib/services/loaders.svelte';
	import { formatUnixTimestamp } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { decode } from 'nostr-tools/nip19';
	import type { Event } from 'nostr-tools';

	let { note, embedded = false }: { note: Event; embedded?: boolean } = $props();
	const NOTE_TRIM_THRESHOLD = 420;

	const date = $derived(formatUnixTimestamp(note.created_at, true));
	type Segment =
		| { type: 'text'; value: string }
		| { type: 'profile'; value: string; pubkey: string }
		| { type: 'event'; value: string; id: string; relays?: string[] }
		| { type: 'link'; value: string; href: string };

	let embeddedNotes = $state<Record<string, Event | undefined>>({});
	let loadedImages = $state<Record<string, boolean>>({});
	let expanded = $state(false);
	const shouldTrim = $derived(!embedded && note.content.length > NOTE_TRIM_THRESHOLD);
	const contentClass = $derived(
		[
			'text-sm break-words whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]',
			shouldTrim && !expanded ? 'max-h-56 overflow-hidden' : ''
		]
			.filter(Boolean)
			.join(' ')
	);

	function isImageUrl(url: string): boolean {
		try {
			const normalized = new URL(url);
			return /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(
				normalized.pathname + normalized.search
			);
		} catch {
			return false;
		}
	}

	function toggleImage(url: string) {
		loadedImages = { ...loadedImages, [url]: !loadedImages[url] };
	}

	function parseNoteContent(content: string): Segment[] {
		const matches = Array.from(
			content.matchAll(
				/(nostr:(?:npub|nprofile|note|nevent)1[023456789acdefghjklmnpqrstuvwxyz]+|https?:\/\/\S+)/gi
			)
		);
		const segments: Segment[] = [];
		let lastIndex = 0;

		for (const match of matches) {
			const value = match[0];
			const index = match.index ?? 0;

			if (index > lastIndex) {
				segments.push({ type: 'text', value: content.slice(lastIndex, index) });
			}

			if (value.startsWith('http://') || value.startsWith('https://')) {
				segments.push({ type: 'link', value, href: value });
			} else if (value.startsWith('nostr:')) {
				const identifier = value.slice(6);

				try {
					const decoded = decode(identifier);

					if (decoded.type === 'npub') {
						segments.push({
							type: 'profile',
							value,
							pubkey: decoded.data
						});
					} else if (decoded.type === 'nprofile') {
						segments.push({
							type: 'profile',
							value,
							pubkey: decoded.data.pubkey
						});
					} else if (decoded.type === 'note') {
						segments.push({
							type: 'event',
							value,
							id: decoded.data
						});
					} else if (decoded.type === 'nevent') {
						segments.push({
							type: 'event',
							value,
							id: decoded.data.id,
							relays: decoded.data.relays
						});
					} else {
						segments.push({ type: 'text', value });
					}
				} catch {
					segments.push({ type: 'text', value });
				}
			} else {
				segments.push({ type: 'text', value });
			}

			lastIndex = index + value.length;
		}

		if (lastIndex < content.length) {
			segments.push({ type: 'text', value: content.slice(lastIndex) });
		}

		return segments.length ? segments : [{ type: 'text', value: content }];
	}

	const segments = $derived.by(() => parseNoteContent(note.content));

	$effect(() => {
		const eventSegments = segments.filter(
			(segment): segment is Extract<Segment, { type: 'event' }> => segment.type === 'event'
		);
		if (!eventSegments.length) return;

		const subscriptions = eventSegments
			.filter((segment) => !embeddedNotes[segment.id])
			.map((segment) =>
				createNoteEventLoader(segment.id, segment.relays).subscribe((event) => {
					embeddedNotes = { ...embeddedNotes, [segment.id]: event };
				})
			);

		return () => {
			for (const subscription of subscriptions) {
				subscription.unsubscribe();
			}
		};
	});
</script>

{#snippet renderSegments(segments: Segment[])}
	{#each segments as segment, index (index)}
		{#if segment.type === 'text'}
			{segment.value}
		{:else if segment.type === 'link'}
			<span class="inline-flex max-w-full flex-wrap items-center gap-2 align-middle">
				<a
					href={segment.href}
					target="_blank"
					rel="noopener noreferrer"
					class="break-all text-primary underline underline-offset-2 hover:text-primary/80"
				>
					{segment.value}
				</a>
				{#if isImageUrl(segment.href)}
					<Button
						variant="outline"
						size="sm"
						class="h-7 px-2 text-xs"
						onclick={() => toggleImage(segment.href)}
					>
						{loadedImages[segment.href] ? 'Hide image' : 'Load image'}
					</Button>
				{/if}
			</span>
			{#if isImageUrl(segment.href) && loadedImages[segment.href]}
				<div class="my-3 overflow-hidden rounded-lg border border-border bg-muted/20">
					<img src={segment.href} alt="Shared note media" class="max-h-96 w-full object-contain" />
				</div>
			{/if}
		{:else if segment.type === 'profile'}
			<span class="inline align-baseline text-foreground">
				<ProfileCard pubkey={segment.pubkey} mode="inline" />
			</span>
		{:else if segment.type === 'event'}
			<div class="my-3 min-w-0">
				{#if embeddedNotes[segment.id]}
					<ServerNoteCard note={embeddedNotes[segment.id]!} embedded={true} />
				{:else}
					<div
						class="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
					>
						Loading embedded note…
					</div>
				{/if}
			</div>
		{/if}
	{/each}
{/snippet}

<Card.Root class={embedded ? 'border-border/60 bg-muted/20 p-0 shadow-none' : 'p-0'}>
	<Card.Content class="p-5">
		<div class="mb-4 min-w-0">
			<ProfileCard pubkey={note.pubkey} mode="compact" />
		</div>
		<div class={contentClass}>
			{@render renderSegments(segments)}
		</div>
		{#if shouldTrim}
			<div class="mt-3">
				<Button
					variant="ghost"
					size="sm"
					class="px-0 text-xs"
					onclick={() => (expanded = !expanded)}
				>
					{expanded ? 'Read less' : 'Read more'}
				</Button>
			</div>
		{/if}
		<div class="mt-4 flex justify-end">
			<time
				datetime={formatUnixTimestamp(note.created_at, true)}
				class="text-xs text-muted-foreground"
			>
				{date}
			</time>
		</div>
	</Card.Content>
</Card.Root>
