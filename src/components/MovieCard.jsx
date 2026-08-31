import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import './MovieCard.css';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function releaseYear(dateStr) {
  if (!dateStr) return null;
  const year = dateStr.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

function MovieCard({ movie, isLarge = false }) {
  const [imgError, setImgError] = useState(false);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggle } = useWatchlist();

  if (!movie) return null;

  const title = movie.title || movie.name || 'Untitled';
  const year = releaseYear(movie.release_date || movie.first_air_date);
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : null;
  const hasPoster = movie.poster_path && !imgError;
  const saved = user ? isSaved(movie.id) : false;

  async function handleToggleWatchlist(e) {
    e.stopPropagation();
    if (!user || pending) return;
    setPending(true);
    try {
      await toggle(movie);
    } catch {
      // Context already rolled the optimistic update back; nothing else to do here.
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`movie-card ${isLarge ? 'movie-card--large' : ''}`}>
      <button
        type="button"
        className="movie-card-main"
        onClick={() => navigate(`/movie/${movie.id}`)}
        aria-label={`View details for ${title}`}
      >
        {hasPoster ? (
          <img
            src={`${IMAGE_BASE}${movie.poster_path}`}
            alt={title}
            className="movie-card-poster"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="movie-card-fallback">
            <span className="movie-card-fallback-icon" aria-hidden="true">🎬</span>
            <span className="movie-card-fallback-title">{title}</span>
          </div>
        )}

        {rating && (
          <span className="movie-card-rating">
            <span aria-hidden="true">★</span> {rating}
          </span>
        )}

        <div className="movie-card-overlay">
          <span className="movie-card-overlay-title">{title}</span>
          <span className="movie-card-overlay-meta">
            {year && <span>{year}</span>}
            {year && rating && <span aria-hidden="true">·</span>}
            {rating && <span>★ {rating}</span>}
          </span>
          <span className="movie-card-overlay-cta">View details</span>
        </div>
      </button>

      {user && (
        <button
          type="button"
          className={`movie-card-watchlist-btn ${saved ? 'movie-card-watchlist-btn--saved' : ''}`}
          onClick={handleToggleWatchlist}
          disabled={pending}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${title} from My List` : `Add ${title} to My List`}
          title={saved ? 'Remove from My List' : 'Add to My List'}
        >
          {saved ? '✓' : '+'}
        </button>
      )}
    </div>
  );
}

export default MovieCard;
