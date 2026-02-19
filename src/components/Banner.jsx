import './Banner.css';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

function Banner({ movie }) {
  if (!movie) return null;

  const backdropPath = movie.backdrop_path || movie.poster_path;
  if (!backdropPath) return null;

  const backgroundImage = `${IMAGE_BASE_URL}${backdropPath}`;
  const truncate = (str, n) =>
    str?.length > n ? `${str.slice(0, n - 1)}...` : str || '';

  return (
    <header
      className="banner"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, #111 100%), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <div className="banner-overlay" />
      <div className="banner-contents">
        <h1 className="banner-title">{movie.title || movie.name}</h1>
        <p className="banner-description">{truncate(movie.overview, 150)}</p>
        <div className="banner-buttons">
          <button type="button" className="banner-button banner-button--play">
            ▶ Play
          </button>
          <button type="button" className="banner-button banner-button--list">
            + My List
          </button>
        </div>
      </div>
      <div className="banner-fade-bottom" />
    </header>
  );
}

export default Banner;
