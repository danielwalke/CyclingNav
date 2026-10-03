<#
.SYNOPSIS
  Direct deployment script for RadTour Deutschland with ngrok tunnel.
.DESCRIPTION
  Builds the application, launches the server on port 5173, starts ngrok, and outputs the public HTTPS link.
.EXAMPLE
  .\deploy_ngrok.ps1 -Port 5173
#>

param (
    [int]$Port = 5173
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚲 Starting RadTour Deutschland with ngrok Tunnel" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check ngrok
if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ngrok is not installed or not found in PATH." -ForegroundColor Red
    Write-Host "Please install ngrok: https://ngrok.com/download"
    exit 1
}

# 2. Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 3. Ensure node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

# 4. Build
Write-Host "🔨 Building production assets..." -ForegroundColor Yellow
npm run build

# 5. Start background preview server
Write-Host "🚀 Starting preview server on port $Port..." -ForegroundColor Green
$serverJob = Start-Process -FilePath "npx.cmd" -ArgumentList "vite", "preview", "--port", "$Port", "--host" -PassThru -NoNewWindow

# 6. Start ngrok
Write-Host "🌐 Starting ngrok tunnel on port $Port..." -ForegroundColor Green
$ngrokJob = Start-Process -FilePath "ngrok.exe" -ArgumentList "http", "$Port" -PassThru -NoNewWindow

Start-Sleep -Seconds 2

# 7. Query public URL from ngrok local API
$publicUrl = $null
for ($i = 0; $i -lt 10; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction SilentlyContinue
        if ($res.tunnels -and $res.tunnels.Count -gt 0) {
            $publicUrl = ($res.tunnels | Where-Object { $_.public_url -like 'https://*' } | Select-Object -First 1).public_url
            if ($publicUrl) { break }
        }
    } catch {
        # Retry
    }
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
if ($publicUrl) {
    Write-Host "🌍 Public HTTPS URL: $publicUrl" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host "📱 Open this link on your smartphone or bike computer!" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Could not automatically query ngrok URL." -ForegroundColor Yellow
    Write-Host "👉 Check ngrok web dashboard at: http://127.0.0.1:4040" -ForegroundColor Cyan
}
Write-Host "🏠 Local URL:        http://localhost:$Port" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Press Ctrl+C to terminate the deployment." -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "🛑 Terminating server and ngrok..." -ForegroundColor Yellow
    if ($serverJob -and -not $serverJob.HasExited) { Stop-Process -Id $serverJob.Id -Force -ErrorAction SilentlyContinue }
    if ($ngrokJob -and -not $ngrokJob.HasExited) { Stop-Process -Id $ngrokJob.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "✅ Done." -ForegroundColor Green
}
