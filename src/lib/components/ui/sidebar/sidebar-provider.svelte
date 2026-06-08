<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, setContext } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { SIDEBAR_CONTEXT, type SidebarContext } from './context';
	import { SIDEBAR_KEYBOARD_SHORTCUT, SIDEBAR_WIDTH, SIDEBAR_WIDTH_MOBILE } from './constants';

	let {
		open = $bindable(true),
		onOpenChange,
		class: className,
		style: styleOverride,
		ref = $bindable(null),
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	let openMobile = $state(false);
	let isMobile = $state(false);

	const setOpen = (value: boolean) => {
		if (open === value) {
			return;
		}

		open = value;
		onOpenChange?.(value);
	};

	const setOpenMobile = (value: boolean) => {
		openMobile = value;
	};

	const sidebar: SidebarContext = {
		get open() {
			return open;
		},
		get openMobile() {
			return openMobile;
		},
		get state() {
			return open ? 'expanded' : 'collapsed';
		},
		get isMobile() {
			return isMobile;
		},
		setOpen,
		setOpenMobile,
		toggle: () => {
			if (isMobile) {
				openMobile = !openMobile;
				return;
			}

			setOpen(!open);
		}
	};

	setContext(SIDEBAR_CONTEXT, sidebar);

	const baseStyle = `--sidebar-width: ${SIDEBAR_WIDTH}; --sidebar-width-mobile: ${SIDEBAR_WIDTH_MOBILE};`;
	const styleValue = $derived(styleOverride ? `${baseStyle} ${styleOverride}` : baseStyle);

	onMount(() => {
		if (!browser) {
			return;
		}

		const media = window.matchMedia('(max-width: 1024px)');
		const update = () => {
			isMobile = media.matches;
			if (!isMobile) {
				openMobile = false;
			}
		};

		update();
		media.addEventListener('change', update);

		const onKeydown = (event: KeyboardEvent) => {
			if (!event.metaKey && !event.ctrlKey) {
				return;
			}

			if (event.key.toLowerCase() !== SIDEBAR_KEYBOARD_SHORTCUT) {
				return;
			}

			event.preventDefault();
			sidebar.toggle();
		};

		window.addEventListener('keydown', onKeydown);

		return () => {
			media.removeEventListener('change', update);
			window.removeEventListener('keydown', onKeydown);
		};
	});
</script>

<div
	bind:this={ref}
	data-sidebar-provider
	class={cn('group/sidebar flex min-h-screen w-full', className)}
	style={styleValue}
	{...restProps}
>
	{@render children?.()}
</div>
