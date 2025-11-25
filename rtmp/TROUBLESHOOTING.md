# 🔧 Troubleshooting Livestream Server

## ❌ Container đang "Restarting"

### Nguyên nhân:
1. **Docker Desktop chưa chạy** hoặc đã tắt
2. **nginx.conf có lỗi** (đã sửa - bỏ `aio` và `directio`)

### Giải pháp:

#### Bước 1: Khởi động Docker Desktop
1. Mở Docker Desktop
2. Đợi Docker khởi động hoàn toàn (icon Docker ở system tray không còn loading)

#### Bước 2: Restart container

```powershell
# Dừng container cũ
docker stop nginx-rtmp
docker rm nginx-rtmp

# Copy nginx.conf đã sửa
Copy-Item D:\Code\DoAnChuyenNganh\rtmp\nginx.conf D:\rtmp\nginx.conf -Force

# Chạy lại container
docker run -d `
  --name nginx-rtmp `
  --restart unless-stopped `
  -p 1935:1935 `
  -p 8080:8080 `
  -v D:\rtmp\nginx.conf:/etc/nginx/nginx.conf:ro `
  -v D:\rtmp\hls:/mnt/hls `
  tiangolo/nginx-rtmp
```

#### Bước 3: Kiểm tra logs

```powershell
# Xem logs để tìm lỗi
docker logs nginx-rtmp

# Xem logs real-time
docker logs -f nginx-rtmp
```

#### Bước 4: Test

```powershell
# Kiểm tra container status
docker ps --filter name=nginx-rtmp

# Test health check
curl http://localhost:8080/health
```

## ✅ Container chạy nhưng không kết nối được

### Kiểm tra:
1. **Ports đã mở chưa:**
   ```powershell
   Get-NetFirewallRule -DisplayName "RTMP"
   Get-NetFirewallRule -DisplayName "HLS-HTTP"
   ```

2. **Ports đã được bind chưa:**
   ```powershell
   netstat -an | findstr "1935"
   netstat -an | findstr "8080"
   ```

3. **Container đang listen:**
   ```powershell
   docker exec nginx-rtmp netstat -tuln
   ```

## 🔍 Debug nginx.conf

### Test cấu hình:

```powershell
# Vào trong container
docker exec -it nginx-rtmp sh

# Test nginx config
nginx -t

# Xem nginx config
cat /etc/nginx/nginx.conf
```

### Lỗi thường gặp:

1. **"aio" directive không được support**
   - ✅ Đã sửa: Bỏ `aio on;` và `directio 512;`

2. **"directio" directive không được support**
   - ✅ Đã sửa: Bỏ `directio 512;`

3. **Permission denied cho /mnt/hls**
   - Kiểm tra quyền thư mục: `D:\rtmp\hls` phải có quyền ghi

## 🚀 Quick Fix Script

Tạo file `fix-container.ps1`:

```powershell
# Dừng và xóa container
docker stop nginx-rtmp 2>$null
docker rm nginx-rtmp 2>$null

# Copy config mới
Copy-Item D:\Code\DoAnChuyenNganh\rtmp\nginx.conf D:\rtmp\nginx.conf -Force

# Chạy lại
docker run -d `
  --name nginx-rtmp `
  --restart unless-stopped `
  -p 1935:1935 `
  -p 8080:8080 `
  -v D:\rtmp\nginx.conf:/etc/nginx/nginx.conf:ro `
  -v D:\rtmp\hls:/mnt/hls `
  tiangolo/nginx-rtmp

# Đợi và kiểm tra
Start-Sleep -Seconds 3
docker ps --filter name=nginx-rtmp
curl http://localhost:8080/health
```



