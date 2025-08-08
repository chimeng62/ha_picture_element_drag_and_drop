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

:: Check if dist folder exists or if it has GitHub Pages paths
if not exist "dist\index.html" (
    echo Building the app for the first time...
    echo This may take a minute...
    echo.
    call npm run build:local
    if errorlevel 1 (
        echo ERROR: Build failed. Please check for errors above.
        pause
        exit /b 1
    )
) else (
    :: Check if the current build has GitHub Pages paths
    findstr "/ha_picture_element_drag_and_drop/" dist\index.html >nul
    if not errorlevel 1 (
        echo Rebuilding for local use...
        echo.
        call npm run build:local
        if errorlevel 1 (
            echo ERROR: Build failed. Please check for errors above.
            pause
            exit /b 1
        )
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
