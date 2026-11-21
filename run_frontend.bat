@echo off
title BreatheWise Frontend Server
cd /d "%~dp0frontend"
echo ========================================================
echo        BreatheWise Next.js Frontend Server
echo ========================================================
set "PATH=D:\nodejs;C:\Users\kushw\AppData\Roaming\npm;%PATH%"

echo Starting BreatheWise frontend on http://localhost:3000 ...
call npm run dev
if %errorlevel% neq 0 (
    echo [ERROR] Next.js frontend encountered an error.
    pause
)
