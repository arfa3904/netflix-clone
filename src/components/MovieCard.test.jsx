import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieCard from './MovieCard';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const useAuthMock = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

const isSavedMock = vi.fn();
const toggleMock = vi.fn();
vi.mock('../context/WatchlistContext', () => ({
  useWatchlist: () => ({ isSaved: isSavedMock, toggle: toggleMock }),
}));

const movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/poster.jpg',
  release_date: '2020-05-01',
  vote_average: 7.456,
};

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <MovieCard movie={movie} {...props} />
    </MemoryRouter>
  );
}

describe('MovieCard', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useAuthMock.mockReturnValue({ user: null });
    isSavedMock.mockReset();
    toggleMock.mockReset();
  });

  it('renders the poster image and a rounded rating badge', () => {
    renderCard();
    const img = screen.getByAltText('Test Movie');
    expect(img).toHaveAttribute('src', expect.stringContaining('/poster.jpg'));
    expect(screen.getByText('7.5')).toBeInTheDocument();
  });

  it('falls back to a placeholder when the poster image fails to load', () => {
    renderCard();
    fireEvent.error(screen.getByAltText('Test Movie'));
    expect(screen.queryByAltText('Test Movie')).not.toBeInTheDocument();
    expect(screen.getByText('🎬')).toBeInTheDocument();
  });

  it('navigates to the movie details route when clicked', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /view details for test movie/i }));
    expect(navigateMock).toHaveBeenCalledWith('/movie/1');
  });

  it('renders nothing when no movie is provided', () => {
    const { container } = render(
      <MemoryRouter>
        <MovieCard movie={null} />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('hides the watchlist button for a signed-out visitor', () => {
    useAuthMock.mockReturnValue({ user: null });
    renderCard();
    expect(screen.queryByLabelText(/my list/i)).not.toBeInTheDocument();
  });

  it('shows an "add" watchlist button when signed in and not saved', () => {
    useAuthMock.mockReturnValue({ user: { id: 1, uname: 'jane' } });
    isSavedMock.mockReturnValue(false);
    renderCard();
    expect(screen.getByRole('button', { name: /add test movie to my list/i })).toBeInTheDocument();
  });

  it('shows a "remove" watchlist button when the movie is already saved, and calls toggle', async () => {
    useAuthMock.mockReturnValue({ user: { id: 1, uname: 'jane' } });
    isSavedMock.mockReturnValue(true);
    renderCard();
    const btn = screen.getByRole('button', { name: /remove test movie from my list/i });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    await waitFor(() => expect(toggleMock).toHaveBeenCalledWith(movie));
  });
});
