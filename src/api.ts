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
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const text = await res.text();
        // Try to parse JSON, but tolerate plain text; backend may return 201 with empty body
        let data: unknown = undefined;
        try {
            data = text ? JSON.parse(text) : undefined;
        } catch { /* ignore */
        }

        if (!res.ok) {
            // Backend returns ApiError { status, message }
            const {message, error} = extractApiMessage(data);
            const msg = message || error || text || `Request failed with status ${res.status}`;
            return {success: false, message: msg};
        }

        const {message} = extractApiMessage(data);
        const msg = message || 'User registered successfully';
        return {success: true, message: msg};
    } catch (err: unknown) {
        return {success: false, message: getErrorMessage(err)};
    }
}
