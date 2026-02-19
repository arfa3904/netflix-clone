const API_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchData(endpoint) {
  if (!API_KEY || String(API_KEY).trim() === '' || API_KEY === 'your_tmdb_api_key_here') {
    throw new Error('VITE_TMDB_KEY is missing. Add it to .env in the project root.');
  }

  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.results)) {
      throw new Error('Invalid API response: results property not found');
    }
    return data;
  } catch (err) {
    throw err instanceof Error ? err : new Error(err.message || 'Failed to fetch data.');
  }
}
