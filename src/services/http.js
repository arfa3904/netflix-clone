// Shared fetch wrapper for the same-origin JSON API (/api/*). Centralizes
// the network-error / non-JSON-body / non-2xx handling that every service
// module (auth, watchlist, profile) needs, so each one only has to describe
// its own endpoints.
export async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
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
