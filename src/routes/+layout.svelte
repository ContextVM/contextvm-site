<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import { setThemeContext } from '@sjsf/shadcn4-theme';
	import * as components from '@sjsf/shadcn4-theme/new-york';
	import RelayWidget from '$lib/components/RelayWidget.svelte';
	import RelayChangeDialog from '$lib/components/dialogs/RelayChangeDialog.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { queryClient } from '$lib/query-client';
	import SEO from '$lib/components/SEO.svelte';

	let { children } = $props();

	// Initialize the theme context for shadcn forms
	setThemeContext({ components });
</script>

<SEO />

<QueryClientProvider client={queryClient}>
	<ModeWatcher />
	<Header />
	<RelayWidget />
	<Toaster />
	<div class=" pt-14">
		{@render children()}
	</div>

	<!-- Global dialog for relay change notifications -->
	<RelayChangeDialog />
</QueryClientProvider>
