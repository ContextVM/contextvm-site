<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import { setThemeContext } from '@sjsf/shadcn4-theme';
	import * as components from '@sjsf/shadcn4-theme/new-york';
	import RelayWidget from '$lib/components/RelayWidget.svelte';

	let { children } = $props();

	// Initialize the theme context for shadcn forms
	setThemeContext({ components });
</script>

<ModeWatcher />
<Header />
<RelayWidget />
<div class=" pt-14">
	{@render children()}
</div>
