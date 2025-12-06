@echo off
echo ====================================
echo PyVax AI - Server Restart Script
echo ====================================
echo.

echo Step 1: Stopping existing servers...
echo.

REM Kill processes on port 3000
echo Stopping processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo   Stopping process %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Kill processes on port 5173
echo Stopping processes on port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo   Stopping process %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Waiting for processes to terminate...
timeout /t 2 /nobreak >nul
echo.

echo Step 2: Starting Main Next.js Server (Port 3000)...
start "PyVax Main Server" cmd /k "cd /d %~dp0 && echo Starting Main App... && npm run dev"
echo   Main server starting...
echo.

timeout /t 3 /nobreak >nul

echo Step 3: Starting AI Coding Assistant (Port 5173)...
start "PyVax AI Assistant" cmd /k "cd /d %~dp0hacked3.0-main && echo Starting AI Assistant... && pnpm run dev"
echo   AI server starting...
echo.

echo =====================================
echo Both servers are starting!
echo =====================================
echo.
echo Please wait 10-20 seconds for servers to fully start, then:
echo.
echo 1. Open your browser
echo 2. Clear cache (Ctrl+Shift+Delete)
echo 3. Navigate to: http://localhost:3000/ai
echo 4. Hard refresh: Ctrl+Shift+R
echo.
echo URLs:
echo   Main App:     http://localhost:3000
echo   AI Assistant: http://localhost:5173
echo   AI Page:      http://localhost:3000/ai
echo.
echo To stop servers: Close their respective command windows
echo.
echo Press any key to close this window (servers will continue running)...
pause >nul
