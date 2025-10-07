import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getApiBaseUrl, registerUser} from '../api';

// Helper to mock fetch
function mockFetchOnce(response: { status?: number; ok?: boolean }, options?: { json?: unknown; text?: string }) {
    const {status = 200, ok = status >= 200 && status < 300} = response;
    const text = options?.text ?? (typeof options?.json !== 'undefined' ? JSON.stringify(options.json) : '');
    // @ts-expect-error minimal Response mock
    global.fetch = vi.fn(async () => ({
        ok,
        status,
        text: async () => text,
    }));
}

function mockFetchReject(err: unknown) {
    // @ts-expect-error assign fetch
    global.fetch = vi.fn(async () => {
        throw err;
    });
}

describe('getApiBaseUrl', () => {
    beforeEach(() => {
        // Reset env before each test
        // @ts-expect-error allow overriding vite env in tests
        (import.meta as unknown as { env: Record<string, unknown> }).env = {};
        (globalThis as unknown as { VITE_API_BASE_URL?: string }).VITE_API_BASE_URL = undefined;
    });

    it('returns default when VITE_API_BASE_URL is not set', () => {
        expect(getApiBaseUrl()).toBe('http://localhost:8080');
    });

    it('returns provided VITE_API_BASE_URL when set and non-empty', () => {
        // @ts-expect-error allow overriding vite env in tests
        (import.meta as unknown as {
            env: Record<string, unknown>
        }).env = {VITE_API_BASE_URL: 'http://api.example.com'};
        (globalThis as unknown as { VITE_API_BASE_URL?: string }).VITE_API_BASE_URL = 'http://api.example.com';
        expect(getApiBaseUrl()).toBe('http://api.example.com');
    });

    it('trims and falls back when VITE_API_BASE_URL is empty/whitespace', () => {
        // @ts-expect-error allow overriding vite env in tests
        (import.meta as unknown as { env: Record<string, unknown> }).env = {VITE_API_BASE_URL: '   '};
        (globalThis as unknown as { VITE_API_BASE_URL?: string }).VITE_API_BASE_URL = '   ';
        expect(getApiBaseUrl()).toBe('http://localhost:8080');
    });
});

describe('registerUser', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    const payload = {
        email: 'user@example.com',
        password: 'secret123',
        name: 'User Name',
    } as const;

    it('handles 200 OK with JSON message', async () => {
        mockFetchOnce({status: 200}, {json: {message: 'ok'}});
        const res = await registerUser(payload);
        expect(fetch).toHaveBeenCalledOnce();
        expect(res).toEqual({success: true, message: 'ok'});
    });

    it('handles 201 Created with empty body', async () => {
        mockFetchOnce({status: 201, ok: true}, {text: ''});
        const res = await registerUser(payload);
        expect(res.success).toBe(true);
        expect(res.message).toBe('User registered successfully');
    });

    it('handles non-OK with JSON error message', async () => {
        mockFetchOnce({status: 400, ok: false}, {json: {message: 'Bad request'}});
        const res = await registerUser(payload);
        expect(res).toEqual({success: false, message: 'Bad request'});
    });

    it('handles non-OK with plain text body', async () => {
        mockFetchOnce({status: 500, ok: false}, {text: 'Server error'});
        const res = await registerUser(payload);
        expect(res).toEqual({success: false, message: 'Server error'});
    });

    it('handles network-level failure', async () => {
        mockFetchReject(new Error('Network down'));
        const res = await registerUser(payload);
        expect(res.success).toBe(false);
        expect(res.message).toContain('Network down');
    });
});
