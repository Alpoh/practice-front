import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { registerUser } from '../api';
import './RegisterPage.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = useMemo(() => {
    if (!email) return false; // required
    if (email.length > 320) return false;
    return /.+@.+\..+/.test(email);
  }, [email]);

  const isValidName = useMemo(() => name.trim().length > 0 && name.trim().length <= 120, [name]);
  const isValidMobile = useMemo(() => !mobileNumber || mobileNumber.length <= 32, [mobileNumber]);
  const isValidAddress = useMemo(() => !address || address.length <= 500, [address]);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isValidPassword = password.length >= 6; // client policy; backend validates presence

  const canSubmit = isValidEmail && isValidName && isValidMobile && isValidAddress && isValidPassword && passwordsMatch && !loading;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!canSubmit) return;
    setLoading(true);
    const resp = await registerUser({
      email: email.trim(),
      password,
      name: name.trim(),
      mobileNumber: mobileNumber.trim() || undefined,
      address: address.trim() || undefined,
    });
    setLoading(false);
    if (resp.success) {
      setMessage(resp.message);
      setEmail('');
      setName('');
      setMobileNumber('');
      setAddress('');
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
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
            maxLength={120}
          />
        </label>

        <label>
          Mobile number (optional)
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="e.g., +57 300 123 4567"
            maxLength={32}
          />
        </label>

        <label>
          Address (optional)
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, City, Country"
            maxLength={500}
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

        {!isValidEmail && <div className="hint error">Please enter a valid email (max 320 characters).</div>}
        {!isValidName && <div className="hint error">Name is required (max 120 characters).</div>}
        {!isValidMobile && <div className="hint error">Mobile number must be 32 characters or fewer.</div>}
        {!isValidAddress && <div className="hint error">Address must be 500 characters or fewer.</div>}
        {password && confirmPassword && !passwordsMatch && (
          <div className="hint error">Passwords do not match.</div>
        )}

        <button type="submit" disabled={!canSubmit}>{loading ? 'Registering...' : 'Register'}</button>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
      </form>
    </div>
  );
}
