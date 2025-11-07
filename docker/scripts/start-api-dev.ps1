param([switch]$Down, [switch]$Build, [switch]$Logs)

# Navigate to project root - use a more reliable method
Set-Location "h:\DACN"
$ComposeFile = "./docker/environments/development/backend-only.yml"
$ProjectName = "lms"  # Set explicit project name to avoid "lms_dev-" prefix

Write-Host "LMS Backend API Development Environment" -ForegroundColor Green

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

Invoke-Expression "docker-compose -p $ProjectName -f $ComposeFile up -d $BuildFlag"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Services started successfully!" -ForegroundColor Green
    Write-Host "API Endpoint: http://localhost:3000/api" -ForegroundColor White
    Write-Host "Database: localhost:5432 (user: lms_user, db: lms_db)" -ForegroundColor White
    Write-Host "Mobile - Android Emulator: http://10.0.2.2:3000/api" -ForegroundColor White
    Write-Host "Mobile - iOS Simulator: http://localhost:3000/api" -ForegroundColor White
} else {
    Write-Host "Failed to start services!" -ForegroundColor Red
}