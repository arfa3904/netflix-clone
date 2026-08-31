import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchData, searchMovies } from './api.js';

describe('fetchData (TMDB via /api/tmdb proxy)', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('requests the server-side proxy, not TMDB directly, and returns results', async () => {
    global.fetch = vi.fn(async (url) => {
      expect(String(url)).toContain('/api/tmdb');
      expect(String(url)).not.toContain('themoviedb.org');
      expect(String(url)).not.toContain('api_key');
      return {
        ok: true,
        json: async () => ({
          results: [
            { id: 550, title: 'Fight Club', overview: 'A ticking-time-bomb insomniac...', poster_path: '/x.jpg' },
          ],
        }),
      };
    });

    const data = await fetchData('/trending/movie/week');
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results[0]).toHaveProperty('title', 'Fight Club');
  });

  it('throws a helpful error when the response is not ok', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: 'The movie service is not configured. Missing TMDB_KEY environment variable.' }),
    }));

    await expect(fetchData('/trending/movie/week')).rejects.toThrow('TMDB_KEY');
  });

  it('throws when the response has no results array', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ page: 1 }),
    }));

    await expect(fetchData('/trending/movie/week')).rejects.toThrow('Unexpected response');
  });

  it('throws a network error message when fetch itself fails', async () => {
    global.fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    await expect(fetchData('/trending/movie/week')).rejects.toThrow('Cannot reach the server');
  });

  it('searchMovies passes the query through as a "query" param', async () => {
    global.fetch = vi.fn(async (url) => {
      expect(String(url)).toContain('endpoint=%2Fsearch%2Fmovie');
      expect(String(url)).toContain('query=inception');
      return { ok: true, json: async () => ({ results: [] }) };
    });

    await searchMovies('inception');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
