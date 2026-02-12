import type { CapTag } from '@contextvm/sdk';
import type { Event } from 'nostr-tools';

export type Cep8CapabilityKind = 'tool' | 'prompt' | 'resource';

export interface ParsedCapTag {
	capabilityIdentifier: string;
	kind: Cep8CapabilityKind;
	name: string;
	price: string;
	currencyUnit: string;
}

function parseCapabilityIdentifier(
	capabilityIdentifier: string
): { kind: Cep8CapabilityKind; name: string } | null {
	if (capabilityIdentifier.startsWith('tool:')) {
		return { kind: 'tool', name: capabilityIdentifier.slice('tool:'.length) };
	}
	if (capabilityIdentifier.startsWith('prompt:')) {
		return { kind: 'prompt', name: capabilityIdentifier.slice('prompt:'.length) };
	}
	if (capabilityIdentifier.startsWith('resource:')) {
		return { kind: 'resource', name: capabilityIdentifier.slice('resource:'.length) };
	}
	return null;
}

export function parsePmiTagsFromEvent(event: Event | undefined | null): string[] {
	if (!event) return [];

	const pmis = event.tags
		.filter((t) => t[0] === 'pmi' && typeof t[1] === 'string')
		.map((t) => t[1] as string);

	// Deduplicate while preserving order.
	return [...new Set(pmis)];
}

export function parseCapTagsFromEvent(event: Event | undefined | null): CapTag[] {
	if (!event) return [];
	console.log('parseCapTagsFromEvent', event);
	// CEP-8 cap tag format: ['cap', capabilityIdentifier, price, currencyUnit]
	return event.tags
		.filter((t): t is [string, ...string[]] => t[0] === 'cap' && t.length >= 4)
		.map((t) => ['cap', String(t[1] ?? ''), String(t[2] ?? ''), String(t[3] ?? '')] as CapTag);
}

export function toParsedCapTags(capTags: CapTag[]): ParsedCapTag[] {
	return capTags
		.map((t) => {
			const capabilityIdentifier = t[1];
			const parsed = parseCapabilityIdentifier(capabilityIdentifier);
			if (!parsed) return null;
			return {
				capabilityIdentifier,
				kind: parsed.kind,
				name: parsed.name,
				price: t[2],
				currencyUnit: t[3]
			} satisfies ParsedCapTag;
		})
		.filter((x): x is ParsedCapTag => Boolean(x));
}

export function findCapTagForTool(capTags: CapTag[], toolName: string): CapTag | undefined {
	return capTags.find((t) => t[1] === `tool:${toolName}`);
}

export function findCapTagForPrompt(capTags: CapTag[], promptName: string): CapTag | undefined {
	return capTags.find((t) => t[1] === `prompt:${promptName}`);
}

export function findCapTagForResource(capTags: CapTag[], uri: string): CapTag | undefined {
	return capTags.find((t) => t[1] === `resource:${uri}`);
}

export function formatCapTagPrice(capTag: CapTag): string {
	const price = capTag[2];
	const unit = capTag[3];
	return unit ? `${price} ${unit}` : price;
}
