@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Change to script directory
pushd %~dp0

echo Starting Backend (port 5000)...
start "Backend" cmd /k "cd backend && node index.js"

REM Small delay to ensure backend initializes
ping -n 3 127.0.0.1 >NUL

echo Starting Frontend (Vite)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Both backend and frontend launch commands issued.

echo.
echo To stop: close the two opened windows (Backend, Frontend).

echo Done.
popd
ENDLOCAL
