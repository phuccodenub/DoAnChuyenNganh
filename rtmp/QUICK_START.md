# ⚡ Quick Start - Setup Production Livestream

## 🚀 Bước 1: Setup Nginx-RTMP Server (5 phút)

```powershell
# Mở PowerShell as Administrator
cd D:\Code\DoAnChuyenNganh\rtmp
.\setup-production.ps1
```

✅ Script sẽ tự động:
- Tạo thư mục `D:\rtmp\hls`
- Khởi động Docker container
- Mở firewall ports
- Tạo auto-cleanup task

## 🧪 Bước 2: Test (2 phút)

```powershell
# Kiểm tra container
docker ps --filter name=nginx-rtmp

# Test health
curl http://localhost:8080/health
```

## 📺 Bước 3: Stream với OBS

1. Mở OBS → Settings → Stream
2. Service: `Custom...`
3. Server: `rtmp://localhost:1935/live`
4. Stream Key: Lấy từ trang Create Live Stream
5. Start Streaming!

## 🌐 Bước 4: Expose ra Internet (Tùy chọn)

```powershell
# Setup Cloudflare Tunnel
.\setup-cloudflare-tunnel.ps1 -Domain "yourdomain.com"
```

## 📊 Monitor

```powershell
# Monitor real-time
.\monitor.ps1 -Continuous
```

## ✅ Done!

Xem chi tiết: `PRODUCTION_SETUP_GUIDE.md`



