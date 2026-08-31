// One-time / idempotent database setup, run locally with `npm run db:init`.
// Replaces the old publicly-exposed /api/create-table endpoint, which had no
// authentication and let anyone on the internet trigger schema changes.
//
// Every statement here is additive and safe to re-run against a database
// that already has data: CREATE TABLE IF NOT EXISTS for new tables, and
// plain ALTER TABLE for columns/indexes a pre-existing `users` table (from
// an earlier version of this schema) might be missing — MySQL doesn't
// support "ADD COLUMN/INDEX IF NOT EXISTS" (that's MariaDB-only), so each
// migration just attempts the ALTER and treats "already exists" errors
// (ER_DUP_FIELDNAME / ER_DUP_KEYNAME) as success. Nothing here ever drops a
// column or a row.
import 'dotenv/config';
import { query } from '../api/db.js';

const ALREADY_APPLIED_CODES = new Set(['ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME']);

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

const USERS_MIGRATIONS = [
  {
    label: 'users.created_at column',
    sql: 'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  },
  {
    label: 'users unique index on email',
    sql: 'ALTER TABLE users ADD UNIQUE INDEX uniq_users_email (email)',
  },
  {
    label: 'users unique index on phone',
    sql: 'ALTER TABLE users ADD UNIQUE INDEX uniq_users_phone (phone)',
  },
];

// Denormalized movie fields (title/poster/etc.) so the watchlist page can
// render instantly without an extra TMDB round trip per row, and stays
// intact even if a title is later removed from TMDB.
const CREATE_WATCHLIST_TABLE = `
  CREATE TABLE IF NOT EXISTS watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    movie_title VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255),
    release_date VARCHAR(20),
    vote_average DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_watchlist_user_movie (user_id, movie_id),
    KEY idx_watchlist_user (user_id),
    CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

async function main() {
  console.log('Connecting to the database and ensuring schema is up to date...');

  await query(CREATE_USERS_TABLE);
  console.log('✓ "users" table exists.');

  for (const migration of USERS_MIGRATIONS) {
    try {
      await query(migration.sql);
      console.log(`✓ Applied: ${migration.label}.`);
    } catch (error) {
      if (ALREADY_APPLIED_CODES.has(error.code)) {
        console.log(`✓ Already in place: ${migration.label}.`);
      } else {
        console.error(`✗ Could not apply "${migration.label}": ${error.message}`);
        console.error('  (Continuing — this may need manual attention, e.g. duplicate data blocking a unique index.)');
      }
    }
  }

  await query(CREATE_WATCHLIST_TABLE);
  console.log('✓ "watchlist" table is ready (unique per user+movie, cascades on user delete).');

  process.exit(0);
}

main().catch((error) => {
  console.error('✗ Database initialization failed:', error.message);
  console.error('  Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in your .env file.');
  process.exit(1);
});
