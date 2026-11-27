@echo off
title Push BreatheWise to GitHub
cd /d "%~dp0.."
echo ========================================================
echo           Push BreatheWise to GitHub Repository
echo ========================================================
echo.

where git >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd" set "PATH=C:\Program Files\Git\cmd;%PATH%"
    if exist "C:\Program Files (x86)\Git\cmd" set "PATH=C:\Program Files (x86)\Git\cmd;%PATH%"
    if exist "%LOCALAPPDATA%\Programs\Git\cmd" set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
)

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git command-line tool is not found.
    pause
    exit /b 1
)

set "DEFAULT_REPO=https://github.com/kushal3698/BreatheWise-Air-Quality-Assistance.git"
echo Default repository: %DEFAULT_REPO%
set /p REPO_URL="Enter your GitHub Repository URL (or press Enter to use default): "
if "%REPO_URL%"=="" (
    set "REPO_URL=%DEFAULT_REPO%"
)

echo.
echo Staging and pushing to %REPO_URL%...
git add .
git commit -m "chore: repository update"
git push origin main
pause
