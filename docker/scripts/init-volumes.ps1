#!/usr/bin/env pwsh
# Initialize Docker volumes for LMS project
# This script creates required external volumes if they don't exist
# Note: Networks are managed automatically by Docker Compose

param(
    [switch]$Force
)

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
$OutputEncoding = [System.Text.Encoding]::UTF8
try { chcp.com 65001 > $null } catch {}

# Get script directory and navigate to project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
Set-Location $ProjectRoot

Write-Host "Initializing Docker volumes and networks for LMS" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

# Required volumes
$Volumes = @(
    "lms_postgres_api_dev_data",
    "lms_redis_api_dev_data"
)

# Create volumes
Write-Host "Checking Docker volumes..." -ForegroundColor Yellow
foreach ($Volume in $Volumes) {
    $ExistingVolume = docker volume ls -q --filter "name=$Volume" 2>$null
    if ($ExistingVolume) {
        Write-Host "   Volume '$Volume' already exists" -ForegroundColor Green
    } else {
        Write-Host "   Creating volume '$Volume'..." -ForegroundColor Cyan
        docker volume create $Volume 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Volume '$Volume' created successfully" -ForegroundColor Green
        } else {
            Write-Host "   Failed to create volume '$Volume'" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Note: Networks are managed by Docker Compose automatically" -ForegroundColor Cyan

Write-Host ""
Write-Host "Initialization completed!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now start services with:" -ForegroundColor Cyan
Write-Host "   npm run dev:web" -ForegroundColor Gray
Write-Host "   npm run dev:api" -ForegroundColor Gray


