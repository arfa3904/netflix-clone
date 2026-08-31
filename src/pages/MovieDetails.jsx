import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchMovieDetails,
  fetchMovieCredits,
  fetchMovieVideos,
  fetchMovieRecommendations,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Row from '../components/Row';
import './MovieDetails.css';

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const PROFILE_BASE = 'https://image.tmdb.org/t/p/w185';
const YOUTUBE_KEY_RE = /^[a-zA-Z0-9_-]{6,20}$/;

function formatRuntime(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggle } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [watchlistPending, setWatchlistPending] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isValidId = /^\d+$/.test(String(id));

  useEffect(() => {
    if (!isValidId) {
      setLoading(false);
      setError('That movie link looks invalid.');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setShowTrailer(searchParams.get('trailer') === '1');
    setImgError(false);

    async function load() {
      try {
        const details = await fetchMovieDetails(id);
        if (cancelled) return;
        setMovie(details);

        const [creditsResult, videosResult, recsResult] = await Promise.allSettled([
          fetchMovieCredits(id),
          fetchMovieVideos(id),
          fetchMovieRecommendations(id),
        ]);
        if (cancelled) return;

        if (creditsResult.status === 'fulfilled') setCast(creditsResult.value.cast.slice(0, 12));
        if (videosResult.status === 'fulfilled' && videosResult.value.length > 0) {
          setTrailer(videosResult.value[0]);
        }
        if (recsResult.status === 'fulfilled') {
          setRecommendations(recsResult.value.results.filter((m) => m.poster_path));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load this movie.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isValidId]);

  async function handleWatchlistToggle() {
    if (!user || !movie || watchlistPending) return;
    setWatchlistPending(true);
    try {
      await toggle(movie);
    } catch {
      // WatchlistContext already rolled back the optimistic change.
    } finally {
      setWatchlistPending(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="details-loading" role="status" aria-live="polite">
          <div className="details-spinner" />
          <span>Loading movie…</span>
        </div>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <Navbar />
        <div className="details-error-page">
          <h1>Movie not found</h1>
          <p>{error || "We couldn't find that movie."}</p>
          <button type="button" className="details-back-btn" onClick={() => navigate('/')}>
            ← Back to home
          </button>
        </div>
      </>
    );
  }

  const backdrop = movie.backdrop_path || movie.poster_path;
  const showBackdrop = backdrop && !imgError;
  const saved = user ? isSaved(movie.id) : false;
  const validTrailerKey = trailer && YOUTUBE_KEY_RE.test(trailer.key) ? trailer.key : null;

  return (
    <>
      <Navbar />
      <div className="details-page">
        <div
          className="details-hero"
          style={showBackdrop ? { backgroundImage: `url(${BACKDROP_BASE}${backdrop})` } : undefined}
        >
          {backdrop && (
            <img src={`${BACKDROP_BASE}${backdrop}`} alt="" className="details-hero-probe" onError={() => setImgError(true)} />
          )}
          <div className="details-hero-fade" />
        </div>

        <div className="details-body">
          <button type="button" className="details-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="details-main">
            <div className="details-poster-col">
              {movie.poster_path ? (
                <img src={`${POSTER_BASE}${movie.poster_path}`} alt={movie.title} className="details-poster" />
              ) : (
                <div className="details-poster details-poster--fallback" aria-hidden="true">
                  🎬
                </div>
              )}
            </div>

            <div className="details-info-col">
              <h1 className="details-title">{movie.title || movie.name}</h1>
              <div className="details-meta">
                {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
                {formatRuntime(movie.runtime) && <span>{formatRuntime(movie.runtime)}</span>}
                {typeof movie.vote_average === 'number' && (
                  <span className="details-meta-rating">★ {movie.vote_average.toFixed(1)}</span>
                )}
              </div>

              {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                <div className="details-genres">
                  {movie.genres.map((g) => (
                    <span key={g.id} className="details-genre-pill">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="details-overview">{movie.overview || 'No overview available for this title.'}</p>

              <div className="details-actions">
                {validTrailerKey && (
                  <button type="button" className="details-btn details-btn--primary" onClick={() => setShowTrailer(true)}>
                    <span aria-hidden="true">▶</span> Watch Trailer
                  </button>
                )}
                {user ? (
                  <button
                    type="button"
                    className={`details-btn ${saved ? 'details-btn--saved' : 'details-btn--secondary'}`}
                    onClick={handleWatchlistToggle}
                    disabled={watchlistPending}
                    aria-pressed={saved}
                  >
                    {saved ? '✓ In My List' : '+ Add to My List'}
                  </button>
                ) : (
                  <Link to="/login" className="details-btn details-btn--secondary">
                    Sign in to save
                  </Link>
                )}
              </div>

              {showTrailer && validTrailerKey && (
                <div className="details-trailer">
                  <iframe
                    src={`https://www.youtube.com/embed/${validTrailerKey}?autoplay=1`}
                    title={`${movie.title} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>

          {cast.length > 0 && (
            <section className="details-cast" aria-label="Cast">
              <h2 className="details-section-title">Cast</h2>
              <div className="details-cast-row">
                {cast.map((member) => (
                  <div key={member.id} className="details-cast-card">
                    {member.profile_path ? (
                      <img src={`${PROFILE_BASE}${member.profile_path}`} alt={member.name} loading="lazy" />
                    ) : (
                      <div className="details-cast-avatar-fallback" aria-hidden="true">
                        {member.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <span className="details-cast-name">{member.name}</span>
                    {member.character && <span className="details-cast-character">{member.character}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {recommendations.length > 0 && (
            <section aria-label="Similar movies">
              <Row title="You might also like" movies={recommendations} />
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
