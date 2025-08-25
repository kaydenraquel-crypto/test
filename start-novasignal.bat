@echo off
echo ========================================
echo 🚀 Starting NovaSignal Trading Platform
echo ========================================

echo.
echo 📋 Starting backend server (FastAPI)...
cd backend
start "NovaSignal Backend" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo ⏱️  Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo 🌐 Starting frontend development server (Vite)...
cd ..\frontend
start "NovaSignal Frontend" cmd /k "npm run dev"

echo.
echo ✅ NovaSignal is starting up!
echo.
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔧 Backend API will be available at: http://localhost:8000
echo 📖 API docs available at: http://localhost:8000/docs
echo.
echo 💡 Press any key to exit this window (servers will continue running)
pause > nul

