@echo off
title Iniciar AgroTrack Nominas
color 0A

echo ========================================================
echo             INICIANDO AGROTRACK NOMINAS
echo ========================================================
echo.

echo [1/2] Iniciando Servidor Backend (.NET) en una nueva ventana...
start "AgroTrack Backend API" cmd /k "cd Backend\AgroTrack.Presentation && echo Ejecutando API de AgroTrack... && dotnet run"

echo.
echo [2/2] Iniciando Aplicacion Frontend (React) en una nueva ventana...
start "AgroTrack Frontend" cmd /k "cd Frontend && echo Iniciando React y servidor Vite... && npm run dev"

echo.
echo ========================================================
echo ¡Todo listo! 
echo Se han abierto dos nuevas ventanas (una para la base 
echo de datos/API y otra para la pagina web).
echo Puedes minimizar esta ventana o cerrarla.
echo ========================================================
echo.
pause
