Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 NovaSignal Simple Startup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "This script will check your setup and show you what to do." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to start checking your setup..." -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "📋 Checking your current directory..." -ForegroundColor Yellow
Write-Host "Current directory: $(Get-Location)" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "🔧 Checking if frontend directory exists..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    Write-Host "✅ Frontend directory found" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend directory not found" -ForegroundColor Red
}
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "🔧 Checking if backend directory exists..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Write-Host "✅ Backend directory found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend directory not found" -ForegroundColor Red
}
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "📋 Now I'll show you the manual commands to run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 MANUAL STARTUP COMMANDS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "TERMINAL 1 (Backend):" -ForegroundColor Cyan
Write-Host "cd backend" -ForegroundColor White
Write-Host "python -m uvicorn main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "TERMINAL 2 (Frontend):" -ForegroundColor Cyan
Write-Host "cd frontend" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Open 2 separate Command Prompt or PowerShell windows" -ForegroundColor Yellow
Write-Host "💡 Run the commands above in each window" -ForegroundColor Yellow
Write-Host "💡 Keep both windows open" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 URLs to access:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend: http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to exit this window..." -ForegroundColor Cyan
Read-Host
