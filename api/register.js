import { query } from './db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Parse request body - Vercel auto-parses JSON
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in request body',
        });
      }
    }

    const { uname, email, phone, password } = body || {};

    // Validate required fields
    if (!uname || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: uname, email, phone, password',
      });
    }

    // Trim and validate
    const trimmedUname = String(uname).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPhone = String(phone).trim();
    const trimmedPassword = String(password).trim();

    if (!trimmedUname || !trimmedEmail || !trimmedPhone || !trimmedPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields must be non-empty',
      });
    }

    // Check if user already exists
    const [existing] = await query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [trimmedEmail, trimmedPhone]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or phone already exists',
      });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Insert user
    await query(
      'INSERT INTO users (uname, email, phone, password) VALUES (?, ?, ?, ?)',
      [trimmedUname, trimmedEmail, trimmedPhone, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('[register] Error:', error.message);
    console.error('[register] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
}
