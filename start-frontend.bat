@echo off
echo Starting Frontend Development Server...
cd /d "%~dp0frontend"
echo Current directory: %CD%
echo.
echo Checking Node.js and npm...
node --version
npm --version
echo.
echo Starting Vite dev server...
npm run dev
pause