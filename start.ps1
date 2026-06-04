# Vehicle Evaluation Platform - start both backend and frontend

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Vehicle Evaluation Platform..." -ForegroundColor Cyan
Write-Host ""

$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root'; npm run dev" -PassThru
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\client'; npm run dev" -PassThru

Write-Host "Backend API  ->  http://localhost:3000" -ForegroundColor Green
Write-Host "Frontend     ->  http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Close the opened terminal windows to stop the services."
Write-Host "Backend PID: $($backend.Id)  |  Frontend PID: $($frontend.Id)"
