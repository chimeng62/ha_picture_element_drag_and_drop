# Home Assistant Picture Elements Editor - Portable Version

## 🚀 Quick Start (Double-Click to Launch)

### Windows Users:
1. **Double-click `launch-app.bat`** - This will:
   - Start the local web server
   - Automatically open your browser to the app
   - Show a console window with status

### Alternative (PowerShell):
1. **Right-click `launch-app.ps1`** → "Run with PowerShell"

## 📋 First Time Setup

Before using the launcher for the first time, you need to build the app:

1. Open a terminal/command prompt in this folder
2. Run: `npm install` (installs dependencies)
3. Run: `npm run build` (builds the app)
4. Now you can use the launchers!

## 🔧 How It Works

- The launcher starts a local web server on port 3000
- Opens http://localhost:3000 in your default browser
- The app runs completely locally - no internet required
- All your data is saved in your browser's local storage

## 🛑 Stopping the App

- Close the console/terminal window that opened
- OR press Ctrl+C in the console window

## 📁 What's in This Folder

- `launch-app.bat` - Windows batch launcher (double-click this!)
- `launch-app.ps1` - PowerShell launcher (alternative)
- `dist/` - Built web app files (created after running `npm run build`)
- `src/` - Source code
- `package.json` - Project configuration

## 🔄 Updating the App

If you make changes to the source code:
1. Run `npm run build` to rebuild
2. Use the launcher as normal

## 🆘 Troubleshooting

**"npx command not found":**
- Install Node.js from https://nodejs.org

**Port 3000 already in use:**
- Close other apps using port 3000
- Or edit the launcher files to use a different port

**Browser doesn't open automatically:**
- Manually go to http://localhost:3000

## 🎯 Creating a Portable Package

To share this app with others:
1. Copy this entire folder
2. Include the `dist/` folder (after building)
3. They only need Node.js installed to run it
