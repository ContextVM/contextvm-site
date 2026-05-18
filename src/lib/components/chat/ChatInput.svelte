<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import SquareIcon from '@lucide/svelte/icons/square';

	let {
		value = $bindable(''),
		isStreaming = false,
		disabled = false,
		onSend,
		onStop,
		placeholder = 'Ask ContextVM...',
		class: className,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		value?: string;
		isStreaming?: boolean;
		disabled?: boolean;
		onSend?: (value: string) => void;
		onStop?: () => void;
		placeholder?: string;
	} = $props();

	let textareaRef = $state<HTMLTextAreaElement | null>(null);
	const isSendDisabled = $derived(!isStreaming && (disabled || value.trim().length === 0));

	const resize = () => {
		if (!textareaRef) {
			return;
		}

		textareaRef.style.height = 'auto';
		textareaRef.style.height = `${Math.min(textareaRef.scrollHeight, 180)}px`;
	};

	const handleSend = () => {
		const trimmed = value.trim();
		if (!trimmed || isStreaming || disabled) {
			return;
		}

		onSend?.(trimmed);
		value = '';
		resize();
		textareaRef?.focus();
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	};

	const handleInput = () => {
		resize();
	};

	$effect(() => {
		if (typeof value === 'string') {
			resize();
		}
	});
</script>

<div
	class={cn(
		'flex items-end gap-2 rounded-2xl border border-border bg-background/90 p-2 shadow-sm backdrop-blur transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15',
		className
	)}
	{...restProps}
>
	<Textarea
		bind:ref={textareaRef}
		bind:value
		rows={1}
		class="min-h-[44px] w-full resize-none border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
		{placeholder}
		{disabled}
		onkeydown={handleKeydown}
		oninput={handleInput}
	/>
	<Button
		size="icon"
		variant={isStreaming ? 'secondary' : 'default'}
		class="h-9 w-9"
		disabled={isSendDisabled}
		onclick={() => (isStreaming ? onStop?.() : handleSend())}
	>
		{#if isStreaming}
			<SquareIcon class="h-4 w-4" />
			<span class="sr-only">Stop generating</span>
		{:else}
			<ArrowUpIcon class="h-4 w-4" />
			<span class="sr-only">Send message</span>
		{/if}
	</Button>
</div>
