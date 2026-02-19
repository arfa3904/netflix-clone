@echo off
echo ========================================
echo Starting Netflex Clone Dev Server
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Checking .env file...
if exist .env (
    echo .env file found
    type .env
) else (
    echo ERROR: .env file not found!
    pause
    exit /b 1
)
echo.
echo Starting Vite dev server...
echo.
echo Server will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.
npm run dev
pause
