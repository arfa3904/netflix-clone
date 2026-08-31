# CineVault

A full-stack, Netflix-inspired movie browsing app: real authentication (bcrypt + JWT session cookies), a MySQL-backed user store, and a live movie catalog from [TMDB](https://www.themoviedb.org/) — trending, popular, top-rated, search, and a details view — behind a polished, original dark UI.

Built with **React 18 + Vite** on the frontend and **Vercel serverless functions + MySQL** on the backend. Ships as a single deployable app (one URL, no separate backend service to host).

> Portfolio project. Not affiliated with Netflix, TMDB, or any streaming service. The UI is an original design (see [Security & design notes](#security--design-notes)).

## Features

- Browse **Trending**, **Popular**, and **Top Rated** movies, with a cinematic hero banner
- **Search** movies by title (debounced, live results)
- **Movie details** modal — genres, runtime, rating, release year, overview
- Email/phone **registration and login**, with server-side validation and duplicate-account handling
- Session-based auth via an **HttpOnly JWT cookie** — no tokens or passwords ever touch `localStorage`
- Protected home route; logged-out visitors are redirected to `/login`
- Loading skeletons, empty states, and friendly error states throughout (including a clear message if the app isn't configured yet)
- Responsive layout: desktop, tablet, and mobile
- Automated tests for both the API handlers and the React components

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18, React Router 7, Vite 5, plain CSS (design tokens, no UI framework) |
| Backend | Vercel serverless functions (`/api`) |
| Database | MySQL (`mysql2`), e.g. [Aiven](https://aiven.io/mysql) |
| Auth | `bcryptjs` password hashing + `jsonwebtoken` session cookies |
| Movie data | [TMDB API](https://www.themoviedb.org/documentation/api), proxied server-side |
| Testing | Vitest, Testing Library, jsdom |

## Architecture

```
Browser (React SPA)
   │
   │  same-origin fetch, credentials included
   ▼
/api/*  (Vercel serverless functions — see api/README.md)
   │                                   │
   │  bcrypt + JWT cookie              │  server-side TMDB key
   ▼                                   ▼
MySQL (users table)                 TMDB API
```

- **The frontend never talks to TMDB or MySQL directly.** All movie requests go through `/api/tmdb`, which holds the TMDB key server-side; all auth goes through `/api/register`, `/api/login`, `/api/logout`, `/api/me`.
- **Sessions are a signed JWT in an HttpOnly, SameSite=Lax cookie**, set by the server and never readable from client JS — not a user object sitting in `localStorage`.
- **One backend, two runtimes.** In production, Vercel invokes the files in `/api` directly. Locally, [`dev-server.js`](./dev-server.js) runs those *same* files behind a plain Node HTTP server (via Vite's dev proxy), so there's no separate/duplicated backend implementation to keep in sync. See [`api/README.md`](./api/README.md) for endpoint-level details.

## Screenshots

_Add screenshots of the home page, search, movie details modal, and auth pages here before publishing (e.g. `docs/screenshots/home.png`)._

## Installation

Requires Node.js 18+.

```bash
git clone <this-repo-url>
cd netflix-clone
npm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required for | Notes |
|---|---|---|
| `TMDB_KEY` | Movie data | Server-side only. Get a free key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api). **Never** prefix this with `VITE_` — that would ship it to the browser. |
| `JWT_SECRET` | Auth | Any long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Auth | MySQL connection details. |

On Vercel, add the same variables under **Project Settings → Environment Variables** for Production, Preview, and Development.

## Local development

```bash
npm run dev
```

This runs the Vite dev server **and** the local API adapter together (via `concurrently`):
- Frontend: http://127.0.0.1:5173
- API adapter: http://localhost:5001 (proxied from `/api/*` on the Vite server — you shouldn't need to hit it directly)

Movie browsing works as soon as `TMDB_KEY` is set. Registration/login additionally require the database variables — without them, `/api/register` and `/api/login` return a clear "server is not configured" error instead of crashing.

Run frontend and API separately if you prefer: `npm run dev:web` / `npm run dev:api`.

## Database setup

Once `DB_*` is set in `.env` (or you're pointing at a real MySQL instance — Aiven, PlanetScale-compatible, local MySQL, etc.):

```bash
npm run db:init
```

This creates the `users` table (with unique indexes on `email` and `phone`) if it doesn't already exist. It's a local script, not an HTTP endpoint — nobody can trigger it remotely just by finding the URL.

## API overview

See [`api/README.md`](./api/README.md) for the full endpoint list, request/response shapes, and the session model. Summary:

| Route | Method | Purpose |
|---|---|---|
| `/api/register` | POST | Create an account, then sign in |
| `/api/login` | POST | Verify credentials, start a session |
| `/api/logout` | POST | End the session |
| `/api/me` | GET | Current user for the active session |
| `/api/tmdb` | GET | Server-side TMDB proxy (allowlisted endpoints only) |

## Testing

```bash
npm test          # run once
npm run test:watch
npm run test:ui
```

48 tests across 9 files, covering:
- **API handlers** (`api/*.test.js`) — validation, duplicate accounts, wrong credentials, database failures, TMDB config/network/upstream failures, retry behavior — all with the real handler code and mocked `db`/`bcrypt`/`https`.
- **Components** (`src/**/*.test.jsx`) — protected route redirect/loading/auth states, movie card rendering and broken-image fallback, row loading/error/empty states, login and register form validation and submission.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel — it auto-detects Vite (`npm run build`, output `dist`).
3. Add the environment variables listed above under Project Settings.
4. Deploy.
5. Run `npm run db:init` once **locally**, pointed at the same database (via `.env`), to create the `users` table — or run the equivalent `CREATE TABLE` manually against your database.
6. Visit the deployed URL, register an account, and confirm login works.

No separate backend host is needed — `vercel.json` just builds the Vite app; the `/api` folder is deployed automatically as serverless functions on the same domain, so there's no CORS to configure.

## Project structure

```
├── api/                    # Vercel serverless functions (the backend)
│   ├── _session.js         # JWT sign/verify + cookie helpers
│   ├── _validate.js        # Shared input validation
│   ├── db.js                # MySQL pool
│   ├── register.js, login.js, logout.js, me.js
│   ├── tmdb.js              # Server-side TMDB proxy
│   └── *.test.js
├── dev-server.js           # Local adapter that runs api/*.js outside Vercel
├── scripts/init-db.js      # One-time schema setup (replaces the old public endpoint)
├── src/
│   ├── components/          # Navbar, Banner, Row, MovieCard, MovieDetailsModal, Footer, ProtectedRoute…
│   ├── context/AuthContext.jsx
│   ├── pages/                # Home, Login, Register
│   ├── services/             # auth.js, api.js — the only files that call /api/*
│   └── styles/variables.css  # Design tokens
├── vite.config.js
└── vercel.json
```

## Security & design notes

- Passwords are hashed with `bcryptjs` (10 rounds); the hash is never returned by any API response.
- Sessions are HttpOnly, SameSite=Lax JWT cookies — not readable by client-side JS, not stored in `localStorage`.
- Login failures return one generic message regardless of whether the account exists or the password was wrong, to avoid confirming registered accounts.
- The TMDB proxy allowlists specific endpoint prefixes so it can't be used as an open relay.
- There are no public "list users" or "run this SQL" endpoints — schema setup is a local script.
- The visual identity (name, colors, layout) is original — not a copy of Netflix's branding or UI.

## Future improvements

- Per-user watchlist / "My List", persisted server-side
- Refresh-token rotation for longer-lived sessions
- Rate limiting on `/api/login` and `/api/register`
- Pagination / infinite scroll on search and category rows
- E2E tests (Playwright) covering the full register → login → browse flow against a real database
