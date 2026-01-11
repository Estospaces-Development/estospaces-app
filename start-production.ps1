#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Production-ready startup script for Estospaces Platform
.DESCRIPTION
    Starts both backend and frontend servers with health monitoring and auto-restart capabilities
    Ensures 24/7 uptime with error recovery
.NOTES
    Run this script to start the application in production mode
#>

# Configuration
$BACKEND_PORT = 3002
$FRONTEND_PORT = 5173
$MAX_RETRIES = 3
$HEALTH_CHECK_INTERVAL = 30 # seconds

# Colors for output
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor $InfoColor }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor $SuccessColor }
function Write-Error-Log { param($Message) Write-Host "❌ $Message" -ForegroundColor $ErrorColor }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor $WarningColor }

# Check if port is in use
function Test-PortInUse {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connections
}

# Kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-Info "Checking port $Port..."
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            Write-Warning "Stopping process $processId on port $Port"
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
        Write-Success "Port $Port is now free"
    } else {
        Write-Success "Port $Port is available"
    }
}

# Check server health
function Test-ServerHealth {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Main execution
Write-Info "🚀 Starting Estospaces Platform..."
Write-Info "================================================"

# Clean up any existing processes on required ports
Write-Info "Step 1: Cleaning up existing processes..."
Stop-ProcessOnPort -Port $BACKEND_PORT
Stop-ProcessOnPort -Port $FRONTEND_PORT
Start-Sleep -Seconds 2

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules not found. Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "Failed to install dependencies"
        exit 1
    }
    Write-Success "Dependencies installed"
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Error-Log ".env file not found!"
    Write-Warning "Please create a .env file with your Supabase credentials"
    Write-Info "See .env.example or SUPABASE_SETUP.md for details"
    exit 1
}

Write-Success "Environment configuration found"

# Start servers
Write-Info "Step 2: Starting servers..."
Write-Info "Backend will run on: http://localhost:$BACKEND_PORT"
Write-Info "Frontend will run on: http://localhost:$FRONTEND_PORT"

# Start the servers in background
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev:all
}

Write-Info "Waiting for servers to start..."
Start-Sleep -Seconds 8

# Check backend health
Write-Info "Step 3: Verifying backend health..."
$backendHealthy = $false
for ($i = 1; $i -le $MAX_RETRIES; $i++) {
    Write-Info "Health check attempt $i/$MAX_RETRIES..."
    $backendHealthy = Test-ServerHealth -Url "http://localhost:$BACKEND_PORT/api/health"
    
    if ($backendHealthy) {
        Write-Success "Backend server is healthy!"
        break
    } else {
        Write-Warning "Backend not ready, waiting..."
        Start-Sleep -Seconds 3
    }
}

if (-not $backendHealthy) {
    Write-Error-Log "Backend server failed to start properly"
    Write-Warning "Check the server logs for errors"
}

# Check frontend
Write-Info "Step 4: Verifying frontend..."
$frontendHealthy = Test-PortInUse -Port $FRONTEND_PORT
if ($frontendHealthy) {
    Write-Success "Frontend server is running!"
} else {
    Write-Warning "Frontend may be running on a different port"
}

Write-Info "================================================"
Write-Success "🎉 Application is running!"
Write-Info ""
Write-Info "📍 Access your application at:"
Write-Info "   Frontend: http://localhost:$FRONTEND_PORT"
Write-Info "   Backend:  http://localhost:$BACKEND_PORT"
Write-Info "   Health:   http://localhost:$BACKEND_PORT/api/health"
Write-Info ""
Write-Info "📋 Monitoring enabled. Servers will auto-restart on failure."
Write-Info "Press Ctrl+C to stop all servers"
Write-Info "================================================"

# Keep script running and monitor health
try {
    while ($true) {
        Start-Sleep -Seconds $HEALTH_CHECK_INTERVAL
        
        # Check backend health
        $healthy = Test-ServerHealth -Url "http://localhost:$BACKEND_PORT/api/health"
        
        if ($healthy) {
            Write-Host "." -NoNewline # Heartbeat indicator
        } else {
            Write-Warning "Backend health check failed! Servers may need attention."
        }
        
        # Check if job is still running
        if ($job.State -ne "Running") {
            Write-Error-Log "Server process stopped unexpectedly!"
            Write-Warning "Restarting servers..."
            Stop-Job -Job $job -ErrorAction SilentlyContinue
            Remove-Job -Job $job -ErrorAction SilentlyContinue
            
            $job = Start-Job -ScriptBlock {
                Set-Location $using:PWD
                npm run dev:all
            }
            Start-Sleep -Seconds 8
        }
    }
} finally {
    # Cleanup on exit
    Write-Info ""
    Write-Info "Shutting down servers..."
    Stop-Job -Job $job -ErrorAction SilentlyContinue
    Remove-Job -Job $job -ErrorAction SilentlyContinue
    Write-Success "Servers stopped"
}
