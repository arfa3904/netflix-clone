import { useEffect, useState } from 'react';
import { fetchGenres, discoverMovies } from '../services/api';
import MovieCard from './MovieCard';
import './Discover.css';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
];

export default function Discover() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGenres()
      .then(setGenres)
      .catch(() => {
        // Genre pills are a nice-to-have; silently skip if TMDB is unreachable —
        // the rest of the page still works.
      });
  }, []);

  useEffect(() => {
    if (!selectedGenre) {
      setResults([]);
      setError(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    discoverMovies({ genreId: selectedGenre, sortBy, page: 1 })
      .then((data) => {
        if (cancelled) return;
        setResults((data.results || []).filter((m) => m.poster_path));
        setTotalPages(data.total_pages || 1);
        setPage(1);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load movies for this genre.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedGenre, sortBy]);

  async function loadMore() {
    if (loading || page >= totalPages) return;
    setLoading(true);
    try {
      const data = await discoverMovies({ genreId: selectedGenre, sortBy, page: page + 1 });
      setResults((prev) => [...prev, ...(data.results || []).filter((m) => m.poster_path)]);
      setPage((p) => p + 1);
    } catch (err) {
      setError(err.message || 'Failed to load more movies.');
    } finally {
      setLoading(false);
    }
  }

  if (genres.length === 0) return null;

  return (
    <div className="discover">
      <div className="discover-controls">
        <div className="discover-genres" role="group" aria-label="Filter by genre">
          <button
            type="button"
            className={`discover-pill ${!selectedGenre ? 'discover-pill--active' : ''}`}
            onClick={() => setSelectedGenre(null)}
            aria-pressed={!selectedGenre}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`discover-pill ${selectedGenre === g.id ? 'discover-pill--active' : ''}`}
              onClick={() => setSelectedGenre(g.id)}
              aria-pressed={selectedGenre === g.id}
            >
              {g.name}
            </button>
          ))}
        </div>
        {selectedGenre && (
          <select
            className="discover-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort results by"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedGenre && (
        <div className="discover-results">
          {error && (
            <div className="row-error" style={{ marginBottom: '1rem' }}>
              <p>{error}</p>
            </div>
          )}

          {!error && !loading && results.length === 0 && (
            <p className="discover-empty">No movies found for this genre.</p>
          )}

          {results.length > 0 && (
            <div className="discover-grid">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}

          {loading && (
            <div className="discover-grid" aria-hidden="true">
              {Array.from({ length: results.length ? 6 : 12 }).map((_, i) => (
                <div key={i} className="discover-skeleton" />
              ))}
            </div>
          )}

          {!loading && page < totalPages && results.length > 0 && (
            <button type="button" className="discover-load-more" onClick={loadMore}>
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
