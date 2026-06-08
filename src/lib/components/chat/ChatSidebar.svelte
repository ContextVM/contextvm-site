<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ConversationList from '$lib/components/chat/ConversationList.svelte';
	import ServerPanel from '$lib/components/chat/ServerPanel.svelte';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import ServerIcon from '@lucide/svelte/icons/server';

	let { activeId = $bindable(null) }: { activeId?: string | null } = $props();
	let activePanel = $state<'conversations' | 'servers'>('conversations');
</script>

<Sidebar.Root collapsible="icon" class="h-full border-r border-border/60 bg-sidebar/95">
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
					<span class="text-xs text-muted-foreground">
						{activePanel === 'conversations' ? 'Your conversations' : 'Connected servers'}
					</span>
				</div>
			</div>
			<Sidebar.Trigger />
		</div>
		<Sidebar.Menu class="group-data-[state=collapsed]/sidebar:hidden">
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					isActive={activePanel === 'conversations'}
					class="transition-colors data-[active=true]:bg-sidebar-accent/80 data-[active=true]:text-sidebar-accent-foreground"
					onclick={() => (activePanel = 'conversations')}
				>
					<MessageSquareIcon class="h-4 w-4" />
					Conversations
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					isActive={activePanel === 'servers'}
					class="transition-colors data-[active=true]:bg-sidebar-accent/80 data-[active=true]:text-sidebar-accent-foreground"
					onclick={() => (activePanel = 'servers')}
				>
					<ServerIcon class="h-4 w-4" />
					Servers
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content class="min-h-0 group-data-[state=collapsed]/sidebar:hidden">
		{#if activePanel === 'conversations'}
			<ConversationList bind:activeId />
		{:else}
			<ServerPanel />
		{/if}
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
