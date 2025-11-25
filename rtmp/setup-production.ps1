# ============================================
# Script Setup Production Livestream Server
# ============================================
# Chay script nay voi quyen Administrator
# PowerShell: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

param(
    [string]$HlsPath = "",  # Mặc định dùng path trong project
    [string]$ConfigPath = "",  # Mặc định dùng path trong project
    [string]$ContainerName = "nginx-rtmp",
    [switch]$SkipDockerCheck
)

# Nếu không chỉ định path, dùng path trong project
if ([string]::IsNullOrEmpty($HlsPath)) {
    $HlsPath = Join-Path $PSScriptRoot "hls"
}
if ([string]::IsNullOrEmpty($ConfigPath)) {
    $ConfigPath = Join-Path $PSScriptRoot "nginx.conf"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Production Livestream Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiem tra quyen Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Can chay voi quyen Administrator!" -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell -> Run as Administrator" -ForegroundColor Yellow
    exit 1
}

# 1. Kiem tra Docker
if (-not $SkipDockerCheck) {
    Write-Host "[1/7] Kiem tra Docker..." -ForegroundColor Yellow
    try {
        $dockerVersion = docker --version
        Write-Host "   OK: Docker da cai dat: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "   ERROR: Docker chua cai dat!" -ForegroundColor Red
        Write-Host "   Tai tai: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
}

# 2. Tao thu muc
Write-Host "[2/7] Tao thu muc..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $HlsPath | Out-Null
Write-Host "   OK: Da tao thu muc: $HlsPath" -ForegroundColor Green

# 3. Kiểm tra nginx.conf
Write-Host "[3/7] Kiem tra nginx.conf..." -ForegroundColor Yellow
$sourceConfig = Join-Path $PSScriptRoot "nginx.conf"
if (Test-Path $sourceConfig) {
    if ($ConfigPath -ne $sourceConfig) {
        Copy-Item -Path $sourceConfig -Destination $ConfigPath -Force
        Write-Host "   OK: Da copy nginx.conf -> $ConfigPath" -ForegroundColor Green
    } else {
        Write-Host "   OK: Su dung nginx.conf trong project: $ConfigPath" -ForegroundColor Green
    }
} else {
    Write-Host "   ERROR: Khong tim thay nginx.conf trong $PSScriptRoot" -ForegroundColor Red
    exit 1
}

# 4. Dung container cu (neu co)
Write-Host "[4/7] Dung container cu..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
if ($existingContainer) {
    Write-Host "   Dang dung container: $ContainerName" -ForegroundColor Yellow
    docker stop $ContainerName 2>$null
    docker rm $ContainerName 2>$null
    Write-Host "   OK: Da dung va xoa container cu" -ForegroundColor Green
} else {
    Write-Host "   Info: Khong co container cu" -ForegroundColor Gray
}

# 5. Chay Docker container
Write-Host "[5/7] Khoi dong Docker container..." -ForegroundColor Yellow
$dockerCmd = @(
    "docker", "run", "-d",
    "--name", $ContainerName,
    "--restart", "unless-stopped",
    "-p", "1935:1935",
    "-p", "8080:8080",
    "-v", "${ConfigPath}:/etc/nginx/nginx.conf:ro",
    "-v", "${HlsPath}:/mnt/hls",
    "tiangolo/nginx-rtmp"
)

Write-Host "   Dang chay: $($dockerCmd -join ' ')" -ForegroundColor Gray
$result = & $dockerCmd[0] $dockerCmd[1..($dockerCmd.Length-1)]

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Container da khoi dong: $result" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Loi khi khoi dong container!" -ForegroundColor Red
    exit 1
}

# 6. Cau hinh Firewall
Write-Host "[6/7] Cau hinh Firewall..." -ForegroundColor Yellow
$firewallRules = @(
    @{Name="RTMP"; Port=1935; Protocol="TCP"},
    @{Name="HLS-HTTP"; Port=8080; Protocol="TCP"}
)

foreach ($rule in $firewallRules) {
    $existingRule = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if (-not $existingRule) {
        New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound -Protocol $rule.Protocol -LocalPort $rule.Port -Action Allow | Out-Null
        Write-Host "   OK: Da mo port $($rule.Port) ($($rule.Name))" -ForegroundColor Green
    } else {
        Write-Host "   Info: Port $($rule.Port) da duoc mo" -ForegroundColor Gray
    }
}

# 7. Tao Scheduled Task cho cleanup
Write-Host "[7/7] Tao Scheduled Task cho cleanup..." -ForegroundColor Yellow
$cleanupScript = Join-Path $PSScriptRoot "cleanup-hls-production.ps1"
$taskName = "LivestreamCleanupHLS"

$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "   Info: Da xoa task cu" -ForegroundColor Gray
}

$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$cleanupScript`" -HlsPath `"$HlsPath`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 365)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Auto cleanup HLS files older than 1 hour" | Out-Null
    Write-Host "   OK: Da tao Scheduled Task: $taskName" -ForegroundColor Green
    Write-Host "   Info: Task se chay moi 30 phut" -ForegroundColor Gray
} catch {
    Write-Host "   WARNING: Khong the tao Scheduled Task: $_" -ForegroundColor Yellow
}

# Kiem tra container
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kiem tra Container" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Start-Sleep -Seconds 2
$containerStatus = docker ps --filter "name=$ContainerName" --format "{{.Status}}" 2>$null
if ($containerStatus) {
    Write-Host "OK: Container dang chay: $containerStatus" -ForegroundColor Green
} else {
    Write-Host "ERROR: Container khong chay! Kiem tra logs:" -ForegroundColor Red
    Write-Host "   docker logs $ContainerName" -ForegroundColor Yellow
}

# Test endpoints
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 5 -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "OK: Health check: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: Health check: Khong ket noi duoc (co the container dang khoi dong)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Hoan tat!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Thong tin:" -ForegroundColor Yellow
Write-Host "   RTMP Server: rtmp://localhost:1935/live" -ForegroundColor White
Write-Host "   HLS Server: http://localhost:8080/hls" -ForegroundColor White
Write-Host "   HLS Path: $HlsPath" -ForegroundColor White
Write-Host ""
Write-Host "Lenh huu ich:" -ForegroundColor Yellow
Write-Host "   Xem logs: docker logs -f $ContainerName" -ForegroundColor White
Write-Host "   Dung: docker stop $ContainerName" -ForegroundColor White
Write-Host "   Khoi dong lai: docker restart $ContainerName" -ForegroundColor White
Write-Host "   Xem status: docker ps --filter name=$ContainerName" -ForegroundColor White
Write-Host ""
