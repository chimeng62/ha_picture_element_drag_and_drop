@echo off
title Home Assistant Picture Elements Editor
color 0A

echo ========================================
echo  Home Assistant Picture Elements Editor
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Check if dist folder exists
if not exist "dist" (
    echo Building the app for the first time...
    echo This may take a minute...
    echo.
    call npm run build
    if errorlevel 1 (
        echo ERROR: Build failed. Please check for errors above.
        pause
        exit /b 1
    )
)

echo Starting web server...
echo.
echo ✓ App will open at: http://localhost:3000
echo ✓ Keep this window open while using the app
echo ✓ To stop: Close this window or press Ctrl+C
echo.

:: Start browser after a short delay
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

:: Start the server
npx serve dist -p 3000 -s

echo.
echo App stopped.
pause
