@echo off
title Sistema INC Novos Negocios
cd /d "%~dp0"

echo =======================================
echo   INC Empreendimentos — Novos Negocios
echo =======================================
echo.

:: Verifica se node_modules existe; instala se necessario
if not exist "node_modules\" (
  echo Instalando dependencias (primeira execucao)...
  call npm install
  if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias.
    pause
    exit /b 1
  )
  echo.
)

echo Iniciando servidor...
echo.

:: Abre o navegador apos 8 segundos (tempo para o servidor subir)
start /b cmd /c "timeout /t 8 >nul && start http://localhost:3000"

:: Inicia o servidor (mantém a janela aberta)
npm run dev

pause
