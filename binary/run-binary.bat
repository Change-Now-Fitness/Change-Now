@echo off
setlocal

echo Starting backend and frontend from binary folder...

REM Start backend in a new terminal window
start "ChangeNow Backend" cmd /k "cd /d %~dp0backend && npm install && npm start"

REM Start frontend static server in a new terminal window
start "ChangeNow Frontend" cmd /k "cd /d %~dp0frontend-dist && npx serve ."

echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Two terminals were opened.