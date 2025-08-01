<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />
<Header />
<div class=" pt-14">
	{@render children()}
</div>
