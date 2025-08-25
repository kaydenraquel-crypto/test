Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 Starting NovaSignal Trading Platform" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Starting backend server (FastAPI)..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

Write-Host ""
Write-Host "⏱️  Waiting 3 seconds for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🌐 Starting frontend development server (Vite)..." -ForegroundColor Yellow
Set-Location ..\frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "✅ NovaSignal is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📖 API docs available at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Both servers are running in separate PowerShell windows" -ForegroundColor White
Write-Host "   Close those windows to stop the servers" -ForegroundColor White

Read-Host "Press Enter to close this window..."

