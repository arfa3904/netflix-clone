# Authentication Fix – What Was Wrong & How to Run

## What Was Wrong (and what was fixed)

1. **No visibility when auth failed**  
   Backend returned 500 with "Registration failed" / "Login failed" but did not log the real error, so DB/table/connection issues were hard to see.  
   **Fix:** Added `console.log('[register] Error:', error.message)` and `console.log('[login] Error:', error.message)` in the catch blocks so the backend terminal shows the actual error.

2. **No way to verify users in DB**  
   You couldn’t confirm if registration actually inserted a row.  
   **Fix:** Added **GET /check-users** that returns `SELECT id, uname, email, phone FROM users` as JSON so you can confirm data in MySQL.

3. **Login response handling**  
   If the backend ever returned success without a `user` object, the frontend could throw when calling `setStoredUser(data.user)`.  
   **Fix:** Login page now checks `if (data.success && data.user)` before calling `setStoredUser` and navigating; otherwise it shows the error message.

4. **Debugging flow**  
   No structured logs to see incoming body, DB result, or password encode/decode.  
   **Fix:** Added console logs in both routes:
   - **Register:** incoming body (password masked), encoded password (first 20 chars), duplicate check result, insert result.
   - **Login:** incoming body (password masked), number of users found, whether decoded password matches.

5. **Backend and frontend port mismatch**  
   If the backend starts on 5001 (because 5000 is busy), the frontend still calls `http://localhost:5000` and you get "Cannot reach server".  
   **Fix:** No code change. You must either free port 5000 or set **VITE_API_URL** in the frontend `.env` to the port the backend actually uses (e.g. `VITE_API_URL=http://localhost:5001`) and restart the frontend.

---

## Exact Steps to Restart Backend and Frontend

### 1. Create the `users` table (once per DB)

Backend must be running. In browser or with curl:

```text
GET http://localhost:5000/create-table
```

Or:

```bash
curl http://localhost:5000/create-table
```

You should see: `Users table created successfully`.

### 2. Start the backend

```bash
cd backend
node server.js
```

- Check the terminal: it should show **Server running on port X** and **http://localhost:X**.
- If you see **Connected to Aiven MySQL**, the DB connection is OK.
- If you see DB connection errors, fix `backend/.env` (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME) and restart.

**Note the port** (e.g. 5000 or 5001). The frontend must call this port.

### 3. (Optional) Match frontend to backend port

If the backend runs on a port other than 5000 (e.g. 5001), in the **project root** create or edit `.env`:

```env
VITE_API_URL=http://localhost:5001
```

Use the port your backend actually printed. Then restart the frontend (step 4).

### 4. Start the frontend

From the **project root** (not inside `backend`):

```bash
npm run dev
```

Open the URL Vite shows (e.g. http://localhost:5173).

### 5. Verify auth flow

1. **Register**  
   Open Register, fill username, email, phone, password → Register.  
   - Backend terminal should show `[register] Incoming body`, encoded password, duplicate check, insert result.  
   - You should be redirected to the Login page.

2. **Check users**  
   Open:

   ```text
   http://localhost:5000/check-users
   ```

   You should see your user (id, uname, email, phone; no password).

3. **Login**  
   On the Login page use the same email (or phone) and password.  
   - Backend should log `[login] Incoming body`, DB result, and "Decoded password matches: true".  
   - You should be redirected to the Netflix homepage.

4. **If something fails**  
   - Read the **backend terminal** for `[register] Error:` or `[login] Error:` and the message.  
   - Typical causes: table missing (run `/create-table`), wrong DB config in `.env`, or frontend calling the wrong port (set `VITE_API_URL` and restart frontend).

---

## Summary of Code Changes

**Backend (`backend/server.js`):**

- **GET /check-users** – returns all users (id, uname, email, phone) as JSON.
- **POST /register** – unchanged validation, duplicate check, Base64 encode, insert; added console logs (body, encoded password, duplicate result, insert result) and error log in catch.
- **POST /login** – unchanged SELECT, Base64 decode, compare; added console logs (body, DB result, decoded match) and error log in catch.
- DB schema and SSL config unchanged.

**Frontend:**

- **Login.jsx** – only change: after `login()`, check `data.success && data.user` before `setStoredUser(data.user)` and `navigate('/')`; otherwise show `data.message` or a fallback error. No other UI or flow changed.
- **auth.js** – already sends `{ uname, email, phone, password }` for register and `{ identifier, password }` for login to `http://localhost:5000` (or `VITE_API_URL`). No change.

Netflix UI, routing, and protected home page are unchanged.
