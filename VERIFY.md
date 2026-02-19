# Verification Instructions – Netflix Clone

## Part 1 – API

### 1. `.env` file
- **Location:** Project root (same folder as `package.json`).
- **Content (no quotes, no spaces around `=`):**
  ```
  VITE_TMDB_KEY=10957148182469aad065ed6a403851f8
  ```
- **Restart:** After changing `.env`, restart the dev server (`Ctrl+C` then `npm run dev`).

### 2. Confirm API key is loaded
- Open the app in the browser.
- Open DevTools (F12) → **Console**.
- You should see: `Loaded API Key: Yes`.
- You should see lines like: `Fetched 20 items from /trending/movie/week`.

### 3. Confirm fetch works
- Hero banner shows a trending movie with backdrop image.
- Rows show: **Trending Now**, **Popular Movies**, **Top Rated** with posters.
- No red “Configuration required” banner.

---

## Part 2 – UI (Netflix-style)

### Navbar
- At the top: transparent (gradient).
- After scrolling down: solid black (`#141414`).
- Red “NETFLIX” logo.
- Menu links (Home, Trending, etc.) with hover lightening.

### Hero banner
- Tall hero (full viewport height).
- Dark gradient at bottom into main background.
- Large title and short description.
- **Play** (white) and **+ My List** (grey) buttons, Netflix-style.
- Smooth fade-in.

### Rows
- Horizontal scroll, no visible scrollbar.
- First row (“Trending Now”) has larger posters.
- Posters scale up slightly on hover.
- Spacing between posters.
- Rows fade in.

### Loading & errors
- Rows show a red loading spinner and “Loading...” while fetching.
- If the API key is missing, a red error banner appears at the top with clear instructions.

### Responsive
- Layout and text scale on smaller screens.
- Rows and navbar remain usable on mobile.

---

## Part 3 – Structure

```
src/
  components/   → Navbar, Banner, Row, MovieCard (+ .css)
  services/     → api.js
  pages/        → Home.jsx
  styles/       → variables.css
  App.jsx, App.css, main.jsx
```

- **App.jsx** imports global styles and renders the **Home** page.
- **Home** handles banner + rows and API error state.
- **api.js** uses `BASE_URL` and `API_KEY`, checks `res.ok` and `data.results`, and logs once that the key is loaded.

---

## Quick checklist

1. [ ] `.env` in project root with `VITE_TMDB_KEY=10957148182469aad065ed6a403851f8` (no quotes).
2. [ ] Dev server restarted after any `.env` change.
3. [ ] Console shows `Loaded API Key: Yes` and “Fetched … items from …”.
4. [ ] Hero shows a movie; three rows show posters.
5. [ ] Navbar goes from transparent to solid black on scroll.
6. [ ] First row has larger posters; hover scales posters.
7. [ ] No scrollbar on rows; loading spinner appears while loading.
8. [ ] Run `npm run test` and see all tests pass.

---

## Run commands

```bash
# Install (if needed)
npm install

# Dev server
npm run dev
# Then open http://localhost:5173

# Tests
npm run test -- --run
```
