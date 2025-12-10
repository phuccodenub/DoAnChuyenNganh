# 🔧 WEBSOCKET FIX TODO - Khắc Phục Triệt Để

> **Ngày tạo**: 2025-12-02  
> **Cập nhật**: 2025-12-02  
> **Trạng thái**: ✅ HOÀN THÀNH CƠ BẢN - Cần test  
> **Ưu tiên**: CRITICAL

---

## 📋 TÓM TẮT VẤN ĐỀ

### Lỗi hiện tại:
```
[WebSocket] Connection error: Error: timeout
WebSocket is closed before the connection is established.
```

### Nguyên nhân gốc:
1. **Multiple Socket Instances**: `useNotificationSocket` tạo socket riêng thay vì dùng `socketService` singleton
2. **Race Condition**: Nhiều socket cố kết nối cùng lúc
3. **Auth Dependency Issue**: NotificationGateway phụ thuộc ChatGateway để auth
4. **Token Refresh Race**: Timeout quá ngắn khi refresh token

---

## ✅ PHASE 1: FIX FRONTEND SOCKET (CRITICAL) - ✅ DONE

### Task 1.1: Refactor `useNotificationSocket.ts` để sử dụng `socketService` ✅
**File**: `frontend/src/hooks/useNotificationSocket.ts`

**Đã thay đổi**:
- ✅ Remove `initializeSocket()` function
- ✅ Remove module-level `socketInstance` variable  
- ✅ Import và sử dụng `socketService`
- ✅ Chỉ register/unregister event listeners, không disconnect
- ⏳ Test kết nối socket sau refactor

---

### Task 1.2: Update `AppProviders.tsx` để quản lý socket lifecycle
**File**: `frontend/src/app/providers/AppProviders.tsx`

**Đã kiểm tra** - file này đã đúng:
- ✅ `socketService.connect()` chỉ gọi 1 lần khi authenticated
- ✅ `socketService.disconnect()` gọi khi logout
- ✅ Không gọi connect nhiều lần

---

### Task 1.3: Thêm connection retry với exponential backoff ✅
**File**: `frontend/src/services/socketService.ts`

**Đã thay đổi**:
- ✅ Tăng timeout khi đợi refresh token (1s → 5s với polling)
- ✅ Tăng timeout khi đợi socket đang connecting (2s → 5s với polling)
- ✅ Log rõ ràng để debug

---

## ✅ PHASE 2: FIX BACKEND GATEWAY (IMPORTANT) - ✅ DONE

### Task 2.1: Đảm bảo auth middleware được apply đúng thứ tự
**File**: `backend/src/server.ts`

**Đã kiểm tra**:
- ✅ ChatGateway khởi tạo TRƯỚC NotificationGateway
- ✅ Auth middleware chạy cho tất cả connections
- ✅ User object được attach đúng cách

---

### Task 2.2: Thêm logging chi tiết ✅
**Files**: 
- `backend/src/modules/notifications/notifications.gateway.ts` ✅
- `backend/src/modules/chat/chat.gateway.ts` ✅

**Đã thay đổi**:
- ✅ Thêm debug logs cho auth
- ✅ Log khi user không có
- ✅ Log khi join room thành công
- ✅ Emit `auth_error` event về client khi auth fail

---

### Task 2.3: Thêm heartbeat mechanism
**File**: Cả frontend và backend

**Checklist**:
- ⏳ Thêm ping/pong events
- ⏳ Handle reconnect khi pong timeout

---

## ✅ PHASE 3: DOCKER SETUP (RECOMMENDED) - ✅ DONE

### Task 3.1: Tạo docker-compose cho development đơn giản ✅
**File**: `docker-compose.dev.yml` (root folder)

**Đã tạo** file `docker-compose.dev.yml` trong root với:
- ✅ Redis service
- ✅ Backend service với hot-reload
- ✅ Volume mounts cho source code

**Cách sử dụng**:
```powershell
# Tạo volume (chỉ 1 lần)
docker volume create lms_redis_dev_data

# Chạy services
docker-compose -f docker-compose.dev.yml up -d

# Xem logs
docker-compose -f docker-compose.dev.yml logs -f
```

---

### Task 3.2: Update backend để gracefully handle Redis unavailable
**File**: `backend/src/config/redis.config.ts`

**Checklist**:
- ⏳ Không crash khi Redis unavailable
- ⏳ Log warning rõ ràng
- ⏳ Fallback to memory cache

---

## ✅ PHASE 4: TESTING & VERIFICATION

### Task 4.1: Tạo component debug Socket status
**File**: `frontend/src/components/debug/SocketStatus.tsx`

**Checklist**:
- ⏳ Tạo component debug
- ⏳ Enable trong AppProviders (dev only)
- ⏳ Hiển thị connection state rõ ràng

---

### Task 4.2: Test scenarios
**Checklist**:
- ⏳ Test login → socket connects
- ⏳ Test page refresh → socket reconnects
- ⏳ Test token refresh → socket stays connected
- ⏳ Test logout → socket disconnects
- ⏳ Test multiple tabs → all tabs have socket
- ⏳ Test network disconnect/reconnect

---

## 📊 PRIORITY ORDER

| Phase | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Phase 1 | 🔴 CRITICAL | Medium | High |
| Phase 2 | 🟠 IMPORTANT | Low | Medium |
| Phase 3 | 🟡 RECOMMENDED | Low | Medium |
| Phase 4 | 🟢 NICE-TO-HAVE | Low | Low |

---

## 🚀 QUICK START

```powershell
# 1. Start Redis với Docker (recommended)
docker run -d --name lms-redis -p 6379:6379 redis:7-alpine

# 2. Start backend
cd backend
npm run dev

# 3. Start frontend
cd frontend  
npm run dev
```

---

## 📝 NOTES

1. **Commit `restructure course`** không ảnh hưởng đến WebSocket - chỉ là move files
2. **Root cause** là multiple socket instances và race conditions
3. **Fix chính** là thống nhất sử dụng `socketService` singleton

---

## 🔗 RELATED FILES

- `frontend/src/hooks/useNotificationSocket.ts` - NEEDS FIX
- `frontend/src/hooks/useLivestreamSocket.ts` - OK (đã dùng socketService)
- `frontend/src/services/socketService.ts` - NEEDS MINOR FIX
- `frontend/src/app/providers/AppProviders.tsx` - OK
- `backend/src/modules/notifications/notifications.gateway.ts` - NEEDS LOGGING
- `backend/src/modules/chat/chat.gateway.ts` - OK (handles auth)
- `backend/src/server.ts` - OK

