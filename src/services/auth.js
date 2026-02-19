// Production: VITE_API_URL from Vercel (e.g. https://your-api.onrender.com)
// Local dev: VITE_API_URL in .env or fallback for dev server
const API_URL = import.meta.env.VITE_API_URL || '';

const AUTH_KEY = 'netflex_auth';

function getApiBase() {
  const url = API_URL && String(API_URL).trim();
  if (url) return url.replace(/\/$/, '');
  throw new Error('VITE_API_URL is not set. Add it to .env (local) or Vercel environment variables (production).');
}

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
  const base = getApiBase();
  let res;
  try {
    res = await fetch(`${base}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uname, email, phone, password }),
    });
  } catch (e) {
    const msg = e?.message || 'Connection failed';
    throw new Error(msg.includes('fetch') ? 'Cannot reach server. Is the backend running?' : msg);
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid response from server');
  }
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function login({ identifier, password }) {
  const base = getApiBase();
  let res;
  try {
    res = await fetch(`${base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
  } catch (e) {
    const msg = e?.message || 'Connection failed';
    throw new Error(msg.includes('fetch') ? 'Cannot reach server. Is the backend running?' : msg);
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid response from server');
  }
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}
