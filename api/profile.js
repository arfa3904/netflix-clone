import { query } from './db.js';
import { getSessionFromRequest } from './_session.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use GET.' });
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const [users] = await query(
      'SELECT id, uname, email, phone, created_at AS createdAt FROM users WHERE id = ? LIMIT 1',
      [session.sub]
    );
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const [countRows] = await query('SELECT COUNT(*) AS count FROM watchlist WHERE user_id = ?', [session.sub]);
    const watchlistCount = countRows?.[0]?.count ?? 0;

    const { id, uname, email, phone, createdAt } = users[0];
    return res.status(200).json({
      success: true,
      profile: { id, uname, email, phone, createdAt, watchlistCount },
    });
  } catch (error) {
    console.error('[profile] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load your profile.' });
  }
}
