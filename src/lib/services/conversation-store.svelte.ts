import { browser } from '$app/environment';
import type { ChatMessage, Conversation } from '$lib/types/chat-types';
import { truncateString } from '$lib/utils';

const DB_NAME = 'contextvm-chat';
const DB_VERSION = 1;
const STORE_NAME = 'conversations';
const DEFAULT_TITLE = 'New Chat';

export const conversationStore = $state({
	conversations: [] as Conversation[],
	loading: false,
	error: null as string | null
});

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
	if (!browser) {
		return Promise.reject(new Error('IndexedDB is only available in the browser'));
	}

	if (dbPromise) {
		return dbPromise;
	}

	dbPromise = new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
				store.createIndex('updatedAt', 'updatedAt', { unique: false });
			}
		};

		request.onerror = () => {
			dbPromise = null;
			reject(request.error);
		};

		request.onsuccess = () => {
			resolve(request.result);
		};
	});

	return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}

function toTimestamp(value: Date | number | string): number {
	if (value instanceof Date) {
		return value.getTime();
	}

	const asNumber = typeof value === 'number' ? value : Date.parse(String(value));
	return Number.isNaN(asNumber) ? 0 : asNumber;
}

function deriveTitle(messages: ChatMessage[]): string {
	const firstUserMessage = messages.find(
		(message) => message.role === 'user' && message.content.trim().length > 0
	);

	if (!firstUserMessage) {
		return DEFAULT_TITLE;
	}

	return truncateString(firstUserMessage.content.trim(), 64);
}

function upsertConversationInStore(conversation: Conversation): void {
	const existing = conversationStore.conversations;
	const index = existing.findIndex((item) => item.id === conversation.id);
	const next = [...existing];

	if (index >= 0) {
		next[index] = conversation;
	} else {
		next.unshift(conversation);
	}

	conversationStore.conversations = next.sort(
		(a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)
	);
}

function removeConversationFromStore(id: string): void {
	conversationStore.conversations = conversationStore.conversations.filter(
		(conversation) => conversation.id !== id
	);
}

async function saveConversation(conversation: Conversation): Promise<void> {
	const db = await openDatabase();
	const transaction = db.transaction(STORE_NAME, 'readwrite');
	transaction.objectStore(STORE_NAME).put($state.snapshot(conversation));
	await waitForTransaction(transaction);
}

async function removeConversation(id: string): Promise<void> {
	const db = await openDatabase();
	const transaction = db.transaction(STORE_NAME, 'readwrite');
	transaction.objectStore(STORE_NAME).delete(id);
	await waitForTransaction(transaction);
}

export async function listConversations(): Promise<Conversation[]> {
	if (!browser) {
		conversationStore.conversations = [];
		return [];
	}

	conversationStore.loading = true;

	try {
		const db = await openDatabase();
		const transaction = db.transaction(STORE_NAME, 'readonly');
		const store = transaction.objectStore(STORE_NAME);
		const results = await requestToPromise(store.getAll());

		const conversations = [...results].sort(
			(a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)
		);

		conversationStore.conversations = conversations;
		conversationStore.error = null;
		return conversations;
	} catch (error) {
		conversationStore.error =
			error instanceof Error ? error.message : 'Failed to load conversations';
		throw error;
	} finally {
		conversationStore.loading = false;
	}
}

export async function getConversation(id: string): Promise<Conversation | null> {
	if (!browser) {
		return null;
	}

	const db = await openDatabase();
	const transaction = db.transaction(STORE_NAME, 'readonly');
	const store = transaction.objectStore(STORE_NAME);
	const conversation = await requestToPromise(store.get(id));
	return (conversation as Conversation | undefined) ?? null;
}

export async function createConversation(): Promise<Conversation> {
	if (!browser) {
		throw new Error('IndexedDB is only available in the browser');
	}

	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- persisted timestamp, not a live reactive clock
	const now = new Date();
	const conversation: Conversation = {
		id: crypto.randomUUID(),
		title: DEFAULT_TITLE,
		messages: [],
		createdAt: now,
		updatedAt: now
	};

	await saveConversation(conversation);
	upsertConversationInStore(conversation);
	return conversation;
}

export async function updateConversation(
	id: string,
	messages: ChatMessage[]
): Promise<Conversation> {
	if (!browser) {
		throw new Error('IndexedDB is only available in the browser');
	}

	return new Promise((resolve, reject) => {
		openDatabase()
			.then((db) => {
				const transaction = db.transaction(STORE_NAME, 'readwrite');
				const store = transaction.objectStore(STORE_NAME);

				const getReq = store.get(id);
				getReq.onsuccess = () => {
					const existing = getReq.result as Conversation | undefined;
					if (!existing) {
						reject(new Error('Conversation not found'));
						return;
					}

					const nextTitle =
						existing.title.trim() === DEFAULT_TITLE || existing.title.trim().length === 0
							? deriveTitle(messages)
							: existing.title;

					const updated: Conversation = {
						...existing,
						title: nextTitle,
						messages,
						// eslint-disable-next-line svelte/prefer-svelte-reactivity
						updatedAt: new Date()
					};

					store.put($state.snapshot(updated));

					transaction.oncomplete = () => {
						upsertConversationInStore(updated);
						resolve(updated);
					};
				};

				getReq.onerror = () => reject(getReq.error);
				transaction.onerror = () => reject(transaction.error);
				transaction.onabort = () => reject(transaction.error);
			})
			.catch(reject);
	});
}

export async function deleteConversation(id: string): Promise<void> {
	if (!browser) {
		throw new Error('IndexedDB is only available in the browser');
	}

	await removeConversation(id);
	removeConversationFromStore(id);
}

export async function renameConversation(id: string, title: string): Promise<Conversation> {
	if (!browser) {
		throw new Error('IndexedDB is only available in the browser');
	}

	return new Promise((resolve, reject) => {
		openDatabase()
			.then((db) => {
				const transaction = db.transaction(STORE_NAME, 'readwrite');
				const store = transaction.objectStore(STORE_NAME);

				const getReq = store.get(id);
				getReq.onsuccess = () => {
					const existing = getReq.result as Conversation | undefined;
					if (!existing) {
						reject(new Error('Conversation not found'));
						return;
					}

					const updated: Conversation = {
						...existing,
						title: title.trim() || DEFAULT_TITLE,
						// eslint-disable-next-line svelte/prefer-svelte-reactivity
						updatedAt: new Date()
					};

					store.put($state.snapshot(updated));

					transaction.oncomplete = () => {
						upsertConversationInStore(updated);
						resolve(updated);
					};
				};

				getReq.onerror = () => reject(getReq.error);
				transaction.onerror = () => reject(transaction.error);
				transaction.onabort = () => reject(transaction.error);
			})
			.catch(reject);
	});
}
