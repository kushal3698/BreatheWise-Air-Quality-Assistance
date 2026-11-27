@echo off
title BreatheWise FastAPI Backend
cd /d "%~dp0..\backend"
echo ========================================================
echo        BreatheWise FastAPI Backend Server
echo ========================================================

if exist .venv\Scripts\activate.bat (
    echo Activating Python virtual environment...
    call .venv\Scripts\activate.bat
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
) else (
    echo Running with system Python...
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
)
if %errorlevel% neq 0 (
    echo [ERROR] Backend server encountered an error.
    pause
)
