# Script kiểm tra kết nối DNS và Supabase từ Docker container
# Usage: .\docker\scripts\check-dns-connection.ps1

Write-Host "🔍 Kiểm tra kết nối DNS và Supabase..." -ForegroundColor Cyan
Write-Host ""

$containerName = "lms-backend-dev"

# Kiểm tra container có đang chạy không
Write-Host "1. Kiểm tra container đang chạy..." -ForegroundColor Yellow
$container = docker ps --filter "name=$containerName" --format "{{.Names}}"
if (-not $container) {
    Write-Host "❌ Container $containerName không đang chạy!" -ForegroundColor Red
    Write-Host "   Chạy: npm run dev:api hoặc npm run dev:web" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Container $containerName đang chạy" -ForegroundColor Green
Write-Host ""

# Kiểm tra ping đến DNS server
Write-Host "2. Kiểm tra kết nối internet (ping 8.8.8.8)..." -ForegroundColor Yellow
$pingResult = docker exec $containerName ping -c 3 8.8.8.8 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Container có thể ping DNS server" -ForegroundColor Green
} else {
    Write-Host "❌ Container KHÔNG thể ping DNS server!" -ForegroundColor Red
    Write-Host "   Có thể do:" -ForegroundColor Yellow
    Write-Host "   - Không có internet" -ForegroundColor Yellow
    Write-Host "   - Firewall chặn Docker" -ForegroundColor Yellow
    Write-Host "   - VPN đang bật" -ForegroundColor Yellow
}
Write-Host ""

# Kiểm tra DNS resolution cho Supabase
Write-Host "3. Kiểm tra DNS resolution cho Supabase..." -ForegroundColor Yellow
$supabaseHost = "aws-1-ap-southeast-1.pooler.supabase.com"
$dnsResult = docker exec $containerName nslookup $supabaseHost 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ DNS resolution thành công cho $supabaseHost" -ForegroundColor Green
    Write-Host $dnsResult
} else {
    Write-Host "❌ DNS resolution THẤT BẠI cho $supabaseHost!" -ForegroundColor Red
    Write-Host "   Lỗi: EAI_AGAIN - không thể resolve hostname" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Giải pháp:" -ForegroundColor Yellow
    Write-Host "   1. Kiểm tra DATABASE_URL trong backend/.env" -ForegroundColor Yellow
    Write-Host "   2. Restart Docker network:" -ForegroundColor Yellow
    Write-Host "      docker network rm lms-dev-network" -ForegroundColor Cyan
    Write-Host "      docker network create lms-dev-network" -ForegroundColor Cyan
    Write-Host "   3. Restart container:" -ForegroundColor Yellow
    Write-Host "      docker-compose -p lms -f docker/environments/development/full-stack.yml restart backend-dev" -ForegroundColor Cyan
    Write-Host "   4. Hoặc dùng local Postgres:" -ForegroundColor Yellow
    Write-Host "      npm run dev:web:localdb" -ForegroundColor Cyan
}
Write-Host ""

# Kiểm tra DATABASE_URL từ env
Write-Host "4. Kiểm tra DATABASE_URL trong container..." -ForegroundColor Yellow
$dbUrl = docker exec $containerName printenv DATABASE_URL 2>&1
if ($dbUrl -and $dbUrl -notmatch "^\s*$") {
    Write-Host "✅ DATABASE_URL được set:" -ForegroundColor Green
    # Mask password trong output
    $maskedUrl = $dbUrl -replace ':(.*?)@', ':****@'
    Write-Host "   $maskedUrl" -ForegroundColor Cyan
    
    if ($dbUrl -match "supabase") {
        Write-Host "   → Đang dùng Supabase" -ForegroundColor Cyan
    } elseif ($dbUrl -match "localhost|127.0.0.1|postgres") {
        Write-Host "   → Đang dùng local Postgres" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  DATABASE_URL không được set trong container!" -ForegroundColor Yellow
    Write-Host "   Kiểm tra backend/.env file" -ForegroundColor Yellow
}
Write-Host ""

# Kiểm tra kết nối đến Supabase port
Write-Host "5. Kiểm tra kết nối đến Supabase port 6543..." -ForegroundColor Yellow
$portTest = docker exec $containerName timeout 5 bash -c "echo > /dev/tcp/$supabaseHost/6543" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Có thể kết nối đến port 6543" -ForegroundColor Green
} else {
    Write-Host "❌ KHÔNG thể kết nối đến port 6543" -ForegroundColor Red
    Write-Host "   Có thể do firewall hoặc Supabase đang down" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📋 Tóm tắt:" -ForegroundColor Cyan
Write-Host "   Nếu tất cả đều ✅ → Kiểm tra DATABASE_URL và credentials" -ForegroundColor Yellow
Write-Host "   Nếu có ❌ → Làm theo các bước troubleshooting ở trên" -ForegroundColor Yellow





