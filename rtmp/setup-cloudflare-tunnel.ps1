# ============================================
# Script Setup Cloudflare Tunnel
# ============================================
# Hướng dẫn:
# 1. Đăng ký Cloudflare (miễn phí): https://dash.cloudflare.com/sign-up
# 2. Add domain vào Cloudflare
# 3. Chạy script này

param(
    [string]$Domain = "",
    [string]$TunnelName = "livestream"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Cloudflare Tunnel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra cloudflared
Write-Host "[1/5] Kiểm tra cloudflared..." -ForegroundColor Yellow
try {
    $version = cloudflared --version
    Write-Host "   ✅ cloudflared đã cài đặt: $version" -ForegroundColor Green
} catch {
    Write-Host "   ❌ cloudflared chưa cài đặt!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Cài đặt:" -ForegroundColor Yellow
    Write-Host "   1. Download: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor White
    Write-Host "   2. Hoặc dùng winget: winget install --id Cloudflare.cloudflared" -ForegroundColor White
    Write-Host "   3. Thêm vào PATH" -ForegroundColor White
    exit 1
}

# Login
Write-Host "[2/5] Login Cloudflare..." -ForegroundColor Yellow
Write-Host "   Mở browser để login..." -ForegroundColor Gray
cloudflared tunnel login
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Login thất bại!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Đã login thành công" -ForegroundColor Green

# Tạo tunnel
Write-Host "[3/5] Tạo tunnel..." -ForegroundColor Yellow
cloudflared tunnel create $TunnelName
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Tạo tunnel thất bại!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Đã tạo tunnel: $TunnelName" -ForegroundColor Green

# Lấy tunnel ID
$tunnelList = cloudflared tunnel list
$tunnelId = ($tunnelList | Select-String $TunnelName | ForEach-Object { ($_ -split '\s+')[0] })
Write-Host "   Tunnel ID: $tunnelId" -ForegroundColor Gray

# Tạo config
Write-Host "[4/5] Tạo config file..." -ForegroundColor Yellow
$configDir = "$env:USERPROFILE\.cloudflared"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
$configFile = Join-Path $configDir "config.yml"
$credentialsFile = Join-Path $configDir "$tunnelId.json"

if (-not $Domain) {
    $Domain = Read-Host "Nhập domain của bạn (ví dụ: yourdomain.com)"
}

$configContent = @"
tunnel: $tunnelId
credentials-file: $credentialsFile

ingress:
  # HLS endpoint
  - hostname: livestream.$Domain
    service: http://localhost:8080
    originRequest:
      noHappyEyeballs: true
      keepAliveConnections: 100
      keepAliveTimeout: 90s
  
  # Catch-all
  - service: http_status:404
"@

Set-Content -Path $configFile -Value $configContent
Write-Host "   ✅ Đã tạo config: $configFile" -ForegroundColor Green

# Route DNS
Write-Host "[5/5] Route DNS..." -ForegroundColor Yellow
cloudflared tunnel route dns $TunnelName livestream.$Domain
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Đã route DNS: livestream.$Domain" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Route DNS thất bại (có thể cần setup thủ công)" -ForegroundColor Yellow
}

# Cài đặt service
Write-Host ""
Write-Host "Cài đặt Cloudflare Tunnel như Windows Service..." -ForegroundColor Yellow
cloudflared service install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Đã cài đặt service" -ForegroundColor Green
    Start-Service cloudflared
    Write-Host "   ✅ Đã khởi động service" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Cài đặt service thất bại" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Hoàn tất!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Thông tin:" -ForegroundColor Yellow
Write-Host "   Tunnel: $TunnelName ($tunnelId)" -ForegroundColor White
Write-Host "   Domain: livestream.$Domain" -ForegroundColor White
Write-Host "   Config: $configFile" -ForegroundColor White
Write-Host ""
Write-Host "📝 Lệnh hữu ích:" -ForegroundColor Yellow
Write-Host "   Chạy tunnel: cloudflared tunnel run $TunnelName" -ForegroundColor White
Write-Host "   Xem logs: Get-Content `"$env:USERPROFILE\.cloudflared\*.log`"" -ForegroundColor White
Write-Host "   Service status: Get-Service cloudflared" -ForegroundColor White
Write-Host ""



