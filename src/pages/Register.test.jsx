import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from './Register';

const registerMock = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ register: registerMock }),
}));

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillValidForm(user, overrides = {}) {
  const values = {
    uname: 'janedoe',
    email: 'jane@example.com',
    phone: '15551234567',
    password: 'longenough1',
    confirm: 'longenough1',
    ...overrides,
  };
  await user.type(screen.getByLabelText(/^username$/i), values.uname);
  await user.type(screen.getByLabelText(/^email$/i), values.email);
  await user.type(screen.getByLabelText(/^phone$/i), values.phone);
  await user.type(screen.getByLabelText(/^password$/i), values.password);
  await user.type(screen.getByLabelText(/confirm password/i), values.confirm);
}

describe('Register page', () => {
  beforeEach(() => {
    registerMock.mockReset();
  });

  it('rejects a password shorter than 8 characters before calling the API', async () => {
    const user = userEvent.setup({ delay: null });
    renderRegister();
    await fillValidForm(user, { password: 'short', confirm: 'short' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('rejects mismatched password confirmation', async () => {
    const user = userEvent.setup({ delay: null });
    renderRegister();
    await fillValidForm(user, { confirm: 'somethingElse1' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match/i);
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', async () => {
    const user = userEvent.setup({ delay: null });
    renderRegister();
    await fillValidForm(user, { email: 'not-an-email' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('registers with valid input and navigates home', async () => {
    registerMock.mockResolvedValueOnce({ user: { id: 1 } });
    const user = userEvent.setup({ delay: null });
    renderRegister();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith({
        uname: 'janedoe',
        email: 'jane@example.com',
        phone: '15551234567',
        password: 'longenough1',
      })
    );
    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  it('shows a duplicate-account error from the server', async () => {
    registerMock.mockRejectedValueOnce(new Error('A user with this email or phone already exists.'));
    const user = userEvent.setup({ delay: null });
    renderRegister();
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/already exists/i);
  });
});
