<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { PROVIDER_PRESETS, type ProviderPreset } from '$lib/types/chat-types';
	import { cn } from '$lib/utils.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CheckIcon from '@lucide/svelte/icons/check';

	let {
		value = $bindable(PROVIDER_PRESETS[0]?.key ?? 'openrouter'),
		onSelect
	}: {
		value?: string;
		onSelect?: (preset: ProviderPreset) => void;
	} = $props();

	let open = $state(false);

	const selectedPreset = $derived(PROVIDER_PRESETS.find((preset) => preset.key === value));

	const handleSelect = (preset: ProviderPreset) => {
		value = preset.key;
		onSelect?.(preset);
		open = false;
	};
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		role="combobox"
		aria-expanded={open}
		class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm shadow-xs"
	>
		<span class="truncate">{selectedPreset?.label ?? 'Select provider'}</span>
		<ChevronsUpDownIcon class="ml-2 h-4 w-4 opacity-50" />
	</Popover.Trigger>
	<Popover.Content class="p-0">
		<Command.Root>
			<Command.Input placeholder="Search providers..." />
			<Command.List>
				<Command.Empty>No providers found.</Command.Empty>
				<Command.Group>
					<Command.GroupItems>
						{#each PROVIDER_PRESETS as preset (preset.key)}
							<Command.Item value={preset.key} onSelect={() => handleSelect(preset)}>
								<CheckIcon
									class={cn('h-4 w-4', value === preset.key ? 'opacity-100' : 'opacity-0')}
								/>
								<div class="flex flex-col">
									<span>{preset.label}</span>
									<span class="text-xs text-muted-foreground">
										{preset.baseURL || 'Custom base URL'}
									</span>
								</div>
							</Command.Item>
						{/each}
					</Command.GroupItems>
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
