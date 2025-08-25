@echo off
echo =====================================================
echo    Starting FinGPT Server for NovaSignal
echo =====================================================
echo.
echo This will start the local FinGPT server on port 8001
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0\fingpt_server"

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing/updating requirements...
pip install -r requirements.txt

echo.
echo =====================================================
echo    🚀 Starting FinGPT Server...
echo =====================================================
echo.
echo Server will be available at: http://localhost:8001
echo Health check: http://localhost:8001/health
echo.

python main.py

pause