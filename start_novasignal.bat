@echo off
title NovaSignal Trading Platform
cls

echo ====================================
echo   NovaSignal Trading Platform
echo ====================================
echo.
echo Starting NovaSignal application...
echo.

REM Change to the project directory
cd /d "C:\Users\iseel\NS\NovaSignal_v0_2"

echo [1/3] Starting Backend API Server...
echo.
start "NovaSignal Backend" cmd /k "cd backend && python main.py"

REM Wait a few seconds for backend to initialize
timeout /t 5 /nobreak >nul

echo [2/3] Starting Frontend Development Server...
echo.
start "NovaSignal Frontend" cmd /k "cd frontend && npm run dev"

REM Wait for frontend to start
timeout /t 3 /nobreak >nul

echo [3/3] Opening application in browser...
echo.
timeout /t 8 /nobreak >nul
start http://localhost:5173

echo.
echo ====================================
echo   NovaSignal is now running!
echo ====================================
echo.
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:5173
echo.
echo Press any key to close this window...
echo (Backend and Frontend will continue running)
echo.
pause >nul
exit