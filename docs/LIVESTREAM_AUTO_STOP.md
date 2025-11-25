# Livestream Auto-Stop Feature

## 📋 Tổng quan

Tính năng tự động dừng RTMP stream khi session được kết thúc trên hệ thống. Khi instructor kết thúc livestream session (status = "ended"), hệ thống sẽ tự động disconnect RTMP publisher từ OBS, không cần phải dừng OBS thủ công.

## 🔧 Cách hoạt động

### Flow:
1. Instructor click "Kết thúc" trên frontend
2. Frontend gọi API `PUT /api/v1/livestream/:sessionId/status` với `status: "ended"`
3. Backend `updateStatus()` được gọi:
   - Update session status trong database
   - Nếu `ingest_type === 'rtmp'` và có `stream_key`, gọi `dropRTMPStream()`
4. `dropRTMPStream()` gửi HTTP request tới Nginx-RTMP control API:
   - `GET /control/drop/publisher?app=live&name={stream_key}`
5. Nginx-RTMP force disconnect RTMP publisher
6. OBS nhận disconnect signal và dừng stream

## ⚙️ Cấu hình

### Backend Environment Variables

```env
# RTMP Control URL (optional, default: http://localhost:8080/control)
RTMP_CONTROL_URL=http://localhost:8080/control
```

### Nginx-RTMP Configuration

File `rtmp/nginx.conf` đã được cập nhật với control module:

```nginx
location /control {
  rtmp_control all;
  # CORS headers...
}

location /stat {
  rtmp_stat all;
  rtmp_stat_stylesheet stat.xsl;
}
```

## ⚠️ Lưu ý quan trọng

### Nginx-RTMP Control Module

**Vấn đề**: Image `tiangolo/nginx-rtmp` có thể **KHÔNG có control module** compiled sẵn.

**Giải pháp**:

1. **Kiểm tra control module có sẵn không**:
   ```bash
   # Test control API
   curl "http://localhost:8080/control/drop/publisher?app=live&name=test"
   ```

2. **Nếu không có control module**:
   - Option 1: Build custom Nginx-RTMP image với control module
   - Option 2: Sử dụng alternative method (xem bên dưới)
   - Option 3: Fallback - yêu cầu user dừng OBS manually (hiện tại)

3. **Alternative methods** (nếu control module không có):
   - Sử dụng Nginx-RTMP stat module để query active streams
   - Implement external script để drop stream
   - Sử dụng `drop_idle_publisher` directive (đã có trong config)

### Error Handling

Backend đã implement error handling tốt:
- Nếu control API không available, chỉ log warning
- **KHÔNG fail** update status nếu drop stream thất bại
- Session vẫn được update thành "ended" trong database

## 🧪 Testing

### Test Flow:

1. **Tạo RTMP livestream session**:
   ```bash
   POST /api/v1/livestream
   {
     "title": "Test Stream",
     "ingest_type": "rtmp",
     "stream_key": "LS-test123"
   }
   ```

2. **Start OBS với stream key**:
   - Server: `rtmp://127.0.0.1/live`
   - Stream Key: `LS-test123`

3. **Verify stream đang chạy**:
   ```bash
   # Check active streams
   curl "http://localhost:8080/stat"
   ```

4. **End session**:
   ```bash
   PUT /api/v1/livestream/{sessionId}/status
   {
     "status": "ended"
   }
   ```

5. **Verify**:
   - Session status = "ended" ✅
   - OBS tự động disconnect ✅
   - Stream dừng ✅

### Debug Logs

Backend logs sẽ hiển thị:
```
[INFO] RTMP stream dropped for session {sessionId} with stream_key {stream_key}
[INFO] RTMP stream dropped successfully: {result}
```

Nếu có lỗi:
```
[WARN] Could not drop RTMP stream (control module may not be available): {error}
```

## 🔍 Troubleshooting

### Vấn đề: OBS không tự động dừng

**Nguyên nhân có thể**:
1. Control module không có trong Nginx-RTMP image
2. Control API không accessible
3. Stream key không khớp

**Giải pháp**:

1. **Kiểm tra control module**:
   ```bash
   # Test control endpoint
   curl "http://localhost:8080/control/drop/publisher?app=live&name=test"
   # Nếu trả về 404 hoặc error → control module không có
   ```

2. **Kiểm tra logs**:
   ```bash
   # Backend logs
   docker logs lms-backend-dev | grep "RTMP stream"
   
   # Nginx logs
   docker logs nginx-rtmp
   ```

3. **Fallback**: Dừng OBS manually (tính năng vẫn hoạt động, chỉ không tự động)

### Vấn đề: Control API trả về 404

**Giải pháp**:
- Build custom Nginx-RTMP image với control module
- Hoặc sử dụng alternative method (implement sau)

## 📚 References

- [Nginx-RTMP Control Module](https://github.com/arut/nginx-rtmp-module/wiki/Control-module)
- [Nginx-RTMP Stat Module](https://github.com/arut/nginx-rtmp-module/wiki/Directives#rtmp_stat)
- [Drop Publisher API](https://github.com/arut/nginx-rtmp-module/wiki/Control-module#drop-publisher)

## 🚀 Future Improvements

1. **Build custom Nginx-RTMP image** với control module
2. **Implement alternative drop method** nếu control module không có
3. **Add retry logic** cho drop stream request
4. **Add monitoring** để track drop success rate
5. **Add notification** cho instructor khi stream được drop thành công

