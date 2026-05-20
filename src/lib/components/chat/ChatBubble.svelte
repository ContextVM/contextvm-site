<script lang="ts" module>
	import { marked } from 'marked';

	const escapeHtml = (value: string) =>
		value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');

	const renderer = new marked.Renderer();
	const codeClass =
		'relative overflow-x-auto rounded-lg border border-border/60 bg-muted/60 p-3 text-sm';
	const buttonClass =
		'code-copy absolute right-2 top-2 rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity duration-150 hover:text-foreground group-hover:opacity-100';

	renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
		const langClass = lang ? `language-${lang}` : '';
		const label = lang ? `Copy ${lang}` : 'Copy';
		const escaped = escapeHtml(text);
		return `
<div class="code-block group my-3">
	<button type="button" class="${buttonClass}" aria-label="${label}">Copy</button>
	<pre class="${codeClass}"><code class="${langClass}">${escaped}</code></pre>
</div>
`;
	};

	const parseOptions = {
		async: false,
		breaks: true,
		gfm: true,
		renderer
	} as const;
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import DOMPurify from 'dompurify';
	import type { ChatMessage } from '$lib/types/chat-types';
	import { cn, copyToClipboard } from '$lib/utils.js';

	let { message }: { message: ChatMessage } = $props();

	const html = $derived.by(() => {
		const raw = marked.parse(message.content ?? '', parseOptions) as string;
		return browser ? DOMPurify.sanitize(raw) : raw;
	});

	const formatRelativeTime = (value: Date | string) => {
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) {
			return '';
		}

		const deltaSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
		if (deltaSeconds < 20) {
			return 'just now';
		}
		if (deltaSeconds < 60) {
			return `${deltaSeconds}s ago`;
		}
		const deltaMinutes = Math.floor(deltaSeconds / 60);
		if (deltaMinutes < 60) {
			return `${deltaMinutes}m ago`;
		}
		const deltaHours = Math.floor(deltaMinutes / 60);
		if (deltaHours < 24) {
			return `${deltaHours}h ago`;
		}
		const deltaDays = Math.floor(deltaHours / 24);
		return `${deltaDays}d ago`;
	};

	const timestampLabel = $derived.by(() => formatRelativeTime(message.timestamp));

	const handleCodeCopy = async (event: MouseEvent) => {
		const target = event.target as HTMLElement | null;
		const button = target?.closest('.code-copy');
		if (!button) {
			return;
		}

		const block = button.closest('.code-block');
		const code = block?.querySelector('code')?.textContent ?? '';
		if (!code) {
			return;
		}

		await copyToClipboard(code);
	};
</script>

<div class={cn('flex w-full gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
	{#if message.role !== 'user'}
		<div
			class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-gradient-to-br from-primary/20 via-background to-background text-[11px] font-semibold text-primary/80"
		>
			CV
		</div>
	{/if}
	<div
		class={cn(
			'flex max-w-[min(80%,42rem)] min-w-0 flex-col',
			message.role === 'user' ? 'items-end' : 'items-start'
		)}
	>
		<div
			class={cn(
				'relative rounded-2xl px-4 py-3 text-sm leading-relaxed break-words shadow-sm',
				message.role === 'user'
					? 'bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/10'
					: message.role === 'system'
						? 'bg-muted text-muted-foreground'
						: 'border border-border/60 bg-card/80 text-card-foreground backdrop-blur-sm',
				message.role !== 'user' ? 'prose prose-sm dark:prose-invert max-w-none' : ''
			)}
			onclick={handleCodeCopy}
		>
			{#if message.role === 'user'}
				<p class="whitespace-pre-wrap">{message.content}</p>
			{:else if message.role === 'assistant' && !message.content}
				<span class="flex h-5 items-center gap-1.5" aria-label="Assistant is responding">
					<span
						class="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70 shadow-[0_0_6px_rgba(59,130,246,0.35)]"
					></span>
					<span
						class="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60 shadow-[0_0_6px_rgba(59,130,246,0.3)] [animation-delay:120ms]"
					></span>
					<span
						class="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50 shadow-[0_0_6px_rgba(59,130,246,0.25)] [animation-delay:240ms]"
					></span>
				</span>
			{:else}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized through DOMPurify before rendering -->
				{@html html}
			{/if}
		</div>
		{#if timestampLabel}
			<span class="mt-1 text-[10px] text-muted-foreground/50">{timestampLabel}</span>
		{/if}
	</div>
</div>
