import { FormEvent, useMemo, useState } from 'react';
import { registerUser } from '../api';
import './RegisterPage.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = useMemo(() => {
    if (!email) return true; // optional
    return /.+@.+\..+/.test(email);
  }, [email]);

  const canSubmit = username.trim().length > 0 && password.length >= 6 && password === confirmPassword && isValidEmail && !loading;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!canSubmit) return;
    setLoading(true);
    const resp = await registerUser({ username: username.trim(), email: email.trim() || undefined, password });
    setLoading(false);
    if (resp.success) {
      setMessage(resp.message);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(resp.message);
    }
  }

  return (
    <div className="register-page">
      <h1>User Registration</h1>
      <form onSubmit={onSubmit} className="register-form">
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
        </label>

        <label>
          Email (optional)
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </label>

        <label>
          Password (min 6 chars)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            minLength={6}
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            required
            minLength={6}
          />
        </label>

        {!isValidEmail && <div className="hint error">Please enter a valid email address.</div>}
        {password && confirmPassword && password !== confirmPassword && (
          <div className="hint error">Passwords do not match.</div>
        )}

        <button type="submit" disabled={!canSubmit}>{loading ? 'Registering...' : 'Register'}</button>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
      </form>
    </div>
  );
}
