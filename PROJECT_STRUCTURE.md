# Netflix Clone - Project Structure

## ✅ Production-Ready Vercel Deployment

This project is configured as a **single full-stack application** on Vercel.

---

## 📁 Project Structure

```
netflex-clone/
│
├── api/                          # Vercel Serverless Functions
│   ├── db.js                    # Database connection pool
│   ├── register.js              # POST /api/register
│   ├── login.js                 # POST /api/login
│   ├── create-table.js          # GET /api/create-table (one-time setup)
│   ├── check-users.js           # GET /api/check-users (debug)
│   └── README.md                # API documentation
│
├── src/                          # React Frontend
│   ├── components/              # React components
│   │   ├── Banner.jsx
│   │   ├── MovieCard.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Row.jsx
│   ├── pages/                   # Page components
│   │   ├── Home.jsx             # Netflix homepage (protected)
│   │   ├── Login.jsx            # Login page
│   │   └── Register.jsx         # Registration page
│   ├── services/                # API services
│   │   ├── auth.js              # Uses /api/* relative paths
│   │   └── api.js               # TMDB API service
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
│
├── backend/                      # ⚠️ DEPRECATED (old Express server)
│   ├── server.js                # Not used in Vercel deployment
│   ├── db.js                    # Not used in Vercel deployment
│   └── package.json             # Not used in Vercel deployment
│
├── dist/                         # Build output (generated)
│
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── vercel.json                   # Vercel configuration
├── vite.config.js                # Vite config (no proxy)
├── package.json                  # Dependencies (bcryptjs, mysql2)
├── VERCEL_DEPLOYMENT.md          # Deployment guide
└── PROJECT_STRUCTURE.md          # This file
```

---

## 🔧 Key Files

### API Serverless Functions (`/api`)

- **`db.js`**: Shared MySQL connection pool using `mysql2/promise`
- **`register.js`**: User registration with bcrypt password hashing
- **`login.js`**: User authentication with bcrypt password comparison
- **`create-table.js`**: One-time table creation (run once after deployment)
- **`check-users.js`**: Debug endpoint to list users

### Frontend (`/src`)

- **`services/auth.js`**: Uses relative paths `/api/register` and `/api/login`
- **No VITE_API_URL**: Removed dependency on environment variable
- **No localhost**: All API calls use relative paths

### Configuration

- **`vercel.json`**: Vercel deployment config
- **`vite.config.js`**: Vite config (no proxy, no localhost)
- **`package.json`**: Includes `bcryptjs` and `mysql2` dependencies

---

## 🚀 Deployment Flow

1. **Push to GitHub**
2. **Deploy on Vercel** (auto-detects Vite)
3. **Add environment variables** on Vercel:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `VITE_TMDB_KEY`
4. **Create table**: Visit `/api/create-table` once
5. **Done!** Single URL for everything

---

## 🔐 Authentication Flow

1. **Register**: `POST /api/register` → Password hashed with bcrypt → Saved to DB
2. **Login**: `POST /api/login` → Password compared with bcrypt → Returns user data
3. **Frontend**: Stores user in `localStorage` → Redirects to `/` (Home)

---

## 📝 Environment Variables

**Required on Vercel:**

```
DB_HOST=mysql-xxx.aivencloud.com
DB_PORT=20185
DB_USER=avnadmin
DB_PASSWORD=AVNS_xxxxx
DB_NAME=defaultdb
VITE_TMDB_KEY=your-tmdb-key
```

**Local development** (`.env`):
```
DB_HOST=your-aiven-host
DB_PORT=20185
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=defaultdb
VITE_TMDB_KEY=your-tmdb-key
```

---

## ✅ What Changed

- ✅ Removed Express server (`backend/server.js` not used)
- ✅ Removed `VITE_API_URL` dependency
- ✅ Removed localhost hardcoding
- ✅ Removed CORS (same domain)
- ✅ Added bcryptjs for password hashing
- ✅ Created `/api` serverless functions
- ✅ Frontend uses relative paths `/api/*`
- ✅ Single URL deployment on Vercel

---

## 🎯 Final Result

**One URL:** `https://your-app.vercel.app`

- Frontend loads at `/`
- Login at `/login`
- Register at `/register`
- API at `/api/*`
- All on the same domain
- No CORS issues
- Secure password hashing
