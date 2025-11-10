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

Set-Location "h:\DACN"

$ComposeFile = "./docker/environments/development/full-stack.yml"
$ProjectName = "lms"  # Set explicit project name to avoid "lms_dev-" prefix

Write-Host "🌐 LMS Full Stack Development Environment" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

if ($Down) {
    Write-Host "🛑 Stopping Full Stack services..." -ForegroundColor Red
    docker-compose -p $ProjectName -f $ComposeFile down
    return
}

if ($Clean) {
    Write-Host "🧹 Cleaning up volumes and containers..." -ForegroundColor Red
    docker-compose -p $ProjectName -f $ComposeFile down -v --remove-orphans
    docker system prune -f
    return
}

if ($Logs) {
    Write-Host "📊 Showing logs for all services..." -ForegroundColor Blue
    docker-compose -p $ProjectName -f $ComposeFile logs -f
    return
}

$BuildFlag = if ($Build) { "--build" } else { "" }

Write-Host "🚀 Starting Full Stack Development Environment..." -ForegroundColor Green
Write-Host "   This includes: PostgreSQL + Redis + Backend + Frontend" -ForegroundColor Cyan

if ($Build) {
    Write-Host "🔨 Building images..." -ForegroundColor Yellow
}

Invoke-Expression "docker-compose -p $ProjectName -f $ComposeFile up -d $BuildFlag"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Access Information:" -ForegroundColor Yellow
    Write-Host "   🌐 Frontend:  http://localhost:3001" -ForegroundColor White
    Write-Host "   🔌 Backend:   http://localhost:3000/api" -ForegroundColor White
    Write-Host "   📚 API Docs:  http://localhost:3000/api-docs" -ForegroundColor White
    Write-Host "   🗄️  Database: localhost:5432 (user: lms_user, db: lms_db)" -ForegroundColor White
    Write-Host "   🚀 Redis:    localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Useful Commands:" -ForegroundColor Yellow
    Write-Host "   📊 View logs:     npm run dev:web:logs" -ForegroundColor Gray
    Write-Host "   🛑 Stop services: npm run dev:down:web" -ForegroundColor Gray
    Write-Host "   🔄 Rebuild:      npm run dev:web:build" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🎯 Perfect for:" -ForegroundColor Cyan
    Write-Host "   • React frontend development" -ForegroundColor White
    Write-Host "   • Full-stack testing" -ForegroundColor White
    Write-Host "   • End-to-end development" -ForegroundColor White
} else {
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    Write-Host "Check logs: docker-compose -f $ComposeFile logs" -ForegroundColor Yellow
}