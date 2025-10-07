import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../pages/RegisterPage';

vi.mock('../api', () => ({
  registerUser: vi.fn(async () => ({ success: true, message: 'User registered successfully' })),
}));

import { registerUser } from '../api';

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  async function fillValidForm() {
    const email = screen.getByLabelText(/email/i);
    const name = screen.getByLabelText(/name/i);
    const mobile = screen.getByLabelText(/mobile number/i);
    const address = screen.getByLabelText(/address/i);
    const password = screen.getByLabelText(/^password \(min 6 chars\)/i);
    const confirm = screen.getByLabelText(/confirm password/i);

    await userEvent.type(email, ' user@example.com '); // with spaces to test trim
    await userEvent.type(name, ' John Doe ');
    await userEvent.type(mobile, ' +57 300 123 4567 ');
    await userEvent.type(address, ' 742 Evergreen Terrace ');
    await userEvent.type(password, 'secret1');
    await userEvent.type(confirm, 'secret1');
  }

  it('renders the form and has disabled submit until valid', async () => {
    render(<RegisterPage />);
    const submit = screen.getByRole('button', { name: /register/i });
    expect(submit).toBeDisabled();

    // Enter only part of the form
    await userEvent.type(screen.getByLabelText(/email/i), 'bad-email');
    await userEvent.type(screen.getByLabelText(/name/i), 'John');

    // Still disabled due to invalid email and missing password
    expect(submit).toBeDisabled();

    // Fix email and fill passwords
    const email = screen.getByLabelText(/email/i);
    await userEvent.clear(email);
    await userEvent.type(email, 'john@example.com');
    await userEvent.type(screen.getByLabelText(/^password \(min 6 chars\)/i), 'secret1');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'secret1');

    expect(submit).toBeEnabled();
  });

  it('shows mismatch hint when passwords do not match', async () => {
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/name/i), 'John');
    await userEvent.type(screen.getByLabelText(/^password \(min 6 chars\)/i), 'secret1');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'wrong');

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits trimmed values and shows success message', async () => {
    render(<RegisterPage />);

    await fillValidForm();

    const submit = screen.getByRole('button', { name: /register/i });
    await userEvent.click(submit);

    expect(registerUser).toHaveBeenCalledTimes(1);
    expect(registerUser).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret1',
      name: 'John Doe',
      mobileNumber: '+57 300 123 4567',
      address: '742 Evergreen Terrace',
    });

    expect(await screen.findByText(/user registered successfully/i)).toBeInTheDocument();
  });

  it('shows API error message when registration fails', async () => {
    (registerUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ success: false, message: 'Email already exists' });

    render(<RegisterPage />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  });
});
