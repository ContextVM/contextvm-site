<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ConversationList from '$lib/components/chat/ConversationList.svelte';

	let { activeId = $bindable(null) }: { activeId?: string | null } = $props();
</script>

<Sidebar.Root collapsible="icon" class="border-r border-border/60 bg-sidebar/95">
	<Sidebar.Header class="border-b border-border/60 bg-sidebar/80">
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2 group-data-[state=collapsed]/sidebar:hidden">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground shadow-sm"
				>
					CV
				</div>
				<div class="flex flex-col">
					<span class="text-sm leading-none font-semibold"> Chat </span>
					<span class="text-xs text-muted-foreground"> Your conversations </span>
				</div>
			</div>
			<Sidebar.Trigger />
		</div>
		<Sidebar.Menu class="group-data-[state=collapsed]/sidebar:hidden">
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					isActive={true}
					class="transition-colors data-[active=true]:bg-sidebar-accent/80 data-[active=true]:text-sidebar-accent-foreground"
				>
					Conversations
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content class="px-2 pb-4 group-data-[state=collapsed]/sidebar:hidden">
		<ConversationList bind:activeId />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
