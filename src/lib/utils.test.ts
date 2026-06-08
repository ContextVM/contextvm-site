import { describe, expect, it } from 'bun:test';
import { formatRelativeTime } from './utils';

describe('formatRelativeTime', () => {
	it('handles past relative times correctly', () => {
		const now = Date.now();
		expect(formatRelativeTime(new Date(now - 5000))).toBe('just now');
		expect(formatRelativeTime(new Date(now - 30000))).toBe('30s ago');
		expect(formatRelativeTime(new Date(now - 5 * 60 * 1000))).toBe('5m ago');
		expect(formatRelativeTime(new Date(now - 3 * 60 * 60 * 1000))).toBe('3h ago');
		expect(formatRelativeTime(new Date(now - 2 * 24 * 60 * 60 * 1000))).toBe('2d ago');
	});

	it('handles future relative times correctly without returning just now', () => {
		const now = Date.now();
		expect(formatRelativeTime(new Date(now + 5000))).toBe('just now');
		expect(formatRelativeTime(new Date(now + 30000))).toBe('in 30s');
		expect(formatRelativeTime(new Date(now + 5 * 60 * 1000))).toBe('in 5m');
		expect(formatRelativeTime(new Date(now + 3 * 60 * 60 * 1000))).toBe('in 3h');
		expect(formatRelativeTime(new Date(now + 2 * 24 * 60 * 60 * 1000))).toBe('in 2d');
	});

	it('returns empty string for invalid date values', () => {
		expect(formatRelativeTime('invalid-date-string')).toBe('');
	});
});
