@echo off
echo ========================================
echo 🚀 NovaSignal Simple Startup
echo ========================================
echo.
echo This script will stay open and show you what to do.
echo.
echo Press any key to start checking your setup...
pause > nul

echo.
echo 📋 Checking your current directory...
echo Current directory: %CD%
echo.
echo Press any key to continue...
pause > nul

echo.
echo 🔧 Checking if frontend directory exists...
if exist "frontend" (
    echo ✅ Frontend directory found
) else (
    echo ❌ Frontend directory not found
)
echo.
echo Press any key to continue...
pause > nul

echo.
echo 🔧 Checking if backend directory exists...
if exist "backend" (
    echo ✅ Backend directory found
) else (
    echo ❌ Backend directory not found
)
echo.
echo Press any key to continue...
pause > nul

echo.
echo 📋 Now I'll Start up NovaSignal:
echo.
echo ========================================
echo 🚀 BLASTING OFF!!!!!!!!!
echo ========================================
start cmd /k "cd C:\Users\iseel\Documents\NovaSignal_v0_2\backend & python -m uvicorn main:app --reload"
echo 5 Seconds
TIMEOUT /T 1
echo 4 Seconds
TIMEOUT /T 1
echo 3 Seconds
TIMEOUT /T 1
echo 2 Seconds
TIMEOUT /T 1
echo WARP DRUVE ACTIVATED!!
start cmd /k "cd C:\Users\iseel\Documents\NovaSignal_v0_2\frontend & npm run dev"
echo 🌐 URLs to access:
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo.
echo Press any key to exit this window...
pause > nul
