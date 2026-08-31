import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { signSession, setSessionCookie } from './_session.js';
import { isValidEmail, isValidPhone, isValidPassword, isValidUsername, toSafeUser } from './_validate.js';

const SALT_ROUNDS = 10;

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

  const { uname, email, phone, password } = body || {};

  if (!uname || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: uname, email, phone, password',
    });
  }

  const trimmedUname = String(uname).trim();
  const trimmedEmail = String(email).trim().toLowerCase();
  const trimmedPhone = String(phone).trim();
  const trimmedPassword = String(password);

  if (!isValidUsername(trimmedUname)) {
    return res.status(400).json({ success: false, message: 'Username must be 3-100 characters.' });
  }
  if (!isValidEmail(trimmedEmail)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  if (!isValidPhone(trimmedPhone)) {
    return res.status(400).json({ success: false, message: 'Enter a valid phone number (7-15 digits).' });
  }
  if (!isValidPassword(trimmedPassword)) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  try {
    const [existing] = await query(
      'SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [trimmedEmail, trimmedPhone]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or phone already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);

    const [result] = await query(
      'INSERT INTO users (uname, email, phone, password) VALUES (?, ?, ?, ?)',
      [trimmedUname, trimmedEmail, trimmedPhone, hashedPassword]
    );

    const user = { id: result.insertId, uname: trimmedUname, email: trimmedEmail, phone: trimmedPhone };
    const token = signSession(user);
    setSessionCookie(res, token);

    return res.status(201).json({ success: true, message: 'Registration successful', user: toSafeUser(user) });
  } catch (error) {
    // Guards against a race where two requests pass the existence check together.
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A user with this email or phone already exists.' });
    }
    console.error('[register] Error:', error.message);
    if (error.message?.includes('environment variables') || error.message?.includes('JWT_SECRET')) {
      return res.status(500).json({ success: false, message: 'Server is not configured correctly. Contact the site owner.' });
    }
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
}
