# Environment Variable Setup Guide

## ✅ Current Status

The `.env` file exists in the project root (same level as `package.json`).

## 📝 Setup Instructions

### 1. Get Your TMDB API Key

1. Go to [TMDB Settings](https://www.themoviedb.org/settings/api)
2. Sign up or log in
3. Request an API key (it's free)
4. Copy your API key

### 2. Update .env File

Open the `.env` file in the project root and replace the placeholder:

```env
VITE_TMDB_KEY=your_actual_api_key_here
```

**Important:**
- ✅ No quotes around the key
- ✅ No spaces around the `=` sign
- ✅ File must be in project root (same level as `package.json`)
- ✅ File must be named exactly `.env` (not `.env.txt`)

### 3. Restart Dev Server

After updating `.env`, you **must** restart the dev server:

1. Stop the current server (Ctrl+C in terminal)
2. Run `npm run dev` again

**Why?** Vite only reads `.env` files when it starts. Changes won't take effect until restart.

## 🔍 Verification Steps

### Check 1: Console Log
Open browser DevTools (F12) and check the console. You should see:
```
Loaded API Key: Yes
```

If you see `Loaded API Key: No`, the environment variable is not being read.

### Check 2: File Location
Verify `.env` is in the correct location:
```
netflex clone/
├── .env          ← Should be here
├── package.json
├── vite.config.js
├── src/
└── ...
```

### Check 3: File Format
The `.env` file should look exactly like this (no quotes, no spaces):
```env
VITE_TMDB_KEY=abc123def456ghi789
```

**Wrong formats:**
```env
VITE_TMDB_KEY="abc123"          ❌ Quotes
VITE_TMDB_KEY = abc123          ❌ Spaces around =
VITE_TMDB_KEY=abc123            ✅ Correct
```

### Check 4: Server Restart
After changing `.env`, always restart the dev server!

## 🐛 Troubleshooting

### Problem: Still seeing "API key not configured"

**Solutions:**
1. ✅ Verify `.env` is in project root (not in `src/` folder)
2. ✅ Check file has no quotes: `VITE_TMDB_KEY=your_key` (not `"your_key"`)
3. ✅ Restart dev server completely (stop and start)
4. ✅ Check browser console for "Loaded API Key: Yes"
5. ✅ Clear browser cache and hard refresh (Ctrl+Shift+R)

### Problem: "Loaded API Key: No" in console

**Solutions:**
1. Verify `.env` file exists in project root
2. Check file name is exactly `.env` (Windows may hide extension)
3. Ensure no extra spaces or quotes
4. Restart dev server

### Problem: File not found errors

If you see file not found, ensure:
- `.env` is in the same directory as `package.json`
- File is not named `.env.txt` or `.env.local`
- File is not inside the `src/` folder

## 📋 Quick Checklist

- [ ] `.env` file exists in project root
- [ ] `.env` contains `VITE_TMDB_KEY=your_actual_key`
- [ ] No quotes around the API key
- [ ] No spaces around `=`
- [ ] Dev server restarted after changes
- [ ] Browser console shows "Loaded API Key: Yes"
- [ ] App loads without API key errors

## 🎯 Expected Behavior

**With valid API key:**
- ✅ Console shows: "Loaded API Key: Yes"
- ✅ Movies load in all rows
- ✅ Banner shows trending movie
- ✅ No error messages

**Without API key (or invalid):**
- ⚠️ Console shows: "Loaded API Key: No"
- ⚠️ Red error banner at top
- ⚠️ Rows show "API key not configured" message
- ⚠️ App still loads (doesn't crash)
