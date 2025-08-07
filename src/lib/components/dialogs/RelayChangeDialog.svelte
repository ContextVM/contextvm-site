<script lang="ts">
	import {
		Dialog,
		DialogPortal,
		DialogOverlay,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose
	} from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { dialogState, dialogActions } from '$lib/stores/dialog-state.svelte';

	// Function to handle reconnecting all clients
	async function handleReconnect() {
		if (dialogState.onConfirm) {
			dialogState.onConfirm();
		}
		dialogActions.hideDialog();
	}
</script>

<Dialog bind:open={dialogState.show}>
	<DialogPortal>
		<DialogOverlay class="fixed inset-0 z-50 bg-black/80" />
		<DialogContent
			class="fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-lg sm:max-w-md"
		>
			<DialogHeader>
				<DialogTitle>{dialogState.title}</DialogTitle>
				<DialogDescription>{dialogState.description}</DialogDescription>
			</DialogHeader>
			<DialogFooter class="mt-4 flex justify-end space-x-2">
				<DialogClose>
					<Button variant="outline">Cancel</Button>
				</DialogClose>
				<Button onclick={handleReconnect}>Reconnect Now</Button>
			</DialogFooter>
			<DialogClose
				class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
			>
				<span class="sr-only">Close</span>
			</DialogClose>
		</DialogContent>
	</DialogPortal>
</Dialog>
