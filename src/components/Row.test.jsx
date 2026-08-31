import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Row from './Row';
import { fetchData } from '../services/api';

vi.mock('../services/api', () => ({
  fetchData: vi.fn(),
}));

describe('Row', () => {
  beforeEach(() => {
    fetchData.mockReset();
  });

  it('shows a loading skeleton while the request is in flight', () => {
    fetchData.mockReturnValue(new Promise(() => {})); // never resolves
    render(<Row title="Trending Now" endpoint="/trending/movie/week" />);
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
    render(<Row title="Popular Movies" endpoint="/movie/popular" />);
    expect(await screen.findByRole('button', { name: /view details for movie one/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view details for movie two/i })).toBeInTheDocument();
  });

  it('shows a setup-specific message when the movie service is not configured', async () => {
    fetchData.mockRejectedValueOnce(
      new Error('The movie service is not configured. Missing TMDB_KEY environment variable.')
    );
    render(<Row title="Trending Now" endpoint="/trending/movie/week" />);
    expect(await screen.findByText(/not configured yet/i)).toBeInTheDocument();
  });

  it('shows the raw error message for other failures', async () => {
    fetchData.mockRejectedValueOnce(new Error('Request failed (500)'));
    render(<Row title="Trending Now" endpoint="/trending/movie/week" />);
    expect(await screen.findByText('Request failed (500)')).toBeInTheDocument();
  });

  it('shows an empty state when there are no results', async () => {
    fetchData.mockResolvedValueOnce({ results: [] });
    render(<Row title="Trending Now" endpoint="/trending/movie/week" />);
    expect(await screen.findByText(/no titles found/i)).toBeInTheDocument();
  });
});
