# API (Vercel Serverless Functions)

Every file in this folder is a standalone serverless function, deployed by Vercel at `/api/<filename>`. Locally, [`dev-server.js`](../dev-server.js) runs these same files behind a plain Node HTTP server so there is exactly one implementation of this logic, in dev and in production.

## Endpoints

| Route | Method | Purpose |
|---|---|---|
| `/api/register` | POST | Create an account (bcrypt-hashed password), then sign in |
| `/api/login` | POST | Verify credentials, issue a session cookie |
| `/api/logout` | POST | Clear the session cookie |
| `/api/me` | GET | Return the current user for a valid session cookie |
| `/api/tmdb` | GET | Server-side proxy to TMDB (keeps the TMDB key out of the browser) |

## Auth model

Sessions are a JWT stored in an `HttpOnly`, `SameSite=Lax` cookie (`cv_session`), set by `/api/login` and `/api/register` and cleared by `/api/logout`. See [`_session.js`](./_session.js). The token is never readable from client-side JavaScript and is never stored in `localStorage`.

Passwords are hashed with `bcryptjs` (10 salt rounds) before being written to the database and are never returned in any API response. See [`_validate.js`](./_validate.js) for shared input validation.

## Database

Uses MySQL (Aiven in production) via a pooled `mysql2/promise` connection in [`db.js`](./db.js). Run `npm run db:init` once to create the `users` table (with unique indexes on `email` and `phone`) — see [`scripts/init-db.js`](../scripts/init-db.js).

Required environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `TMDB_KEY`.

## Notes

- There is intentionally no public "list users" or "create table" endpoint — schema setup is a local script, not an HTTP route, so it can't be triggered by anyone who finds the URL.
- CORS headers are not set because the frontend and API are always same-origin (Vercel in production, the Vite proxy in development).
