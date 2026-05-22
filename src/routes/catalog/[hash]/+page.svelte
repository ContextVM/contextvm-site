<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	const hash = $derived(page.params.hash);

	onMount(() => {
		goto(resolve(`/servers/i/${hash}`), { replaceState: true });
	});
</script>

<p>Redirecting...</p>
