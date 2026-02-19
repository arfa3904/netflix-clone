import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// Load environment variables - backend/.env locally; Render injects env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - production: use CORS_ORIGIN; dev: allow localhost
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const devOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
const allowedOrigins = [...devOrigins, ...corsOrigins];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (!isProduction && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging helper
function log(level, ...args) {
  const prefix = isProduction ? `[${level}]` : `[${level}]`;
  const fn = level === 'error' ? console.error : console.log;
  fn(prefix, ...args);
}

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 as test');
    res.json({ message: 'Database connection successful', data: rows });
  } catch (error) {
    log('error', 'DB test failed:', error.message);
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
});

app.get('/create-table', async (req, res) => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uname VARCHAR(100),
      email VARCHAR(150),
      phone VARCHAR(20),
      password VARCHAR(255)
    )
  `;
  try {
    await db.query(createTableSQL);
    res.send('Users table created successfully');
  } catch (error) {
    log('error', 'Create table failed:', error.message);
    res.status(500).send('Error creating table');
  }
});

app.get('/check-users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, uname, email, phone FROM users');
    res.json({ users: rows });
  } catch (error) {
    log('error', 'Check users failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /register
app.post('/register', async (req, res) => {
  try {
    const body = req.body || {};
    const { uname, email, phone, password } = body;

    if (!uname || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: uname, email, phone, password',
      });
    }

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

    const encodedPassword = Buffer.from(trimmedPassword).toString('base64');

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [trimmedEmail, trimmedPhone]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or phone already exists',
      });
    }

    await db.query(
      'INSERT INTO users (uname, email, phone, password) VALUES (?, ?, ?, ?)',
      [trimmedUname, trimmedEmail, trimmedPhone, encodedPassword]
    );

    if (!isProduction) log('info', '[register] User created:', trimmedEmail);
    return res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (error) {
    log('error', '[register] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /login
app.post('/login', async (req, res) => {
  try {
    const body = req.body || {};
    const { identifier, password } = body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier (email or phone) and password are required',
      });
    }

    const trimmedIdentifier = String(identifier).trim();
    const trimmedPassword = String(password).trim();

    if (!trimmedIdentifier || !trimmedPassword) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and password must be non-empty',
      });
    }

    const [rows] = await db.query(
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
    const decoded = Buffer.from(user.password, 'base64').toString('utf-8');

    if (decoded !== trimmedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password',
      });
    }

    if (!isProduction) log('info', '[login] Success:', user.email);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, uname: user.uname, email: user.email, phone: user.phone },
    });
  } catch (error) {
    log('error', '[login] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  log('error', 'Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', message: `Route ${req.method} ${req.path} not found` });
});

// Start server
const server = app.listen(PORT, () => {
  log('info', `Server running on port ${PORT}`);
  if (!isProduction) {
    console.log(`📍 http://localhost:${PORT}`);
    if (corsOrigins.length === 0) {
      console.log('→ Set CORS_ORIGIN on Render to your Vercel frontend URL');
    }
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log('error', `Port ${PORT} is in use. Set PORT in environment or stop the process using it.`);
  } else {
    log('error', err);
  }
  process.exit(1);
});
