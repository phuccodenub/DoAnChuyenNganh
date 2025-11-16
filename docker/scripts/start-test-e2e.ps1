# LMS E2E Testing Environment Startup Script
# Uses traditional PostgreSQL with OLD volume data for testing
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

$ComposeFile = "./docker/environments/development/test-e2e.yml"
$ProjectName = "lms-test"

Write-Host "LMS E2E Testing Environment" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Using HOST PostgreSQL with existing data" -ForegroundColor Yellow
Write-Host ""

if ($Down) {
    Write-Host "Stopping E2E Test services..." -ForegroundColor Red
    docker-compose -p $ProjectName -f $ComposeFile down
    return
}

if ($Clean) {
    Write-Host "⚠️  WARNING: This will clean test volumes!" -ForegroundColor Red
    Write-Host "⚠️  OLD PostgreSQL volume (dacn_postgres_data) will NOT be removed" -ForegroundColor Yellow
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne 'y') {
        Write-Host "Cancelled." -ForegroundColor Yellow
        return
    }
    Write-Host "Cleaning up test containers and volumes..." -ForegroundColor Red
    docker-compose -p $ProjectName -f $ComposeFile down -v --remove-orphans
    docker system prune -f
    return
}

if ($Logs) {
    Write-Host "Showing logs for E2E test services..." -ForegroundColor Blue
    docker-compose -p $ProjectName -f $ComposeFile logs -f
    return
}

# Check if old volume exists
Write-Host "Checking PostgreSQL test volume..." -ForegroundColor Cyan

$BuildFlag = if ($Build) { "--build" } else { "" }

Write-Host "Starting E2E Testing Environment..." -ForegroundColor Green
Write-Host "   Database: Host PostgreSQL (same as DBeaver)" -ForegroundColor Cyan
Write-Host "   Services: Redis + Backend + Frontend" -ForegroundColor Cyan
Write-Host ""

if ($Build) {
    Write-Host "Building images..." -ForegroundColor Yellow
}

$command = "docker-compose -p $ProjectName -f $ComposeFile up -d $BuildFlag"
Invoke-Expression $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ E2E Test Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Information:" -ForegroundColor Yellow
    Write-Host "   Frontend:     http://localhost:3001" -ForegroundColor White
    Write-Host "   Backend API:  http://localhost:3000/api" -ForegroundColor White
    Write-Host "   API Docs:     http://localhost:3000/api-docs" -ForegroundColor White
    Write-Host "   Database:     localhost:5432 (user: lms_user, db: lms_db)" -ForegroundColor White
    Write-Host "   Redis:        localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Database Info:" -ForegroundColor Yellow
    Write-Host "   Using HOST PostgreSQL on localhost port 5432" -ForegroundColor Cyan
    Write-Host "   Same database as DBeaver - WITH YOUR EXISTING DATA!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Helpful Commands:" -ForegroundColor Yellow
    Write-Host "   View logs:     npm run dev:test:logs" -ForegroundColor Gray
    Write-Host "   Stop services: npm run dev:down:test" -ForegroundColor Gray
    Write-Host "   Rebuild:       npm run dev:test:build" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Perfect for:" -ForegroundColor Cyan
    Write-Host "   ✓ E2E testing with real data" -ForegroundColor White
    Write-Host "   ✓ Integration testing" -ForegroundColor White
    Write-Host "   ✓ Testing with legacy database" -ForegroundColor White
    Write-Host ""
    Write-Host "ℹ️  Note: Your dev:web environment uses Supabase" -ForegroundColor Blue
    Write-Host "ℹ️  This test environment uses traditional PostgreSQL" -ForegroundColor Blue
} else {
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    $LogMsg = "Check logs: docker-compose -p $ProjectName -f $ComposeFile logs"
    Write-Host $LogMsg -ForegroundColor Yellow
}
