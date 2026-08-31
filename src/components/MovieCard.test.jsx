import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MovieCard from './MovieCard';

const movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/poster.jpg',
  release_date: '2020-05-01',
  vote_average: 7.456,
};

describe('MovieCard', () => {
  it('renders the poster image and a rounded rating badge', () => {
    render(<MovieCard movie={movie} />);
    const img = screen.getByAltText('Test Movie');
    expect(img).toHaveAttribute('src', expect.stringContaining('/poster.jpg'));
    expect(screen.getByText('7.5')).toBeInTheDocument();
  });

  it('falls back to a placeholder when the poster image fails to load', () => {
    render(<MovieCard movie={movie} />);
    fireEvent.error(screen.getByAltText('Test Movie'));
    expect(screen.queryByAltText('Test Movie')).not.toBeInTheDocument();
    expect(screen.getByText('🎬')).toBeInTheDocument();
  });

  it('calls onSelect with the movie when clicked', () => {
    const onSelect = vi.fn();
    render(<MovieCard movie={movie} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /view details for test movie/i }));
    expect(onSelect).toHaveBeenCalledWith(movie);
  });

  it('renders nothing when no movie is provided', () => {
    const { container } = render(<MovieCard movie={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
