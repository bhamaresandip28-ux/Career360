# Career360 PowerShell Launcher
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "          Starting Career360 Platform             " -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/2] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$scriptDir\backend`" && npm run dev" -WindowStyle Normal

Write-Host "[2/2] Starting Frontend Vite Server (Port 5173)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$scriptDir\frontend`" && npm run dev" -WindowStyle Normal

Write-Host "`nBoth servers started in separate windows!" -ForegroundColor Green
Write-Host "Do NOT close those terminal windows while using Career360.`n" -ForegroundColor DarkGray

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
