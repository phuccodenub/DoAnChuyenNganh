#!/usr/bin/env pwsh
# Script tối ưu Docker images - Giảm từ 1.8GB xuống ~300-400MB

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Docker Image Optimization Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Dừng tất cả container LMS
Write-Host "`n[1/6] Dừng các container LMS đang chạy..." -ForegroundColor Yellow
docker ps -q --filter "name=lms-" | ForEach-Object { docker stop $_ }

# 2. Xóa các container LMS
Write-Host "`n[2/6] Xóa các container LMS..." -ForegroundColor Yellow
docker ps -aq --filter "name=lms-" | ForEach-Object { docker rm -f $_ }

# 3. Xóa các image LMS cũ
Write-Host "`n[3/6] Xóa các image LMS cũ (để build lại từ đầu)..." -ForegroundColor Yellow
$images = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -match "lms-" }
foreach ($img in $images) {
    Write-Host "  Xóa: $img" -ForegroundColor Gray
    docker rmi -f $img 2>$null
}

# 4. Dọn dẹp Docker build cache
Write-Host "`n[4/6] Dọn dẹp Docker build cache..." -ForegroundColor Yellow
docker builder prune -f

# 5. Build lại backend với Dockerfile mới (multi-stage)
Write-Host "`n[5/6] Build lại backend-dev (đã tối ưu)..." -ForegroundColor Yellow
Set-Location -Path $PSScriptRoot\..\..
docker compose -f docker/environments/development/backend-only.yml build --no-cache backend-dev

# 6. Kiểm tra kích thước image mới
Write-Host "`n[6/6] Kiểm tra kích thước image mới..." -ForegroundColor Yellow
docker images | Where-Object { $_ -match "lms-" -or $_ -match "REPOSITORY" }

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Hoàn tất! Kiểm tra RAM usage:" -ForegroundColor Green
Write-Host "  docker stats --no-stream" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green

# Gợi ý khởi động lại
Write-Host "`nĐể khởi động lại hệ thống:" -ForegroundColor Cyan
Write-Host "  docker compose -f docker/environments/development/backend-only.yml up -d" -ForegroundColor White
