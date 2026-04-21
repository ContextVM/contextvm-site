<script lang="ts">
	import { formatUnixTimestamp } from '$lib/utils';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Event } from 'nostr-tools';

	let { note }: { note: Event } = $props();

	const date = $derived(formatUnixTimestamp(note.created_at, true));
</script>

<Card.Root class="p-0">
	<Card.Content class="p-5">
		<div class="mb-2 flex items-center text-sm text-muted-foreground">
			<time datetime={formatUnixTimestamp(note.created_at, true)}>{date}</time>
		</div>
		<p class="text-sm whitespace-pre-wrap">{note.content}</p>
	</Card.Content>
</Card.Root>
