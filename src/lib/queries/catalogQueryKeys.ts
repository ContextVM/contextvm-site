export const catalogKeys = {
	all: ['catalog'] as const,
	providers: (hash: string) => [...catalogKeys.all, 'providers', hash] as const
} as const;
