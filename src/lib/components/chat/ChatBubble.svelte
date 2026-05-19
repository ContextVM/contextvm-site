<script lang="ts">
	import { browser } from '$app/environment';
	import DOMPurify from 'dompurify';
	import { marked } from 'marked';
	import type { ChatMessage } from '$lib/types/chat-types';
	import { cn } from '$lib/utils.js';

	let { message }: { message: ChatMessage } = $props();

	const html = $derived.by(() => {
		const raw = marked.parse(message.content ?? '', {
			async: false,
			breaks: true,
			gfm: true
		}) as string;
		return browser ? DOMPurify.sanitize(raw) : raw;
	});
</script>

<div class={cn('flex w-full gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
	{#if message.role !== 'user'}
		<div
			class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[11px] font-semibold text-muted-foreground"
		>
			CV
		</div>
	{/if}
	<div
		class={cn(
			'max-w-[min(80%,42rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words shadow-sm',
			message.role === 'user'
				? 'bg-primary text-primary-foreground'
				: message.role === 'system'
					? 'bg-muted text-muted-foreground'
					: 'border border-border bg-card text-card-foreground',
			message.role !== 'user' ? 'prose prose-sm dark:prose-invert max-w-none' : ''
		)}
	>
		{#if message.role === 'user'}
			<p class="whitespace-pre-wrap">{message.content}</p>
		{:else if message.role === 'assistant' && !message.content}
			<span class="flex h-5 items-center gap-1.5" aria-label="Assistant is responding">
				<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/70"></span>
				<span
					class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:120ms]"
				></span>
				<span
					class="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/50 [animation-delay:240ms]"
				></span>
			</span>
		{:else}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized through DOMPurify before rendering -->
			{@html html}
		{/if}
	</div>
</div>
