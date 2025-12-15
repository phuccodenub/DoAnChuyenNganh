<# 
.SYNOPSIS
    Rebuild specific Docker service for LMS project
.DESCRIPTION
    Stops, removes, rebuilds and starts backend or frontend Docker containers
.PARAMETER Service
    Service to rebuild: backend, frontend, or both
.PARAMETER NoCache
    Build without using cache
.EXAMPLE
    .\rebuild-service.ps1 -Service backend
    .\rebuild-service.ps1 -Service frontend -NoCache
#>
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("backend", "frontend", "both")]
    [string]$Service,
    
    [switch]$NoCache
)

$ErrorActionPreference = "Continue"

# Get project root (3 levels up from script location)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$ComposeFile = Join-Path $ProjectRoot "docker\environments\development\full-stack.yml"

Write-Host "[REBUILD] LMS Docker Service Rebuild" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray
Write-Host "Compose File: $ComposeFile" -ForegroundColor Gray

# Check if compose file exists
if (-not (Test-Path $ComposeFile)) {
    Write-Host "[ERROR] Compose file not found: $ComposeFile" -ForegroundColor Red
    exit 1
}

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

function Reset-DockerService {
    param(
        [string]$ServiceName,
        [string]$DisplayName,
        [bool]$UseNoCache
    )
     
    Write-Host ""
    Write-Host "[INFO] Rebuilding $DisplayName..." -ForegroundColor Yellow
     
    # Stop the service first
    Write-Host "  -> Stopping $ServiceName..." -ForegroundColor Gray
    & $Compose.Exe @($Compose.BaseArgs + @('-f', $ComposeFile, '-p', 'lms', 'stop', $ServiceName)) 2>$null
     
    # Remove the container
    Write-Host "  -> Removing container..." -ForegroundColor Gray
    & $Compose.Exe @($Compose.BaseArgs + @('-f', $ComposeFile, '-p', 'lms', 'rm', '-f', $ServiceName)) 2>$null
     
    # Rebuild the image
    Write-Host "  -> Building image..." -ForegroundColor Gray
    if ($UseNoCache) {
        & $Compose.Exe @($Compose.BaseArgs + @('-f', $ComposeFile, '-p', 'lms', 'build', '--no-cache', $ServiceName))
    } else {
        & $Compose.Exe @($Compose.BaseArgs + @('-f', $ComposeFile, '-p', 'lms', 'build', $ServiceName))
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to build $DisplayName" -ForegroundColor Red
        return $false
    }
     
    # Start the service
    Write-Host "  -> Starting $ServiceName..." -ForegroundColor Gray
    & $Compose.Exe @($Compose.BaseArgs + @('-f', $ComposeFile, '-p', 'lms', 'up', '-d', $ServiceName))
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] $DisplayName rebuilt and started successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[ERROR] Failed to start $DisplayName" -ForegroundColor Red
        return $false
    }
}

$UseNoCache = $NoCache.IsPresent

switch ($Service) {
    "backend" {
        Reset-DockerService -ServiceName "backend-dev" -DisplayName "Backend API" -UseNoCache $UseNoCache
    }
    "frontend" {
        Reset-DockerService -ServiceName "frontend-dev" -DisplayName "Frontend" -UseNoCache $UseNoCache
    }
    "both" {
        Reset-DockerService -ServiceName "backend-dev" -DisplayName "Backend API" -UseNoCache $UseNoCache
        Reset-DockerService -ServiceName "frontend-dev" -DisplayName "Frontend" -UseNoCache $UseNoCache
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "[INFO] View logs with:" -ForegroundColor Cyan
Write-Host "   Backend:  $($Compose.Exe) $($Compose.BaseArgs -join ' ') -f $ComposeFile -p lms logs -f backend-dev" -ForegroundColor White
Write-Host "   Frontend: $($Compose.Exe) $($Compose.BaseArgs -join ' ') -f $ComposeFile -p lms logs -f frontend-dev" -ForegroundColor White
Write-Host ""
