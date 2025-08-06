<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import RelaySelector from './RelaySelector.svelte';
	import Network from '@lucide/svelte/icons/network';
</script>

<Dialog.Root>
	<Dialog.Trigger
		class={buttonVariants({
			variant: 'outline',
			size: 'icon',
			class: 'fixed bottom-4 left-4 z-50 rounded-full shadow-lg'
		})}
		title="Manage Relays"
		aria-label="Manage Relays"
	>
		<Network class="h-5 w-5" />
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Relay Management</Dialog.Title>
			<Dialog.Description>
				Manage your Nostr relay connections. Add custom relays or use default configurations.
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-2">
			<RelaySelector />
		</div>
	</Dialog.Content>
</Dialog.Root>
