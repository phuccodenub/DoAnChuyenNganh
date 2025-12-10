# 📡 BÁO CÁO WEBSOCKET - HỆ THỐNG LMS

> **Ngày tạo**: 2025-12-03  
> **Phiên bản**: 3.0 (Passive Hook Architecture)  
> **Trạng thái**: ✅ Đã tối ưu hoàn toàn

---

## 📋 MỤC LỤC

1. [Tổng quan WebSocket trong LMS](#1-tổng-quan-websocket-trong-lms)
2. [Kiến trúc hiện tại](#2-kiến-trúc-hiện-tại)
3. [Các vấn đề đã khắc phục](#3-các-vấn-đề-đã-khắc-phục)
4. [Hướng dẫn sử dụng](#4-hướng-dẫn-sử-dụng)
5. [Các chức năng sử dụng WebSocket](#5-các-chức-năng-sử-dụng-websocket)
6. [Best Practices](#6-best-practices)
7. [Troubleshooting](#7-troubleshooting)
8. [File Reference](#8-file-reference)

---

## 1. TỔNG QUAN WEBSOCKET TRONG LMS

### 1.1 WebSocket là gì?

WebSocket là giao thức kết nối 2 chiều (bi-directional) giữa client và server, cho phép:
- Server push data đến client mà không cần client request
- Real-time communication với độ trễ thấp
- Persistent connection (không cần reconnect mỗi lần gửi message)

### 1.2 Tại sao LMS cần WebSocket?

LMS sử dụng WebSocket (qua Socket.IO) cho các tính năng real-time:

| Tính năng | Lý do cần real-time |
|-----------|---------------------|
| **Chat** | Tin nhắn hiển thị ngay khi gửi |
| **Notifications** | Thông báo mới xuất hiện ngay lập tức |
| **Livestream** | Viewer count, chat, reactions real-time |
| **Quiz tương tác** | Bảng xếp hạng cập nhật live |
| **Typing indicators** | Hiển thị ai đang gõ |

### 1.3 Socket.IO vs Native WebSocket

LMS sử dụng **Socket.IO** thay vì WebSocket thuần vì:
- ✅ Auto-reconnection với exponential backoff
- ✅ Fallback to HTTP long-polling nếu WebSocket fail
- ✅ Rooms & namespaces cho group messaging
- ✅ Event-based API dễ sử dụng
- ✅ Binary streaming support

---

## 2. KIẾN TRÚC HIỆN TẠI

### 2.1 Sơ đồ kiến trúc (v3.0 - Passive Hooks)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AppProviders (Connection Owner)             │    │
│  │      - ONLY place that initiates connection             │    │
│  │      - socketService.connectNonBlocking()               │    │
│  └─────────────────┬───────────────────────────────────────┘    │
│                    │                                             │
│  ┌─────────────────▼───────────────────────────────────────┐    │
│  │              socketService (Singleton)                   │    │
│  │  - connect() / connectNonBlocking()                     │    │
│  │  - disconnect()                                         │    │
│  │  - emit() / on() / off()                               │    │
│  │  - onConnect() / offConnect() (Event Callbacks)        │    │
│  │  - getSocket() / getSocketIfConnected()                │    │
│  └─────────────────┬───────────────────────────────────────┘    │
│                    │                                             │
│       ┌────────────┼────────────────────────────────┐           │
│       │            │                                │           │
│       ▼            ▼                                ▼           │
│  ┌─────────┐  ┌─────────────────┐  ┌──────────────────────┐    │
│  │ useNoti │  │ useLivestream   │  │    webrtcService     │    │
│  │ Socket  │  │    Socket       │  │                      │    │
│  │(PASSIVE)│  │   (PASSIVE)     │  │                      │    │
│  └────┬────┘  └────────┬────────┘  └──────────┬───────────┘    │
│       │                │                       │                 │
│       ▼                ▼                       ▼                 │
│  ┌─────────┐  ┌─────────────────┐  ┌──────────────────────┐    │
│  │Notifica-│  │  Livestream     │  │  WebRTC Pages        │    │
│  │tion     │  │  Pages          │  │                      │    │
│  │ Panel   │  │                 │  │                      │    │
│  └─────────┘  └─────────────────┘  └──────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Socket.IO Connection
                              │ (WebSocket + Polling fallback)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Socket.IO Server (io)                       │    │
│  │              - Auth middleware                           │    │
│  │              - Connection management                     │    │
│  └─────────────────┬───────────────────────────────────────┘    │
│                    │                                             │
│       ┌────────────┼────────────────────────────────┐           │
│       │            │            │           │       │           │
│       ▼            ▼            ▼           ▼       ▼           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐    │
│  │  Chat   │  │Notifica-│  │Livestr- │  │  WebRTC  │Conver│    │
│  │ Gateway │  │  tion   │  │  eam    │  │ Gateway  │sation│    │
│  │         │  │ Gateway │  │ Gateway │  │          │      │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Passive Hook Architecture (v3.0 - NEW!)

**Nguyên tắc quan trọng:** Hooks KHÔNG bao giờ khởi tạo connection!

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSIVE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AppProviders (OWNER)                                           │
│  ├── Token available?                                           │
│  │   ├── YES → socketService.connectNonBlocking()               │
│  │   └── NO  → Do nothing                                       │
│  │                                                               │
│  useNotificationSocket (PASSIVE LISTENER)                       │
│  ├── NEVER calls connectNonBlocking()                           │
│  ├── Check: socketService.getSocketIfConnected()                │
│  │   ├── Connected → Setup listeners immediately               │
│  │   └── Not yet → Subscribe via onConnect()                   │
│  └── When connection happens → Listeners activate              │
│                                                                  │
│  useLivestreamSocket (PASSIVE LISTENER)                         │
│  └── Same pattern as above                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

RESULT:
✅ Pages without socket needs (courses, lessons) → Render INSTANTLY
✅ Socket connects in background → Doesn't block anything
✅ When socket ready → Real-time features automatically activate
```

### 2.3 Singleton Pattern

**`socketService`** là singleton - chỉ có 1 instance socket cho toàn bộ app:

```typescript
// ✅ ĐÚNG - Sử dụng singleton
import { socketService } from '@/services/socketService';
socketService.connect();

// ❌ SAI - Tạo socket riêng
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000'); // KHÔNG LÀM THẾ NÀY!
```

### 2.4 Non-Blocking + Passive Architecture

Từ phiên bản 3.0, WebSocket sử dụng kiến trúc **passive hooks**:

```
TRƯỚC (v1.0 - Blocking):
[User Login] → [Wait Socket 5-10s] → [Render Dashboard] ❌ Very Slow

TRƯỚC (v2.0 - Non-blocking but still initiating):
[Any Page] → [Hook calls connectNonBlocking()] → [Still affects render] ❌ Slow

SAU (v3.0 - Passive):
[AppProviders] → [connectNonBlocking() once]
[Any Page] → [Hook just subscribes] → [Render INSTANTLY] ✅ Fast
[Socket connects] → [Hooks get notified] → [Real-time activates]
```

---

## 3. CÁC VẤN ĐỀ ĐÃ KHẮC PHỤC

### 3.1 Multiple Socket Instances (Fixed ✅)

**Vấn đề:**
```typescript
// useNotificationSocket.ts (CŨ - SAI)
let socketInstance: Socket | null = null;

function initializeSocket(token: string): Socket {
  socketInstance = io(wsUrl, {...}); // Tạo socket MỚI mỗi lần!
}
```

**Hậu quả:**
- 2-3 socket connections cùng lúc
- Race conditions
- Timeout errors

**Giải pháp:**
```typescript
// useNotificationSocket.ts (MỚI - ĐÚNG)
import { socketService } from '@/services/socketService';

// Sử dụng singleton, không tạo socket mới
const socket = socketService.getSocketIfConnected();
```

### 3.2 Blocking UI During Connection (Fixed ✅)

**Vấn đề:**
```typescript
// CŨ - Block UI
const socket = await socketService.connect(); // Đợi 5-10 giây!
if (socket) {
  setupListeners(socket);
}
```

**Giải pháp:**
```typescript
// MỚI - Non-blocking
// 1. Dùng socket hiện có nếu đã connected
const existingSocket = socketService.getSocketIfConnected();
if (existingSocket) {
  setupListeners(existingSocket);
}

// 2. Subscribe để setup khi connected trong tương lai
socketService.onConnect(() => {
  const socket = socketService.getSocket();
  if (socket) setupListeners(socket);
});

// 3. Khởi tạo connection trong background
socketService.connectNonBlocking();
```

### 3.3 Token Refresh Race Condition (Fixed ✅)

**Vấn đề:**
- Nhiều components gọi `connect()` cùng lúc
- Token refresh chỉ đợi 1 giây → fail

**Giải pháp:**
- Tăng wait time lên 5 giây với polling loop
- Sử dụng `isRefreshing` flag để tránh multiple refresh

### 3.4 Backend Auth Logging (Fixed ✅)

**Thêm logging chi tiết:**
- ChatGateway: Log auth success/failure
- NotificationGateway: Log connection với user info
- Emit `auth_error` event về client khi fail

---

## 4. HƯỚNG DẪN SỬ DỤNG

### 4.1 Kết nối Socket (cho Developers)

```typescript
// ✅ Cách 1: Non-blocking (recommended)
socketService.connectNonBlocking();

// ✅ Cách 2: Blocking (chỉ khi BẮT BUỘC phải có socket)
const socket = await socketService.connect();
```

### 4.2 Lắng nghe events

```typescript
// Cách 1: Sử dụng hook có sẵn
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

function MyComponent() {
  const { isConnected, emit } = useNotificationSocket(true);
  
  // isConnected: boolean - socket đã connected chưa
  // emit: function - gửi event đến server
}
```

```typescript
// Cách 2: Sử dụng socketService trực tiếp
import { socketService } from '@/services/socketService';

// Lắng nghe event
socketService.on('notification:new', (data) => {
  console.log('New notification:', data);
});

// Gửi event
socketService.emit('notification:mark-read', { notificationId: '123' });

// Hủy lắng nghe
socketService.off('notification:new');
```

### 4.3 Subscribe Connection State

```typescript
// Được thông báo khi socket connected
socketService.onConnect(() => {
  console.log('Socket connected!');
});

// Được thông báo khi socket disconnected
socketService.onDisconnect(() => {
  console.log('Socket disconnected!');
});

// Cleanup
socketService.offConnect(myCallback);
socketService.offDisconnect(myCallback);
```

### 4.4 Kiểm tra trạng thái

```typescript
// Kiểm tra đã connected chưa
const isConnected = socketService.isConnected();

// Lấy socket (có thể null nếu chưa connected)
const socket = socketService.getSocket();

// Lấy socket CHỈ KHI đã connected (không đợi)
const socket = socketService.getSocketIfConnected();
```

---

## 5. CÁC CHỨC NĂNG SỬ DỤNG WEBSOCKET

### 5.1 Notifications (Real-time)

| Event | Direction | Mô tả |
|-------|-----------|-------|
| `notification:new` | Server → Client | Thông báo mới |
| `notification:count` | Server → Client | Update số unread |
| `notification:read` | Server → Client | Notification đã đọc |
| `notification:mark-read` | Client → Server | Đánh dấu đã đọc |
| `notification:mark-all-read` | Client → Server | Đánh dấu tất cả đã đọc |

**Fallback:** Nếu socket không available, notifications vẫn load từ API và hiển thị.

### 5.2 Chat (Real-time)

| Event | Direction | Mô tả |
|-------|-----------|-------|
| `join-room` | Client → Server | Join course chat room |
| `leave-room` | Client → Server | Leave chat room |
| `chat:message` | Bidirectional | Tin nhắn mới |
| `chat:typing` | Client → Server | Đang gõ |
| `chat:typing-stop` | Client → Server | Ngừng gõ |
| `user:online` | Server → Client | User online |
| `user:offline` | Server → Client | User offline |

### 5.3 Livestream (Real-time)

| Event | Direction | Mô tả |
|-------|-----------|-------|
| `livestream:join_session` | Client → Server | Join live session |
| `livestream:leave_session` | Client → Server | Leave session |
| `livestream:send_message` | Client → Server | Gửi chat |
| `livestream:new_message` | Server → Client | Nhận chat |
| `livestream:viewer_count_updated` | Server → Client | Update viewer count |
| `livestream:reaction_received` | Server → Client | Nhận reaction |
| `livestream:session_ended` | Server → Client | Session kết thúc |

### 5.4 WebRTC (Required Socket)

WebRTC **BẮT BUỘC** phải có socket để hoạt động:

| Event | Direction | Mô tả |
|-------|-----------|-------|
| `webrtc:join_session` | Client → Server | Join WebRTC session |
| `webrtc:offer` | Bidirectional | SDP Offer |
| `webrtc:answer` | Bidirectional | SDP Answer |
| `webrtc:ice_candidate` | Bidirectional | ICE Candidate |
| `webrtc:toggle_audio` | Client → Server | Bật/tắt audio |
| `webrtc:toggle_video` | Client → Server | Bật/tắt video |

---

## 6. BEST PRACTICES

### 6.1 ✅ NÊN LÀM

```typescript
// 1. Sử dụng non-blocking connect
socketService.connectNonBlocking();

// 2. Cleanup listeners khi unmount
useEffect(() => {
  const handler = (data) => console.log(data);
  socketService.on('event', handler);
  
  return () => {
    socketService.off('event', handler);
  };
}, []);

// 3. Check connected trước khi emit
if (socketService.isConnected()) {
  socketService.emit('my-event', data);
}

// 4. Fallback to API nếu socket không available
const { data } = useNotifications(); // API data
useNotificationSocket(true); // Real-time enhancement
```

### 6.2 ❌ KHÔNG NÊN LÀM

```typescript
// 1. KHÔNG tạo socket riêng
const socket = io('http://localhost:3000'); // ❌

// 2. KHÔNG await connect() trong render path
await socketService.connect(); // ❌ Block UI

// 3. KHÔNG quên cleanup listeners
socketService.on('event', handler); // ❌ Memory leak

// 4. KHÔNG emit khi chưa connected
socketService.emit('event', data); // ❌ Silent fail
```

### 6.3 Feature Degradation

Thiết kế features để hoạt động CÓ VÀ KHÔNG CÓ socket:

```typescript
// ✅ ĐÚNG: API first, socket enhancement
function NotificationPanel() {
  // 1. Data từ API (luôn hoạt động)
  const { data, isLoading } = useNotifications();
  
  // 2. Real-time updates (enhancement)
  useNotificationSocket(true);
  
  // 3. Render với API data
  return <NotificationList notifications={data} />;
}
```

---

## 7. TROUBLESHOOTING

### 7.1 Socket không connect

**Triệu chứng:** Console log `[SocketService] ❌ Connection error`

**Kiểm tra:**
1. Backend có đang chạy không?
2. `VITE_WS_URL` trong `.env` đúng chưa?
3. Token có hợp lệ không?
4. Redis có đang chạy không? (Backend cần Redis)

**Debug:**
```typescript
// Bật debug logging
localStorage.setItem('DEBUG', 'socket.io-client:*');
```

### 7.2 Multiple socket connections

**Triệu chứng:** Console hiện nhiều `[SocketService] Connected` cùng lúc

**Nguyên nhân:** Component tạo socket riêng thay vì dùng singleton

**Giải pháp:** Kiểm tra không có `io()` trực tiếp trong code

### 7.3 Events không nhận được

**Triệu chứng:** Client emit nhưng server không nhận, hoặc ngược lại

**Kiểm tra:**
1. Event name có đúng không? (case-sensitive)
2. Socket đã connected chưa?
3. User đã join đúng room chưa?
4. Backend gateway có đăng ký event không?

### 7.4 Auth error

**Triệu chứng:** Console log `[SocketService] Authentication error`

**Kiểm tra:**
1. Token có expired không?
2. JWT_SECRET backend có đúng không?
3. Token format có đúng không? (`Bearer xxx` vs `xxx`)

---

## 8. FILE REFERENCE

### 8.1 Frontend

| File | Mô tả |
|------|-------|
| `services/socketService.ts` | Singleton socket service |
| `hooks/useNotificationSocket.ts` | Hook cho notifications |
| `hooks/useLivestreamSocket.ts` | Hook cho livestream |
| `services/webrtcService.ts` | WebRTC với socket signaling |
| `app/providers/AppProviders.tsx` | Socket lifecycle management |
| `components/notifications/NotificationPanel.tsx` | Notification UI |

### 8.2 Backend

| File | Mô tả |
|------|-------|
| `server.ts` | Socket.IO server initialization |
| `modules/chat/chat.gateway.ts` | Chat + Auth middleware |
| `modules/notifications/notifications.gateway.ts` | Notification events |
| `modules/livestream/livestream.gateway.ts` | Livestream events |
| `modules/webrtc/webrtc.gateway.ts` | WebRTC signaling |
| `modules/conversation/conversation.gateway.ts` | DM events |

### 8.3 Documentation

| File | Mô tả |
|------|-------|
| `docs/WEBSOCKET_REPORT.md` | File này |
| `docs/WEBSOCKET_FIX_TODO.md` | TODO list các fixes |
| `docs/WEBSOCKET_NON_BLOCKING_FIX.md` | Non-blocking architecture |

---

## 📊 CHANGELOG

### v3.0 (2025-12-03) - Passive Hook Architecture
- ✅ **BREAKING**: Hooks no longer initiate connections
- ✅ All hooks are now PASSIVE listeners
- ✅ Only `AppProviders` manages connection lifecycle
- ✅ Pages without socket needs render INSTANTLY
- ✅ `useNotificationSocket` is passive (just subscribes)
- ✅ `useLivestreamSocket` is passive (just subscribes)
- ✅ Socket connection doesn't block ANY page

### v2.0 (2025-12-03) - Non-Blocking Architecture
- ✅ Refactor to non-blocking architecture
- ✅ Add `connectNonBlocking()` method
- ✅ Add `onConnect()`/`offConnect()` callbacks
- ✅ Add `getSocketIfConnected()` method
- ✅ Fix multiple socket instances
- ✅ Fix token refresh race condition
- ✅ Add detailed backend logging

### v1.0 (Initial)
- Socket.IO integration
- Basic chat, notifications, livestream
- Blocking connection

---

## 🔗 RELATED DOCS

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [React Query Integration](https://tanstack.com/query/latest)
- [WebRTC Architecture](./LIVESTREAM_ARCHITECTURE.md)
