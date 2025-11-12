# LMS Full Stack Development Startup Script
param(
    [switch]$Down,
    [switch]$Build,
    [switch]$Logs,
    [switch]$Clean
)

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
$OutputEncoding = [System.Text.Encoding]::UTF8
try { chcp.com 65001 > $null } catch {}

# Get script directory and navigate to project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
Set-Location $ProjectRoot

$ComposeFile = "./docker/environments/development/full-stack.yml"
$ProjectName = "lms"

Write-Host "LMS Full Stack Development Environment" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Initialize volumes and networks if needed
Write-Host "Checking Docker volumes and networks..." -ForegroundColor Cyan
& "$ScriptDir\init-volumes.ps1" -Force | Out-Null
Write-Host ""

if ($Down) {
    Write-Host "Stopping Full Stack services..." -ForegroundColor Red
    docker-compose -p $ProjectName -f $ComposeFile down
    return
}

if ($Clean) {
    Write-Host "Cleaning up volumes and containers..." -ForegroundColor Red
    docker-compose -p $ProjectName -f $ComposeFile down -v --remove-orphans
    docker system prune -f
    return
}

if ($Logs) {
    Write-Host "Showing logs for all services..." -ForegroundColor Blue
    docker-compose -p $ProjectName -f $ComposeFile logs -f
    return
}

$BuildFlag = if ($Build) { "--build" } else { "" }

Write-Host "Starting Full Stack Development Environment..." -ForegroundColor Green
Write-Host "   Includes: PostgreSQL + Redis + Backend + Frontend" -ForegroundColor Cyan

if ($Build) {
    Write-Host "Building images..." -ForegroundColor Yellow
}

$command = "docker-compose -p $ProjectName -f $ComposeFile up -d $BuildFlag"
Invoke-Expression $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Information:" -ForegroundColor Yellow
    Write-Host "   Frontend:  http://localhost:3001" -ForegroundColor White
    Write-Host "   Backend:   http://localhost:3000/api" -ForegroundColor White
    Write-Host "   API Docs:  http://localhost:3000/api-docs" -ForegroundColor White
    Write-Host "   Database:  localhost:5432 (user: lms_user, db: lms_db)" -ForegroundColor White
    Write-Host "   Redis:     localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "Helpful Commands:" -ForegroundColor Yellow
    Write-Host "   View logs:     npm run dev:web:logs" -ForegroundColor Gray
    Write-Host "   Stop services: npm run dev:down:web" -ForegroundColor Gray
    Write-Host "   Rebuild:       npm run dev:web:build" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Great for:" -ForegroundColor Cyan
    Write-Host "   - React frontend development" -ForegroundColor White
    Write-Host "   - Full-stack testing" -ForegroundColor White
    Write-Host "   - End-to-end development" -ForegroundColor White
} else {
    Write-Host "Failed to start services!" -ForegroundColor Red
    $LogMsg = "Check logs: docker-compose -f $ComposeFile logs"
    Write-Host $LogMsg -ForegroundColor Yellow
}