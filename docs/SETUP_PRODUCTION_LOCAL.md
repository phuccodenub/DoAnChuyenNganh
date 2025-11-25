# 🚀 Hướng dẫn Setup Production trên Máy Cá nhân

## ✅ Đánh giá Cấu hình

Máy của bạn **HOÀN TOÀN ĐỦ** để chạy production livestream:

- ✅ **CPU:** Intel i5-12500H (12 cores, 16 threads) - Vượt xa yêu cầu
- ✅ **RAM:** 16 GB - Đủ dùng
- ✅ **Upload Speed:** 396.56 Mbps - **CỰC KỲ TỐT!** (đủ cho ~100 viewers)
- ✅ **Storage:** 71.36 GB trống (D:\) - Đủ dùng
- ✅ **Ping:** 8ms - Cực kỳ thấp

**→ Có thể hỗ trợ 50-100 viewers đồng thời!**

## 📋 Checklist Setup

### 1. Cấu hình Máy

#### Tắt Sleep/Hibernate
```powershell
# PowerShell (Run as Administrator)
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
powercfg /change monitor-timeout-ac 0
```

#### Tắt Windows Update Tự động
1. Settings → Windows Update
2. Pause updates for 7 days (hoặc schedule)
3. Hoặc dùng Group Policy để tắt hoàn toàn

#### Tối ưu Performance
1. Settings → System → Power & battery
2. Chọn "Best performance"
3. Tắt "Battery saver"

### 2. Setup Firewall

```powershell
# PowerShell (Run as Administrator)
# Mở ports cần thiết
New-NetFirewallRule -DisplayName "RTMP" -Direction Inbound -Protocol TCP -LocalPort 1935 -Action Allow
New-NetFirewallRule -DisplayName "HLS HTTP" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
New-NetFirewallRule -DisplayName "Backend API" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### 3. Setup Cloudflare Tunnel (Bảo mật tốt nhất)

#### Bước 1: Cài đặt Cloudflare Tunnel

```powershell
# Download từ: https://github.com/cloudflare/cloudflared/releases
# Hoặc dùng winget:
winget install --id Cloudflare.cloudflared
```

#### Bước 2: Login Cloudflare

```powershell
cloudflared tunnel login
```

#### Bước 3: Tạo Tunnel

```powershell
cloudflared tunnel create livestream
```

#### Bước 4: Tạo Config File

Tạo file: `C:\Users\YourName\.cloudflared\config.yml`

```yaml
tunnel: <tunnel-id>
credentials-file: C:\Users\YourName\.cloudflared\<tunnel-id>.json

ingress:
  # HLS endpoint
  - hostname: livestream.yourdomain.com
    service: http://localhost:8080
  
  # Backend API (nếu cần)
  - hostname: api.yourdomain.com
    service: http://localhost:3000
  
  # Catch-all
  - service: http_status:404
```

#### Bước 5: Route DNS

```powershell
cloudflared tunnel route dns livestream livestream.yourdomain.com
```

#### Bước 6: Chạy Tunnel (Service)

```powershell
# Cài đặt như Windows Service
cloudflared service install
cloudflared service start
```

### 4. Deploy Nginx-RTMP

#### Tạo thư mục trên D:\ (nhiều storage hơn)

```powershell
# Tạo thư mục
New-Item -ItemType Directory -Force -Path D:\rtmp\hls
New-Item -ItemType Directory -Force -Path D:\rtmp\logs

# Copy nginx.conf
Copy-Item rtmp\nginx.conf D:\rtmp\nginx.conf
```

#### Chạy Docker Container

```powershell
docker run -d `
  --name nginx-rtmp `
  --restart unless-stopped `
  -p 1935:1935 `
  -p 8080:8080 `
  -v D:\rtmp\nginx.conf:/etc/nginx/nginx.conf:ro `
  -v D:\rtmp\hls:/mnt/hls `
  tiangolo/nginx-rtmp
```

### 5. Setup Auto-cleanup HLS Files

#### Tạo PowerShell Script

Tạo file: `D:\rtmp\cleanup-hls.ps1`

```powershell
# Xóa file .ts cũ hơn 1 giờ
Get-ChildItem -Path "D:\rtmp\hls" -Filter "*.ts" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddHours(-1) } | 
    Remove-Item -Force

# Xóa file .m3u8 cũ hơn 1 giờ
Get-ChildItem -Path "D:\rtmp\hls" -Filter "*.m3u8" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddHours(-1) } | 
    Remove-Item -Force

Write-Host "Cleanup completed at $(Get-Date)"
```

#### Tạo Scheduled Task

```powershell
# PowerShell (Run as Administrator)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File D:\rtmp\cleanup-hls.ps1"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 365)
Register-ScheduledTask -TaskName "CleanupHLS" -Action $action -Trigger $trigger -RunLevel Highest
```

### 6. Monitoring

#### Tạo Script Monitor

Tạo file: `D:\rtmp\monitor.ps1`

```powershell
# Kiểm tra disk space
$disk = Get-PSDrive D
$freeGB = [math]::Round($disk.Free / 1GB, 2)
Write-Host "D:\ Free Space: $freeGB GB"

# Kiểm tra Docker container
$container = docker ps --filter "name=nginx-rtmp" --format "{{.Status}}"
Write-Host "Nginx-RTMP: $container"

# Kiểm tra Cloudflare Tunnel
$tunnel = Get-Service -Name cloudflared -ErrorAction SilentlyContinue
if ($tunnel) {
    Write-Host "Cloudflare Tunnel: $($tunnel.Status)"
} else {
    Write-Host "Cloudflare Tunnel: Not installed"
}
```

## 🎯 Cấu hình OBS

### Settings cho Production

1. **Stream Settings:**
   - Service: `Custom...`
   - Server: `rtmp://livestream.yourdomain.com/live` (qua Cloudflare Tunnel)
   - Stream Key: Lấy từ trang Create Live Stream

2. **Output Settings:**
   - Encoder: H.264 (x264 hoặc NVENC nếu có GPU)
   - Bitrate: 3500-4500 kbps (CBR)
   - Keyframe Interval: 2s
   - Preset: veryfast hoặc faster

3. **Video Settings:**
   - Base Resolution: 1920x1080
   - Output Resolution: 1280x720 (720p) hoặc 1920x1080 (1080p)
   - FPS: 30

## 📊 Tính toán Capacity

### Với Upload 396 Mbps:

**Tính toán:**
- 1 streamer: 4 Mbps upload
- Upload available: 396 Mbps
- **Số viewers tối đa:** 396 ÷ 4 = **~99 viewers**

**Khuyến nghị:**
- **An toàn:** 50-70 viewers (để dư bandwidth)
- **Tối đa:** 80-100 viewers

### Với CPU 12 cores:

**Tính toán:**
- Nginx-RTMP: 1-2 cores per stream
- **Số streams đồng thời:** 12 ÷ 2 = **6 streams**

**Khuyến nghị:**
- **An toàn:** 3-4 streams đồng thời
- **Tối đa:** 5-6 streams đồng thời

## ⚠️ Lưu ý Quan trọng

### 1. Nhiệt độ

**Laptop gaming có thể nóng khi chạy lâu:**
- Để máy mở nắp
- Dùng quạt tản nhiệt
- Đặt ở nơi thoáng mát
- Monitor nhiệt độ: `Get-WmiObject -Namespace "root\wmi" -Class MSAcpi_ThermalZoneTemperature`

### 2. Điện năng

**Laptop chạy 24/7:**
- Cắm sạc liên tục
- Tắt battery saver
- Cân nhắc chi phí điện (~50-100k/tháng)

### 3. Bảo mật

**Quan trọng khi mở ra internet:**
- ✅ Dùng Cloudflare Tunnel (không cần mở ports)
- ✅ Firewall chặt chẽ
- ✅ Đổi mật khẩu mặc định
- ✅ Update Windows thường xuyên
- ✅ Backup dữ liệu quan trọng

### 4. IP Động

**Nếu không dùng Cloudflare Tunnel:**
- Setup DDNS (No-IP, DuckDNS - miễn phí)
- Hoặc dùng Cloudflare Tunnel (khuyến nghị)

### 5. Uptime

**Máy cá nhân không ổn định như server:**
- Có thể bị restart
- Có thể bị tắt
- Cần có backup plan
- Monitor uptime

## 🚀 Khi nào nên chuyển sang VPS?

### Chuyển sang VPS khi:

1. **Viewers > 100:** Cần bandwidth lớn hơn
2. **Uptime quan trọng:** Cần 99.9% uptime
3. **Nhiều streams:** > 5 streams đồng thời
4. **Business critical:** Cần SLA, support
5. **Máy cá nhân không ổn định:** Restart thường xuyên

### VPS khuyến nghị:

- **Contabo:** ~250k/tháng (4 vCPU, 8GB RAM)
- **Vultr:** ~600k/tháng (4 vCPU, 8GB RAM, tốt hơn)

## 📝 Tóm tắt

### Máy của bạn:
- ✅ **HOÀN TOÀN ĐỦ** cho production 50-100 viewers
- ✅ Upload 396 Mbps → Cực kỳ tốt
- ✅ CPU 12 cores → Xử lý tốt
- ✅ Storage 71 GB → Đủ dùng

### Khuyến nghị:
1. **Bắt đầu với máy cá nhân** (tiết kiệm chi phí)
2. **Setup Cloudflare Tunnel** (bảo mật tốt)
3. **Monitor performance** (disk, CPU, RAM)
4. **Scale lên VPS khi cần** (>100 viewers)

### Next Steps:
1. Setup Cloudflare Tunnel
2. Deploy Nginx-RTMP trên D:\
3. Test với 10-20 viewers
4. Monitor và optimize

