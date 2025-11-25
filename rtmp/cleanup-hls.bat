@echo off
REM Script tự động xóa file HLS cũ để tránh đầy ổ đĩa
REM Chạy script này định kỳ bằng Task Scheduler

set "HLS_PATH=D:\Code\DoAnChuyenNganh\rtmp\hls"
set "MAX_AGE_MINUTES=30"

echo Bắt đầu dọn dẹp file HLS cũ...
echo Thư mục: %HLS_PATH%
echo Xóa file cũ hơn: %MAX_AGE_MINUTES% phút

if not exist "%HLS_PATH%" (
    echo Thư mục không tồn tại: %HLS_PATH%
    exit /b 1
)

REM PowerShell command để xóa file cũ
powershell -Command "Get-ChildItem -Path '%HLS_PATH%' -File -Recurse -Include *.m3u8,*.ts | Where-Object { $_.LastWriteTime -lt (Get-Date).AddMinutes(-%MAX_AGE_MINUTES%) } | Remove-Item -Force -Verbose"

echo Hoàn thành!

