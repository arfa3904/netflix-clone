import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchData, searchMovies } from '../services/api';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Row from '../components/Row';
import Discover from '../components/Discover';
import Footer from '../components/Footer';

export default function Home() {
  const [trendingMovie, setTrendingMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
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

      {!loading && !apiError && !query && <Banner movie={trendingMovie} />}

      <div className="app-content">
        {query ? (
          <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)' }}>
            <Row title={searchLoading ? `Searching "${query}"…` : `Results for "${query}"`} movies={searchResults} />
            {searchError && (
              <div className="row" style={{ paddingLeft: 'clamp(1rem, 4vw, 3rem)' }}>
                <div className="row-error">
                  <p>{searchError}</p>
                </div>
              </div>
            )}
            {!searchLoading && !searchError && query && searchResults.length === 0 && (
              <div className="row" style={{ paddingLeft: 'clamp(1rem, 4vw, 3rem)' }}>
                <p className="discover-empty">No results for &ldquo;{query}&rdquo;. Try a different title.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <Row title="Trending Now" endpoint="/trending/movie/week" isLargeRow />
            <Row title="Popular Movies" endpoint="/movie/popular" />
            <Row title="Top Rated" endpoint="/movie/top_rated" />
            <Discover />
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
