# PyVax AI - Server Restart Script
# This script stops and restarts both servers to apply configuration changes

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "PyVax AI - Server Restart Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to stop processes on a specific port
function Stop-ProcessOnPort {
    param (
        [int]$Port
    )
    
    Write-Host "Checking for processes on port $Port..." -ForegroundColor Yellow
    $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
    
    if ($connections) {
        foreach ($connection in $connections) {
            $parts = $connection -split '\s+' | Where-Object { $_ }
            $processId = $parts[-1]
            
            try {
                Write-Host "  Stopping process $processId on port $Port" -ForegroundColor Red
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "  ✓ Process $processId stopped" -ForegroundColor Green
            }
            catch {
                Write-Host "  ✗ Failed to stop process $processId" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "  No processes found on port $Port" -ForegroundColor Gray
    }
}

# Step 1: Stop existing processes
Write-Host "Step 1: Stopping existing servers..." -ForegroundColor Yellow
Write-Host ""
Stop-ProcessOnPort -Port 3000
Stop-ProcessOnPort -Port 5173
Write-Host ""

# Wait a moment for processes to fully terminate
Write-Host "Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host ""

# Step 2: Start Main Next.js Server
Write-Host "Step 2: Starting Main Next.js Server (Port 3000)..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mainServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; Write-Host 'Starting Main App...' -ForegroundColor Cyan; npm run dev" -PassThru
Write-Host "  ✓ Main server starting (PID: $($mainServer.Id))" -ForegroundColor Green
Write-Host ""

# Wait before starting second server
Start-Sleep -Seconds 3

# Step 3: Start AI Coding Assistant
Write-Host "Step 3: Starting AI Coding Assistant (Port 5173)..." -ForegroundColor Yellow
$aiServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\hacked3.0-main'; Write-Host 'Starting AI Assistant...' -ForegroundColor Cyan; pnpm run dev" -PassThru
Write-Host "  ✓ AI server starting (PID: $($aiServer.Id))" -ForegroundColor Green
Write-Host ""

# Step 4: Instructions
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✓ Both servers are starting!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Please wait 10-20 seconds for servers to fully start, then:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open your browser" -ForegroundColor White
Write-Host "2. Clear cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "3. Navigate to: http://localhost:3000/ai" -ForegroundColor Cyan
Write-Host "4. Hard refresh: Ctrl+Shift+R" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  Main App:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "  AI Assistant: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  AI Page:      http://localhost:3000/ai" -ForegroundColor Magenta
Write-Host ""
Write-Host "Server Windows:" -ForegroundColor Yellow
Write-Host "  Main Server PID:  $($mainServer.Id)" -ForegroundColor Gray
Write-Host "  AI Server PID:    $($aiServer.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop servers: Close their respective PowerShell windows" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close this window (servers will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
