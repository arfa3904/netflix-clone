import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Row from './Row';
import { fetchData } from '../services/api';

vi.mock('../services/api', () => ({
  fetchData: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../context/WatchlistContext', () => ({
  useWatchlist: () => ({ isSaved: () => false, toggle: vi.fn() }),
}));

function renderRow(props) {
  return render(
    <MemoryRouter>
      <Row {...props} />
    </MemoryRouter>
  );
}

describe('Row', () => {
  beforeEach(() => {
    fetchData.mockReset();
  });

  it('shows a loading skeleton while the request is in flight', () => {
    fetchData.mockReturnValue(new Promise(() => {})); // never resolves
    renderRow({ title: 'Trending Now', endpoint: '/trending/movie/week' });
    expect(screen.getByText('Trending Now')).toBeInTheDocument();
    expect(document.querySelector('.movie-skeleton')).toBeInTheDocument();
  });

  it('renders a movie card per result once data loads', async () => {
    fetchData.mockResolvedValueOnce({
      results: [
        { id: 1, title: 'Movie One', poster_path: '/one.jpg' },
        { id: 2, title: 'Movie Two', poster_path: '/two.jpg' },
      ],
    });
    renderRow({ title: 'Popular Movies', endpoint: '/movie/popular' });
    expect(await screen.findByRole('button', { name: /view details for movie one/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view details for movie two/i })).toBeInTheDocument();
  });

  it('shows a setup-specific message when the movie service is not configured', async () => {
    fetchData.mockRejectedValueOnce(
      new Error('The movie service is not configured. Missing TMDB_KEY environment variable.')
    );
    renderRow({ title: 'Trending Now', endpoint: '/trending/movie/week' });
    expect(await screen.findByText(/not configured yet/i)).toBeInTheDocument();
  });

  it('shows the raw error message for other failures', async () => {
    fetchData.mockRejectedValueOnce(new Error('Request failed (500)'));
    renderRow({ title: 'Trending Now', endpoint: '/trending/movie/week' });
    expect(await screen.findByText('Request failed (500)')).toBeInTheDocument();
  });

  it('shows an empty state when there are no results', async () => {
    fetchData.mockResolvedValueOnce({ results: [] });
    renderRow({ title: 'Trending Now', endpoint: '/trending/movie/week' });
    expect(await screen.findByText(/no titles found/i)).toBeInTheDocument();
  });

  it('renders movies passed directly via the movies prop (e.g. search results)', () => {
    renderRow({
      title: 'Results',
      movies: [{ id: 9, title: 'Direct Movie', poster_path: '/direct.jpg' }],
    });
    expect(screen.getByRole('button', { name: /view details for direct movie/i })).toBeInTheDocument();
    expect(fetchData).not.toHaveBeenCalled();
  });
});
