@echo off
title Career360 Launcher
echo ==================================================
echo           Starting Career360 Platform
echo ==================================================
echo.
echo [1/2] Starting Backend Server on http://localhost:5000 ...
start "Career360 Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/2] Starting Frontend Vite Server on http://localhost:5173 ...
start "Career360 Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==================================================
echo  Both servers are starting in separate windows!
echo  Do NOT close those terminal windows while using.
echo ==================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo Done!
