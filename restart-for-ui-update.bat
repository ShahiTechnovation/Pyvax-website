@echo off
echo ====================================
echo PyVax AI - UI Update Applied
echo ====================================
echo.
echo Changes made:
echo   - Removed candy and teddy decorations
echo   - Removed animated background rays  
echo   - Simplified heading and text
echo   - Made UI minimal and professional
echo.
echo ====================================
echo Restarting AI Server...
echo ====================================
echo.

REM Stop processes on port 5173
echo Stopping AI server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo Starting AI server with new UI...
cd /d %~dp0hacked3.0-main
start "PyVax AI - Minimal UI" cmd /k "pnpm run dev"

echo.
echo ====================================
echo AI Server Starting...
echo ====================================
echo.
echo Wait 10-15 seconds, then:
echo   1. Navigate to: http://localhost:5173
echo   2. Or embedded: http://localhost:3000/ai
echo   3. Hard refresh: Ctrl+Shift+R
echo.
echo You should see:
echo   - Clean background (no candies/teddies)
echo   - Simple "PyVax AI" heading
echo   - No animated rays
echo   - Professional minimal design
echo.
pause
