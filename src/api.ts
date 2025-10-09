export function getApiBaseUrl(): string {
    const fromEnv = import.meta.env?.VITE_API_BASE_URL as string | undefined;
    // Allow tests or runtime overrides via a global variable
    const fromGlobal = (globalThis as unknown as { VITE_API_BASE_URL?: string }).VITE_API_BASE_URL;
    const chosen = (fromEnv && fromEnv.trim().length > 0) ? fromEnv : (fromGlobal && fromGlobal.trim().length > 0 ? fromGlobal : undefined);
    // Default to local backend if not provided
    return chosen ?? 'http://localhost:8080';
}

function extractApiMessage(input: unknown): { message?: string; error?: string } {
    if (input && typeof input === 'object') {
        const rec = input as Record<string, unknown>;
        const message = typeof rec.message === 'string' ? rec.message : undefined;
        const error = typeof rec.error === 'string' ? rec.error : undefined;
        return {message, error};
    }
    return {};
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    try {
        return JSON.stringify(err);
    } catch {
        return 'Network error';
    }
}

// Fetch wrapper with timeout protection to avoid hanging requests
async function safeFetch(input: RequestInfo | URL, init?: RequestInit & { timeoutMs?: number }) {
    const { timeoutMs = 10000, ...rest } = init || {};
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        // Attach abort signal
        const res = await fetch(input, { ...rest, signal: controller.signal });
        return res;
    } finally {
        clearTimeout(id);
    }
}

export async function registerUser(payload: {
    email: string;
    password: string;
    name: string;
    mobileNumber?: string;
    address?: string;
}): Promise<{ success: boolean; message: string }> {
    const base = getApiBaseUrl();
    const url = `${base.replace(/\/$/, '')}/auth/register`;
    try {
        const res = await safeFetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            timeoutMs: 10000,
        });

        const text = await (res as Response).text();
        // Try to parse JSON, but tolerate plain text; backend may return 201 with empty body
        let data: unknown = undefined;
        try {
            data = text ? JSON.parse(text) : undefined;
        } catch { /* ignore */
        }

        if (!(res as Response).ok) {
            // Backend returns ApiError { status, message }
            const {message, error} = extractApiMessage(data);
            const msg = message || error || text || `Request failed with status ${(res as Response).status}`;
            return {success: false, message: msg};
        }

        const {message} = extractApiMessage(data);
        const msg = message || 'User registered successfully';
        return {success: true, message: msg};
    } catch (err: unknown) {
        return {success: false, message: getErrorMessage(err)};
    }
}

export async function checkEmailExists(email: string): Promise<{ success: boolean; exists: boolean; message?: string }> {
    const base = getApiBaseUrl();
    const url = `${base.replace(/\/$/, '')}/auth/check-email?email=${encodeURIComponent(email)}`;
    try {
        const res = await safeFetch(url, { method: 'GET', timeoutMs: 10000 });
        const text = await (res as Response).text();
        let data: unknown = undefined;
        try { data = text ? JSON.parse(text) : undefined; } catch { /* ignore parse errors */ }
        if (!(res as Response).ok) {
            const {message, error} = extractApiMessage(data);
            const msg = message || error || text || `Request failed with status ${(res as Response).status}`;
            return { success: false, exists: false, message: msg };
        }
        // Accept either {exists: boolean} or {available: boolean}
        const rec = (data && typeof data === 'object') ? data as Record<string, unknown> : {};
        const exists = typeof rec.exists === 'boolean' ? rec.exists : (typeof rec.available === 'boolean' ? !rec.available : false);
        return { success: true, exists };
    } catch (err: unknown) {
        return { success: false, exists: false, message: getErrorMessage(err) };
    }
}

export async function loginUser(payload: { email: string; password: string }): Promise<{ success: boolean; message: string }> {
    const base = getApiBaseUrl();
    const url = `${base.replace(/\/$/, '')}/auth/login`;
    try {
        const res = await safeFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            timeoutMs: 10000,
        });
        const text = await (res as Response).text();
        let data: unknown = undefined;
        try { data = text ? JSON.parse(text) : undefined; } catch { /* ignore parse errors */ }
        if (!(res as Response).ok) {
            const {message, error} = extractApiMessage(data);
            const msg = message || error || text || `Login failed with status ${(res as Response).status}`;
            return { success: false, message: msg };
        }
        const {message} = extractApiMessage(data);
        return { success: true, message: message || 'Login successful' };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) };
    }
}
