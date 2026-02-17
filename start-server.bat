@echo off
REM Multi-Server Setup Script for Quiz Interactive (Windows)
REM This script helps you run the app on a network-accessible server

echo.
echo ================================================
echo Quiz Interactive - Multi-Server Setup (Windows)
echo ================================================
echo.

REM Get server IP address
echo [*] Finding your server IP address...
for /f "tokens=2 delims=: " %%A in ('ipconfig ^| findstr /C:"IPv4 Address"') do (
    set "IP=%%A"
    goto :found_ip
)

:found_ip
echo [+] Server IP: %IP%
echo.
echo Access the app from other machines at:
echo     http://%IP%:5000
echo.

REM Check if port 5000 is in use
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo [!] Port 5000 is already in use.
    echo.
    netstat -ano | findstr :5000
    echo.
    set /p action="Kill this process? (y/n): "
    if /i "%action%"=="y" (
        for /f "tokens=5" %%A in ('netstat -ano ^| findstr :5000') do (
            taskkill /PID %%A /F >nul 2>&1
        )
        echo [+] Process killed
    ) else (
        echo [-] Please free port 5000 and try again
        exit /b 1
    )
) else (
    echo [+] Port 5000 is available
)

echo.
echo ================================================
echo Starting server...
echo ================================================
echo.

REM Run production build
npm run prod

pause
