# API Serverless Functions

This folder contains Vercel serverless functions for the Netflix Clone backend.

## Functions

- `/api/register` - User registration (POST)
- `/api/login` - User login (POST)
- `/api/create-table` - Create users table (GET, one-time setup)
- `/api/check-users` - List all users (GET, debug)

## Database

Uses Aiven MySQL. Connection is managed in `db.js` using environment variables:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Password Hashing

Uses `bcryptjs` for secure password hashing (10 rounds).
