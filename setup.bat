@echo off
setlocal enabledelayedexpansion
title Campus Events - Setup
cd /d "%~dp0"

echo.
echo ============================================================
echo   Campus Event Management System - One-Time Setup
echo ============================================================
echo.

call :refreshpath

where winget >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Windows Package Manager ^(winget^) is not available on this PC.
    echo         Please install it from the Microsoft Store, then run setup.bat again.
    echo.
    pause
    exit /b 1
)

echo [1/5] Checking Java 21...
where java >nul 2>nul
if errorlevel 1 (
    echo   Java not found - installing JDK 21 ^(Temurin^)...
    winget install --id EclipseAdoptium.Temurin.21.JDK -e --accept-source-agreements --accept-package-agreements
) else (
    java -version 2>&1 | findstr /R "2[1-9]\." >nul
    if errorlevel 1 (
        echo   Java found but not version 21 - installing JDK 21 ^(Temurin^)...
        winget install --id EclipseAdoptium.Temurin.21.JDK -e --accept-source-agreements --accept-package-agreements
    ) else (
        echo   OK - Java 21 detected
    )
)
echo.

echo [2/5] Checking Maven...
where mvn >nul 2>nul
if errorlevel 1 (
    echo   Maven not found - installing...
    winget install --id Apache.Maven -e --accept-source-agreements --accept-package-agreements
) else (
    echo   OK - Maven detected
)
echo.

echo [3/5] Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo   Node.js not found - installing LTS version...
    winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
) else (
    echo   OK - Node.js detected
)
echo.

echo [4/5] Checking MySQL...
where mysql >nul 2>nul
if errorlevel 1 (
    echo   MySQL not found - installing MySQL Server...
    echo   NOTE: The MySQL installer opens a graphical wizard.
    echo         Choose MySQL Server 8+, keep port 3306, set the root password,
    echo         and check "Start MySQL Server at System Startup".
    winget install --id Oracle.MySQL -e --accept-source-agreements --accept-package-agreements
    echo   ^(If the wizard appeared, finish it manually, then run setup.bat again.^)
) else (
    echo   OK - MySQL detected
)
echo.

call :refreshpath

echo [5/5] Verifying tools...
set "MISSING="
where java >nul 2>nul || set "MISSING=!MISSING! Java"
where mvn >nul 2>nul || set "MISSING=!MISSING! Maven"
where node >nul 2>nul || set "MISSING=!MISSING! Node.js"
where npm >nul 2>nul || set "MISSING=!MISSING! npm"
if not "!MISSING!"=="" (
    echo   Still missing:!MISSING!
    echo   Close this window, open a NEW command prompt, and re-run setup.bat
    echo   ^(installed tools may only appear in new terminals^).
    echo.
    pause
    exit /b 1
)
echo   All tools present.
echo.

if not exist "frontend-react\node_modules" (
    echo Installing frontend packages ^(first time, may take a few minutes^)...
    pushd "frontend-react"
    call npm install
    if errorlevel 1 (
        echo   [ERROR] npm install failed.
        popd
        pause
        exit /b 1
    )
    popd
) else (
    echo Frontend packages already installed.
)
echo.

echo Building backend and downloading dependencies ^(first time, may take a few minutes^)...
call mvn -q compile -DskipTests
if errorlevel 1 (
    echo   [ERROR] Maven build failed.
    pause
    exit /b 1
)
echo.

echo ============================================================
echo   SETUP COMPLETE
echo   Next step: run  launch.bat  to start the application.
echo ============================================================
echo.
pause
exit /b 0

:refreshpath
set "PATH=%PATH%;%ProgramFiles%\nodejs;C:\tools\mysql\current\bin"
for /d %%i in ("%ProgramFiles%\Eclipse Adoptium\jdk-21*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%ProgramFiles%\apache-maven*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%ProgramFiles%\Apache\maven*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%ProgramFiles%\MySQL\MySQL Server*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\Apache.Maven_*\apache-maven*") do set "PATH=%%i\bin;%PATH%"
for /d %%i in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\EclipseAdoptium.Temurin.21.JDK_*\jdk-21*") do set "PATH=%%i\bin;%PATH%"
exit /b 0
