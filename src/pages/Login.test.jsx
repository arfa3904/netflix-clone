import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';

const loginMock = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: loginMock }),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('shows a validation error instead of submitting when fields are empty', async () => {
    const user = userEvent.setup({ delay: null });
    renderLogin();
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/enter your email/i);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('submits trimmed credentials and navigates home on success', async () => {
    loginMock.mockResolvedValueOnce({ user: { id: 1 } });
    const user = userEvent.setup({ delay: null });
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), '  jane@example.com  ');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith({ identifier: 'jane@example.com', password: 'password123' })
    );
    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  it('shows the server error message when login is rejected', async () => {
    loginMock.mockRejectedValueOnce(new Error('Invalid email/phone or password.'));
    const user = userEvent.setup({ delay: null });
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email\/phone or password/i);
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup({ delay: null });
    renderLogin();
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
