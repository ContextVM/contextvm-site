import { getContext } from 'svelte';

export type SidebarState = 'expanded' | 'collapsed';

export interface SidebarContext {
	open: boolean;
	openMobile: boolean;
	state: SidebarState;
	isMobile: boolean;
	setOpen: (open: boolean) => void;
	setOpenMobile: (open: boolean) => void;
	toggle: () => void;
}

export const SIDEBAR_CONTEXT = Symbol('sidebar-context');

export function useSidebar(): SidebarContext {
	const context = getContext<SidebarContext>(SIDEBAR_CONTEXT);

	if (!context) {
		throw new Error('Sidebar context not found');
	}

	return context;
}
