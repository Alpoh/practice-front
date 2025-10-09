import type { FormEvent } from 'react';
import { useState } from 'react';
import { loginUser } from '../api';

export default function SignInPage({ onBack, onSuccess }: { onBack?: () => void; onSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        if (!canSubmit) return;
        setLoading(true);
        const resp = await loginUser({ email: email.trim(), password });
        setLoading(false);
        if (resp.success) {
            onSuccess();
        } else {
            setError(resp.message);
        }
    }

    return (
        <div className="sign-in-page" style={{ padding: 24 }}>
            <h1>Sign In</h1>
            <form onSubmit={onSubmit} className="sign-in-form">
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        maxLength={320}
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {onBack && <button type="button" onClick={onBack} disabled={loading}>Back</button>}
                    <button type="submit" disabled={!canSubmit}>{loading ? 'Signing in...' : 'Sign In'}</button>
                </div>
                {error && <div className="alert error" style={{ marginTop: 12 }}>{error}</div>}
            </form>
        </div>
    );
}
