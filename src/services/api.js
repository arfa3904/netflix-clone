// All TMDB requests go through /api/tmdb — the API key lives only on the
// server (see api/tmdb.js), never in client-side JS or a VITE_ env var.
const PROXY_BASE = '/api/tmdb';

function buildUrl(endpoint, params = {}) {
  const url = new URL(PROXY_BASE, window.location.origin);
  url.searchParams.set('endpoint', endpoint);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function requestJson(url) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no/invalid body
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

/** Fetches a paginated movie list (trending/popular/top_rated/search/...). */
export async function fetchData(endpoint, params = {}) {
  const data = await requestJson(buildUrl(endpoint, params));
  if (!data || !Array.isArray(data.results)) {
    throw new Error('Unexpected response from the movie service.');
  }
  return data;
}

/** Fetches full details for a single movie (genres, runtime, etc). */
export async function fetchMovieDetails(id) {
  const data = await requestJson(buildUrl(`/movie/${id}`));
  if (!data || typeof data.id === 'undefined') {
    throw new Error('Unexpected response from the movie service.');
  }
  return data;
}

export function searchMovies(query, page = 1) {
  return fetchData('/search/movie', { query, page });
}
