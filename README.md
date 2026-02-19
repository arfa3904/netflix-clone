# Netflex Clone

A Netflix-style movie browsing application built with React + Vite, powered by The Movie Database (TMDB) API.

## Features

- 🎬 Browse trending, popular, and top-rated movies
- 🎨 Dark Netflix-style UI with smooth scrolling rows
- 🖼️ Movie posters with hover effects
- 📱 Responsive design
- ✅ Comprehensive error handling
- 🧪 Unit tests with Vitest

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` (or edit existing `.env`)
   - Add your TMDB API key (get one free at [TMDB](https://www.themoviedb.org/settings/api)):
     ```
     VITE_TMDB_KEY=your_actual_tmdb_api_key_here
     ```
   - **Important:** No quotes around the key, no spaces around `=`
   - See `ENV_SETUP.md` for detailed instructions and troubleshooting

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── Navbar.jsx      # Navigation bar
│   ├── Banner.jsx      # Hero banner with trending movie
│   ├── Row.jsx         # Horizontal scrolling movie row
│   └── MovieCard.jsx   # Individual movie poster card
├── services/
│   └── api.js          # TMDB API service with fetch function
└── App.jsx             # Main application component
```

## API Endpoints Used

- `/trending/movie/week` - Trending movies
- `/movie/popular` - Popular movies
- `/movie/top_rated` - Top rated movies

## Technologies

- React 18
- Vite
- Vitest (testing)
- TMDB API
