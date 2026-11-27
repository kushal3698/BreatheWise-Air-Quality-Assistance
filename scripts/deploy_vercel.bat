@echo off
title Deploy BreatheWise to Vercel
cd /d "%~dp0..\frontend"
echo ========================================================
echo          Deploy BreatheWise Next.js to Vercel
echo ========================================================

echo.
echo Running Vercel deployment...
echo (If this is your first time, Vercel will ask you to log in via browser)
echo.
call npx vercel
if %errorlevel% neq 0 (
    echo.
    echo [INFO] You can also deploy production directly with: npx vercel --prod
    pause
) else (
    echo.
    echo [SUCCESS] To deploy to production, run: npx vercel --prod
    pause
)
