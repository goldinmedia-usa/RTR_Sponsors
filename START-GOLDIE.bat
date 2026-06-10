@echo off
cd /d "%~dp0"
echo Starting Goldie...
echo Open http://localhost:8080 in your browser
echo Keep this window open while you use Goldie.
echo.
start "" cmd /c "timeout /t 2 >nul && start http://localhost:8080"
python -m http.server 8080 2>nul || py -m http.server 8080 2>nul || python3 -m http.server 8080
if errorlevel 1 (
  echo ERROR: Python not found. Install from https://python.org
  pause
)
