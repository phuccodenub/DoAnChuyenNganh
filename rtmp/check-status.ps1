# Script kiểm tra status container

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kiem tra Livestream Server Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Docker connection
Write-Host "[1] Kiem tra Docker connection..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: Docker daemon dang chay" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: Khong ket noi duoc Docker daemon" -ForegroundColor Red
        Write-Host "   Vui long restart PowerShell hoac kiem tra Docker Desktop" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ERROR: Docker chua san sang" -ForegroundColor Red
    Write-Host "   Vui long mo Docker Desktop va doi no khoi dong hoan toan" -ForegroundColor Yellow
    exit 1
}

# Check container status
Write-Host "[2] Kiem tra container status..." -ForegroundColor Yellow
$container = docker ps -a --filter "name=nginx-rtmp" --format "{{.Names}}|{{.Status}}|{{.Ports}}" 2>&1
if ($container) {
    $parts = $container -split '\|'
    Write-Host "   Name: $($parts[0])" -ForegroundColor White
    Write-Host "   Status: $($parts[1])" -ForegroundColor $(if ($parts[1] -match "Up") { "Green" } else { "Red" })
    Write-Host "   Ports: $($parts[2])" -ForegroundColor White
    
    if ($parts[1] -notmatch "Up") {
        Write-Host "   WARNING: Container khong chay!" -ForegroundColor Yellow
        Write-Host "   Xem logs: docker logs nginx-rtmp" -ForegroundColor Gray
    }
} else {
    Write-Host "   ERROR: Container khong ton tai!" -ForegroundColor Red
    Write-Host "   Chay: .\setup-production.ps1" -ForegroundColor Yellow
    exit 1
}

# Check logs for errors
Write-Host "[3] Kiem tra logs (10 dong cuoi)..." -ForegroundColor Yellow
$logs = docker logs nginx-rtmp --tail 10 2>&1
if ($logs) {
    $errorLogs = $logs | Select-String -Pattern "error|Error|ERROR|emerg|emergency" -CaseSensitive:$false
    if ($errorLogs) {
        Write-Host "   WARNING: Co loi trong logs:" -ForegroundColor Yellow
        $errorLogs | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    } else {
        Write-Host "   OK: Khong co loi trong logs" -ForegroundColor Green
    }
} else {
    Write-Host "   Info: Khong co logs" -ForegroundColor Gray
}

# Test health endpoint
Write-Host "[4] Test health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   OK: Health check thanh cong!" -ForegroundColor Green
        Write-Host "   Response: $($response.Content.Trim())" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ERROR: Health check that bai" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Gray
    
    # Check if port is listening
    $port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
    if ($port8080) {
        Write-Host "   Info: Port 8080 dang listen" -ForegroundColor Gray
    } else {
        Write-Host "   WARNING: Port 8080 khong listen" -ForegroundColor Yellow
    }
}

# Check HLS directory
Write-Host "[5] Kiem tra HLS directory..." -ForegroundColor Yellow
# Dùng path trong project
$hlsPath = Join-Path $PSScriptRoot "hls"
if (Test-Path $hlsPath) {
    $fileCount = (Get-ChildItem -Path $hlsPath -File -ErrorAction SilentlyContinue | Measure-Object).Count
    $dirCount = (Get-ChildItem -Path $hlsPath -Directory -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "   OK: Thu muc ton tai" -ForegroundColor Green
    Write-Host "   Files: $fileCount, Directories: $dirCount" -ForegroundColor White
} else {
    Write-Host "   WARNING: Thu muc khong ton tai: $hlsPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ket qua" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Neu container khong chay, thu:" -ForegroundColor Yellow
Write-Host "  1. Xem logs: docker logs nginx-rtmp" -ForegroundColor White
Write-Host "  2. Restart: docker restart nginx-rtmp" -ForegroundColor White
Write-Host "  3. Hoac chay lai: .\fix-container.ps1" -ForegroundColor White
Write-Host ""



