@echo off
echo ====================================
echo Starting PyVax AI Development Servers
echo ====================================
echo.
echo Starting Main Next.js Server (Port 3000)...
start cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo Starting AI Coding Assistant (Port 5173)...
start cmd /k "cd /d %~dp0hacked3.0-main && pnpm run dev"

echo.
echo ====================================
echo Both servers are starting...
echo Main App:     http://localhost:3000
echo AI Assistant: http://localhost:5173
echo AI Page:      http://localhost:3000/ai
echo ====================================
echo.
echo Press any key to close this window...
pause >nul
