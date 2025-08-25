@echo off
echo ========================================
echo 🚀 Starting NovaSignal Trading Platform
echo ========================================
echo.
echo 🔍 DEBUG MODE - Checking for issues...
echo.

echo 📋 Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.8+
    echo.
    echo Press any key to continue anyway...
    pause > nul
)

echo.
echo 📦 Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js 16+
    echo.
    echo Press any key to continue anyway...
    pause > nul
)

echo.
echo 📦 Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm not found! Please install npm
    echo.
    echo Press any key to continue anyway...
    pause > nul
)

echo.
echo 🔧 Installing frontend dependencies...
cd frontend
if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to frontend directory
    echo Current directory: %CD%
    echo.
    echo Press any key to continue anyway...
    pause > nul
) else (
    echo ✅ Navigated to frontend directory: %CD%
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        echo.
        echo Press any key to continue anyway...
        pause > nul
    )
)

echo.
echo 🔧 Installing backend dependencies...
cd ..\backend
if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to backend directory
    echo Current directory: %CD%
    echo.
    echo Press any key to continue anyway...
    pause > nul
) else (
    echo ✅ Navigated to backend directory: %CD%
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        echo.
        echo Press any key to continue anyway...
        pause > nul
    )
)

echo.
echo ✅ Dependencies installation completed!
echo.
echo 📋 Starting backend server (FastAPI)...
cd ..\backend
if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to backend directory for server start
    echo Current directory: %CD%
    echo.
    echo Press any key to continue anyway...
    pause > nul
) else (
    echo ✅ Starting backend from: %CD%
    start "NovaSignal Backend" cmd /k "cd /d %CD% && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
)

echo.
echo ⏱️  Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Starting frontend development server (Vite)...
cd ..\frontend
if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to frontend directory for server start
    echo Current directory: %CD%
    echo.
    echo Press any key to continue anyway...
    pause > nul
) else (
    echo ✅ Starting frontend from: %CD%
    start "NovaSignal Frontend" cmd /k "cd /d %CD% && npm run dev"
)

echo.
echo ✅ NovaSignal startup sequence completed!
echo.
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔧 Backend API will be available at: http://localhost:8000
echo 📖 API docs available at: http://localhost:8000/docs
echo.
echo 💡 Press any key to exit this window (servers will continue running)
echo 🔍 Check the separate terminal windows for any error messages
echo.
echo Current directory: %CD%
pause > nul
