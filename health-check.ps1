#!/usr/bin/env pwsh
# Quick health check script - Run this anytime to verify servers are working

Write-Host "🏥 Estospaces Health Check" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check backend
Write-Host "Checking backend (port 3002)..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:3002/api/health" -Method GET -TimeoutSec 5 -UseBasicParsing
    $status = $backend.Content | ConvertFrom-Json
    
    Write-Host "✅ Backend: HEALTHY" -ForegroundColor Green
    Write-Host "   Uptime: $([math]::Round($status.uptime, 2))s" -ForegroundColor Gray
    Write-Host "   Supabase: $($status.supabase)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend: NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Make sure to run: npm run dev:all" -ForegroundColor Yellow
}

Write-Host ""

# Check frontend
Write-Host "Checking frontend (port 5173/5174)..." -ForegroundColor Yellow
$frontendRunning = $false

foreach ($port in @(5173, 5174)) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "✅ Frontend: RUNNING on port $port" -ForegroundColor Green
        Write-Host "   URL: http://localhost:$port" -ForegroundColor Gray
        $frontendRunning = $true
        break
    }
}

if (-not $frontendRunning) {
    Write-Host "❌ Frontend: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Make sure to run: npm run dev:all" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

if ($backend -and $frontendRunning) {
    Write-Host "🎉 All systems operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your app at: http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some services are not running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To start the servers, run:" -ForegroundColor Cyan
    Write-Host "   npm run dev:all" -ForegroundColor White
    Write-Host ""
    Write-Host "Or for production mode with monitoring:" -ForegroundColor Cyan
    Write-Host "   .\start-production.ps1" -ForegroundColor White
}

Write-Host ""
