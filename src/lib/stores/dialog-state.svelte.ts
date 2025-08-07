// Dialog state interface
interface DialogState {
	show: boolean;
	title: string;
	description: string;
	onConfirm: (() => void) | null;
}

// Reactive dialog state object using Svelte 5 $state
export const dialogState = $state<DialogState>({
	show: false,
	title: '',
	description: '',
	onConfirm: null
});

// Helper functions to control the dialog
export const dialogActions = {
	// Show a dialog with specific content
	showDialog: (title: string, description: string, onConfirm?: () => void) => {
		dialogState.title = title;
		dialogState.description = description;
		dialogState.onConfirm = onConfirm || null;
		dialogState.show = true;
	},

	// Hide the dialog
	hideDialog: () => {
		dialogState.show = false;
		dialogState.onConfirm = null;
	}
};
