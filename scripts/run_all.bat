@echo off
title BreatheWise Application Launcher
echo ========================================================
echo       BreatheWise - Urban Air Quality Companion
echo ========================================================
echo Starting FastAPI Backend on http://localhost:8000 ...
start "BreatheWise Backend" cmd /k "%~dp0run_backend.bat"

echo Starting Next.js Frontend on http://localhost:3000 ...
start "BreatheWise Frontend" cmd /k "%~dp0run_frontend.bat"

echo.
echo Both servers are starting up...
echo Waiting 5 seconds before opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo BreatheWise is live!
echo Keep both server command windows open while using the app.
echo You can access:
echo   - Web UI: http://localhost:3000
echo   - API & Docs: http://localhost:8000/docs
echo.
pause
