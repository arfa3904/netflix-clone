// Vercel serverless functions - use relative paths /api/*
const API_BASE = '/api';

const AUTH_KEY = 'netflex_auth';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } catch {}
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {}
}

export async function register({ uname, email, phone, password }) {
  let res;
  try {
    res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uname, email, phone, password }),
    });
  } catch (e) {
    console.error('[auth] Register fetch error:', e);
    throw new Error('Cannot reach server. Please check your connection.');
  }

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
    throw new Error(errorData.message || 'Registration failed');
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error('[auth] Register JSON parse error:', e);
    throw new Error('Invalid response from server');
  }

  return data;
}

export async function login({ identifier, password }) {
  let res;
  try {
    res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });
  } catch (e) {
    console.error('[auth] Login fetch error:', e);
    throw new Error('Cannot reach server. Please check your connection.');
  }

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
    throw new Error(errorData.message || 'Login failed');
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error('[auth] Login JSON parse error:', e);
    throw new Error('Invalid response from server');
  }

  return data;
}
