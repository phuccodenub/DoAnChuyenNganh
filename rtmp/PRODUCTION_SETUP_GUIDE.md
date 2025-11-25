# 🚀 Hướng dẫn Setup Production Livestream Hoàn chỉnh

## 📋 Tổng quan

Workflow này sẽ setup livestream server production hoàn chỉnh trên máy cá nhân của bạn với:
- ✅ Nginx-RTMP server (Docker)
- ✅ Auto-cleanup HLS files
- ✅ Monitoring tools
- ✅ Cloudflare Tunnel (bảo mật, miễn phí)
- ✅ Tối ưu performance

## 🎯 Yêu cầu

- Windows 10/11
- Docker Desktop đã cài đặt
- PowerShell (Run as Administrator)
- Cloudflare account (miễn phí) - nếu muốn expose ra internet

## 📝 Bước 1: Setup Nginx-RTMP Server

### Chạy script setup tự động:

```powershell
# Mở PowerShell as Administrator
cd D:\Code\DoAnChuyenNganh\rtmp
.\setup-production.ps1
```

Script sẽ tự động:
- ✅ Tạo thư mục `D:\rtmp\hls` và `D:\rtmp\logs`
- ✅ Copy `nginx.conf` tối ưu
- ✅ Khởi động Docker container
- ✅ Mở firewall ports (1935, 8080)
- ✅ Tạo Scheduled Task cho auto-cleanup

### Kiểm tra:

```powershell
# Xem container status
docker ps --filter name=nginx-rtmp

# Test health check
curl http://localhost:8080/health

# Xem logs
docker logs -f nginx-rtmp
```

## 📝 Bước 2: Setup Cloudflare Tunnel (Tùy chọn - Nếu muốn expose ra internet)

### 2.1. Đăng ký Cloudflare (nếu chưa có)

1. Truy cập: https://dash.cloudflare.com/sign-up
2. Đăng ký tài khoản miễn phí
3. Add domain của bạn vào Cloudflare
4. Update DNS nameservers

### 2.2. Chạy script setup tunnel:

```powershell
# Mở PowerShell
cd D:\Code\DoAnChuyenNganh\rtmp
.\setup-cloudflare-tunnel.ps1 -Domain "yourdomain.com"
```

Script sẽ:
- ✅ Cài đặt cloudflared (nếu chưa có)
- ✅ Login Cloudflare
- ✅ Tạo tunnel
- ✅ Tạo config file
- ✅ Route DNS
- ✅ Cài đặt Windows Service

### 2.3. Kiểm tra tunnel:

```powershell
# Xem service status
Get-Service cloudflared

# Xem logs
Get-Content "$env:USERPROFILE\.cloudflared\*.log" -Tail 20
```

### 2.4. Test domain:

```powershell
# Test HLS endpoint
curl https://livestream.yourdomain.com/health
```

## 📝 Bước 3: Cấu hình Environment Variables

### 3.1. Frontend (.env.production):

Tạo file `frontend/.env.production`:

```env
# Local development
VITE_RTMP_SERVER_URL=rtmp://127.0.0.1/live
VITE_HLS_PLAYBACK_BASE=http://localhost:8080/hls

# Production (nếu dùng Cloudflare Tunnel)
# VITE_RTMP_SERVER_URL=rtmp://livestream.yourdomain.com/live
# VITE_HLS_PLAYBACK_BASE=https://livestream.yourdomain.com/hls
```

### 3.2. Backend (.env.development):

Thêm vào `backend/.env.development`:

```env
# RTMP Server
RTMP_SERVER_URL=rtmp://localhost:1935/live
HLS_PLAYBACK_BASE=http://localhost:8080/hls
```

## 📝 Bước 4: Test Livestream

### 4.1. Tạo Live Stream Session:

1. Mở frontend: `http://localhost:5174`
2. Vào trang "Create Live Stream"
3. Chọn "Streaming software"
4. Copy **Server URL** và **Stream Key**

### 4.2. Cấu hình OBS:

1. Mở OBS → Settings → Stream
2. Service: `Custom...`
3. Server: `rtmp://localhost:1935/live` (hoặc domain nếu dùng Cloudflare)
4. Stream Key: Paste stream key từ trang web
5. Output → Encoder: H.264
6. Bitrate: 3500-4500 kbps (CBR)
7. Keyframe Interval: 2s

### 4.3. Start Streaming:

1. Click "Start Streaming" trong OBS
2. Đợi 5-10 giây
3. Kiểm tra preview trên trang web
4. Nếu thấy video → **Thành công!** ✅

## 📝 Bước 5: Monitoring

### 5.1. Monitor Real-time:

```powershell
# Chạy monitor liên tục
cd D:\Code\DoAnChuyenNganh\rtmp
.\monitor.ps1 -Continuous
```

Monitor sẽ hiển thị:
- Container status
- Health check
- HLS files count
- Disk space
- CPU/RAM usage
- Active streams

### 5.2. Monitor một lần:

```powershell
.\monitor.ps1
```

### 5.3. Xem logs:

```powershell
# Docker logs
docker logs -f nginx-rtmp

# Cleanup logs
Get-Content D:\rtmp\logs\cleanup-*.log -Tail 20
```

## 🔧 Troubleshooting

### Container không chạy:

```powershell
# Xem logs
docker logs nginx-rtmp

# Restart container
docker restart nginx-rtmp

# Xem status
docker ps -a --filter name=nginx-rtmp
```

### HLS files không được tạo:

1. Kiểm tra OBS đang stream
2. Kiểm tra stream key đúng
3. Kiểm tra thư mục `D:\rtmp\hls` có quyền ghi
4. Xem logs: `docker logs nginx-rtmp`

### Stream không hiển thị trên web:

1. Kiểm tra HLS file tồn tại:
   ```powershell
   Get-ChildItem D:\rtmp\hls\*.m3u8
   ```

2. Test HLS URL:
   ```powershell
   curl http://localhost:8080/hls/STREAM-KEY.m3u8
   ```

3. Kiểm tra CORS headers:
   ```powershell
   curl -I http://localhost:8080/hls/STREAM-KEY.m3u8
   ```

### Cloudflare Tunnel không kết nối:

1. Kiểm tra service:
   ```powershell
   Get-Service cloudflared
   ```

2. Xem logs:
   ```powershell
   Get-Content "$env:USERPROFILE\.cloudflared\*.log" -Tail 50
   ```

3. Restart service:
   ```powershell
   Restart-Service cloudflared
   ```

### Disk space đầy:

1. Chạy cleanup thủ công:
   ```powershell
   .\cleanup-hls-production.ps1
   ```

2. Kiểm tra Scheduled Task:
   ```powershell
   Get-ScheduledTask -TaskName LivestreamCleanupHLS
   ```

3. Xem disk space:
   ```powershell
   Get-PSDrive D
   ```

## 📊 Performance Tuning

### Tối ưu cho nhiều viewers:

1. **Dùng CDN:** Cloudflare tự động cache (cần config)
2. **Tăng worker processes:** Đã set `auto` trong nginx.conf
3. **Monitor resources:** Dùng `monitor.ps1`

### Tối ưu cho low latency:

1. **HLS fragment:** Đã set `1s` (tối thiểu)
2. **Playlist length:** Đã set `3s` (tối thiểu)
3. **HLS.js config:** Đã tối ưu trong frontend

## 🎯 Workflow Hoàn chỉnh

### Development:
```
1. Chạy setup-production.ps1
2. Start OBS → Stream
3. Test trên localhost
```

### Production:
```
1. Chạy setup-production.ps1
2. Chạy setup-cloudflare-tunnel.ps1
3. Update .env.production
4. Deploy frontend/backend
5. Start OBS → Stream
6. Monitor với monitor.ps1
```

## 📚 Scripts Reference

| Script | Mô tả | Usage |
|--------|-------|-------|
| `setup-production.ps1` | Setup Nginx-RTMP server | `.\setup-production.ps1` |
| `setup-cloudflare-tunnel.ps1` | Setup Cloudflare Tunnel | `.\setup-cloudflare-tunnel.ps1 -Domain "yourdomain.com"` |
| `monitor.ps1` | Monitor server status | `.\monitor.ps1 [-Continuous]` |
| `cleanup-hls-production.ps1` | Cleanup HLS files | Chạy tự động bởi Scheduled Task |

## ✅ Checklist Hoàn thành

- [ ] Docker đã cài đặt
- [ ] Đã chạy `setup-production.ps1`
- [ ] Container đang chạy
- [ ] Health check OK
- [ ] Firewall ports đã mở
- [ ] Scheduled Task đã tạo
- [ ] (Tùy chọn) Cloudflare Tunnel đã setup
- [ ] (Tùy chọn) Domain đã route
- [ ] Environment variables đã config
- [ ] Đã test stream thành công

## 🎉 Hoàn tất!

Bây giờ bạn có thể:
- ✅ Stream từ OBS
- ✅ Xem trên web
- ✅ Monitor server
- ✅ Auto-cleanup files
- ✅ (Tùy chọn) Expose ra internet qua Cloudflare

**Chúc bạn stream vui vẻ! 🚀**



