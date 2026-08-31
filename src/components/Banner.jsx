import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Banner.css';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

function truncate(str, n) {
  return str?.length > n ? `${str.slice(0, n - 1)}…` : str || '';
}

function Banner({ movie }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  if (!movie) return null;

  const title = movie.title || movie.name;
  const backdropPath = movie.backdrop_path || movie.poster_path;
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : null;
  const showImage = backdropPath && !imgError;

  return (
    <header
      className="banner"
      style={
        showImage
          ? {
              backgroundImage: `linear-gradient(to bottom, rgba(10,10,12,0.25) 0%, rgba(10,10,12,0.55) 55%, var(--color-bg) 100%), url(${IMAGE_BASE_URL}${backdropPath})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }
          : undefined
      }
    >
      {backdropPath && (
        <img
          src={`${IMAGE_BASE_URL}${backdropPath}`}
          alt=""
          className="banner-image-probe"
          onError={() => setImgError(true)}
        />
      )}
      {!showImage && <div className="banner-fallback-gradient" aria-hidden="true" />}
      <div className="banner-overlay" />
      <div className="banner-contents">
        <p className="banner-eyebrow">Featured this week</p>
        <h1 className="banner-title">{title}</h1>
        <div className="banner-meta">
          {year && <span>{year}</span>}
          {rating && <span className="banner-meta-rating">★ {rating}</span>}
        </div>
        <p className="banner-description">{truncate(movie.overview, 170)}</p>
        <div className="banner-buttons">
          <button
            type="button"
            className="banner-button banner-button--play"
            onClick={() => navigate(`/movie/${movie.id}?trailer=1`)}
          >
            <span aria-hidden="true">▶</span> Watch Trailer
          </button>
          <button
            type="button"
            className="banner-button banner-button--list"
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            More Info
          </button>
        </div>
      </div>
      <div className="banner-fade-bottom" />
    </header>
  );
}

export default Banner;
