import { useState, useEffect } from 'react';
import { fetchData } from '../services/api';
import MovieCard from './MovieCard';
import './Row.css';

function SkeletonRow({ count = 8, isLargeRow = false }) {
  return (
    <div className="row-posters" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`movie-skeleton ${isLargeRow ? 'movie-skeleton--large' : ''}`} />
      ))}
    </div>
  );
}

function Row({ title, endpoint, isLargeRow = false, onSelectMovie, movies: providedMovies }) {
  const [movies, setMovies] = useState(providedMovies || []);
  const [loading, setLoading] = useState(!providedMovies);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (providedMovies) {
      setMovies(providedMovies);
      setLoading(false);
      setError(null);
      return undefined;
    }
    if (!endpoint) return undefined;

    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchData(endpoint);
        if (cancelled) return;
        const list = (data.results || []).filter((m) => m.poster_path != null || m.title || m.name);
        setMovies(list);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [endpoint, providedMovies]);

  if (loading) {
    return (
      <div className="row">
        <h2 className="row-title">{title}</h2>
        <SkeletonRow isLargeRow={isLargeRow} />
      </div>
    );
  }

  if (error) {
    const isConfigError = error.toLowerCase().includes('not configured') || error.includes('TMDB_KEY');
    return (
      <div className="row">
        <h2 className="row-title">{title}</h2>
        <div className="row-error">
          {isConfigError ? (
            <>
              <p>Movie data is not configured yet.</p>
              <p className="row-error-sub">Add TMDB_KEY to your server environment. See README.md.</p>
            </>
          ) : (
            <p>{error}</p>
          )}
        </div>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="row">
        <h2 className="row-title">{title}</h2>
        <div className="row-empty">
          <p>No titles found here yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <h2 className="row-title">{title}</h2>
      <div className="row-posters">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} isLarge={isLargeRow} onSelect={onSelectMovie} />
        ))}
      </div>
    </div>
  );
}

export default Row;
