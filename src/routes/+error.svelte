<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
</script>

<main class="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background px-4">
	<div class="mx-auto max-w-md text-center">
		<p class="mb-2 text-7xl font-bold tracking-tight text-primary">
			{page.status}
		</p>
		<h1 class="mb-4 text-2xl font-semibold text-foreground">
			{#if page.status === 404}
				Page not found
			{:else if page.status === 500}
				Something went wrong
			{:else}
				An error occurred
			{/if}
		</h1>
		<p class="mb-8 text-muted-foreground">
			{page.error?.message || "The page you're looking for doesn't exist or has been moved."}
		</p>
		<div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
			<Button href={resolve('/')} variant="default">Go back home</Button>
			<Button href={resolve('/servers')} variant="outline">Browse servers</Button>
		</div>
	</div>
</main>
