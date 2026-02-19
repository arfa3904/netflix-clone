# Vercel Deployment Steps - Quick Reference

## 🚀 Complete Deployment Guide

### Prerequisites
- GitHub repository pushed
- Vercel account (https://vercel.com)
- Aiven MySQL database credentials

---

## Step 1: Push Code to GitHub

```bash
cd "c:\Users\Areeb\OneDrive\Desktop\netflex clone"
git add .
git commit -m "Fix Vercel serverless functions"
git push origin main
```

---

## Step 2: Deploy on Vercel

1. Go to **https://vercel.com**
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **DO NOT CLICK DEPLOY YET** - Add environment variables first

---

## Step 3: Add Environment Variables

In Vercel project → **Settings** → **Environment Variables**

Add these **6 variables** for **Production**, **Preview**, and **Development**:

| Variable Name | Value Example | Where to Get |
|---------------|---------------|--------------|
| `DB_HOST` | `mysql-xxx.aivencloud.com` | Aiven dashboard |
| `DB_PORT` | `20185` | Aiven dashboard |
| `DB_USER` | `avnadmin` | Aiven dashboard |
| `DB_PASSWORD` | `AVNS_xxxxx` | Aiven dashboard |
| `DB_NAME` | `defaultdb` | Aiven dashboard |
| `VITE_TMDB_KEY` | `10957148182469aad065...` | Your TMDB API key |

**Important:** Click **Save** after adding each variable.

---

## Step 4: Deploy

1. Click **Deploy** button
2. Wait for build to complete (2-3 minutes)
3. Copy your **Production URL** (e.g. `https://netflex-clone.vercel.app`)

---

## Step 5: Create Users Table (One-Time Setup)

Open this URL in your browser:
```
https://YOUR-APP-NAME.vercel.app/api/create-table
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Users table created successfully"
}
```

**If you see an error:** Check that all DB environment variables are set correctly.

---

## Step 6: Test the Application

1. **Open your Vercel URL** (e.g. `https://netflex-clone.vercel.app`)
2. **Go to Register page**
3. **Fill in:**
   - Username
   - Email
   - Phone
   - Password
4. **Click Register** → Should show success
5. **Go to Login page**
6. **Login with email/phone and password**
7. **Should redirect to Netflix homepage**

---

## ✅ Success Indicators

- ✅ Register creates account without errors
- ✅ Login works and redirects to homepage
- ✅ No "Invalid response from server" errors
- ✅ No console errors in browser DevTools
- ✅ User data stored in Aiven MySQL database

---

## 🔧 Troubleshooting

### Issue: "Invalid response from server"
**Solution:** 
- Check Vercel function logs (Deployments → View Function Logs)
- Verify all environment variables are set
- Ensure `/api/create-table` was called successfully

### Issue: Database connection fails
**Solution:**
- Verify all DB_* environment variables are correct
- Check Aiven database is running
- Verify Aiven allows connections from Vercel IPs

### Issue: Build fails
**Solution:**
- Run `npm run build` locally to see errors
- Check `package.json` has all dependencies
- Ensure `vercel.json` is correct

### Issue: Functions not found (404)
**Solution:**
- Verify `/api` folder exists in project root
- Check `vercel.json` has correct configuration
- Ensure files are committed to GitHub

---

## 📋 Final Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] All environment variables ready
- [ ] `npm run build` works locally
- [ ] `/api` folder exists with all functions

After deploying:
- [ ] Build completed successfully
- [ ] Environment variables added
- [ ] `/api/create-table` called successfully
- [ ] Register works
- [ ] Login works
- [ ] Redirect works

---

## 🎯 Final Project Structure

```
netflex-clone/
├── api/                    # ✅ Vercel Serverless Functions
│   ├── db.js
│   ├── register.js
│   ├── login.js
│   ├── create-table.js
│   └── check-users.js
├── src/                    # ✅ React Frontend
│   └── services/auth.js    # Uses /api/* relative paths
├── vercel.json             # ✅ Vercel config
└── package.json            # ✅ Dependencies (bcryptjs, mysql2)
```

---

## 🌐 Your Production URL

After deployment, your app will be available at:
```
https://YOUR-PROJECT-NAME.vercel.app
```

**First URL to open:**
```
https://YOUR-PROJECT-NAME.vercel.app/api/create-table
```

Then:
```
https://YOUR-PROJECT-NAME.vercel.app
```

---

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Check browser console for errors
3. Verify environment variables
4. Test `/api/create-table` endpoint
5. Check Aiven database connection
