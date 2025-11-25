# ============================================
# Script Cleanup HLS Files cho Production
# ============================================
# Script này sẽ xóa các file HLS cũ hơn 1 giờ
# Được chạy tự động bởi Scheduled Task mỗi 30 phút

param(
    [string]$HlsPath = "",  # Mặc định dùng path trong project
    [int]$MaxAgeHours = 1,
    [switch]$Verbose
)

# Nếu không chỉ định path, dùng path trong project
if ([string]::IsNullOrEmpty($HlsPath)) {
    $HlsPath = Join-Path $PSScriptRoot "hls"
}

$ErrorActionPreference = "SilentlyContinue"

# Log file - tạo trong thư mục rtmp/logs
$logDir = Join-Path $PSScriptRoot "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir "cleanup-$(Get-Date -Format 'yyyyMMdd').log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $logFile -Value $logMessage
    if ($Verbose -or $Level -ne "INFO") {
        Write-Host $logMessage
    }
}

Write-Log "Bắt đầu cleanup HLS files..."

if (-not (Test-Path $HlsPath)) {
    Write-Log "Thư mục không tồn tại: $HlsPath" "ERROR"
    exit 1
}

# Xóa file .ts cũ
$tsFiles = Get-ChildItem -Path $HlsPath -Filter "*.ts" -File -ErrorAction SilentlyContinue
$deletedTs = 0
$deletedTsSize = 0

foreach ($file in $tsFiles) {
    $age = (Get-Date) - $file.LastWriteTime
    if ($age.TotalHours -gt $MaxAgeHours) {
        $size = $file.Length
        Remove-Item -Path $file.FullName -Force -ErrorAction SilentlyContinue
        $deletedTs++
        $deletedTsSize += $size
    }
}

# Xóa file .m3u8 cũ (trừ các file đang active - modified trong 5 phút gần đây)
$m3u8Files = Get-ChildItem -Path $HlsPath -Filter "*.m3u8" -File -ErrorAction SilentlyContinue
$deletedM3u8 = 0
$deletedM3u8Size = 0

foreach ($file in $m3u8Files) {
    $age = (Get-Date) - $file.LastWriteTime
    # Xóa nếu cũ hơn 1 giờ VÀ không được modify trong 5 phút gần đây
    if ($age.TotalHours -gt $MaxAgeHours -and $age.TotalMinutes -gt 5) {
        $size = $file.Length
        Remove-Item -Path $file.FullName -Force -ErrorAction SilentlyContinue
        $deletedM3u8++
        $deletedM3u8Size += $size
    }
}

# Xóa thư mục rỗng
$emptyDirs = Get-ChildItem -Path $HlsPath -Directory -ErrorAction SilentlyContinue | Where-Object {
    (Get-ChildItem -Path $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0
}

$deletedDirs = 0
foreach ($dir in $emptyDirs) {
    Remove-Item -Path $dir.FullName -Force -ErrorAction SilentlyContinue
    $deletedDirs++
}

# Tính tổng dung lượng đã xóa
$totalDeletedSize = $deletedTsSize + $deletedM3u8Size
$totalDeletedSizeMB = [math]::Round($totalDeletedSize / 1MB, 2)

# Kiểm tra dung lượng còn lại
$disk = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -eq (Split-Path -Qualifier $HlsPath) }
$freeSpaceGB = [math]::Round($disk.Free / 1GB, 2)

# Log kết quả
Write-Log "Đã xóa: $deletedTs file .ts, $deletedM3u8 file .m3u8, $deletedDirs thư mục rỗng"
Write-Log "Dung lượng đã giải phóng: $totalDeletedSizeMB MB"
Write-Log "Dung lượng còn trống: $freeSpaceGB GB"
Write-Log "Cleanup hoàn tất"

# Cảnh báo nếu dung lượng thấp
if ($freeSpaceGB -lt 10) {
    Write-Log "⚠️  CẢNH BÁO: Dung lượng còn lại dưới 10 GB!" "WARNING"
}



