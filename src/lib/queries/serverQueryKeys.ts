export const serverKeys = {
	all: ['servers'] as const,
	detail: (pubkey: string) => [...serverKeys.all, pubkey] as const,
	announcement: (pubkey: string) => [...serverKeys.detail(pubkey), 'announcement'] as const,
	identity: (pubkey: string) => [...serverKeys.detail(pubkey), 'identity'] as const,
	profile: (pubkey: string) => [...serverKeys.detail(pubkey), 'profile'] as const,
	notes: (pubkey: string) => [...serverKeys.detail(pubkey), 'notes'] as const,
	capabilities: {
		all: (pubkey: string) => [...serverKeys.detail(pubkey), 'capabilities'] as const,
		tools: (pubkey: string) => [...serverKeys.capabilities.all(pubkey), 'tools'] as const,
		resources: (pubkey: string) => [...serverKeys.capabilities.all(pubkey), 'resources'] as const,
		resourceTemplates: (pubkey: string) =>
			[...serverKeys.capabilities.all(pubkey), 'resourceTemplates'] as const,
		prompts: (pubkey: string) => [...serverKeys.capabilities.all(pubkey), 'prompts'] as const
	}
} as const;
