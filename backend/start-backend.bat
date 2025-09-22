@echo off
echo Starting Green Harvest Backend Server...
cd /d "%~dp0"
echo Current directory: %CD%
node index.js
pause