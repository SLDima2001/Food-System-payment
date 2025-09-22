<#
 Start both backend and frontend for the project.
 Usage:
   powershell -ExecutionPolicy Bypass -File .\start-all.ps1
#>

$ErrorActionPreference = 'Stop'

# Move to script directory
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "Starting Backend (port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-Command","cd backend; node index.js" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "Starting Frontend (Vite)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-Command","cd frontend; npm run dev" -WindowStyle Normal

Write-Host "Both backend and frontend launch commands issued." -ForegroundColor Cyan
Write-Host "Close the opened PowerShell windows to stop them." -ForegroundColor Yellow
