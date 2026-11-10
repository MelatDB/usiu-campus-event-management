@echo off
setlocal enabledelayedexpansion
title Campus Events - Restore Database
cd /d "%~dp0"

echo.
echo ============================================================
echo   Campus Event Management System - Restore Database
echo ============================================================
echo.

call :refreshpath

where mysql >nul 2>nul
if errorlevel 1 (
    echo [ERROR] MySQL client not found. Install MySQL 8+ first, or run setup.bat.
    echo.
    pause
    exit /b 1
)

set "DB_USERNAME=%DB_USERNAME%"
if "%DB_USERNAME%"=="" set "DB_USERNAME=root"

set "MYSQL_CMD=mysql --host=127.0.0.1 -u %DB_USERNAME%"
if not "%DB_PASSWORD%"=="" set "MYSQL_CMD=mysql --host=127.0.0.1 -u %DB_USERNAME% -p%DB_PASSWORD%"

if not exist "db_backup" (
    echo [ERROR] No db_backup folder found in the project.
    echo         Copy the whole project folder from the source PC to this PC first.
    echo.
    pause
    exit /b 1
)

rem Find the newest dump file in db_backup
set "DUMP="
for /f "delims=" %%f in ('dir /b /o-d db_backup\usiu_events_full_*.sql 2^>nul') do (
    if not defined DUMP set "DUMP=db_backup\%%f"
)
if not defined DUMP (
    echo [ERROR] No usiu_events_full_*.sql dump found in db_backup.
    echo.
    pause
    exit /b 1
)
echo Found database backup: %DUMP%
echo.

echo Checking that MySQL is running...
netstat -ano | findstr /R ":3306 .*LISTENING" >nul 2>nul
if not errorlevel 1 (
    echo   MySQL is already running.
) else (
    for %%s in (MySQL9x MySQL90 MySQL8x MySQL80 MySQL MySql80) do (
        sc query "%%s" >nul 2>nul
        if not errorlevel 1 (
            net start "%%s" >nul 2>nul && echo   Started service "%%s".
        )
    )
)
echo.

echo Importing database (this may take a few seconds)...
%MYSQL_CMD% -e "DROP DATABASE IF EXISTS usiu_events;" >nul 2>nul
%MYSQL_CMD% --default-character-set=utf8mb4 < "%DUMP%"
if errorlevel 1 (
    echo.
    echo [ERROR] Import failed. Check the MySQL root password:
    echo         set DB_PASSWORD=yourpassword   then re-run restore-db.bat
    echo.
    pause
    exit /b 1
)
echo   Import finished.

echo.
echo Verifying tables...
%MYSQL_CMD% -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='usiu_events';"
if errorlevel 1 (
    echo   [ERROR] Could not verify the database.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   DATABASE RESTORED SUCCESSFULLY
echo   Next step: run  launch.bat  to start the application.
echo ============================================================
echo.
pause
exit /b 0

:refreshpath
set "PATH=%PATH%;%ProgramFiles%\nodejs;C:\tools\mysql\current\bin;C:\xampp\mysql\bin"
for /d %%i in ("%ProgramFiles%\MySQL\MySQL Server*") do set "PATH=%%i\bin;%PATH%"
exit /b 0
