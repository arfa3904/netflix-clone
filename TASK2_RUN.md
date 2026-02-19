# Task 2 – Run Instructions

## Prerequisites

- Node.js (v16+)
- MySQL (Aiven) with `users` table created (run `GET http://localhost:5000/create-table` once if needed)
- Frontend `.env` with `VITE_TMDB_KEY` for Netflix content
- Backend `.env` with Aiven DB credentials

---

## 1. Backend (Express + MySQL)

```bash
cd backend
npm install
node server.js
```

- Server runs on **port 5000** (or next free port if busy).
- Base URL: `http://localhost:5000`.

**Endpoints:**

- `GET /` – health
- `GET /create-table` – create `users` table
- `POST /register` – body: `{ uname, email, phone, password }`
- `POST /login` – body: `{ identifier, password }` (identifier = email or phone)

---

## 2. Frontend (React + Vite)

```bash
# from project root (netflex clone)
npm install
npm run dev
```

- App runs at **http://localhost:5173** (or next port Vite shows).

**Optional – different backend URL**

In project root `.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_TMDB_KEY=your_tmdb_key
```

If `VITE_API_URL` is not set, the app uses `http://localhost:5000`.

---

## 3. Flow

1. Open **http://localhost:5173** → **Login** page.
2. **Register**: open “Sign up now” → fill Username, Email, Phone, Password → Register → redirect to Login.
3. **Login**: Email or phone + Password → Sign In → redirect to **Netflix homepage**.
4. Homepage is protected: not logged in → redirect to Login.
5. **Log out** via “Log out” in the navbar → back to Login.

---

## 4. Quick checks

- Backend: `curl http://localhost:5000/` → `"Backend is running"`.
- Create table once: `curl http://localhost:5000/create-table` → `Users table created successfully`.
- Register:  
  `curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d "{\"uname\":\"test\",\"email\":\"test@test.com\",\"phone\":\"1234567890\",\"password\":\"pass123\"}"`
- Login:  
  `curl -X POST http://localhost:5000/login -H "Content-Type: application/json" -d "{\"identifier\":\"test@test.com\",\"password\":\"pass123\"}"`

---

## 5. Structure

**Backend:** `backend/server.js`, `backend/db.js`, `backend/.env`  
**Frontend:** `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/Home.jsx`, `src/services/auth.js`, `src/App.jsx` (routing + protected route)

Passwords are stored **Base64-encoded** in MySQL. Login accepts **email or phone** as identifier.
