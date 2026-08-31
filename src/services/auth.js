// Talks to the /api/* serverless functions. The session lives in an HttpOnly
// cookie set by the server — this file never touches localStorage or reads
// the cookie directly, since client JS can't (and shouldn't be able to).
const API_BASE = '/api';

async function apiRequest(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Some responses (e.g. 405) may not have a JSON body.
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

export function register({ uname, email, phone, password }) {
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ uname, email, phone, password }),
  });
}

export function login({ identifier, password }) {
  return apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export function logout() {
  return apiRequest('/logout', { method: 'POST' });
}

export function fetchCurrentUser() {
  return apiRequest('/me', { method: 'GET' });
}
