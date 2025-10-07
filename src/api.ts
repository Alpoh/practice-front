export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env?.VITE_API_BASE_URL as string | undefined;
  // Default to local backend if not provided
  return (fromEnv && fromEnv.trim().length > 0) ? fromEnv : 'http://localhost:8080';
}

export async function registerUser(payload: {
  username: string;
  email?: string;
  password: string;
}): Promise<{ success: boolean; message: string }>
{
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
    // Try to parse JSON, but tolerate plain text
    let data: any = undefined;
    try { data = text ? JSON.parse(text) : undefined; } catch { /* ignore */ }

    if (!res.ok) {
      const msg = data?.message || data?.error || text || `Request failed with status ${res.status}`;
      return { success: false, message: msg };
    }

    const msg = data?.message || 'User registered successfully';
    return { success: true, message: msg };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error' };
  }
}
