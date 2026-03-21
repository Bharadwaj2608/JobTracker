@echo off
echo.
echo ==========================================
echo        JobTrackr - Setup and Run
echo ==========================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org
  pause
  exit /b 1
)

echo [OK] Node.js detected
echo.

echo [1/2] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 ( echo [ERROR] Backend install failed & pause & exit /b 1 )
echo [OK] Backend ready

echo.
echo [2/2] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 ( echo [ERROR] Frontend install failed & pause & exit /b 1 )
echo [OK] Frontend ready

cd ..
echo.
echo ==========================================
echo   Setup Complete! How to run:
echo ==========================================
echo   Terminal 1:  cd backend ^&^& npm run dev
echo   Terminal 2:  cd frontend ^&^& npm start
echo ==========================================
echo   Frontend  -^>  http://localhost:3000
echo   Backend   -^>  http://localhost:5000
echo ==========================================
echo.
echo To change MongoDB URI, edit: backend\.env
echo.
pause
