// One-time / idempotent database setup, run locally with `npm run db:init`.
// Replaces the old publicly-exposed /api/create-table endpoint, which had no
// authentication and let anyone on the internet trigger schema changes.
import 'dotenv/config';
import { query } from '../api/db.js';

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_users_email (email),
    UNIQUE KEY uniq_users_phone (phone)
  )
`;

async function main() {
  console.log('Connecting to the database and ensuring schema is up to date...');
  await query(CREATE_USERS_TABLE);
  console.log('✓ "users" table is ready (with unique indexes on email and phone).');
  process.exit(0);
}

main().catch((error) => {
  console.error('✗ Database initialization failed:', error.message);
  console.error('  Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in your .env file.');
  process.exit(1);
});
