# Netflex Clone — Production Deployment Guide

Deploy the backend to **Render** and frontend to **Vercel** with Aiven MySQL as the database.

---

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Aiven MySQL database (already configured)

---

## STEP 1: Push to GitHub

1. Create a new repository on GitHub.
2. From the project root, run:

```bash
git init
git add .
git commit -m "Production-ready: Render + Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. Ensure `.gitignore` excludes `node_modules`, `dist`, `.env`, and `backend/.env`.

---

## STEP 2: Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect your GitHub repository.
4. Configure:
   - **Name:** `netflex-api` (or your choice)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid)

5. Do **not** deploy yet. Go to **STEP 3** to add environment variables first.

---

## STEP 3: Add Environment Variables on Render

1. In the Render service, go to **Environment**
2. Add these variables:

| Key           | Value                                          | Notes                    |
|---------------|-------------------------------------------------|--------------------------|
| `DB_HOST`     | your-aiven-host.aivencloud.com                  | From Aiven               |
| `DB_PORT`     | 20185                                           | From Aiven               |
| `DB_USER`     | avnadmin                                        | From Aiven               |
| `DB_PASSWORD` | your-db-password                                | From Aiven               |
| `DB_NAME`     | defaultdb                                       | From Aiven               |
| `CORS_ORIGIN` | https://your-app.vercel.app                     | Vercel URL (add after Step 5) |
| `NODE_ENV`    | production                                      | Optional                 |

3. Save changes.
4. Deploy the service. Wait until it shows **Live**.
5. Copy the backend URL (e.g. `https://netflex-api.onrender.com`).

---

## STEP 4: Deploy Frontend on Vercel

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository.
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** (leave blank — project root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Do **not** deploy yet. Add environment variables first.

---

## STEP 5: Add Environment Variables on Vercel

1. In the Vercel project, go to **Settings** → **Environment Variables**
2. Add:

| Key             | Value                            | Environment      |
|-----------------|----------------------------------|------------------|
| `VITE_API_URL`  | https://netflex-api.onrender.com | Production, Preview |
| `VITE_TMDB_KEY` | your-tmdb-api-key                | Production, Preview |

3. Use the **Render** backend URL from Step 3 as `VITE_API_URL`.
4. Save and trigger a new deployment (**Deployments** → **Redeploy**).
5. Copy the Vercel URL (e.g. `https://netflex-clone.vercel.app`).

---

## STEP 6: Update CORS on Render

1. Go back to Render → your backend service → **Environment**
2. Update `CORS_ORIGIN` to your Vercel URL:
   - `https://netflex-clone.vercel.app`
   - For preview deployments, add comma-separated URLs if needed:
   - `https://netflex-clone.vercel.app,https://netflex-clone-*.vercel.app`
3. Save. Render will redeploy automatically.

---

## STEP 7: Create Users Table (One-Time)

1. Open: `https://YOUR-RENDER-URL.onrender.com/create-table`
2. You should see: `Users table created successfully`
3. This sets up the `users` table in Aiven MySQL.

---

## STEP 8: Verify Production

1. Open your Vercel URL.
2. Go to **Register** and create an account.
3. **Log in** with the same credentials.
4. Confirm you are redirected to the Netflix homepage.
5. Check for console errors and CORS issues.

---

## Local Development

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with Aiven credentials
npm install
npm start
```

**Frontend:**
```bash
cp .env.example .env
# Add VITE_API_URL=http://localhost:5000 and VITE_TMDB_KEY
npm install
npm run dev
```

---

## Troubleshooting

| Issue                     | Fix                                                                 |
|---------------------------|---------------------------------------------------------------------|
| "Cannot reach server"     | Ensure `VITE_API_URL` on Vercel matches the Render backend URL     |
| CORS errors               | Add Vercel URL to `CORS_ORIGIN` on Render                          |
| DB connection failed      | Check Aiven credentials and allow Render IPs in Aiven              |
| Build fails               | Run `npm run build` locally to reproduce and fix errors            |
| Render sleeps (Free tier) | First request may be slow; subsequent requests should be fast      |

---

## Summary

| Component | Platform | URL                    |
|-----------|----------|------------------------|
| Frontend  | Vercel   | https://your-app.vercel.app |
| Backend   | Render   | https://your-api.onrender.com |
| Database  | Aiven    | (connection via env vars)   |
