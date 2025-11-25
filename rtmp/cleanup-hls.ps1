# Script tu dong xoa file HLS cu de tranh day o dia
# Chay script nay dinh ky (vi du: moi 30 phut) bang Task Scheduler

param(
    [string]$HlsPath = "",  # Mac dinh dung path trong project
    [int]$MaxAgeMinutes = 30  # Xoa file cu hon 30 phut
)

# Neu khong chi dinh path, dung path trong project
if ([string]::IsNullOrEmpty($HlsPath)) {
    $HlsPath = Join-Path $PSScriptRoot "hls"
}

Write-Host "Bat dau don dep file HLS cu..." -ForegroundColor Cyan
Write-Host "Thu muc: $HlsPath" -ForegroundColor Gray
Write-Host "Xoa file cu hon: $MaxAgeMinutes phut" -ForegroundColor Gray

if (-not (Test-Path $HlsPath)) {
    Write-Host "Thu muc khong ton tai: $HlsPath" -ForegroundColor Red
    exit 1
}

$cutoffTime = (Get-Date).AddMinutes(-$MaxAgeMinutes)
$deletedCount = 0
$deletedSize = 0

Get-ChildItem -Path $HlsPath -File -Recurse | Where-Object {
    $_.LastWriteTime -lt $cutoffTime
} | ForEach-Object {
    $fileSize = $_.Length
    $deletedSize += $fileSize
    $deletedCount++
    Write-Host "Dang xoa: $($_.Name) (Cu hon $([math]::Round(($cutoffTime - $_.LastWriteTime).TotalMinutes, 1)) phut)" -ForegroundColor Yellow
    Remove-Item $_.FullName -Force
}

Write-Host ""
Write-Host "Hoan thanh!" -ForegroundColor Green
Write-Host "Da xoa $deletedCount file(s)" -ForegroundColor Green
$freedMB = [math]::Round($deletedSize / 1MB, 2)
Write-Host "Tong dung luong giai phong: $freedMB MB" -ForegroundColor Green
