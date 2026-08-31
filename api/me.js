import { query } from './db.js';
import { getSessionFromRequest } from './_session.js';
import { toSafeUser } from './_validate.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use GET.' });
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const [rows] = await query('SELECT id, uname, email, phone FROM users WHERE id = ? LIMIT 1', [session.sub]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    return res.status(200).json({ success: true, user: toSafeUser(rows[0]) });
  } catch (error) {
    console.error('[me] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load session.' });
  }
}
