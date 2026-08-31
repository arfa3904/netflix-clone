import https from 'node:https';

const BASE_URL = 'https://api.themoviedb.org/3';

// Allowlist of endpoint prefixes this proxy will forward, so it can't be used
// as an open relay to arbitrary TMDB (or non-TMDB) paths.
const ALLOWED_PREFIXES = [
  '/trending/movie',
  '/movie/popular',
  '/movie/top_rated',
  '/movie/now_playing',
  '/movie/upcoming',
  '/movie/', // covers /movie/{id} details
  '/search/movie',
  '/genre/movie/list',
  '/discover/movie',
];

const REQUEST_TIMEOUT_MS = 10000;

// Uses node:https rather than the global fetch: some network setups (proxies,
// restrictive sandboxes) reset undici's fetch connections to TMDB with
// ECONNRESET while plain node:https to the same host works fine.
function httpsGetJson(targetUrl) {
  return new Promise((resolve, reject) => {
    const req = https.get(targetUrl, { headers: { Accept: 'application/json' } }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        let data = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
          data = null;
        }
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error('Request to the movie service timed out.'));
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use GET.' });
  }

  const apiKey = process.env.TMDB_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: 'The movie service is not configured. Missing TMDB_KEY environment variable.',
    });
  }

  const { endpoint, query: searchQuery, page } = req.query || {};

  if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('/')) {
    return res.status(400).json({ success: false, message: 'A valid "endpoint" query parameter is required.' });
  }

  const isAllowed = ALLOWED_PREFIXES.some((prefix) => endpoint.startsWith(prefix));
  if (!isAllowed) {
    return res.status(400).json({ success: false, message: 'This endpoint is not permitted.' });
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  if (searchQuery) url.searchParams.set('query', String(searchQuery));
  if (page) url.searchParams.set('page', String(page));

  try {
    // One retry: transient resets on the first connection attempt are common
    // enough on some networks/proxies that a single retry meaningfully
    // improves reliability without masking a genuinely broken upstream.
    let result;
    try {
      result = await httpsGetJson(url.toString());
    } catch (firstError) {
      console.warn('[tmdb] First attempt failed, retrying once:', firstError.message);
      result = await httpsGetJson(url.toString());
    }

    const { status, data } = result;

    if (status < 200 || status >= 300) {
      return res.status(status || 502).json({
        success: false,
        message: data?.status_message || 'The movie service returned an error.',
      });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (error) {
    console.error('[tmdb] Error:', error.message);
    return res.status(502).json({ success: false, message: 'Could not reach the movie service. Try again shortly.' });
  }
}
