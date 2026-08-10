@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion

:: ============================================================
::  AGROTRACK NOMINAS - Sistema de Arranque y Monitor de Testing
::  Versión: 2.0
::  Descripción: Inicia Backend + Frontend con monitorización
::               en tiempo real y registro de logs para depuración.
:: ============================================================

:: Configuración de rutas (relativas al directorio del .bat)
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%Backend\AgroTrack.Presentation"
set "FRONTEND_DIR=%ROOT_DIR%Frontend"
set "LOGS_DIR=%ROOT_DIR%logs"
set "TIMESTAMP=%date:~6,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"

:: Nombres de archivos de log
set "LOG_BACKEND=%LOGS_DIR%\backend_%TIMESTAMP%.log"
set "LOG_FRONTEND=%LOGS_DIR%\frontend_%TIMESTAMP%.log"
set "LOG_CHECKS=%LOGS_DIR%\checks_%TIMESTAMP%.log"
set "LOG_COMBINED=%LOGS_DIR%\combined_%TIMESTAMP%.log"

:: ============================================================
::  FASE 0: Preparar carpeta de Logs
:: ============================================================
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"

:: Limpiar logs viejos (mantener solo los últimos 10)
for /f "skip=30 delims=" %%F in ('dir /b /o-d "%LOGS_DIR%\*.log" 2^>nul') do del "%LOGS_DIR%\%%F" 2>nul

title [AGROTRACK] Panel de Control Principal
color 0B

cls
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║     █████╗  ██████╗ ██████╗  ██████╗ ████████╗██████╗        ║
echo  ║    ██╔══██╗██╔════╝ ██╔══██╗██╔═══██╗╚══██╔══╝██╔══██╗       ║
echo  ║    ███████║██║  ███╗██████╔╝██║   ██║   ██║   ██████╔╝       ║
echo  ║    ██╔══██║██║   ██║██╔══██╗██║   ██║   ██║   ██╔══██╗       ║
echo  ║    ██║  ██║╚██████╔╝██║  ██║╚██████╔╝   ██║   ██║  ██║       ║
echo  ║    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝       ║
echo  ║                                                              ║
echo  ║          SISTEMA DE ARRANQUE Y MONITOR DE TESTING            ║
echo  ║                     v2.0 - Nominas                           ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  [INFO] Fecha de inicio: %date% %time%
echo  [INFO] Logs guardados en: %LOGS_DIR%\
echo.

:: Guardar inicio en log combinado
echo ============================================================ > "%LOG_COMBINED%"
echo  AGROTRACK - Registro de Ejecucion >> "%LOG_COMBINED%"
echo  Fecha: %date% %time% >> "%LOG_COMBINED%"
echo ============================================================ >> "%LOG_COMBINED%"
echo. >> "%LOG_COMBINED%"

:: ============================================================
::  FASE 1: Verificación de Prerrequisitos
:: ============================================================
echo  ┌──────────────────────────────────────────────────────────┐
echo  │  FASE 1: Verificación de Prerrequisitos                  │
echo  └──────────────────────────────────────────────────────────┘
echo.

echo [FASE 1] Verificacion de Prerrequisitos > "%LOG_CHECKS%"
echo ──────────────────────────────────────── >> "%LOG_CHECKS%"

set "CHECKS_OK=1"

:: --- Check Node.js ---
echo  [VERIFICANDO] Node.js ...
node -v > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  [  ERROR  ] Node.js NO esta instalado o no esta en el PATH.
    echo  [  ERROR  ] Descargalo de: https://nodejs.org/
    echo [ERROR] Node.js no encontrado >> "%LOG_CHECKS%"
    set "CHECKS_OK=0"
) else (
    for /f "tokens=*" %%v in ('node -v 2^>^&1') do set "NODE_VER=%%v"
    echo  [    OK   ] Node.js !NODE_VER!
    echo [OK] Node.js !NODE_VER! >> "%LOG_CHECKS%"
)

:: --- Check npm ---
echo  [VERIFICANDO] npm ...
npm -v > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  [  ERROR  ] npm NO esta instalado.
    echo [ERROR] npm no encontrado >> "%LOG_CHECKS%"
    set "CHECKS_OK=0"
) else (
    for /f "tokens=*" %%v in ('npm -v 2^>^&1') do set "NPM_VER=%%v"
    echo  [    OK   ] npm v!NPM_VER!
    echo [OK] npm v!NPM_VER! >> "%LOG_CHECKS%"
)

:: --- Check .NET SDK ---
echo  [VERIFICANDO] .NET SDK ...
dotnet --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  [  ERROR  ] .NET SDK NO esta instalado o no esta en el PATH.
    echo  [  ERROR  ] Descargalo de: https://dotnet.microsoft.com/download
    echo [ERROR] .NET SDK no encontrado >> "%LOG_CHECKS%"
    set "CHECKS_OK=0"
) else (
    for /f "tokens=*" %%v in ('dotnet --version 2^>^&1') do set "DOTNET_VER=%%v"
    echo  [    OK   ] .NET SDK v!DOTNET_VER!
    echo [OK] .NET SDK v!DOTNET_VER! >> "%LOG_CHECKS%"
)

:: --- Check directorios del proyecto ---
echo  [VERIFICANDO] Estructura del proyecto ...
if not exist "%BACKEND_DIR%" (
    color 0C
    echo  [  ERROR  ] Directorio Backend no encontrado: %BACKEND_DIR%
    echo [ERROR] Backend dir no encontrado >> "%LOG_CHECKS%"
    set "CHECKS_OK=0"
) else (
    echo  [    OK   ] Backend: AgroTrack.Presentation encontrado
    echo [OK] Backend directorio encontrado >> "%LOG_CHECKS%"
)

if not exist "%FRONTEND_DIR%" (
    color 0C
    echo  [  ERROR  ] Directorio Frontend no encontrado: %FRONTEND_DIR%
    echo [ERROR] Frontend dir no encontrado >> "%LOG_CHECKS%"
    set "CHECKS_OK=0"
) else (
    echo  [    OK   ] Frontend: React/Vite encontrado
    echo [OK] Frontend directorio encontrado >> "%LOG_CHECKS%"
)

:: --- Check node_modules ---
echo  [VERIFICANDO] Dependencias del Frontend (node_modules) ...
if not exist "%FRONTEND_DIR%\node_modules" (
    color 0E
    echo  [ AVISO  ] node_modules no encontrado. Instalando dependencias...
    echo [AVISO] Instalando node_modules... >> "%LOG_CHECKS%"
    echo. >> "%LOG_CHECKS%"
    cd /d "%FRONTEND_DIR%"
    npm install >> "%LOG_CHECKS%" 2>&1
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo  [  ERROR  ] Fallo al instalar dependencias npm.
        echo [ERROR] npm install fallo >> "%LOG_CHECKS%"
        set "CHECKS_OK=0"
    ) else (
        echo  [    OK   ] Dependencias instaladas correctamente
        echo [OK] npm install completado >> "%LOG_CHECKS%"
    )
    cd /d "%ROOT_DIR%"
) else (
    echo  [    OK   ] node_modules existe
    echo [OK] node_modules presente >> "%LOG_CHECKS%"
)

echo.
echo [RESULTADO] Checks OK = !CHECKS_OK! >> "%LOG_CHECKS%"
echo. >> "%LOG_CHECKS%"

:: --- Abortar si hay errores críticos ---
if "!CHECKS_OK!"=="0" (
    echo.
    echo  ╔══════════════════════════════════════════════════════════╗
    echo  ║  ERROR: Faltan prerrequisitos. Revisa los errores        ║
    echo  ║  de arriba antes de continuar.                           ║
    echo  ║                                                          ║
    echo  ║  Log guardado en: %LOG_CHECKS%                           ║
    echo  ╚══════════════════════════════════════════════════════════╝
    echo.
    echo  [ACCION] Copia TODO el texto de esta ventana y pasaselo
    echo           a tu asistente de IA para resolver los errores.
    echo.
    pause
    exit /b 1
)

echo  ┌──────────────────────────────────────────────────────────┐
echo  │  ✓ Todos los prerrequisitos verificados correctamente    │
echo  └──────────────────────────────────────────────────────────┘
echo.

:: ============================================================
::  FASE 2: Iniciar Backend (.NET)
:: ============================================================
echo  ┌──────────────────────────────────────────────────────────┐
echo  │  FASE 2: Iniciando Backend (.NET API)                    │
echo  └──────────────────────────────────────────────────────────┘
echo.
echo  [INFO] Iniciando servidor Backend con logs detallados...
echo  [INFO] Log: %LOG_BACKEND%
echo.

:: Crear script temporal PowerShell para el Backend (con logging y colores)
set "PS_BACKEND=%LOGS_DIR%\_run_backend.ps1"
(
echo $Host.UI.RawUI.WindowTitle = '[AGROTRACK] Backend .NET API'
echo $logFile = '%LOG_BACKEND%'
echo $combinedLog = '%LOG_COMBINED%'
echo ''
echo Write-Host ''
echo Write-Host '  ══════════════════════════════════════════════════' -ForegroundColor Cyan
echo Write-Host '    AGROTRACK - Backend .NET API Server' -ForegroundColor Cyan
echo Write-Host '    Log: ' -NoNewline -ForegroundColor Gray
echo Write-Host $logFile -ForegroundColor DarkGray
echo Write-Host '  ══════════════════════════════════════════════════' -ForegroundColor Cyan
echo Write-Host ''
echo ''
echo $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
echo "$timestamp [BACKEND] Iniciando servidor..." ^| Tee-Object -FilePath $logFile -Append
echo "$timestamp [BACKEND] Iniciando servidor..." ^| Out-File -FilePath $combinedLog -Append
echo ''
echo Set-Location '%BACKEND_DIR%'
echo ''
echo try {
echo     $process = Start-Process -FilePath 'dotnet' -ArgumentList 'run', '--verbosity', 'detailed' -NoNewWindow -PassThru -RedirectStandardOutput '%LOGS_DIR%\_backend_stdout.tmp' -RedirectStandardError '%LOGS_DIR%\_backend_stderr.tmp'
echo     $processId = $process.Id
echo     $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
echo     Write-Host "  [OK] Proceso dotnet iniciado (PID: $processId^)" -ForegroundColor Green
echo     "$timestamp [BACKEND] Proceso iniciado PID=$processId" ^| Tee-Object -FilePath $logFile -Append
echo     "$timestamp [BACKEND] Proceso iniciado PID=$processId" ^| Out-File -FilePath $combinedLog -Append
echo     Write-Host ''
echo     Write-Host '  Monitoreando salida del servidor...' -ForegroundColor Yellow
echo     Write-Host '  (Presiona Ctrl+C para detener^)' -ForegroundColor DarkGray
echo     Write-Host '' 
echo     ''
echo     while (-not $process.HasExited^) {
echo         if (Test-Path '%LOGS_DIR%\_backend_stdout.tmp'^) {
echo             $content = Get-Content '%LOGS_DIR%\_backend_stdout.tmp' -ErrorAction SilentlyContinue
echo             if ($content^) {
echo                 foreach ($line in $content^) {
echo                     $timestamp = Get-Date -Format 'HH:mm:ss'
echo                     $logLine = "$timestamp [BACKEND] $line"
echo                     if ($line -match 'error' -or $line -match 'fail' -or $line -match 'exception'^) {
echo                         Write-Host "  [ERROR] $line" -ForegroundColor Red
echo                     } elseif ($line -match 'warn'^) {
echo                         Write-Host "  [WARN]  $line" -ForegroundColor Yellow
echo                     } elseif ($line -match 'Now listening' -or $line -match 'started'^) {
echo                         Write-Host "  [OK]    $line" -ForegroundColor Green
echo                     } else {
echo                         Write-Host "  [LOG]   $line" -ForegroundColor Gray
echo                     }
echo                     $logLine ^| Out-File -FilePath $logFile -Append
echo                     $logLine ^| Out-File -FilePath $combinedLog -Append
echo                 }
echo                 Clear-Content '%LOGS_DIR%\_backend_stdout.tmp' -ErrorAction SilentlyContinue
echo             }
echo         }
echo         if (Test-Path '%LOGS_DIR%\_backend_stderr.tmp'^) {
echo             $errContent = Get-Content '%LOGS_DIR%\_backend_stderr.tmp' -ErrorAction SilentlyContinue
echo             if ($errContent^) {
echo                 foreach ($line in $errContent^) {
echo                     $timestamp = Get-Date -Format 'HH:mm:ss'
echo                     Write-Host "  [STDERR] $line" -ForegroundColor Red
echo                     "$timestamp [BACKEND-ERR] $line" ^| Out-File -FilePath $logFile -Append
echo                     "$timestamp [BACKEND-ERR] $line" ^| Out-File -FilePath $combinedLog -Append
echo                 }
echo                 Clear-Content '%LOGS_DIR%\_backend_stderr.tmp' -ErrorAction SilentlyContinue
echo             }
echo         }
echo         Start-Sleep -Milliseconds 500
echo     }
echo     ''
echo     $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
echo     Write-Host '' 
echo     Write-Host "  [!!] El proceso Backend se detuvo (Exit code: $($process.ExitCode^)^)" -ForegroundColor Red
echo     "$timestamp [BACKEND] Proceso terminado. ExitCode=$($process.ExitCode^)" ^| Tee-Object -FilePath $logFile -Append
echo     "$timestamp [BACKEND] Proceso terminado. ExitCode=$($process.ExitCode^)" ^| Out-File -FilePath $combinedLog -Append
echo } catch {
echo     $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
echo     Write-Host "  [ERROR FATAL] $($_.Exception.Message^)" -ForegroundColor Red
echo     "$timestamp [BACKEND-FATAL] $($_.Exception.Message^)" ^| Tee-Object -FilePath $logFile -Append
echo     "$timestamp [BACKEND-FATAL] $($_.Exception.Message^)" ^| Out-File -FilePath $combinedLog -Append
echo }
echo ''
echo Write-Host ''
echo Write-Host '  ════════════════════════════════════════════════' -ForegroundColor Red
echo Write-Host '  El Backend se ha detenido. Revisa los logs.' -ForegroundColor Red
echo Write-Host '  ════════════════════════════════════════════════' -ForegroundColor Red
echo Write-Host ''
echo Write-Host '  [TIP] Copia el contenido de esta ventana y pasaselo' -ForegroundColor Yellow
echo Write-Host '        a tu asistente de IA para depurar.' -ForegroundColor Yellow
echo Write-Host ''
echo Read-Host '  Presiona Enter para cerrar'
) > "%PS_BACKEND%"

start "AGROTRACK Backend" powershell -ExecutionPolicy Bypass -NoProfile -File "%PS_BACKEND%"

echo  [OK] Ventana del Backend abierta
echo.

:: Pausa breve para que Backend inicie primero
echo  [INFO] Esperando 3 segundos para que el Backend inicie...
timeout /t 3 /nobreak > nul

:: ============================================================
::  FASE 3: Iniciar Frontend (React/Vite)
:: ============================================================
echo  ┌──────────────────────────────────────────────────────────┐
echo  │  FASE 3: Iniciando Frontend (React + Vite)               │
echo  └──────────────────────────────────────────────────────────┘
echo.
echo  [INFO] Iniciando servidor de desarrollo Vite...
echo  [INFO] Log: %LOG_FRONTEND%
echo.

:: Crear script temporal PowerShell para el Frontend
set "PS_FRONTEND=%LOGS_DIR%\_run_frontend.ps1"
(
echo $Host.UI.RawUI.WindowTitle = '[AGROTRACK] Frontend React/Vite'
echo $logFile = '%LOG_FRONTEND%'
echo $combinedLog = '%LOG_COMBINED%'
echo ''
echo Write-Host ''
echo Write-Host '  ══════════════════════════════════════════════════' -ForegroundColor Magenta
echo Write-Host '    AGROTRACK - Frontend React + Vite Dev Server' -ForegroundColor Magenta
echo Write-Host '    Log: ' -NoNewline -ForegroundColor Gray
echo Write-Host $logFile -ForegroundColor DarkGray
echo Write-Host '  ══════════════════════════════════════════════════' -ForegroundColor Magenta
echo Write-Host ''
echo ''
echo $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
echo "$timestamp [FRONTEND] Iniciando Vite dev server..." ^| Tee-Object -FilePath $logFile -Append
echo "$timestamp [FRONTEND] Iniciando Vite dev server..." ^| Out-File -FilePath $combinedLog -Append
echo ''
echo Set-Location '%FRONTEND_DIR%'
echo ''
echo try {
echo     $pinfo = New-Object System.Diagnostics.ProcessStartInfo
echo     $pinfo.FileName = 'cmd.exe'
echo     $pinfo.Arguments = '/c npm run dev 2^>^&1'
echo     $pinfo.RedirectStandardOutput = $true
echo     $pinfo.RedirectStandardError = $true
echo     $pinfo.UseShellExecute = $false
echo     $pinfo.CreateNoWindow = $true
echo     $pinfo.WorkingDirectory = '%FRONTEND_DIR%'
echo     ''
echo     $proc = New-Object System.Diagnostics.Process
echo     $proc.StartInfo = $pinfo
echo     $proc.Start^(^) ^| Out-Null
echo     ''
echo     Write-Host "  [OK] Proceso Vite iniciado (PID: $($proc.Id^)^)" -ForegroundColor Green
echo     $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
echo     "$timestamp [FRONTEND] Proceso iniciado PID=$($proc.Id^)" ^| Tee-Object -FilePath $logFile -Append
echo     "$timestamp [FRONTEND] Proceso iniciado PID=$($proc.Id^)" ^| Out-File -FilePath $combinedLog -Append
echo     Write-Host ''
echo     Write-Host '  Monitoreando salida de Vite...' -ForegroundColor Yellow
echo     Write-Host '  (Presiona Ctrl+C para detener^)' -ForegroundColor DarkGray
echo     Write-Host ''
echo     ''
echo     while (-not $proc.HasExited^) {
echo         $line = $proc.StandardOutput.ReadLine^(^)
echo         if ($null -ne $line^) {
echo             $timestamp = Get-Date -Format 'HH:mm:ss'
echo             $logLine = "$timestamp [FRONTEND] $line"
echo             if ($line -match 'error' -or $line -match 'ERROR' -or $line -match 'failed'^) {
echo                 Write-Host "  [ERROR] $line" -ForegroundColor Red
echo             } elseif ($line -match 'warn' -or $line -match 'WARN'^) {
echo                 Write-Host "  [WARN]  $line" -ForegroundColor Yellow
echo             } elseif ($line -match 'Local:' -or $line -match 'ready' -or $line -match 'localhost'^) {
echo                 Write-Host "  [OK]    $line" -ForegroundColor Green
echo             } elseif ($line -match 'hmr' -or $line -match 'update' -or $line -match 'reload'^) {
echo                 Write-Host "  [HMR]   $line" -ForegroundColor Cyan
echo             } else {
echo                 Write-Host "  [LOG]   $line" -ForegroundColor Gray
echo             }
echo             $logLine ^| Out-File -FilePath $logFile -Append
echo             $logLine ^| Out-File -FilePath $combinedLog -Append
echo         }
echo     }
echo     ''
echo     $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
echo     Write-Host ''
echo     Write-Host "  [!!] El proceso Frontend se detuvo (Exit code: $($proc.ExitCode^)^)" -ForegroundColor Red
echo     "$timestamp [FRONTEND] Proceso terminado. ExitCode=$($proc.ExitCode^)" ^| Tee-Object -FilePath $logFile -Append
echo     "$timestamp [FRONTEND] Proceso terminado. ExitCode=$($proc.ExitCode^)" ^| Out-File -FilePath $combinedLog -Append
echo } catch {
echo     $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
echo     Write-Host "  [ERROR FATAL] $($_.Exception.Message^)" -ForegroundColor Red
echo     "$timestamp [FRONTEND-FATAL] $($_.Exception.Message^)" ^| Tee-Object -FilePath $logFile -Append
echo     "$timestamp [FRONTEND-FATAL] $($_.Exception.Message^)" ^| Out-File -FilePath $combinedLog -Append
echo }
echo ''
echo Write-Host ''
echo Write-Host '  ════════════════════════════════════════════════' -ForegroundColor Red
echo Write-Host '  El Frontend se ha detenido. Revisa los logs.' -ForegroundColor Red
echo Write-Host '  ════════════════════════════════════════════════' -ForegroundColor Red
echo Write-Host ''
echo Write-Host '  [TIP] Copia el contenido de esta ventana y pasaselo' -ForegroundColor Yellow
echo Write-Host '        a tu asistente de IA para depurar.' -ForegroundColor Yellow
echo Write-Host ''
echo Read-Host '  Presiona Enter para cerrar'
) > "%PS_FRONTEND%"

start "AGROTRACK Frontend" powershell -ExecutionPolicy Bypass -NoProfile -File "%PS_FRONTEND%"

echo  [OK] Ventana del Frontend abierta
echo.

:: ============================================================
::  FASE 4: Panel de Control Principal
:: ============================================================
echo  ┌──────────────────────────────────────────────────────────┐
echo  │  FASE 4: Sistema Iniciado - Panel de Control             │
echo  └──────────────────────────────────────────────────────────┘
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║  AGROTRACK esta ejecutandose en 3 ventanas:              ║
echo  ║                                                          ║
echo  ║   1. [Backend]  - Servidor .NET API (esta ventana)       ║
echo  ║   2. [Frontend] - React / Vite Dev Server                ║
echo  ║   3. [ESTA]     - Panel de Control Principal             ║
echo  ║                                                          ║
echo  ║  URLS:                                                   ║
echo  ║   Frontend: http://localhost:5173                         ║
echo  ║   Backend:  https://localhost:5001 (o el puerto .NET)     ║
echo  ║   Swagger:  https://localhost:5001/swagger                ║
echo  ║                                                          ║
echo  ╠══════════════════════════════════════════════════════════╣
echo  ║                                                          ║
echo  ║  ARCHIVOS DE LOG:                                        ║
echo  ║   Backend:  %LOG_BACKEND%
echo  ║   Frontend: %LOG_FRONTEND%
echo  ║   Checks:   %LOG_CHECKS%
echo  ║   Combinado:%LOG_COMBINED%
echo  ║                                                          ║
echo  ╠══════════════════════════════════════════════════════════╣
echo  ║                                                          ║
echo  ║  COMO REPORTAR UN ERROR:                                 ║
echo  ║                                                          ║
echo  ║   1. Ve a la ventana donde aparecio el error             ║
echo  ║      (Backend o Frontend)                                ║
echo  ║   2. Click derecho en la ventana, selecciona todo        ║
echo  ║      (Ctrl+A), luego copia (Enter)                      ║
echo  ║   3. Pega el texto completo a tu asistente de IA         ║
echo  ║                                                          ║
echo  ║   O tambien puedes abrir el archivo de log combinado:    ║
echo  ║   > notepad "%LOG_COMBINED%"
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo.
echo  ┌──────────────────────────────────────────────────────────┐
echo  │  OPCIONES:                                               │
echo  │                                                          │
echo  │   [1] Abrir log combinado en Bloc de Notas               │
echo  │   [2] Abrir carpeta de logs                              │
echo  │   [3] Abrir la app en el navegador                       │
echo  │   [4] Detener todo y salir                               │
echo  │                                                          │
echo  └──────────────────────────────────────────────────────────┘
echo.

:MENU
set "OPCION="
set /p "OPCION=  Selecciona una opcion [1-4]: "

if "%OPCION%"=="1" (
    start notepad "%LOG_COMBINED%"
    goto MENU
)
if "%OPCION%"=="2" (
    start explorer "%LOGS_DIR%"
    goto MENU
)
if "%OPCION%"=="3" (
    start http://localhost:5173
    goto MENU
)
if "%OPCION%"=="4" (
    echo.
    echo  [INFO] Deteniendo procesos...
    
    :: Matar procesos de dotnet y node que estén corriendo
    taskkill /F /IM "dotnet.exe" /T >nul 2>&1
    taskkill /F /IM "node.exe" /T >nul 2>&1
    
    :: Limpiar scripts temporales
    del "%PS_BACKEND%" >nul 2>&1
    del "%PS_FRONTEND%" >nul 2>&1
    del "%LOGS_DIR%\_backend_stdout.tmp" >nul 2>&1
    del "%LOGS_DIR%\_backend_stderr.tmp" >nul 2>&1
    
    echo  [OK] Todos los procesos detenidos.
    echo  [OK] Los logs se conservan en: %LOGS_DIR%\
    echo.
    echo  Hasta luego!
    timeout /t 3 /nobreak > nul
    exit /b 0
)

echo  [!] Opcion invalida. Intenta de nuevo.
goto MENU
