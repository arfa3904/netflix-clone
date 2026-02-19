import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env locally; Render/cloud providers inject env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('❌ Missing required database environment variables.');
  console.error('Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in .env or deployment environment.');
  process.exit(1);
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to Aiven MySQL');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') console.error('→ Check DB_HOST and DB_PORT');
    else if (error.code === 'ER_ACCESS_DENIED_ERROR') console.error('→ Check DB_USER and DB_PASSWORD');
    else if (error.code === 'ER_BAD_DB_ERROR') console.error('→ Check DB_NAME');
    return false;
  }
}

testConnection().catch((err) => console.error('DB test failed:', err));

export default pool;
