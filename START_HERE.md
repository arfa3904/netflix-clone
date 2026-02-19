# Fix "Cannot reach server" Error

That error means the **backend is not running**. You need to run both backend and frontend.

## 1. Start the backend first

**Terminal 1:**
```bash
npm run backend
```

Or:
```bash
cd backend
node server.js
```

You should see:
- `Server running on port 5000`
- `http://localhost:5000`
- `✅ Connected to Aiven MySQL` (if DB is configured)

Leave this terminal open. Do not close it.

---

## 2. Start the frontend

**Terminal 2** (new terminal):
```bash
npm run dev
```

Open the URL shown (e.g. http://localhost:5173).

---

## 3. If backend uses a different port

If your backend prints `Server running on port 5001` (because 5000 is busy):

1. Add to your **project root** `.env`:
   ```
   VITE_API_URL=http://localhost:5001
   ```
2. Restart the frontend (`Ctrl+C` then `npm run dev` again).

---

## Quick summary

1. **Terminal 1:** `npm run backend` ← keep running  
2. **Terminal 2:** `npm run dev`  
3. Open http://localhost:5173 and try login again
