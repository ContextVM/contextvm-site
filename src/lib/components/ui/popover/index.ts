import { Popover as PopoverPrimitive } from 'bits-ui';
import Trigger from './popover-trigger.svelte';
import Content from './popover-content.svelte';

const Root = PopoverPrimitive.Root;
const Portal = PopoverPrimitive.Portal;

export {
	Root,
	Trigger,
	Content,
	Portal,
	//
	Root as Popover,
	Trigger as PopoverTrigger,
	Content as PopoverContent,
	Portal as PopoverPortal
};
