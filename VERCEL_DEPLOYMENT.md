# Vercel Full-Stack Deployment Guide

This project is configured to deploy **entirely on Vercel** as a single full-stack application (frontend + backend serverless functions).

---

## Architecture

- **Frontend:** React + Vite (served as static files)
- **Backend:** Vercel Serverless Functions in `/api` folder
- **Database:** Aiven MySQL (external)
- **Single URL:** Everything runs on one Vercel domain

---

## Prerequisites

- GitHub account
- Vercel account (https://vercel.com)
- Aiven MySQL database (already configured)

---

## STEP 1: Push to GitHub

1. Ensure your code is committed:
   ```bash
   git add .
   git commit -m "Refactor for Vercel serverless functions"
   git push origin main
   ```

---

## STEP 2: Deploy on Vercel

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Do not deploy yet** — add environment variables first.

---

## STEP 3: Add Environment Variables on Vercel

1. In the Vercel project, go to **Settings** → **Environment Variables**
2. Add these variables (for **Production**, **Preview**, and **Development**):

| Key           | Value                          | Example                    |
|---------------|--------------------------------|----------------------------|
| `DB_HOST`     | Your Aiven MySQL host          | `mysql-xxx.aivencloud.com` |
| `DB_PORT`     | Your Aiven MySQL port          | `20185`                    |
| `DB_USER`     | Your Aiven MySQL user          | `avnadmin`                 |
| `DB_PASSWORD` | Your Aiven MySQL password       | `AVNS_xxxxx`               |
| `DB_NAME`     | Your Aiven MySQL database name | `defaultdb`                |
| `VITE_TMDB_KEY`| Your TMDB API key              | `10957148182469aad065...`  |

3. **Save** all variables.

---

## STEP 4: Deploy

1. Click **Deploy** (or trigger a new deployment)
2. Wait for the build to complete
3. Copy your **Production URL** (e.g. `https://netflex-clone.vercel.app`)

---

## STEP 5: Create Users Table (One-Time)

1. Open: `https://YOUR-APP.vercel.app/api/create-table`
2. You should see: `{"success":true,"message":"Users table created successfully"}`
3. This creates the `users` table in your Aiven MySQL database.

---

## STEP 6: Test the Application

1. Open your Vercel URL
2. Go to **Register** and create an account
3. **Log in** with the same credentials
4. You should be redirected to the Netflix homepage
5. Verify no console errors

---

## Local Development

**Install dependencies:**
```bash
npm install
```

**Set up environment variables:**
Create `.env` in the project root:
```
DB_HOST=your-aiven-host
DB_PORT=20185
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=defaultdb
VITE_TMDB_KEY=your-tmdb-key
```

**Run frontend:**
```bash
npm run dev
```

**Note:** For local development, you'll need to use Vercel CLI to run serverless functions locally, or use a local Express server. The production deployment uses Vercel serverless functions.

---

## Project Structure

```
netflex-clone/
├── api/                    # Vercel serverless functions
│   ├── db.js              # Database connection
│   ├── register.js        # POST /api/register
│   ├── login.js           # POST /api/login
│   ├── create-table.js    # GET /api/create-table
│   └── check-users.js     # GET /api/check-users
├── src/                    # React frontend
│   ├── services/
│   │   └── auth.js        # Uses /api/* relative paths
│   └── ...
├── vercel.json            # Vercel configuration
├── vite.config.js         # Vite config (no proxy)
└── package.json           # Dependencies (bcryptjs, mysql2)
```

---

## Key Changes from Previous Setup

✅ **No Express server** — uses Vercel serverless functions  
✅ **No VITE_API_URL** — frontend uses relative paths `/api/*`  
✅ **No CORS** — same domain for frontend and backend  
✅ **bcryptjs** — secure password hashing (replaces Base64)  
✅ **Single URL** — everything on one Vercel domain  

---

## Troubleshooting

| Issue                     | Solution                                           |
|---------------------------|----------------------------------------------------|
| Build fails               | Check `npm run build` locally, fix errors          |
| "Cannot reach server"     | Ensure `/api` functions are deployed correctly   |
| Database connection fails| Verify DB env vars are set on Vercel              |
| Password doesn't match    | Old users used Base64; new users use bcrypt       |

---

## Migration Note

**Existing users:** If you had users registered with the old Base64 password system, they will need to re-register. The new system uses bcrypt, which is incompatible with Base64.

---

## Summary

✅ **One URL:** `https://your-app.vercel.app`  
✅ **Frontend:** React app served as static files  
✅ **Backend:** Serverless functions at `/api/*`  
✅ **Database:** Aiven MySQL (external)  
✅ **No CORS:** Same domain  
✅ **Secure:** bcrypt password hashing  
