# Quick Fix for Vercel Deployment Error

## 🔴 Error You're Seeing

```
VITE_API_URL is not set. Add it to .env (local) or Vercel environment variables (production).
```

## ✅ What Was Fixed

The code has been updated to **NOT require VITE_API_URL**. The frontend now uses relative paths `/api/*` directly.

## 🚀 Steps to Fix

### 1. Push Updated Code to GitHub

```bash
cd "c:\Users\Areeb\OneDrive\Desktop\netflex clone"
git add .
git commit -m "Remove VITE_API_URL dependency - use relative paths"
git push origin main
```

### 2. Redeploy on Vercel

1. Go to **Vercel Dashboard**
2. Open your project
3. Click **Deployments** tab
4. Click **Redeploy** on the latest deployment (or it will auto-redeploy from GitHub)

### 3. Verify Fix

After redeployment:
1. Open your Vercel URL
2. The error should be gone
3. Try Register/Login - should work now

## ✅ What Changed

- **`src/services/auth.js`**: Now uses `/api` directly (no VITE_API_URL check)
- **No environment variable needed**: Frontend uses relative paths
- **Build verified**: `npm run build` completes successfully

## 📝 Important Notes

- **DO NOT** add `VITE_API_URL` to Vercel environment variables
- The frontend automatically uses `/api/*` relative paths
- Only add these environment variables on Vercel:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `VITE_TMDB_KEY` (for movie data)

## 🎯 After Redeploy

Your app will work at:
```
https://your-app.vercel.app
```

No VITE_API_URL needed!
