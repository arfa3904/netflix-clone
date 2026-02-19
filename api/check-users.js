import { query } from './db.js';

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use GET.' 
    });
  }

  try {
    const [rows] = await query('SELECT id, uname, email, phone FROM users');

    return res.status(200).json({
      success: true,
      users: rows || [],
    });
  } catch (error) {
    console.error('[check-users] Error:', error.message);
    console.error('[check-users] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
