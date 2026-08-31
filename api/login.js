import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { signSession, setSessionCookie } from './_session.js';
import { toSafeUser } from './_validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
    }
  }

  const { identifier, password } = body || {};

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Identifier (email or phone) and password are required.',
    });
  }

  const trimmedIdentifier = String(identifier).trim().toLowerCase();
  const trimmedPassword = String(password);

  if (!trimmedIdentifier || !trimmedPassword) {
    return res.status(400).json({ success: false, message: 'Identifier and password must be non-empty.' });
  }

  try {
    const [rows] = await query(
      'SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [trimmedIdentifier, trimmedIdentifier]
    );

    // Same generic message whether the account is missing or the password is wrong,
    // so the response never confirms which emails/phones are registered.
    const genericError = () => res.status(401).json({ success: false, message: 'Invalid email/phone or password.' });

    if (!rows || rows.length === 0) {
      return genericError();
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!passwordMatch) {
      return genericError();
    }

    const token = signSession(user);
    setSessionCookie(res, token);

    return res.status(200).json({ success: true, message: 'Login successful', user: toSafeUser(user) });
  } catch (error) {
    console.error('[login] Error:', error.message);
    if (error.message?.includes('environment variables') || error.message?.includes('JWT_SECRET')) {
      return res.status(500).json({ success: false, message: 'Server is not configured correctly. Contact the site owner.' });
    }
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
}
