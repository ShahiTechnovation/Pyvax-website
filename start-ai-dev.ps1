# PyVax AI Development Servers Starter
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Starting PyVax AI Development Servers" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Main Next.js Server
Write-Host "Starting Main Next.js Server (Port 3000)..." -ForegroundColor Yellow
$mainServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; npm run dev" -PassThru

# Wait a bit before starting the second server
Start-Sleep -Seconds 3

# Start AI Coding Assistant
Write-Host "Starting AI Coding Assistant (Port 5173)..." -ForegroundColor Yellow
$aiServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\hacked3.0-main'; pnpm run dev" -PassThru

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Main App:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "AI Assistant: http://localhost:5173" -ForegroundColor Cyan
Write-Host "AI Page:      http://localhost:3000/ai" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (servers will continue running)" -ForegroundColor Yellow
Write-Host "To stop servers, close their respective windows" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Script terminated" -ForegroundColor Red
}
