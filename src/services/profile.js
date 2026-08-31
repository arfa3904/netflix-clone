import { apiFetch } from './http';

export function fetchProfile() {
  return apiFetch('/api/profile', { method: 'GET' });
}
