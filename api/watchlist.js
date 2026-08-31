import { query } from './db.js';
import { getSessionFromRequest } from './_session.js';
import { isValidMovieId } from './_validate.js';

// user_id always comes from the verified session, never from the request
// body/query — a client can only ever read or mutate its own rows.
export default async function handler(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const userId = session.sub;

  if (req.method === 'GET') {
    return handleList(userId, res);
  }
  if (req.method === 'POST') {
    return handleAdd(userId, req, res);
  }
  if (req.method === 'DELETE') {
    return handleRemove(userId, req, res);
  }
  return res.status(405).json({ success: false, message: 'Method not allowed. Use GET, POST, or DELETE.' });
}

async function handleList(userId, res) {
  try {
    const [rows] = await query(
      `SELECT movie_id AS movieId, movie_title AS title, poster_path AS posterPath,
              release_date AS releaseDate, vote_average AS voteAverage, created_at AS addedAt
       FROM watchlist WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return res.status(200).json({ success: true, items: rows || [] });
  } catch (error) {
    console.error('[watchlist] List error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load your watchlist.' });
  }
}

async function handleAdd(userId, req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
    }
  }

  const { movieId, title, posterPath, releaseDate, voteAverage } = body || {};

  if (!isValidMovieId(movieId)) {
    return res.status(400).json({ success: false, message: 'A valid movieId is required.' });
  }
  const trimmedTitle = typeof title === 'string' ? title.trim().slice(0, 255) : '';
  if (!trimmedTitle) {
    return res.status(400).json({ success: false, message: 'A movie title is required.' });
  }

  const safePosterPath = typeof posterPath === 'string' ? posterPath.slice(0, 255) : null;
  const safeReleaseDate = typeof releaseDate === 'string' ? releaseDate.slice(0, 20) : null;
  const safeVoteAverage = typeof voteAverage === 'number' && Number.isFinite(voteAverage) ? voteAverage : null;

  try {
    await query(
      `INSERT INTO watchlist (user_id, movie_id, movie_title, poster_path, release_date, vote_average)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, Number(movieId), trimmedTitle, safePosterPath, safeReleaseDate, safeVoteAverage]
    );
    return res.status(201).json({ success: true, message: 'Added to your watchlist.' });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      // Already saved — treat as success so the client doesn't need special-case handling.
      return res.status(200).json({ success: true, message: 'Already in your watchlist.' });
    }
    console.error('[watchlist] Add error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update your watchlist.' });
  }
}

async function handleRemove(userId, req, res) {
  const movieId = req.query?.movieId;
  if (!isValidMovieId(movieId)) {
    return res.status(400).json({ success: false, message: 'A valid movieId query parameter is required.' });
  }

  try {
    await query('DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?', [userId, Number(movieId)]);
    return res.status(200).json({ success: true, message: 'Removed from your watchlist.' });
  } catch (error) {
    console.error('[watchlist] Remove error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update your watchlist.' });
  }
}
