@echo off
echo.
echo ========================================
echo    ResumeAI Pro - Starting Dev Servers
echo ========================================
echo.

:: Start Backend in new window
echo Starting FastAPI Backend on port 8000...
start "ResumeAI Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\uvicorn main:app --reload --port 8000"

:: Wait a moment
timeout /t 3 /nobreak > nul

:: Start Frontend in new window
echo Starting React Frontend on port 5173...
start "ResumeAI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers starting...
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/api/docs
echo.
pause
