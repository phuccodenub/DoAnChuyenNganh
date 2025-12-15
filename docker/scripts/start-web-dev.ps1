# LMS Full Stack Development Startup Script
param(
    [switch]$Down,
    [switch]$Build,
    [switch]$Logs,
    [switch]$Clean,
    [switch]$LocalDb
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

function Import-EnvFileToProcess([string]$Path) {
    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line.Length -eq 0 -or $line.StartsWith('#')) { return }

        $idx = $line.IndexOf('=')
        if ($idx -lt 1) { return }

        $key = $line.Substring(0, $idx).Trim()
        $value = $line.Substring($idx + 1)

        $existing = [Environment]::GetEnvironmentVariable($key, 'Process')
        if ($null -eq $existing) {
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
}

$Compose = Get-ComposeRunner
$EnvFilePath = Join-Path $ProjectRoot "docker/environments/development/.env"
Import-EnvFileToProcess $EnvFilePath

if ($LocalDb) {
    $ComposeFile = "./docker/environments/development/full-stack.localdb.yml"
} else {
    $ComposeFile = "./docker/environments/development/full-stack.yml"
}

$ProjectName = "lms"

Write-Host "LMS Full Stack Development Environment" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Initialize volumes and networks if needed
Write-Host "Checking Docker volumes and networks..." -ForegroundColor Cyan
& "$ScriptDir\init-volumes.ps1" -Force | Out-Null
Write-Host ""

if ($Down) {
    Write-Host "Stopping Full Stack services..." -ForegroundColor Red
    & $Compose.Exe @($Compose.BaseArgs + @('-p', $ProjectName, '-f', $ComposeFile, 'down'))
    return
}

if ($Clean) {
    Write-Host "Cleaning up volumes and containers..." -ForegroundColor Red
    & $Compose.Exe @($Compose.BaseArgs + @('-p', $ProjectName, '-f', $ComposeFile, 'down', '-v', '--remove-orphans'))
    return
}

if ($Logs) {
    Write-Host "Showing logs for all services..." -ForegroundColor Blue
    & $Compose.Exe @($Compose.BaseArgs + @('-p', $ProjectName, '-f', $ComposeFile, 'logs', '-f'))
    return
}

Write-Host "Starting Full Stack Development Environment..." -ForegroundColor Green
if ($LocalDb) {
    Write-Host "   Includes: PostgreSQL + Redis + Backend + Frontend" -ForegroundColor Cyan
} else {
    Write-Host "   Includes: Redis + Backend + Frontend (Supabase DB)" -ForegroundColor Cyan
}

if ($Build) {
    Write-Host "Building images..." -ForegroundColor Yellow
}

$UpArgs = @('-p', $ProjectName, '-f', $ComposeFile, 'up', '-d')
if ($Build) { $UpArgs += '--build' }
& $Compose.Exe @($Compose.BaseArgs + $UpArgs)

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Information:" -ForegroundColor Yellow
    Write-Host "   Frontend:  http://localhost:3001" -ForegroundColor White
    Write-Host "   Backend:   http://localhost:3000/api" -ForegroundColor White
    Write-Host "   API Docs:  http://localhost:3000/api-docs" -ForegroundColor White
    if ($LocalDb) {
        Write-Host "   Database:  localhost:5432 (Docker Postgres)" -ForegroundColor White
    } else {
        Write-Host "   Database:  Supabase (DATABASE_URL từ backend/.env)" -ForegroundColor White
    }
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
    $LogMsg = "Check logs: $($Compose.Exe) $($Compose.BaseArgs -join ' ') -p $ProjectName -f $ComposeFile logs"
    Write-Host $LogMsg -ForegroundColor Yellow
}