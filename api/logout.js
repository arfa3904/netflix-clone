import { clearSessionCookie } from './_session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST.' });
  }
  clearSessionCookie(res);
  return res.status(200).json({ success: true, message: 'Logged out' });
}
