# Troubleshooting Guide - Connection Refused Error

## Problem
You're seeing `ERR_CONNECTION_REFUSED` - the dev server isn't running or isn't accessible.

## Quick Fix

### Option 1: Use the Batch File (Easiest)
1. Double-click `RUN_SERVER.bat` in the project folder
2. Wait for "Local: http://localhost:5173" message
3. Open Chrome and go to `http://localhost:5173`

### Option 2: Manual Start
1. Open PowerShell or Command Prompt in the project folder
2. Run: `npm run dev`
3. Wait for the server to start (you'll see "Local: http://localhost:5173")
4. Open Chrome and navigate to `http://localhost:5173`

## Common Issues

### Issue 1: Port Already in Use
**Error:** `Port 5173 is already in use`

**Solution:**
```powershell
# Find what's using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Then restart
npm run dev
```

### Issue 2: Node Processes Stuck
**Solution:**
```powershell
# Kill all node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Then restart
npm run dev
```

### Issue 3: Chrome Crashes
If Chrome is crashing:
1. Try Microsoft Edge instead: `http://localhost:5173`
2. Or restart Chrome completely
3. Try incognito mode

### Issue 4: Server Starts But Can't Connect
**Check:**
1. Is the server actually running? Look for "Local: http://localhost:5173" in terminal
2. Try `http://127.0.0.1:5173` instead of `localhost:5173`
3. Check Windows Firewall isn't blocking it

## Verification Steps

1. **Check server is running:**
   ```powershell
   netstat -ano | findstr ":5173.*LISTENING"
   ```
   Should show a LISTENING connection

2. **Check .env file:**
   - File should be in project root (same folder as package.json)
   - Content: `VITE_TMDB_KEY=10957148182469aad065ed6a403851f8`
   - No quotes, no spaces

3. **Check browser console:**
   - Open DevTools (F12)
   - Should see: `Loaded API Key: Yes`
   - Should see: `Fetched X items from...`

## Still Not Working?

1. **Check terminal output** - Look for error messages when starting `npm run dev`
2. **Try different port:**
   ```powershell
   npm run dev -- --port 3000
   ```
   Then open `http://localhost:3000`

3. **Reinstall dependencies:**
   ```powershell
   rm -r node_modules
   npm install
   npm run dev
   ```

4. **Check Node.js version:**
   ```powershell
   node --version
   ```
   Should be v16 or higher
