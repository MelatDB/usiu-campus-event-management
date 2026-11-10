@echo off
setlocal enabledelayedexpansion
title Campus Events - Launcher
cd /d "%~dp0"

echo.
echo ============================================================
echo   Campus Event Management System - Launcher
echo ============================================================
echo.

call :refreshpath

set "MISSING="
where java >nul 2>nul || set "MISSING=!MISSING! Java"
where mvn >nul 2>nul || set "MISSING=!MISSING! Maven"
where node >nul 2>nul || set "MISSING=!MISSING! Node.js"
where mysql >nul 2>nul || set "MISSING=!MISSING! MySQL"
if not "!MISSING!"=="" (
    echo [ERROR] Missing tools:!MISSING!
    echo         Run setup.bat first to install everything.
    echo.
    pause
    exit /b 1
)
echo Tools OK.

set "DB_USERNAME=%DB_USERNAME%"
if "%DB_USERNAME%"=="" set "DB_USERNAME=root"
set "DB_PASSWORD=%DB_PASSWORD%"
if not "%DB_PASSWORD%"=="" (
    echo Using MySQL user %DB_USERNAME% with password from DB_PASSWORD.
) else (
    echo Using MySQL user %DB_USERNAME% with EMPTY password.
    echo   If your MySQL has a root password, set DB_PASSWORD first, e.g.:
    echo   set DB_PASSWORD=yourpassword
)
echo.

if not exist "frontend-react\node_modules" (
    echo Installing frontend packages ^(first run^)...
    pushd "frontend-react"
    call npm install
    if errorlevel 1 (
        echo   [ERROR] npm install failed.
        popd
        pause
        exit /b 1
    )
    popd
)

netstat -ano | findstr /R ":3306 .*LISTENING" >nul 2>nul
if not errorlevel 1 (
    echo MySQL is already running.
) else (
    echo Starting MySQL service...
    for %%s in (MySQL9x MySQL90 MySQL8x MySQL80 MySQL MySql80) do (
        sc query "%%s" >nul 2>nul
        if not errorlevel 1 (
            net start "%%s" >nul 2>nul
            if errorlevel 1 (
                echo   [WARN] Could not start service "%%s".
            ) else (
                echo   MySQL service "%%s" started.
            )
        )
    )
)
echo.

echo Creating database if needed...
set "MYSQL_CMD=mysql -u %DB_USERNAME%"
if not "%DB_PASSWORD%"=="" set "MYSQL_CMD=mysql -u %DB_USERNAME% -p%DB_PASSWORD%"
%MYSQL_CMD% -e "CREATE DATABASE IF NOT EXISTS usiu_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>nul
if errorlevel 1 (
    echo   [WARN] Could not create database. Check your MySQL root password.
    echo          Set the DB_PASSWORD variable above and re-run launch.bat.
) else (
    echo   Database "usiu_events" ready.
)
echo.

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo Starting backend on port 8080...
start "Campus Events - Backend" cmd /k "cd /d "%PROJECT_DIR%" && mvn spring-boot:run"
echo Starting frontend on port 3000...
start "Campus Events - Frontend" cmd /k "cd /d "%PROJECT_DIR%\frontend-react" && npm start"
echo.

echo Waiting for backend to be ready...
set /a attempts=0
:wait8080
netstat -ano | findstr /R ":8080 .*LISTENING" >nul 2>nul
if not errorlevel 1 goto :8080up
set /a attempts+=1
if !attempts! gtr 90 (
    echo   [WARN] Backend did not respond within 90s. Check the backend window.
    goto :afterwait
)
timeout /t 1 /nobreak >nul
goto :wait8080

:8080up
echo   Backend is up.
:afterwait
echo.
echo Opening browser...
start "" "http://localhost:3000"
echo.
echo The application should now be available at:  http://localhost:3000
echo Keep the two new windows open - closing them stops the app.
echo.
pause
exit /b 0

:refreshpath
set "PATH=%PATH%;%ProgramFiles%\nodejs;C:\tools\mysql\current\bin;C:\xampp\mysql\bin"
for /d %%i in ("%ProgramFiles%\Eclipse Adoptium\jdk-21*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%ProgramFiles%\apache-maven*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%ProgramFiles%\Apache\maven*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%ProgramFiles%\MySQL\MySQL Server*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\Apache.Maven_*\apache-maven*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\EclipseAdoptium.Temurin.21.JDK_*\jdk-21*") do set "PATH=%%i\bin;%PATH%"
exit /b 0
