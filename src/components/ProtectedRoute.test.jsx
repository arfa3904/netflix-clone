import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const useAuthMock = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Secret Home</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading state while the session is being checked', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true });
    renderAt('/');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Secret Home')).not.toBeInTheDocument();
  });

  it('redirects to /login when there is no authenticated user', () => {
    useAuthMock.mockReturnValue({ user: null, loading: false });
    renderAt('/');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Home')).not.toBeInTheDocument();
  });

  it('renders the protected content once a user is authenticated', () => {
    useAuthMock.mockReturnValue({ user: { id: 1, uname: 'jane' }, loading: false });
    renderAt('/');
    expect(screen.getByText('Secret Home')).toBeInTheDocument();
  });
});
