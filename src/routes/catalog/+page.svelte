<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(resolve('/servers'), { replaceState: true });
	});
</script>

<p>Redirecting to <a href={resolve('/servers')}>Servers</a>...</p>
