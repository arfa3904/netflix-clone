import { useState, useEffect } from 'react';
import { fetchData } from '../services/api';
import MovieCard from './MovieCard';
import './Row.css';

function Row({ title, endpoint, isLargeRow = false }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchData(endpoint);
        if (cancelled) return;
        const list = (data.results || []).filter((m) => m.poster_path != null);
        setMovies(list);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [endpoint]);

  if (loading) {
    return (
      <div className="row">
        <h2 className="row-title">{title}</h2>
        <div className="row-loading">
          <div className="row-spinner" aria-hidden />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    const isKeyError = error.includes('VITE_TMDB_KEY');
    return (
      <div className="row">
        <h2 className="row-title">{title}</h2>
        <div className="row-error">
          {isKeyError ? (
            <>
              <p>API key not configured</p>
              <p className="row-error-sub">Add VITE_TMDB_KEY to .env in project root.</p>
            </>
          ) : (
            <p>{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <h2 className="row-title">{title}</h2>
      <div className="row-posters">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} isLarge={isLargeRow} />
        ))}
      </div>
    </div>
  );
}

export default Row;
