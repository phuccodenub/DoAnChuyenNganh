#!/bin/bash
# Script tự động xóa file HLS cũ để tránh đầy ổ đĩa
# Chạy script này định kỳ bằng cron: */30 * * * * /path/to/cleanup-hls.sh

HLS_PATH="${HLS_PATH:-/mnt/hls}"
MAX_AGE_MINUTES="${MAX_AGE_MINUTES:-30}"

echo "Bắt đầu dọn dẹp file HLS cũ..."
echo "Thư mục: $HLS_PATH"
echo "Xóa file cũ hơn: $MAX_AGE_MINUTES phút"

if [ ! -d "$HLS_PATH" ]; then
    echo "Thư mục không tồn tại: $HLS_PATH"
    exit 1
fi

# Tìm và xóa file cũ hơn MAX_AGE_MINUTES phút
find "$HLS_PATH" -type f \( -name "*.m3u8" -o -name "*.ts" \) -mmin +$MAX_AGE_MINUTES -delete -print | while read file; do
    echo "Đã xóa: $file"
done

echo "Hoàn thành!"

