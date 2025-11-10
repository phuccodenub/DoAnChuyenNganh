#!/usr/bin/env pwsh
# LMS Docker Cleanup Script
# This script helps clean up Docker resources to free up space and resolve conflicts

param(
    [switch]$All,
    [switch]$Volumes,
    [switch]$Networks,
    [switch]$Images,
    [switch]$Containers,
    [switch]$Force
)

Write-Host "🧹 LMS Docker Cleanup Utility" -ForegroundColor Blue
Write-Host "==============================" -ForegroundColor Blue

if (!$All -and !$Volumes -and !$Networks -and !$Images -and !$Containers) {
    Write-Host ""
    Write-Host "📋 Available cleanup options:" -ForegroundColor Yellow
    Write-Host "   -All         Clean everything (containers, volumes, networks, images)" -ForegroundColor White
    Write-Host "   -Volumes     Clean only volumes" -ForegroundColor White
    Write-Host "   -Networks    Clean only networks" -ForegroundColor White
    Write-Host "   -Images      Clean only images" -ForegroundColor White
    Write-Host "   -Containers  Clean only containers" -ForegroundColor White
    Write-Host "   -Force       Skip confirmation prompts" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Examples:" -ForegroundColor Cyan
    Write-Host "   .\docker\scripts\cleanup.ps1 -All" -ForegroundColor Gray
    Write-Host "   .\docker\scripts\cleanup.ps1 -Volumes -Force" -ForegroundColor Gray
    Write-Host "   .\docker\scripts\cleanup.ps1 -Containers -Networks" -ForegroundColor Gray
    exit
}

# Confirmation function
function Confirm-Action {
    param([string]$Message)
    
    if ($Force) {
        return $true
    }
    
    $response = Read-Host "$Message (y/N)"
    return $response -eq 'y' -or $response -eq 'Y'
}

# Stop all LMS containers first
Write-Host "🛑 Stopping all LMS containers..." -ForegroundColor Yellow
docker ps --filter "name=lms_" -q | ForEach-Object { 
    if ($_) {
        docker stop $_ 2>$null
    }
}

# Clean containers
if ($All -or $Containers) {
    Write-Host ""
    Write-Host "🗑️  Container Cleanup" -ForegroundColor Blue
    
    $lmsContainers = docker ps -a --filter "name=lms_" -q
    if ($lmsContainers) {
        if (Confirm-Action "Remove all LMS containers?") {
            Write-Host "   Removing LMS containers..." -ForegroundColor Yellow
            $lmsContainers | ForEach-Object { docker rm $_ 2>$null }
        }
    } else {
        Write-Host "   ✅ No LMS containers found" -ForegroundColor Green
    }
    
    # Clean up orphaned containers
    if (Confirm-Action "Remove all orphaned containers?") {
        Write-Host "   Removing orphaned containers..." -ForegroundColor Yellow
        docker container prune -f
    }
}

# Clean volumes  
if ($All -or $Volumes) {
    Write-Host ""
    Write-Host "💾 Volume Cleanup" -ForegroundColor Blue
    
    $lmsVolumes = docker volume ls --filter "name=lms_" -q
    if ($lmsVolumes) {
        if (Confirm-Action "⚠️  Remove all LMS volumes? (This will delete all data!)") {
            Write-Host "   Removing LMS volumes..." -ForegroundColor Red
            $lmsVolumes | ForEach-Object { docker volume rm $_ 2>$null }
        }
    } else {
        Write-Host "   ✅ No LMS volumes found" -ForegroundColor Green
    }
    
    # Clean up unused volumes
    if (Confirm-Action "Remove all unused volumes?") {
        Write-Host "   Removing unused volumes..." -ForegroundColor Yellow
        docker volume prune -f
    }
}

# Clean networks
if ($All -or $Networks) {
    Write-Host ""
    Write-Host "🌐 Network Cleanup" -ForegroundColor Blue
    
    $lmsNetworks = docker network ls --filter "name=lms-network" -q
    if ($lmsNetworks) {
        if (Confirm-Action "Remove all LMS networks?") {
            Write-Host "   Removing LMS networks..." -ForegroundColor Yellow
            $lmsNetworks | ForEach-Object { docker network rm $_ 2>$null }
        }
    } else {
        Write-Host "   ✅ No LMS networks found" -ForegroundColor Green
    }
    
    # Clean up unused networks
    if (Confirm-Action "Remove all unused networks?") {
        Write-Host "   Removing unused networks..." -ForegroundColor Yellow
        docker network prune -f
    }
}

# Clean images
if ($All -or $Images) {
    Write-Host ""
    Write-Host "🖼️  Image Cleanup" -ForegroundColor Blue
    
    $lmsImages = docker images --filter "reference=*lms*" -q
    if ($lmsImages) {
        if (Confirm-Action "Remove all LMS images?") {
            Write-Host "   Removing LMS images..." -ForegroundColor Yellow
            $lmsImages | ForEach-Object { docker rmi $_ 2>$null }
        }
    } else {
        Write-Host "   ✅ No LMS images found" -ForegroundColor Green
    }
    
    # Clean up dangling images
    if (Confirm-Action "Remove all dangling images?") {
        Write-Host "   Removing dangling images..." -ForegroundColor Yellow
        docker image prune -f
    }
}

# Final system cleanup
if ($All) {
    Write-Host ""
    Write-Host "🔧 System Cleanup" -ForegroundColor Blue
    
    if (Confirm-Action "Run system-wide Docker cleanup?") {
        Write-Host "   Running system cleanup..." -ForegroundColor Yellow
        docker system prune -f
        
        if (Confirm-Action "Also remove unused build cache?") {
            docker builder prune -f
        }
    }
}

Write-Host ""
Write-Host "✅ Cleanup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Current Docker usage:" -ForegroundColor Yellow
docker system df

Write-Host ""
Write-Host "💡 To start fresh:" -ForegroundColor Cyan
Write-Host "   .\docker\scripts\start-web-dev.ps1 -Build" -ForegroundColor Gray
Write-Host "   .\docker\scripts\start-api-dev.ps1 -Build" -ForegroundColor Gray