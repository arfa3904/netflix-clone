import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchData } from './api.js';

describe('fetchData - TMDB API', () => {
  let originalFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
    if (!import.meta.env.VITE_TMDB_KEY) {
      import.meta.env.VITE_TMDB_KEY = 'test_api_key';
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('calls fetchData("/trending/movie/week") and validates response structure', async () => {
    const mockResults = [
      {
        id: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      },
      {
        id: 551,
        title: 'Another Movie',
        overview: 'Another overview.',
        poster_path: '/poster2.jpg',
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: mockResults }),
      })
    );

    const response = await fetchData('/trending/movie/week');

    expect(response).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);

    const firstMovie = response.results[0];
    expect(firstMovie).toHaveProperty('id');
    expect(firstMovie).toHaveProperty('title');
    expect(firstMovie).toHaveProperty('overview');
    expect(firstMovie).toHaveProperty('poster_path');
  });

  it('throws when response is not ok (res.ok check)', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })
    );

    await expect(fetchData('/trending/movie/week')).rejects.toThrow('API request failed');
  });

  it('throws when data.results is missing', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ page: 1 }),
      })
    );

    await expect(fetchData('/trending/movie/week')).rejects.toThrow(
      'Invalid API response: results property not found'
    );
  });
});
