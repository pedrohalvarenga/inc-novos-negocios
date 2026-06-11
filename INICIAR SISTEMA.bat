@echo off
title Sistema INC Novos Negocios
cd /d "%~dp0"
echo Iniciando Sistema INC Novos Negocios...
echo.
start "" "http://localhost:3000"
timeout /t 3 >nul
npm run dev
pause
