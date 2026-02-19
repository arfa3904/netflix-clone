import { useState, useEffect } from 'react';
import { fetchData } from '../services/api';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Row from '../components/Row';

export default function Home() {
  const [trendingMovie, setTrendingMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchData('/trending/movie/week');
        if (cancelled) return;
        const movie = data.results?.find(
          (m) => m.backdrop_path || m.poster_path
        ) ?? null;
        setTrendingMovie(movie);
        setApiError(null);
      } catch (err) {
        if (!cancelled) setApiError(err.message || 'API error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Navbar />
      {apiError && (
        <div className="api-error-banner">
          <div className="api-error-content">
            <h3>Configuration required</h3>
            <p>{apiError}</p>
            <p className="api-error-instructions">
              Add <code>VITE_TMDB_KEY=your_key</code> to <code>.env</code> in project root. Restart dev server.
            </p>
            <p className="api-error-link">
              <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">Get API key →</a>
            </p>
          </div>
        </div>
      )}
      {!loading && !apiError && <Banner movie={trendingMovie} />}
      <div className="app-content">
        <Row title="Trending Now" endpoint="/trending/movie/week" isLargeRow />
        <Row title="Popular Movies" endpoint="/movie/popular" />
        <Row title="Top Rated" endpoint="/movie/top_rated" />
      </div>
    </>
  );
}
