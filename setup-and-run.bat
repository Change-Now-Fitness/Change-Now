@echo off
setlocal

echo =====================================
echo ChangeNow Setup and Frontend Launcher
echo =====================================

REM Ensure script runs from project root
cd /d %~dp0

echo.
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend npm install failed.
    exit /b 1
)

echo.
echo Checking backend .env configuration...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo Created backend\.env from backend\.env.example
    ) else (
        echo No backend .env.example found. Skipping .env creation.
    )
) else (
    echo backend\.env already exists.
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Frontend npm install failed.
    exit /b 1
)

echo.
echo Starting backend in a new terminal...
start "ChangeNow Backend" cmd /k "cd /d %~dp0backend && npm start"

echo.
echo Starting Expo frontend...
call npx expo start -c
if errorlevel 1 (
    echo ERROR: Failed to start Expo frontend.
    exit /b 1
)

endlocal