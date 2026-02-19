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

    const { identifier, password } = body || {};

    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier (email or phone) and password are required',
      });
    }

    // Trim and validate
    const trimmedIdentifier = String(identifier).trim();
    const trimmedPassword = String(password).trim();

    if (!trimmedIdentifier || !trimmedPassword) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and password must be non-empty',
      });
    }

    // Find user by email or phone
    const [rows] = await query(
      'SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [trimmedIdentifier, trimmedIdentifier]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password',
      });
    }

    const user = rows[0];

    // Compare password with bcrypt
    const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password',
      });
    }

    // Return success with user data
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        uname: user.uname,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('[login] Error:', error.message);
    console.error('[login] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
}
