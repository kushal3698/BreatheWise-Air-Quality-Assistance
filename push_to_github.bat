@echo off
title Push BreatheWise to GitHub
cd /d "%~dp0"
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
    echo If you just finished the installer, please close and re-open this file.
    echo.
    echo If you have not run the installer yet, please run the downloaded Git .exe file.
    echo.
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
echo [1/5] Initializing local git repository...
if not exist ".git" (
    git init
)

echo [2/5] Staging files according to .gitignore...
git add .

echo [3/5] Creating commit...
git commit -m "feat: complete BreatheWise urban air quality companion with CPCB NAQI compliance"

echo [4/5] Setting branch to main...
git branch -M main

echo [5/5] Configuring remote and pushing...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  [SUCCESS] Code successfully pushed to GitHub!
    echo ========================================================
) else (
    echo.
    echo [ERROR] Git push failed. Please verify your GitHub credentials and repository permissions.
)
pause
