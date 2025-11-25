# ============================================
# Script Monitor Livestream Server
# ============================================

param(
    [string]$ContainerName = "nginx-rtmp",
    [string]$HlsPath = "",  # Mặc định dùng path trong project
    [switch]$Continuous
)

# Nếu không chỉ định path, dùng path trong project
if ([string]::IsNullOrEmpty($HlsPath)) {
    $HlsPath = Join-Path $PSScriptRoot "hls"
}

function Show-Status {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Livestream Server Monitor" -ForegroundColor Cyan
    Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # 1. Container Status
    Write-Host "[Container Status]" -ForegroundColor Yellow
    $container = docker ps --filter "name=$ContainerName" --format "{{.Names}}|{{.Status}}|{{.Ports}}" 2>$null
    if ($container) {
        $parts = $container -split '\|'
        Write-Host "   Name: $($parts[0])" -ForegroundColor Green
        Write-Host "   Status: $($parts[1])" -ForegroundColor Green
        Write-Host "   Ports: $($parts[2])" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Container không chạy!" -ForegroundColor Red
    }
    Write-Host ""

    # 2. Health Check
    Write-Host "[Health Check]" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ HTTP Server: OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ❌ HTTP Server: Không kết nối được" -ForegroundColor Red
    }
    Write-Host ""

    # 3. HLS Files
    Write-Host "[HLS Files]" -ForegroundColor Yellow
    if (Test-Path $HlsPath) {
        $tsFiles = (Get-ChildItem -Path $HlsPath -Filter "*.ts" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
        $m3u8Files = (Get-ChildItem -Path $HlsPath -Filter "*.m3u8" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
        
        $totalSize = (Get-ChildItem -Path $HlsPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $totalSizeGB = [math]::Round($totalSize / 1GB, 2)
        
        Write-Host "   .ts files: $tsFiles" -ForegroundColor White
        Write-Host "   .m3u8 files: $m3u8Files" -ForegroundColor White
        Write-Host "   Total size: $totalSizeGB GB" -ForegroundColor White
        
        # Active streams (m3u8 files modified in last 5 minutes)
        $activeStreams = (Get-ChildItem -Path $HlsPath -Filter "*.m3u8" -Recurse -File -ErrorAction SilentlyContinue | 
            Where-Object { ((Get-Date) - $_.LastWriteTime).TotalMinutes -lt 5 } | Measure-Object).Count
        Write-Host "   Active streams: $activeStreams" -ForegroundColor $(if ($activeStreams -gt 0) { "Green" } else { "Gray" })
    } else {
        Write-Host "   ❌ Thư mục không tồn tại: $HlsPath" -ForegroundColor Red
    }
    Write-Host ""

    # 4. Disk Space
    Write-Host "[Disk Space]" -ForegroundColor Yellow
    $disk = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -eq (Split-Path -Qualifier $HlsPath) }
    if ($disk) {
        $usedGB = [math]::Round($disk.Used / 1GB, 2)
        $freeGB = [math]::Round($disk.Free / 1GB, 2)
        $totalGB = [math]::Round(($disk.Used + $disk.Free) / 1GB, 2)
        $percentFree = [math]::Round(($disk.Free / ($disk.Used + $disk.Free)) * 100, 1)
        
        Write-Host "   Used: $usedGB GB" -ForegroundColor White
        Write-Host "   Free: $freeGB GB ($percentFree%)" -ForegroundColor $(if ($percentFree -lt 10) { "Red" } elseif ($percentFree -lt 20) { "Yellow" } else { "Green" })
        Write-Host "   Total: $totalGB GB" -ForegroundColor White
    }
    Write-Host ""

    # 5. System Resources
    Write-Host "[System Resources]" -ForegroundColor Yellow
    $cpu = Get-WmiObject Win32_Processor | Measure-Object -property LoadPercentage -Average
    $ram = Get-WmiObject Win32_OperatingSystem
    $ramUsedGB = [math]::Round(($ram.TotalVisibleMemorySize - $ram.FreePhysicalMemory) / 1MB, 2)
    $ramTotalGB = [math]::Round($ram.TotalVisibleMemorySize / 1MB, 2)
    $ramPercent = [math]::Round((($ram.TotalVisibleMemorySize - $ram.FreePhysicalMemory) / $ram.TotalVisibleMemorySize) * 100, 1)
    
    Write-Host "   CPU: $([math]::Round($cpu.Average, 1))%" -ForegroundColor White
    Write-Host "   RAM: $ramUsedGB / $ramTotalGB GB ($ramPercent%)" -ForegroundColor White
    Write-Host ""

    # 6. Recent Logs
    Write-Host "[Recent Logs]" -ForegroundColor Yellow
    $logDir = Join-Path (Split-Path -Parent $HlsPath) "logs"
    if (Test-Path $logDir) {
        $latestLog = Get-ChildItem -Path $logDir -Filter "cleanup-*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latestLog) {
            $logLines = Get-Content -Path $latestLog.FullName -Tail 3 -ErrorAction SilentlyContinue
            foreach ($line in $logLines) {
                Write-Host "   $line" -ForegroundColor Gray
            }
        }
    }
    Write-Host ""
}

# Main loop
if ($Continuous) {
    Write-Host "Đang monitor (nhấn Ctrl+C để dừng)..." -ForegroundColor Yellow
    Write-Host ""
    while ($true) {
        Show-Status
        Start-Sleep -Seconds 5
    }
} else {
    Show-Status
}



