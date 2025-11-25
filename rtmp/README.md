# Hướng dẫn tối ưu Livestream

Tài liệu này mô tả các tối ưu đã được triển khai để đảm bảo livestream mượt mà và ổn định nhất có thể.

## 📋 Mục lục

1. [Cấu hình Nginx-RTMP](#cấu-hình-nginx-rtmp)
2. [Script Cleanup](#script-cleanup)
3. [Tối ưu Frontend](#tối-ưu-frontend)
4. [Tối ưu WebRTC](#tối-ưu-webrtc)
5. [Khởi động Server](#khởi-động-server)

## 🚀 Cấu hình Nginx-RTMP

File `nginx.conf` đã được tối ưu với các cấu hình sau:

### HLS Settings
- **Fragment size**: 2s (giảm latency)
- **Playlist length**: 30s (buffer đủ để chống giật)
- **Cleanup**: Tắt (giữ segment cho client catch up)
- **Continuous**: Bật (giữ playlist liên tục)

### CORS Headers
- Đã cấu hình đầy đủ CORS headers để HLS.js có thể load từ mọi origin
- Hỗ trợ Range requests cho video streaming

## 🧹 Script Cleanup

Để tránh đầy ổ đĩa, sử dụng các script cleanup sau:

### Windows (PowerShell)
```powershell
# Chạy thủ công
.\rtmp\cleanup-hls.ps1

# Hoặc thiết lập Task Scheduler để chạy tự động mỗi 30 phút
```

### Windows (Batch)
```batch
# Chạy thủ công
rtmp\cleanup-hls.bat
```

### Linux/Mac
```bash
# Cấp quyền thực thi
chmod +x rtmp/cleanup-hls.sh

# Chạy thủ công
./rtmp/cleanup-hls.sh

# Hoặc thêm vào crontab (chạy mỗi 30 phút)
*/30 * * * * /path/to/rtmp/cleanup-hls.sh
```

## 🎨 Tối ưu Frontend

### HLS.js Player
- **Low latency mode**: Bật
- **Buffer tuning**: Giảm buffer để giảm độ trễ
- **Retry logic**: Tự động retry khi có lỗi network/media
- **Error recovery**: Tự động recover khi stream bị gián đoạn

### Error Handling
- Hiển thị thông báo lỗi rõ ràng với hướng dẫn khắc phục
- Nút "Thử lại" để retry kết nối
- Loading states với spinner và thông báo

## 📡 Tối ưu WebRTC

### Peer Connection Config
- **ICE candidate pool**: 10 (tăng tốc kết nối)
- **Bundle policy**: max-bundle (giảm số connection)
- **RTCP mux**: require (giảm overhead)

### Codec Optimization
- Ưu tiên VP8/VP9 cho video (tốt hơn H.264 cho real-time)
- Opus cho audio với sample rate 48kHz

### Media Constraints
- Video: 1280x720 @ 30fps (cân bằng chất lượng/latency)
- Audio: 48kHz, 2 channels với echo cancellation

## 🖥️ Khởi động Server

### 1. Khởi động Docker Container

```powershell
# Windows PowerShell
docker run -it --rm `
  -p 1935:1935 -p 8080:8080 `
  -v D:\Code\DoAnChuyenNganh\rtmp\nginx.conf:/etc/nginx/nginx.conf:ro `
  -v D:\Code\DoAnChuyenNganh\rtmp\hls:/mnt/hls `
  tiangolo/nginx-rtmp
```

### 2. Kiểm tra Server

```powershell
# Health check
curl.exe http://localhost:8080/health

# Kiểm tra thư mục HLS
dir D:\Code\DoAnChuyenNganh\rtmp\hls
```

### 3. Cấu hình OBS

1. Mở OBS → Settings → Stream
2. Service: `Custom...`
3. Server: `rtmp://127.0.0.1/live`
4. Stream Key: Lấy từ trang Create Live Stream
5. Output → Encoder: H.264 (x264 hoặc NVENC)
6. Bitrate: 3500-4500 kbps (CBR)
7. Keyframe Interval: 2s

### 4. Test Stream

1. Bấm "Start Streaming" trong OBS
2. Đợi vài giây để HLS segments được tạo
3. Kiểm tra preview trong trang Create Live Stream
4. Nếu thấy video, stream đã hoạt động!

## 🔧 Troubleshooting

### Lỗi CORS
- Đảm bảo container đã restart với file `nginx.conf` mới
- Kiểm tra header CORS: `curl.exe -I http://localhost:8080/hls/test.m3u8`

### Lỗi 404 cho .m3u8
- Đảm bảo OBS đang phát stream
- Kiểm tra stream key có đúng không
- Đợi 5-10 giây sau khi start streaming để file được tạo

### Stream bị giật
- Kiểm tra bitrate OBS (không quá cao so với upload speed)
- Đảm bảo mạng ổn định (dùng dây thay vì WiFi nếu có thể)
- Kiểm tra CPU usage (OBS encoding có thể tốn CPU)

### WebRTC không kết nối
- Kiểm tra STUN servers có accessible không
- Kiểm tra firewall có chặn UDP ports không
- Thử dùng mạng khác (có thể NAT quá strict)

## 📊 Monitoring

### Logs
- Container logs: Xem trong terminal đang chạy `docker run`
- Browser console: F12 → Console để xem HLS.js logs
- Network tab: F12 → Network để xem requests tới HLS server

### Metrics
- Latency: Kiểm tra delay giữa OBS và preview
- Buffer health: Xem trong HLS.js stats (nếu có)
- Connection quality: Xem trong WebRTC stats

## 🎯 Best Practices

1. **Luôn test trước khi go live**: Kiểm tra preview hoạt động tốt
2. **Giữ OBS stream ổn định**: Tránh start/stop liên tục
3. **Monitor disk space**: Chạy cleanup script định kỳ
4. **Sử dụng WebRTC cho low latency**: Khi cần độ trễ thấp nhất
5. **Sử dụng RTMP/HLS cho stability**: Khi cần ổn định hơn

## 📝 Notes

- Tất cả tối ưu này đều **miễn phí** và chạy trên hạ tầng local
- Không cần dịch vụ bên thứ ba hay CDN
- Có thể scale lên production bằng cách deploy nginx-rtmp lên server riêng

