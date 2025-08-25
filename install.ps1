\
# NovaSignal v0.2 One-Click Installer (Windows PowerShell)
# - Installs Python 3 and Node.js via winget if missing
# - Sets up backend venv + pip deps
# - Installs frontend deps
# - Creates .env from template (if missing)
# - Creates Start scripts

$ErrorActionPreference = "Stop"

function Ensure-Winget {
  if (Get-Command winget -ErrorAction SilentlyContinue) { return $true }
  Write-Host "winget not found. Please install App Installer from Microsoft Store, then re-run." -ForegroundColor Yellow
  exit 1
}

function Ensure-Tool($name, $check, $wingetId) {
  if (Get-Command $check -ErrorAction SilentlyContinue) {
    Write-Host "$name found."
  } else {
    Write-Host "$name not found. Installing via winget..." -ForegroundColor Yellow
    winget install --id $wingetId -e --source winget --accept-source-agreements --accept-package-agreements
  }
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "== NovaSignal Installer ==" -ForegroundColor Cyan

Ensure-Winget
Ensure-Tool "Python 3" "python" "Python.Python.3.12"
Ensure-Tool "Node.js (LTS)" "node" "OpenJS.NodeJS.LTS"

# Prefer python launcher
$py = "python"
if (Get-Command py -ErrorAction SilentlyContinue) { $py = "py -3" }

# Backend setup
Write-Host "`n--- Backend setup ---" -ForegroundColor Cyan
Set-Location "$ScriptDir\backend"
if (-Not (Test-Path ".venv")) {
  cmd /c $py -m venv .venv
}
# Activate and install
$venvPython = Join-Path (Resolve-Path ".venv").Path "Scripts\python.exe"
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r requirements.txt

# .env
if (-Not (Test-Path "..\.env") -and (Test-Path "..\.env.example")) {
  Copy-Item "..\.env.example" "..\.env"
  Write-Host "Created ../.env from template. Add your keys later." -ForegroundColor DarkYellow
}

# Frontend setup
Write-Host "`n--- Frontend setup ---" -ForegroundColor Cyan
Set-Location "$ScriptDir\frontend"
if (Test-Path "package-lock.json") {
  npm ci
} else {
  npm i
}

# Create runner scripts at repo root
Set-Location $ScriptDir
$startAll = @"
# Start both backend and frontend
Start-Process -NoNewWindow powershell -ArgumentList '-NoExit','-Command','cd ""$ScriptDir\backend""; .\.venv\Scripts\activate; uvicorn main:app --host 127.0.0.1 --port 8000 --reload'
Start-Process -NoNewWindow powershell -ArgumentList '-NoExit','-Command','cd ""$ScriptDir\frontend""; npm run dev'
"@
$startAll | Out-File -Encoding UTF8 ".\run_all.ps1"

$startBackend = @"
cd ""$ScriptDir\backend""
.\.venv\Scripts\activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
"@
$startBackend | Out-File -Encoding UTF8 ".\run_backend.ps1"

$startFrontend = @"
cd ""$ScriptDir\frontend""
npm run dev
"@
$startFrontend | Out-File -Encoding UTF8 ".\run_frontend.ps1"

# Convenience BAT launchers
'@echo off
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0run_all.ps1"
' | Out-File -Encoding ASCII ".\run_all.bat"

'@echo off
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0run_backend.ps1"
' | Out-File -Encoding ASCII ".\run_backend.bat"

'@echo off
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0run_frontend.ps1"
' | Out-File -Encoding ASCII ".\run_frontend.bat"

Write-Host "`nAll set! To launch NovaSignal:" -ForegroundColor Green
Write-Host "1) Double-click run_all.bat  (or run_all.ps1)" -ForegroundColor Green
Write-Host "   Backend: http://127.0.0.1:8000  |  Frontend: http://127.0.0.1:5173" -ForegroundColor Green
