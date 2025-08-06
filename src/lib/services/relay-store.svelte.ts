import { dev } from '$app/environment';
import { defaultRelays, devRelay } from './relay-pool';

// Reactive state for selected relays
let selectedRelays = $state<string[]>(!dev ? devRelay : defaultRelays);

// Function to update selected relays
export function setSelectedRelays(relays: string[]) {
	relayState.current = relays;
}

// Function to get current selected relays
export function getSelectedRelays(): string[] {
	return selectedRelays;
}

// Function to reset to default relays
export function resetToDefaultRelays() {
	relayState.current = defaultRelays;
}

// Function to use dev relay
export function useDevRelay() {
	relayState.current = devRelay;
}

// Function to remove relays from selected relays
export function removeRelays(relaysToRemove: string[]): void {
	selectedRelays = selectedRelays.filter(
		(relay) =>
			!relaysToRemove.some(
				(relayToRemove) => relay.startsWith(relayToRemove) || relayToRemove.startsWith(relay)
			)
	);
}

// Export a reactive object that components can use
export const relayState = {
	get current() {
		return selectedRelays;
	},
	set current(relays: string[]) {
		selectedRelays = relays;
	}
};
