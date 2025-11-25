# ============================================
# Script Test Livestream System
# ============================================
# Script này kiểm tra toàn bộ hệ thống livestream

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Livestream System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allTestsPassed = $true

# 1. Kiểm tra Docker
Write-Host "[1/6] Kiem tra Docker..." -ForegroundColor Yellow
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: Docker daemon san sang" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: Docker daemon chua san sang!" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host "   ERROR: Khong ket noi duoc Docker!" -ForegroundColor Red
    $allTestsPassed = $false
}

# 2. Kiểm tra Container
Write-Host "[2/6] Kiem tra Container..." -ForegroundColor Yellow
$container = docker ps --filter "name=nginx-rtmp" --format "{{.Names}}|{{.Status}}" 2>&1
if ($container -and $container -match "nginx-rtmp") {
    $parts = $container -split '\|'
    Write-Host "   OK: Container dang chay: $($parts[0])" -ForegroundColor Green
    Write-Host "   Status: $($parts[1])" -ForegroundColor Gray
} else {
    Write-Host "   ERROR: Container khong chay!" -ForegroundColor Red
    Write-Host "   Chay: .\fix-container.ps1" -ForegroundColor Yellow
    $allTestsPassed = $false
}

# 3. Kiểm tra Health Check
Write-Host "[3/6] Kiem tra Health Check..." -ForegroundColor Yellow
try {
    # Dùng curl.exe thay vì Invoke-WebRequest để tránh lỗi PowerShell
    $healthResult = curl.exe -s http://localhost:8080/health 2>&1
    if ($healthResult -match "healthy") {
        Write-Host "   OK: Health check thanh cong!" -ForegroundColor Green
        Write-Host "   Response: $healthResult" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR: Health check tra ve: $healthResult" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host "   ERROR: Khong the ket noi toi http://localhost:8080/health" -ForegroundColor Red
    Write-Host "   Kiem tra: docker logs nginx-rtmp" -ForegroundColor Yellow
    $allTestsPassed = $false
}

# 4. Kiểm tra HLS Directory
Write-Host "[4/6] Kiem tra HLS Directory..." -ForegroundColor Yellow
$hlsPath = Join-Path $PSScriptRoot "hls"
if (Test-Path $hlsPath) {
    Write-Host "   OK: Thu muc HLS ton tai: $hlsPath" -ForegroundColor Green
    $fileCount = (Get-ChildItem $hlsPath -File -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "   Files: $fileCount" -ForegroundColor Gray
} else {
    Write-Host "   WARNING: Thu muc HLS chua ton tai (se duoc tao tu dong)" -ForegroundColor Yellow
}

# 5. Kiểm tra Ports
Write-Host "[5/6] Kiem tra Ports..." -ForegroundColor Yellow
$rtmpPort = Get-NetTCPConnection -LocalPort 1935 -ErrorAction SilentlyContinue
$httpPort = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue

if ($rtmpPort) {
    Write-Host "   OK: Port 1935 (RTMP) dang mo" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Port 1935 (RTMP) khong mo" -ForegroundColor Yellow
}

if ($httpPort) {
    Write-Host "   OK: Port 8080 (HTTP/HLS) dang mo" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Port 8080 (HTTP/HLS) khong mo" -ForegroundColor Yellow
}

# 6. Kiểm tra Config
Write-Host "[6/6] Kiem tra Config..." -ForegroundColor Yellow
$configPath = Join-Path $PSScriptRoot "nginx.conf"
if (Test-Path $configPath) {
    Write-Host "   OK: nginx.conf ton tai" -ForegroundColor Green
    
    # Kiểm tra config syntax trong container
    $testResult = docker exec nginx-rtmp nginx -t 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: Nginx config syntax hop le" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: Nginx config co loi!" -ForegroundColor Red
        Write-Host "   $testResult" -ForegroundColor Gray
        $allTestsPassed = $false
    }
} else {
    Write-Host "   ERROR: nginx.conf khong ton tai!" -ForegroundColor Red
    $allTestsPassed = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allTestsPassed) {
    Write-Host "  TAT CA TEST PASSED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "San sang test livestream:" -ForegroundColor Yellow
    Write-Host "  1. Mo frontend: http://localhost:5174/instructor/livestream/create" -ForegroundColor White
    Write-Host "  2. Chon 'Streaming software setup'" -ForegroundColor White
    Write-Host "  3. Copy Server URL va Stream Key" -ForegroundColor White
    Write-Host "  4. Mo OBS Studio -> Settings -> Stream" -ForegroundColor White
    Write-Host "  5. Service: Custom..." -ForegroundColor White
    Write-Host "  6. Dán Server URL va Stream Key" -ForegroundColor White
    Write-Host "  7. Nhan 'Start Streaming' trong OBS" -ForegroundColor White
    Write-Host "  8. Doi 5-10 giay, preview se tu dong hien thi" -ForegroundColor White
} else {
    Write-Host "  CO LOI! Vui long sua truoc khi test." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
}
Write-Host ""

