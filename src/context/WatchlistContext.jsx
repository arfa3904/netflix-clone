import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import * as watchlistService from '../services/watchlist';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await watchlistService.getWatchlist();
      setItems(data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load your watchlist.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const savedIds = useMemo(() => new Set(items.map((i) => i.movieId)), [items]);
  const isSaved = useCallback((movieId) => savedIds.has(Number(movieId)), [savedIds]);

  const add = useCallback(async (movie) => {
    const payload = {
      movieId: movie.id,
      title: movie.title || movie.name || 'Untitled',
      posterPath: movie.poster_path || null,
      releaseDate: movie.release_date || movie.first_air_date || null,
      voteAverage: typeof movie.vote_average === 'number' ? movie.vote_average : null,
    };
    setItems((prev) => (prev.some((i) => i.movieId === payload.movieId) ? prev : [{ ...payload, addedAt: new Date().toISOString() }, ...prev]));
    try {
      await watchlistService.addToWatchlist(payload);
    } catch (err) {
      setItems((prev) => prev.filter((i) => i.movieId !== payload.movieId));
      throw err;
    }
  }, []);

  const remove = useCallback(async (movieId) => {
    const id = Number(movieId);
    let removedItem;
    setItems((prev) => {
      removedItem = prev.find((i) => i.movieId === id);
      return prev.filter((i) => i.movieId !== id);
    });
    try {
      await watchlistService.removeFromWatchlist(id);
    } catch (err) {
      if (removedItem) setItems((prev) => [removedItem, ...prev]);
      throw err;
    }
  }, []);

  const toggle = useCallback(
    (movie) => (isSaved(movie.id) ? remove(movie.id) : add(movie)),
    [isSaved, add, remove]
  );

  const value = { items, loading, error, isSaved, add, remove, toggle, refresh };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return ctx;
}
