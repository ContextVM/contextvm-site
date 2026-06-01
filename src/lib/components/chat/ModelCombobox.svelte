<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { cn } from '$lib/utils.js';
	import { LLMService } from '$lib/services/llm';
	import { FREE_MODEL_SUFFIX } from '$lib/services/auto-mode';
	import { DEFAULT_OPENROUTER_KEY } from '$lib/types/chat-types';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CheckIcon from '@lucide/svelte/icons/check';

	let {
		provider,
		baseURL,
		apiKey,
		value = $bindable(''),
		onChange
	}: {
		provider: string;
		baseURL: string;
		apiKey: string;
		value?: string;
		onChange?: (model: string) => void;
	} = $props();

	let open = $state(false);
	let status = $state<'idle' | 'loading' | 'error'>('idle');
	let errorMessage = $state<string | null>(null);
	let models = $state<string[]>([]);
	let debounceHandle: ReturnType<typeof setTimeout> | null = null;
	let activeAbort: AbortController | null = null;

	const showAuto = $derived(provider === 'openrouter');
	const freeModels = $derived(models.filter((id) => id.endsWith(FREE_MODEL_SUFFIX)));
	const paidModels = $derived(models.filter((id) => !id.endsWith(FREE_MODEL_SUFFIX)));

	const selectedLabel = $derived.by(() => {
		if (showAuto && value === 'auto') {
			return 'Auto (free models)';
		}

		return value || 'Select model';
	});

	$effect(() => {
		const effectiveKey = apiKey || (provider === 'openrouter' ? DEFAULT_OPENROUTER_KEY : '');

		if (!baseURL.trim() || !effectiveKey) {
			models = [];
			status = 'idle';
			errorMessage = null;
			activeAbort?.abort();
			return;
		}

		let cancelled = false;
		status = 'loading';
		errorMessage = null;

		if (debounceHandle) {
			clearTimeout(debounceHandle);
		}
		activeAbort?.abort();
		const controller = new AbortController();
		activeAbort = controller;

		debounceHandle = setTimeout(() => {
			const tempService = new LLMService({
				provider,
				baseURL,
				apiKey: effectiveKey,
				model: 'auto'
			});

			tempService.fetchModels(controller.signal)
				.then((list: string[]) => {
					if (cancelled || controller.signal.aborted) {
						return;
					}

					if (!list.length) {
						status = 'error';
						errorMessage = 'No models returned from the provider.';
						models = [];
						return;
					}

					models = list;
					status = 'idle';
				})
				.catch((error: unknown) => {
					if (cancelled || controller.signal.aborted) {
						return;
					}

					status = 'error';
					models = [];
					errorMessage = error instanceof Error ? error.message : 'Failed to load models.';
				});
		}, 300);

		return () => {
			cancelled = true;
			if (debounceHandle) {
				clearTimeout(debounceHandle);
				debounceHandle = null;
			}
			if (activeAbort === controller) {
				activeAbort = null;
			}
			controller.abort();
		};
	});

	const handleSelect = (modelId: string) => {
		value = modelId;
		onChange?.(modelId);
		open = false;
	};

	const handleManualInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		value = target.value;
		onChange?.(target.value);
	};
</script>

{#if status === 'error'}
	<div class="space-y-2">
		<Input placeholder="Enter a model id" {value} oninput={handleManualInput} />
		<p class="text-xs text-destructive">
			{errorMessage ?? 'Model list unavailable. Enter the model id manually.'}
		</p>
	</div>
{:else}
	<Popover.Root bind:open>
		<Popover.Trigger
			role="combobox"
			aria-expanded={open}
			class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm shadow-xs"
		>
			<span class="truncate">{selectedLabel}</span>
			<ChevronsUpDownIcon class="ml-2 h-4 w-4 opacity-50" />
		</Popover.Trigger>
		<Popover.Content class="p-0">
			<Command.Root>
				<Command.Input placeholder="Search models..." />
				<Command.List>
					{#if status === 'loading'}
						<Command.Loading>Loading models...</Command.Loading>
					{:else}
						<Command.Empty>No models found.</Command.Empty>
						{#if showAuto}
							<Command.Group>
								<Command.GroupHeading>Auto</Command.GroupHeading>
								<Command.GroupItems>
									<Command.Item value="auto" onSelect={() => handleSelect('auto')}>
										<CheckIcon
											class={cn('h-4 w-4', value === 'auto' ? 'opacity-100' : 'opacity-0')}
										/>
										Auto (free models)
									</Command.Item>
								</Command.GroupItems>
							</Command.Group>
						{/if}
						{#if freeModels.length}
							<Command.Group>
								<Command.GroupHeading>Free models</Command.GroupHeading>
								<Command.GroupItems>
									{#each freeModels as model (model)}
										<Command.Item value={model} onSelect={() => handleSelect(model)}>
											<CheckIcon
												class={cn('h-4 w-4', value === model ? 'opacity-100' : 'opacity-0')}
											/>
											<span class="truncate">{model}</span>
										</Command.Item>
									{/each}
								</Command.GroupItems>
							</Command.Group>
						{/if}
						{#if paidModels.length}
							<Command.Group>
								<Command.GroupHeading>All models</Command.GroupHeading>
								<Command.GroupItems>
									{#each paidModels as model (model)}
										<Command.Item value={model} onSelect={() => handleSelect(model)}>
											<CheckIcon
												class={cn('h-4 w-4', value === model ? 'opacity-100' : 'opacity-0')}
											/>
											<span class="truncate">{model}</span>
										</Command.Item>
									{/each}
								</Command.GroupItems>
							</Command.Group>
						{/if}
					{/if}
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
{/if}
