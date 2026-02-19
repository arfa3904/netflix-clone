import './MovieCard.css';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

function MovieCard({ movie, isLarge = false }) {
  if (!movie?.poster_path) return null;

  const size = isLarge ? 'w500' : 'w500';
  const src = `${IMAGE_BASE}/${size}${movie.poster_path}`;

  return (
    <div className={`movie-card ${isLarge ? 'movie-card--large' : ''}`}>
      <img
        src={src}
        alt={movie.title || movie.name || 'Movie'}
        className="movie-card-poster"
        loading="lazy"
      />
    </div>
  );
}

export default MovieCard;
