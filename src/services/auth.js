// Talks to the /api/* serverless functions. The session lives in an HttpOnly
// cookie set by the server — this file never touches localStorage or reads
// the cookie directly, since client JS can't (and shouldn't be able to).
import { apiFetch } from './http';

const API_BASE = '/api';

export function register({ uname, email, phone, password }) {
  return apiFetch(`${API_BASE}/register`, {
    method: 'POST',
    body: JSON.stringify({ uname, email, phone, password }),
  });
}

export function login({ identifier, password }) {
  return apiFetch(`${API_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export function logout() {
  return apiFetch(`${API_BASE}/logout`, { method: 'POST' });
}

export function fetchCurrentUser() {
  return apiFetch(`${API_BASE}/me`, { method: 'GET' });
}
