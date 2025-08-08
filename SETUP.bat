@echo off
title HA Picture Elements - Setup
color 0B

echo ==========================================
echo  HA Picture Elements Editor - First Setup
echo ==========================================
echo.

echo This will prepare your portable web app...
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is required but not found.
    echo.
    echo Please:
    echo 1. Download Node.js from: https://nodejs.org
    echo 2. Install it
    echo 3. Run this setup again
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js found

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies already installed
)

:: Build the app
echo Building the app for local use...
call npm run build:local
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo ✓ App built successfully
echo.
echo ===========================================
echo  Setup Complete! 
echo ===========================================
echo.
echo You can now use:
echo   • Double-click "launch-app.bat" to start the app
echo   • The app will open at http://localhost:3000
echo.
echo Enjoy your HA Picture Elements Editor!
echo.
pause
