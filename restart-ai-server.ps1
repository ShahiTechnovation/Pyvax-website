# Clean restart of AI server only
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Clean Restart - AI Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop processes on port 5173
Write-Host "Stopping any processes on port 5173..." -ForegroundColor Yellow
$found = $false
$connections = netstat -ano | Select-String ":5173\s" | Select-String "LISTENING"

if ($connections) {
    foreach ($connection in $connections) {
        $found = $true
        $parts = $connection -split '\s+' | Where-Object { $_ }
        $processId = $parts[-1]
        
        try {
            Write-Host "  Stopping process $processId" -ForegroundColor Red
            Stop-Process -Id $processId -Force -ErrorAction Stop
            Write-Host "  ✓ Process stopped" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ Failed to stop process" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  No processes running on port 5173" -ForegroundColor Gray
}

Write-Host ""

if ($found) {
    Write-Host "Waiting for port to be released..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    Write-Host ""
}

# Start AI server
Write-Host "Starting AI server..." -ForegroundColor Green
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$aiPath = Join-Path $scriptDir "hacked3.0-main"

if (Test-Path $aiPath) {
    Write-Host "  Location: $aiPath" -ForegroundColor Gray
    Write-Host ""
    
    $server = Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
        cd '$aiPath'
        Write-Host '========================================' -ForegroundColor Cyan
        Write-Host 'PyVax AI Server' -ForegroundColor Cyan  
        Write-Host '========================================' -ForegroundColor Cyan
        Write-Host ''
        Write-Host 'Starting...' -ForegroundColor Yellow
        pnpm run dev
"@ -PassThru
    
    Write-Host "✓ AI server started (PID: $($server.Id))" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Server starting..." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please wait 10-15 seconds for server to be ready" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then:" -ForegroundColor White
    Write-Host "  1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
    Write-Host "  2. Navigate to: http://localhost:3000/ai" -ForegroundColor Cyan
    Write-Host "  3. Hard refresh: Ctrl+Shift+R" -ForegroundColor White
    Write-Host ""
    Write-Host "Direct access: http://localhost:5173" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Server Window: A new PowerShell window opened" -ForegroundColor Gray
    Write-Host "To stop: Close that window or press Ctrl+C in it" -ForegroundColor Gray
} else {
    Write-Host "✗ Error: hacked3.0-main folder not found!" -ForegroundColor Red
    Write-Host "  Expected at: $aiPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
