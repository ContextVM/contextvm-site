import { InitializeResultSchema } from '@contextvm/mcp-sdk/types.js';
import { SERVER_ANNOUNCEMENT_KIND } from '@contextvm/sdk';
import { SimplePool } from 'nostr-tools/pool';
import { LongFormArticle } from 'nostr-tools/kinds';
import { validateEvent, verifyEvent, type Event } from 'nostr-tools';
import { readFile, rename, writeFile } from 'node:fs/promises';
import {
	ARTICLE_AUTHOR,
	ARTICLE_RELAYS,
	EXCLUDED_ARTICLE_IDENTIFIERS,
	SERVER_SOURCES
} from './seo-snapshot-sources';

interface ServerSnapshot {
	event: Event;
	relays: string[];
}

interface SeoSnapshot {
	schemaVersion: 1;
	generatedAt: string;
	articles: Event[];
	servers: ServerSnapshot[];
}

const SNAPSHOT_PATH = new URL('../src/lib/content/seo-snapshot.json', import.meta.url);
const TEMP_PATH = new URL('../src/lib/content/seo-snapshot.json.tmp', import.meta.url);
const MAX_WAIT_MS = 10_000;

function tagValue(event: Event, name: string): string | null {
	return event.tags.find((tag) => tag[0] === name)?.[1] || null;
}

// Website/picture tags are rendered into prerendered href/src attributes, so
// anything that is not a plain http(s) URL is rejected at this trust boundary.
function safeHttpUrl(value: string | null): boolean {
	if (value === null) return true;
	try {
		const protocol = new URL(value).protocol;
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
}

function validSignedEvent(event: Event): boolean {
	return validateEvent(event) && verifyEvent(event);
}

function validArticle(event: Event): boolean {
	const identifier = tagValue(event, 'd');
	return (
		validSignedEvent(event) &&
		event.kind === LongFormArticle &&
		event.pubkey === ARTICLE_AUTHOR &&
		Boolean(identifier && /^[A-Za-z0-9_-]+$/.test(identifier)) &&
		Boolean(tagValue(event, 'title')) &&
		Boolean(event.content.trim())
	);
}

function validServer(event: Event, pubkey: string): boolean {
	if (
		!validSignedEvent(event) ||
		event.kind !== SERVER_ANNOUNCEMENT_KIND ||
		event.pubkey !== pubkey
	) {
		return false;
	}

	try {
		const content = JSON.parse(event.content);
		const initializeResult = 'result' in content ? content.result : content;
		if (!InitializeResultSchema.safeParse(initializeResult).success) return false;
	} catch {
		return false;
	}

	return safeHttpUrl(tagValue(event, 'website')) && safeHttpUrl(tagValue(event, 'picture'));
}

function latestByIdentifier(events: Event[]): Event[] {
	const latest = new Map<string, Event>();

	for (const event of events) {
		const identifier = tagValue(event, 'd');
		if (!identifier || EXCLUDED_ARTICLE_IDENTIFIERS.includes(identifier)) continue;

		const current = latest.get(identifier);
		if (!current || event.created_at > current.created_at) latest.set(identifier, event);
	}

	return [...latest.values()].sort((a, b) => b.created_at - a.created_at);
}

async function readPreviousSnapshot(): Promise<SeoSnapshot> {
	try {
		return JSON.parse(await readFile(SNAPSHOT_PATH, 'utf8')) as SeoSnapshot;
	} catch (error) {
		throw new Error(
			`Could not read the previous snapshot at ${SNAPSHOT_PATH.pathname} (restore it from git history if it was deleted): ${error}`
		);
	}
}

async function refresh() {
	const previous = await readPreviousSnapshot();
	const pool = new SimplePool();

	try {
		const articleEvents = await pool.querySync(
			ARTICLE_RELAYS,
			{ kinds: [LongFormArticle], authors: [ARTICLE_AUTHOR], limit: 500 },
			{ maxWait: MAX_WAIT_MS }
		);
		const validArticles = articleEvents.filter(validArticle);

		if (validArticles.length === 0) {
			throw new Error('No valid ContextVM articles were returned; the previous snapshot was kept.');
		}

		const articles = latestByIdentifier([
			...previous.articles.filter(validArticle),
			...validArticles
		]);
		if (articles.length === 0) throw new Error('The article snapshot cannot be empty.');

		const servers: ServerSnapshot[] = [];
		for (const source of SERVER_SOURCES) {
			const events = await pool.querySync(
				source.relays.slice(),
				{ kinds: [SERVER_ANNOUNCEMENT_KIND], authors: [source.pubkey] },
				{ maxWait: MAX_WAIT_MS }
			);
			const current = events
				.filter((event) => validServer(event, source.pubkey))
				.sort((a, b) => b.created_at - a.created_at)[0];
			const fallback = previous.servers.find(
				(server) =>
					server.event.pubkey === source.pubkey && validServer(server.event, source.pubkey)
			);

			if (!current && !fallback) {
				throw new Error(`No valid announcement found for curated server ${source.pubkey}.`);
			}

			servers.push({ event: current ?? fallback!.event, relays: source.relays.slice() });
		}

		const snapshot: SeoSnapshot = {
			schemaVersion: 1,
			generatedAt: new Date().toISOString(),
			articles,
			servers
		};
		const output = `${JSON.stringify(snapshot, null, '\t')}\n`;
		await writeFile(TEMP_PATH, output, 'utf8');
		await rename(TEMP_PATH, SNAPSHOT_PATH);

		console.log(
			`Wrote ${articles.length} articles and ${servers.length} servers to the SEO snapshot.`
		);
	} finally {
		pool.close([...ARTICLE_RELAYS, ...SERVER_SOURCES.flatMap((source) => source.relays)]);
	}
}

await refresh();
