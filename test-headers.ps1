# Test if the AI server is sending correct headers for iframe embedding
Write-Host "Testing AI Server Headers..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method HEAD -ErrorAction Stop
    
    Write-Host "✓ Server is running on http://localhost:5173" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Headers:" -ForegroundColor Yellow
    Write-Host "-----------------------------------" -ForegroundColor Gray
    
    $headers = $response.Headers
    
    # Check for problematic headers
    $hasCoep = $headers.ContainsKey('Cross-Origin-Embedder-Policy')
    $hasCoop = $headers.ContainsKey('Cross-Origin-Opener-Policy')
    $hasCors = $headers.ContainsKey('Access-Control-Allow-Origin')
    $hasCsp = $headers.ContainsKey('Content-Security-Policy')
    
    # Display all headers
    foreach ($key in $headers.Keys) {
        $value = $headers[$key]
        Write-Host "$key : $value" -ForegroundColor White
    }
    
    Write-Host "-----------------------------------" -ForegroundColor Gray
    Write-Host ""
    
    # Analysis
    Write-Host "Analysis:" -ForegroundColor Yellow
    
    if ($hasCoep -or $hasCoop) {
        Write-Host "  ✗ PROBLEM: Restrictive COEP/COOP headers detected!" -ForegroundColor Red
        Write-Host "    These headers block iframe embedding." -ForegroundColor Red
        Write-Host "    Solution: Restart the AI server (pnpm run dev)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ Good: No restrictive COEP/COOP headers" -ForegroundColor Green
    }
    
    if ($hasCors) {
        Write-Host "  ✓ Good: CORS headers present" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Warning: CORS headers missing" -ForegroundColor Yellow
    }
    
    if ($hasCsp) {
        $cspValue = $headers['Content-Security-Policy']
        if ($cspValue -like "*frame-ancestors*") {
            Write-Host "  ✓ Good: CSP allows iframe embedding" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Warning: CSP may block iframe embedding" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    
    if (-not $hasCoep -and -not $hasCoop -and $hasCors) {
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ Server configuration looks good!" -ForegroundColor Green
        Write-Host "  Iframe embedding should work now." -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "✗ Server needs configuration fix" -ForegroundColor Red
        Write-Host "  Please restart the AI server:" -ForegroundColor Yellow
        Write-Host "  cd hacked3.0-main && pnpm run dev" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Cannot connect to http://localhost:5173" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the AI server first:" -ForegroundColor Yellow
    Write-Host "  cd hacked3.0-main && pnpm run dev" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
