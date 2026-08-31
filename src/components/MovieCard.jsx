import { useState } from 'react';
import './MovieCard.css';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function releaseYear(dateStr) {
  if (!dateStr) return null;
  const year = dateStr.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

function MovieCard({ movie, isLarge = false, onSelect }) {
  const [imgError, setImgError] = useState(false);
  if (!movie) return null;

  const title = movie.title || movie.name || 'Untitled';
  const year = releaseYear(movie.release_date || movie.first_air_date);
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : null;
  const hasPoster = movie.poster_path && !imgError;

  return (
    <button
      type="button"
      className={`movie-card ${isLarge ? 'movie-card--large' : ''}`}
      onClick={() => onSelect?.(movie)}
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
  );
}

export default MovieCard;
