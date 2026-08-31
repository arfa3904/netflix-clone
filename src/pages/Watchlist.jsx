import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import './Watchlist.css';

function toCardMovie(item) {
  return {
    id: item.movieId,
    title: item.title,
    poster_path: item.posterPath,
    release_date: item.releaseDate,
    vote_average: item.voteAverage,
  };
}

export default function Watchlist() {
  const { items, loading, error } = useWatchlist();

  return (
    <>
      <Navbar />
      <div className="watchlist-page">
        <h1 className="watchlist-title">My List</h1>

        {loading && (
          <div className="watchlist-grid" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="watchlist-skeleton" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="watchlist-state watchlist-state--error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="watchlist-state">
            <p>Your list is empty.</p>
            <p className="watchlist-state-sub">
              Browse <Link to="/">movies</Link> and tap the + button on any poster to save it here.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="watchlist-grid">
            {items.map((item) => (
              <MovieCard key={item.movieId} movie={toCardMovie(item)} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
