# API (Vercel Serverless Functions)

Every file in this folder is a standalone serverless function, deployed by Vercel at `/api/<filename>`. Locally, [`dev-server.js`](../dev-server.js) runs these same files behind a plain Node HTTP server so there is exactly one implementation of this logic, in dev and in production.

## Endpoints

| Route | Method | Auth required | Purpose |
|---|---|---|---|
| `/api/register` | POST | — | Create an account (bcrypt-hashed password), then sign in |
| `/api/login` | POST | — | Verify credentials, issue a session cookie |
| `/api/logout` | POST | — | Clear the session cookie |
| `/api/me` | GET | session | Return the current user for a valid session cookie |
| `/api/profile` | GET | session | Extended profile: email, phone, member-since date, watchlist count |
| `/api/watchlist` | GET | session | List the caller's saved movies |
| `/api/watchlist` | POST | session | Add a movie `{ movieId, title, posterPath, releaseDate, voteAverage }` (idempotent — re-adding an existing entry is a no-op, not an error) |
| `/api/watchlist` | DELETE | session | Remove a movie via `?movieId=` |
| `/api/tmdb` | GET | — | Server-side proxy to TMDB (keeps the TMDB key out of the browser; endpoint is allowlisted) |

## Auth model

Sessions are a JWT stored in an `HttpOnly`, `SameSite=Lax` cookie (`cv_session`), set by `/api/login` and `/api/register` and cleared by `/api/logout`. See [`_session.js`](./_session.js). The token is never readable from client-side JavaScript and is never stored in `localStorage`.

Passwords are hashed with `bcryptjs` (10 salt rounds) before being written to the database and are never returned in any API response. See [`_validate.js`](./_validate.js) for shared input validation.

Every endpoint that reads or writes user-owned data (`/api/profile`, `/api/watchlist`) resolves the acting user from the verified session cookie (`getSessionFromRequest`) — a request can never act on behalf of a different `user_id` by supplying one in the body or query string.

## Database

Uses MySQL (Aiven in production) via a pooled `mysql2/promise` connection in [`db.js`](./db.js). Run `npm run db:init` to create/migrate the `users` table (unique indexes on `email` and `phone`) and the `watchlist` table (composite unique index on `user_id` + `movie_id`, foreign key to `users` with `ON DELETE CASCADE`) — see [`scripts/init-db.js`](../scripts/init-db.js). The script is idempotent and safe to re-run against a database that already has data.

Required environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `TMDB_KEY`.

## Notes

- There is intentionally no public "list users" or "create table" endpoint — schema setup is a local script, not an HTTP route, so it can't be triggered by anyone who finds the URL.
- CORS headers are not set because the frontend and API are always same-origin (Vercel in production, the Vite proxy in development).
