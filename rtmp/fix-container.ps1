# Quick fix script - Restart container với config mới

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Container nginx-rtmp" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Docker connection first
Write-Host "[1] Kiem tra Docker connection..." -ForegroundColor Yellow
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ERROR: Docker daemon chua san sang!" -ForegroundColor Red
        Write-Host "   Vui long:" -ForegroundColor Yellow
        Write-Host "   1. Mo Docker Desktop" -ForegroundColor White
        Write-Host "   2. Doi Docker khoi dong hoan toan" -ForegroundColor White
        Write-Host "   3. Restart PowerShell va chay lai script" -ForegroundColor White
        exit 1
    }
    Write-Host "   OK: Docker daemon san sang" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Khong ket noi duoc Docker!" -ForegroundColor Red
    exit 1
}

# Stop and remove old container
Write-Host "[2] Dang dung va xoa container cu..." -ForegroundColor Yellow
$existing = docker ps -a --filter "name=nginx-rtmp" --format "{{.Names}}" 2>&1
if ($existing -and $existing -match "nginx-rtmp") {
    docker stop nginx-rtmp 2>&1 | Out-Null
    docker rm nginx-rtmp 2>&1 | Out-Null
    Write-Host "   OK: Da dung va xoa container cu" -ForegroundColor Green
} else {
    Write-Host "   Info: Khong co container cu" -ForegroundColor Gray
}

# Setup paths - dùng path trong project
Write-Host "[3] Setup paths..." -ForegroundColor Yellow
$sourceConfig = Join-Path $PSScriptRoot "nginx.conf"
$projectHlsPath = Join-Path $PSScriptRoot "hls"

# Đảm bảo thư mục hls tồn tại
if (-not (Test-Path $projectHlsPath)) {
    New-Item -ItemType Directory -Force -Path $projectHlsPath | Out-Null
    Write-Host "   OK: Da tao thu muc: $projectHlsPath" -ForegroundColor Green
}

if (-not (Test-Path $sourceConfig)) {
    Write-Host "   ERROR: Khong tim thay nginx.conf trong $PSScriptRoot" -ForegroundColor Red
    exit 1
}

Write-Host "   OK: Su dung path trong project" -ForegroundColor Green
Write-Host "   Config: $sourceConfig" -ForegroundColor Gray
Write-Host "   HLS: $projectHlsPath" -ForegroundColor Gray

# Start new container
Write-Host "[4] Khoi dong container moi..." -ForegroundColor Yellow
$dockerCmd = "docker run -d --name nginx-rtmp --restart unless-stopped -p 1935:1935 -p 8080:8080 -v `"${sourceConfig}:/etc/nginx/nginx.conf:ro`" -v `"${projectHlsPath}:/mnt/hls`" tiangolo/nginx-rtmp"
Write-Host "   Dang chay: $dockerCmd" -ForegroundColor Gray

$containerId = Invoke-Expression $dockerCmd 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Container da khoi dong: $($containerId.Trim())" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Loi khi khoi dong container!" -ForegroundColor Red
    Write-Host "   Output: $containerId" -ForegroundColor Gray
    exit 1
}

# Wait for container to start
Write-Host "[5] Doi container khoi dong (5 giay)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check status
Write-Host "[6] Kiem tra status..." -ForegroundColor Yellow
$status = docker ps --filter "name=nginx-rtmp" --format "{{.Status}}" 2>&1
if ($status -and $status -match "Up") {
    Write-Host "   OK: Container dang chay: $status" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Container co the chua on dinh" -ForegroundColor Yellow
    Write-Host "   Status: $status" -ForegroundColor Gray
    Write-Host "   Xem logs: docker logs nginx-rtmp" -ForegroundColor Gray
}

# Test health check
Write-Host "[7] Test health check..." -ForegroundColor Yellow
$maxRetries = 3
$retryCount = 0
$healthOk = $false

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   OK: Health check thanh cong!" -ForegroundColor Green
            Write-Host "   Response: $($response.Content.Trim())" -ForegroundColor Gray
            $healthOk = $true
            break
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "   Doi... ($retryCount/$maxRetries)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        } else {
            Write-Host "   WARNING: Health check that bai sau $maxRetries lan thu" -ForegroundColor Yellow
            Write-Host "   Xem logs: docker logs nginx-rtmp" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Hoan tat!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
if ($healthOk) {
    Write-Host "Container da chay on dinh!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Thong tin:" -ForegroundColor Yellow
    Write-Host "   RTMP: rtmp://localhost:1935/live" -ForegroundColor White
    Write-Host "   HLS: http://localhost:8080/hls" -ForegroundColor White
} else {
    Write-Host "Container co the co van de. Kiem tra logs:" -ForegroundColor Yellow
    Write-Host "   docker logs nginx-rtmp" -ForegroundColor White
}
Write-Host ""



