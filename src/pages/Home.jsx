import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchData, searchMovies } from '../services/api';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Row from '../components/Row';
import Footer from '../components/Footer';
import MovieDetailsModal from '../components/MovieDetailsModal';

export default function Home() {
  const [trendingMovie, setTrendingMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchData('/trending/movie/week');
        if (cancelled) return;
        const movie = data.results?.find((m) => m.backdrop_path || m.poster_path) ?? null;
        setTrendingMovie(movie);
        setApiError(null);
      } catch (err) {
        if (!cancelled) setApiError(err.message || 'Failed to load movie data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      setSearchError(null);
      return undefined;
    }
    let cancelled = false;
    async function runSearch() {
      try {
        setSearchLoading(true);
        setSearchError(null);
        const data = await searchMovies(query);
        if (cancelled) return;
        setSearchResults((data.results || []).filter((m) => m.poster_path));
      } catch (err) {
        if (!cancelled) setSearchError(err.message || 'Search failed.');
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }
    runSearch();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const isConfigError =
    apiError && (apiError.toLowerCase().includes('not configured') || apiError.includes('TMDB_KEY'));

  return (
    <>
      <div id="top" />
      <Navbar />

      {apiError && (
        <div className="api-error-banner">
          <div className="api-error-content">
            <h3>{isConfigError ? 'Movie service not configured' : 'Something went wrong'}</h3>
            <p>{apiError}</p>
            {isConfigError && (
              <>
                <p className="api-error-instructions">
                  Add <code>TMDB_KEY=your_key</code> to your server environment (<code>.env</code> locally, or
                  Vercel project settings in production), then restart.
                </p>
                <p className="api-error-link">
                  <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">
                    Get a free TMDB API key →
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {!loading && !apiError && !query && <Banner movie={trendingMovie} onSelectMovie={(m) => setSelectedMovieId(m.id)} />}

      <div className="app-content">
        {query ? (
          <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)' }}>
            <Row
              title={searchLoading ? `Searching "${query}"…` : `Results for "${query}"`}
              movies={searchResults}
              onSelectMovie={(m) => setSelectedMovieId(m.id)}
            />
            {searchError && (
              <div className="row" style={{ paddingLeft: 'clamp(1rem, 4vw, 3rem)' }}>
                <div className="row-error">
                  <p>{searchError}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div id="trending">
              <Row
                title="Trending Now"
                endpoint="/trending/movie/week"
                isLargeRow
                onSelectMovie={(m) => setSelectedMovieId(m.id)}
              />
            </div>
            <div id="popular">
              <Row title="Popular Movies" endpoint="/movie/popular" onSelectMovie={(m) => setSelectedMovieId(m.id)} />
            </div>
            <div id="top-rated">
              <Row title="Top Rated" endpoint="/movie/top_rated" onSelectMovie={(m) => setSelectedMovieId(m.id)} />
            </div>
          </>
        )}
      </div>

      <Footer />

      {selectedMovieId && (
        <MovieDetailsModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} />
      )}
    </>
  );
}
