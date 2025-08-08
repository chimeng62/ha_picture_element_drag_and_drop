Write-Host "Starting Home Assistant Picture Elements Editor..." -ForegroundColor Green
Write-Host ""
Write-Host "Opening your web browser to http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop the app, close this window or press Ctrl+C" -ForegroundColor Cyan
Write-Host ""

# Start the web server and open browser
Start-Process "http://localhost:3000"
npx serve dist -p 3000 -s

Read-Host "Press Enter to exit"
