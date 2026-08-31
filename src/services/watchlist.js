import { apiFetch } from './http';

const API_BASE = '/api/watchlist';

export function getWatchlist() {
  return apiFetch(API_BASE, { method: 'GET' });
}

export function addToWatchlist({ movieId, title, posterPath, releaseDate, voteAverage }) {
  return apiFetch(API_BASE, {
    method: 'POST',
    body: JSON.stringify({ movieId, title, posterPath, releaseDate, voteAverage }),
  });
}

export function removeFromWatchlist(movieId) {
  return apiFetch(`${API_BASE}?movieId=${encodeURIComponent(movieId)}`, { method: 'DELETE' });
}
