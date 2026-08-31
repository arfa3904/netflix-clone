import { useEffect, useState, useCallback } from 'react';
import { fetchMovieDetails } from '../services/api';
import './MovieDetailsModal.css';

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

function formatRuntime(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieDetailsModal({ movieId, onClose }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  const handleClose = useCallback(() => onClose?.(), [onClose]);

  useEffect(() => {
    if (!movieId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setImgError(false);

    fetchMovieDetails(movieId)
      .then((data) => {
        if (!cancelled) setMovie(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load movie details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleClose]);

  if (!movieId) return null;

  const backdrop = movie?.backdrop_path || movie?.poster_path;
  const showBackdrop = backdrop && !imgError;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={movie?.title || 'Movie details'}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">
          ✕
        </button>

        {loading && (
          <div className="modal-state" role="status" aria-live="polite">
            <div className="modal-spinner" />
            <span>Loading details…</span>
          </div>
        )}

        {!loading && error && (
          <div className="modal-state modal-state--error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && movie && (
          <>
            <div
              className="modal-backdrop-image"
              style={showBackdrop ? { backgroundImage: `url(${BACKDROP_BASE}${backdrop})` } : undefined}
            >
              {backdrop && (
                <img
                  src={`${BACKDROP_BASE}${backdrop}`}
                  alt=""
                  className="modal-backdrop-probe"
                  onError={() => setImgError(true)}
                />
              )}
              <div className="modal-backdrop-fade" />
            </div>

            <div className="modal-body">
              <h2 className="modal-title">{movie.title || movie.name}</h2>
              <div className="modal-meta">
                {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
                {typeof movie.vote_average === 'number' && (
                  <span className="modal-meta-rating">★ {movie.vote_average.toFixed(1)}</span>
                )}
                {formatRuntime(movie.runtime) && <span>{formatRuntime(movie.runtime)}</span>}
              </div>

              {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                <div className="modal-genres">
                  {movie.genres.map((g) => (
                    <span key={g.id} className="modal-genre-pill">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="modal-overview">{movie.overview || 'No overview available for this title.'}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
