// Local development adapter for the Vercel serverless functions in /api.
//
// This does NOT duplicate any auth/db/tmdb logic — it just gives the plain
// api/*.js handler modules the same req/res shape Vercel's runtime provides
// (req.query, req.body, res.status().json()) so `npm run dev` can exercise
// the exact same code that runs in production, without requiring the
// Vercel CLI. vite.config.js proxies /api/* here during development.
import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';

const PORT = process.env.API_PORT || 5001;

const routes = {
  '/api/register': () => import('./api/register.js'),
  '/api/login': () => import('./api/login.js'),
  '/api/logout': () => import('./api/logout.js'),
  '/api/me': () => import('./api/me.js'),
  '/api/profile': () => import('./api/profile.js'),
  '/api/tmdb': () => import('./api/tmdb.js'),
  '/api/watchlist': () => import('./api/watchlist.js'),
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function enhanceResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  };
  return res;
}

const server = http.createServer(async (req, res) => {
  enhanceResponse(res);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const loadHandler = routes[url.pathname];

  if (!loadHandler) {
    res.status(404).json({ success: false, message: `Route ${req.method} ${url.pathname} not found` });
    return;
  }

  req.query = Object.fromEntries(url.searchParams.entries());

  if (req.method === 'POST' || req.method === 'PUT') {
    const raw = await readBody(req);
    try {
      req.body = raw ? JSON.parse(raw) : {};
    } catch {
      req.body = raw;
    }
  }

  try {
    const mod = await loadHandler();
    await mod.default(req, res);
  } catch (error) {
    console.error(`[dev-server] ${url.pathname} threw:`, error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

server.listen(PORT, () => {
  console.log(`Local API dev server ready at http://localhost:${PORT}`);
  if (!process.env.DB_HOST) {
    console.log('  Note: DB_* variables are not set in .env — /api/register, /api/login, /api/me will return a config error.');
  }
  if (!process.env.JWT_SECRET) {
    console.log('  Note: JWT_SECRET is not set in .env — auth endpoints will return a config error.');
  }
  if (!process.env.TMDB_KEY) {
    console.log('  Note: TMDB_KEY is not set in .env — movie data endpoints will return a config error.');
  }
});
