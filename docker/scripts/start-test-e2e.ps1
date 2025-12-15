# LMS E2E Testing Environment Startup Script
# Uses isolated PostgreSQL (tmpfs) + Redis for testing
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

function Get-ComposeRunner {
    try {
        & docker compose version *> $null
        if ($LASTEXITCODE -eq 0) {
            return @{ Exe = "docker"; BaseArgs = @("compose") }
        }
    } catch {}

    try {
        & docker-compose version *> $null
        if ($LASTEXITCODE -eq 0) {
            return @{ Exe = "docker-compose"; BaseArgs = @() }
        }
    } catch {}

    throw "Không tìm thấy Docker Compose. Cài Docker Desktop hoặc docker-compose trước khi chạy."
}

$Compose = Get-ComposeRunner

$ComposeFile = "./docker-compose.test.yml"
$ProjectName = "lms-test"

Write-Host "LMS E2E Testing Environment" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host 'Using isolated Docker PostgreSQL (tmpfs)' -ForegroundColor Yellow
Write-Host ""

if ($Down) {
    Write-Host "Stopping E2E Test services..." -ForegroundColor Red
    & $Compose.Exe @($Compose.BaseArgs + @('-p', $ProjectName, '-f', $ComposeFile, 'down'))
    return
}

if ($Clean) {
    Write-Host "⚠️  WARNING: This will clean test volumes!" -ForegroundColor Red
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne 'y') {
        Write-Host "Cancelled." -ForegroundColor Yellow
        return
    }
    Write-Host "Cleaning up test containers and volumes..." -ForegroundColor Red
    & $Compose.Exe @($Compose.BaseArgs + @('-p', $ProjectName, '-f', $ComposeFile, 'down', '-v', '--remove-orphans'))
    return
}

if ($Logs) {
    Write-Host "Showing logs for E2E test services..." -ForegroundColor Blue
    & $Compose.Exe @($Compose.BaseArgs + @('-p', $ProjectName, '-f', $ComposeFile, 'logs', '-f'))
    return
}

# Check if old volume exists
Write-Host "Checking PostgreSQL test volume..." -ForegroundColor Cyan

Write-Host "Starting E2E Testing Environment..." -ForegroundColor Green
Write-Host '   Database: Docker PostgreSQL tmpfs (localhost:6543)' -ForegroundColor Cyan
Write-Host "   Services: postgres-test + redis-test" -ForegroundColor Cyan
Write-Host ""

if ($Build) {
    Write-Host "Building images..." -ForegroundColor Yellow
}

$UpArgs = @('-p', $ProjectName, '-f', $ComposeFile, 'up', '-d')
if ($Build) { $UpArgs += '--build' }
& $Compose.Exe @($Compose.BaseArgs + $UpArgs)

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] E2E Test Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Information:" -ForegroundColor Yellow
    Write-Host "   Database:     localhost:6543 (user: lms_user, db: lms_db)" -ForegroundColor White
    Write-Host "   Redis:        localhost:6380 (db 0)" -ForegroundColor White
    Write-Host ""
    Write-Host "Database Info:" -ForegroundColor Yellow
    Write-Host "   Using isolated PostgreSQL in Docker" -ForegroundColor Cyan
    Write-Host '   Data stored in RAM (tmpfs) - safe by default' -ForegroundColor Green
    Write-Host ""
    Write-Host "Helpful Commands:" -ForegroundColor Yellow
    Write-Host "   View logs:     npm run dev:test:logs" -ForegroundColor Gray
    Write-Host "   Stop services: npm run dev:down:test" -ForegroundColor Gray
    Write-Host "   Rebuild:       npm run dev:test:build" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Perfect for:" -ForegroundColor Cyan
    Write-Host "   * Integration tests (backend)" -ForegroundColor White
    Write-Host "   * E2E test DB spin-up/tear-down" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: Run backend tests on host (backend/src/tests/integration/test.env uses port 6543)" -ForegroundColor Blue
} else {
    Write-Host "[ERROR] Failed to start services!" -ForegroundColor Red
    $LogMsg = "Check logs: $($Compose.Exe) $($Compose.BaseArgs -join ' ') -p $ProjectName -f $ComposeFile logs"
    Write-Host $LogMsg -ForegroundColor Yellow
}
