## Kế hoạch triển khai Livestream

### 1. Xác định yêu cầu chức năng
- **Use-case**: host (instructor/admin) tạo, quản lý, phát trực tiếp; student xem/ tương tác.
- **Tính năng tối thiểu**: danh sách livestream, trang player, chat realtime, viewer count, ghi hình/recording.

### 2. Backend
1. **Mở rộng schema/model**  
   - Bổ sung trường `thumbnail_url`, `viewer_count`, `category`, `stream_key`, `rtmp_url`, `host_avatar`, `platform` (enum: `internal`, `zoom`, `meet`, ...).  
   - Thiết lập bảng `live_session_viewers`, `live_session_chats`, `live_session_recordings` nếu cần.
2. **API REST**  
   - `GET /live-sessions` (filter status/search/pagination).  
   - `GET /live-sessions/{id}` trả metadata + link stream/recording.  
   - `POST /live-sessions` tạo session => trả `stream_key`/`join_token`.  
   - `POST /live-sessions/{id}/start` / `end`, `DELETE` (cancel).  
   - `GET /live-sessions/{id}/chat` (history).  
   - Optional: `POST /live-sessions/{id}/thumbnail`.
3. **Realtime services**  
   - Socket.IO namespace `livestream:{sessionId}` để join/leave, chat, reactions, viewer count.  
   - WebRTC/RTMP signaling endpoints (tùy chọn stack).  
   - Tracking: lưu viewer duration, chat logs.

### 3. Hạ tầng media
- **Phương án A – WebRTC nội bộ**: triển khai SFU (LiveKit/Janus/mediasoup).  
  - Host: tạo peer connection, publish stream.  
  - Viewer: subscribe qua SFU (sử dụng SDK).  
- **Phương án B – RTMP + HLS**: instructor dùng OBS → RTMP server (nginx-rtmp/Cloudflare Stream).  
  - Backend lưu `stream_key`/`playback_url`.  
  - Frontend dùng `hls.js` để phát.  
- **Recording**: lưu file HLS hoặc WebRTC record → S3/GCS.

### 4. Frontend
1. **Trang Lobby (`/livestream`)**  
   - Hiển thị grid thumbnail (LIVE badge, viewer count, host info).  
   - Tabs/filter/search.  
   - Lấy dữ liệu từ API (không mock).  
2. **Trang chi tiết (`/livestream/:id`)**  
   - Player (WebRTC/HLS) + toolbar (mute, fullscreen).  
   - Sidebar chat realtime, viewer list, emoji.  
   - Thông tin phiên (mô tả, link tài liệu).  
   - Khi host: hiện control start/stop, share screen, record toggle.
3. **Hooks/services**  
   - `useLiveSessions`, `useLiveSession`, `useLiveChat`, `useViewerCount`.  
   - Socket hooks cho chat + realtime stats.  
   - UI components: `LiveCard`, `LivePlayer`, `LiveChat`, `LiveStats`.

### 5. Quy trình
1. Instructor tạo session → nhận stream key/link.  
2. Khi host nhấn “Bắt đầu phát”: gọi `/start`, kết nối media pipeline, emit socket event.  
3. Viewer mở trang → load metadata, join socket, subscribe video stream, chat.  
4. Khi kết thúc → `/end`, lưu recording, cập nhật danh sách.  
5. Cron/worker dọn dẹp sessions quá hạn hoặc ghi log stats.

### 6. Chuẩn bị/DevOps
- **Environment**: config `.env` cho RTMP/WebRTC (STUN/TURN, stream server URL).  
- **CDN/Storage**: chỗ chứa thumbnail + recording.  
- **Monitoring**: logs viewer count, bitrate (nếu dùng WebRTC).  
- **Security**: token bảo mật stream key, kiểm soát ai được host, rate limit chat.  
- **Testing**:  
  - Unit test API.  
  - Integration test socket events.  
  - Manual test player (chrome/firefox/mobile).  
  - Load test viewer concurrency.

### 7. Lộ trình đề xuất
1. Hoàn thiện API + model + mock data → cập nhật lobby UI.  
2. Xây trang player + socket chat (mock data).  
3. Tích hợp media pipeline (WebRTC/RTMP) cho host/viewer.  
4. Bổ sung recording + stats.  
5. Hardening (monitoring, security, scaling).

