param(
    [switch]$Down,
    [switch]$Build,
    [switch]$Logs
)

# Ensure UTF-8 output (avoid encoding issues)
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
$OutputEncoding = [System.Text.Encoding]::UTF8
try { chcp.com 65001 > $null } catch {}

# Get script directory and navigate to project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
Set-Location $ProjectRoot

# Use backend-only.yml so backend reads DATABASE_URL from backend/.env (Supabase)
$ComposeFile = "./docker/environments/development/backend-only.yml"
$ProjectName = "lms"

Write-Host "LMS Backend API Development Environment" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Initialize volumes and networks if needed
Write-Host "Checking Docker volumes and networks..." -ForegroundColor Cyan
& "$ScriptDir\init-volumes.ps1" -Force | Out-Null
Write-Host ""

if ($Down) {
    Write-Host "Stopping services..." -ForegroundColor Red
    docker-compose -p $ProjectName -f $ComposeFile down
    return
}

if ($Logs) {
    docker-compose -p $ProjectName -f $ComposeFile logs -f
    return
}

$BuildFlag = if ($Build) { "--build" } else { "" }

Write-Host "Starting Backend API services..." -ForegroundColor Green

$command = "docker-compose -p $ProjectName -f $ComposeFile up -d $BuildFlag"
Invoke-Expression $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Services started successfully!" -ForegroundColor Green
    Write-Host "API Endpoint:  http://localhost:3000/api" -ForegroundColor White
    Write-Host "Database:      localhost:5432 (user: lms_user, db: lms_db)" -ForegroundColor White
    Write-Host "Android emu:   http://10.0.2.2:3000/api" -ForegroundColor White
    Write-Host "iOS simulator: http://localhost:3000/api" -ForegroundColor White
} else {
    Write-Host "Failed to start services!" -ForegroundColor Red
    exit $LASTEXITCODE
}