# Start Both PyVax Servers
# Run this script to start PyVax Main and PyVax AI simultaneously

Write-Host "🚀 Starting PyVax System..." -ForegroundColor Cyan
Write-Host ""

# Start PyVax Main (Port 3001)
Write-Host "Starting PyVax Main on port 3001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '🎨 PyVax Main Server' -ForegroundColor Magenta; Write-Host 'Port: 3001' -ForegroundColor Yellow; Write-Host ''; npm run dev"

Start-Sleep -Seconds 2

# Start PyVax AI (Port 5173)
Write-Host "Starting PyVax AI on port 5173..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\hacked3.0-main'; Write-Host '🤖 PyVax AI Server' -ForegroundColor Cyan; Write-Host 'Port: 5173' -ForegroundColor Yellow; Write-Host ''; pnpm run dev"

Write-Host ""
Write-Host "✅ Both servers starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 PyVax Main:  http://localhost:3001" -ForegroundColor White
Write-Host "🤖 PyVax AI:    http://localhost:3001/ai" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Wait ~10 seconds for servers to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to open PyVax in browser..."
Read-Host

Start-Process "http://localhost:3001"
