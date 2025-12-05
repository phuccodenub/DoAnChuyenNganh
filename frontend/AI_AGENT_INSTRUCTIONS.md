# 🤖 HƯỚNG DẪN CHO AI AGENTS - DỰ ÁN LMS

> **Tài liệu ngắn gọn cho AI Agents làm việc với dự án LMS**

---

## 🚀 CÁCH CHẠY DỰ ÁN (QUAN TRỌNG!)

### ⚠️ DỰ ÁN CHẠY BẰNG DOCKER - KHÔNG CHẠY TRỰC TIẾP

```powershell
# ĐÚNG: Chạy full-stack (Frontend + Backend + Redis + Postgres)
npm run dev:web

# ĐÚNG: Chỉ backend (dùng khi phát triển frontend riêng với Vite)
npm run dev:api
cd frontend && npm run dev  # Frontend chạy trên port 5174
```

### ❌ SAI - KHÔNG LÀM ĐIỀU NÀY
```powershell
# SAI: Không chạy trực tiếp npm run dev ở backend!
cd backend && npm run dev  # ← KHÔNG HOẠT ĐỘNG vì thiếu Redis, Postgres
```

### 📊 Ports mặc định
| Service | Port | URL |
|---------|------|-----|
| Frontend (Docker nginx) | 3001 | http://localhost:3001 |
| Frontend (Vite dev) | 5174 | http://localhost:5174 |
| Backend API | 3000 | http://localhost:3000/api/v1.3.0 |
| PostgreSQL | 5432 | - |
| Redis | 6379 | - |

---

## 📋 KIỂM TRA LOGS (QUAN TRỌNG!)

### Backend Logs (trong Docker)
```powershell
# Xem logs realtime
docker logs lms-backend-dev -f

# Xem 50 dòng cuối
docker logs lms-backend-dev --tail 50

# Tìm lỗi cụ thể
docker logs lms-backend-dev 2>&1 | Select-String -Pattern "error|Error|ERROR"

# Tìm theo keyword
docker logs lms-backend-dev 2>&1 | Select-String -Pattern "conversation|chat"
```

### Frontend Logs (nginx)
```powershell
docker logs lms-frontend-dev -f
```

### Kiểm tra trạng thái containers
```powershell
docker ps  # Xem containers đang chạy
docker ps -a  # Xem tất cả (kể cả đã dừng)
```

### Restart services
```powershell
# Restart backend
docker-compose -p lms -f docker/environments/development/full-stack.yml restart backend-dev

# Restart tất cả
docker-compose -p lms -f docker/environments/development/full-stack.yml restart
```

---

## 🏗️ CẤU TRÚC DỰ ÁN

```
H:\DACN\
├── backend/                    # NestJS-like Express API
│   ├── src/
│   │   ├── api/               # Routes (v1, v1.3.0)
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── course/       # Courses
│   │   │   ├── chat/         # Course chat (Socket.IO)
│   │   │   ├── conversation/ # DM chat (Socket.IO)
│   │   │   ├── notifications/# Realtime notifications
│   │   │   └── ...
│   │   ├── models/           # Sequelize models
│   │   ├── middlewares/      # Auth, validation, etc.
│   │   └── utils/            # Helpers
│   └── .env                  # Environment (DATABASE_URL to Supabase)
│
├── frontend/                  # React + Vite + TypeScript
│   ├── src/
│   │   ├── app/              # App setup, providers
│   │   ├── features/         # Feature-based modules
│   │   ├── components/       # Shared components
│   │   ├── services/         # API clients
│   │   └── hooks/            # Custom hooks
│   └── vite.config.ts
│
├── docker/
│   └── environments/
│       └── development/
│           ├── full-stack.yml    # Full development
│           └── backend-only.yml  # Backend only
│
└── docs/                      # Documentation
```

---

## 🔌 API & AUTHENTICATION

### API Base URL
- Docker: `http://localhost:3001/api/v1.3.0` (qua nginx proxy)
- Vite dev: `http://localhost:5174/api/v1.3.0` (qua Vite proxy)
- Direct: `http://localhost:3000/api/v1.3.0`

### JWT Token
```typescript
// Token payload structure
interface JWTPayload {
  userId: string;    // ← Dùng userId, KHÔNG phải id
  email: string;
  role: string;
}

// Trong controller, lấy user từ request:
const userId = req.user.userId;  // ✅ ĐÚNG
const userId = req.user.id;      // ❌ SAI
```

### Test API
```powershell
# Health check
curl http://localhost:3001/health

# Get courses
curl http://localhost:3001/api/v1.3.0/courses

# Với authentication
$token = "eyJ..."
curl -H "Authorization: Bearer $token" http://localhost:3001/api/v1.3.0/users/profile
```

---

## 🔌 SOCKET.IO

### Connection
```typescript
// Frontend kết nối qua window.location.origin
// Docker: ws://localhost:3001/socket.io
// Vite:   ws://localhost:5174/socket.io
```

### Gateways
| Gateway | Purpose | Events |
|---------|---------|--------|
| ChatGateway | Course discussions | `message:new`, `typing`, etc. |
| ConversationGateway | DM between users | `dm:new`, `dm:read`, etc. |
| NotificationGateway | Realtime notifications | `notification:new`, etc. |

---

## ✅ QUY TẮC CODE

### TypeScript
- **KHÔNG dùng `any`** trừ khi thực sự cần thiết
- Định nghĩa interface cho tất cả API responses
- Type-check: `npm run type-check` (frontend), `npm run lint` (backend)

### Ngôn ngữ UI
- **100% TIẾNG VIỆT** cho tất cả text hiển thị
- Sử dụng i18n với default locale `vi`

### Trước khi commit
```powershell
# Frontend
cd frontend
npm run type-check
npm run lint

# Backend
cd backend
npm run lint
```

---

## 🐛 DEBUG COMMON ISSUES

### 1. API trả về 404
```powershell
# Kiểm tra route có được đăng ký không
docker logs lms-backend-dev 2>&1 | Select-String "Registering"
```

### 2. API trả về 500 "User not found"
- Kiểm tra `req.user.userId` (không phải `req.user.id`)
- Xem logs để biết userId có được decode đúng không

### 3. Socket không kết nối
```powershell
# Test socket từ bên trong container
docker exec lms-backend-dev curl "http://127.0.0.1:3000/socket.io/?EIO=4&transport=polling"
```

### 4. Database errors
```powershell
# Xem logs Sequelize
docker logs lms-backend-dev 2>&1 | Select-String "Sequelize|Database|SQL"
```

### 5. CORS errors
- Kiểm tra `CORS_ALLOWED_ORIGINS` trong docker-compose
- Ports 3000, 3001, 5174 cần được cho phép

---

## 📚 FILES QUAN TRỌNG

| File | Mô tả |
|------|-------|
| `backend/src/api/v1/routes/index.ts` | Đăng ký tất cả API routes |
| `backend/src/middlewares/auth.middleware.ts` | JWT authentication |
| `backend/src/config/jwt.config.ts` | JWT payload structure |
| `frontend/src/services/http/client.ts` | Axios client setup |
| `frontend/src/services/socketService.ts` | Socket.IO client |
| `docker/environments/development/full-stack.yml` | Docker compose |

---

## 🎯 WORKFLOW CHO AI

1. **Đọc logs trước** khi debug
2. **Dùng Docker commands** để kiểm tra, KHÔNG chạy trực tiếp
3. **Kiểm tra JWT payload** khi có lỗi authentication
4. **Test API bằng curl** trước khi sửa code
5. **Restart container** sau khi sửa backend code

---

*Last updated: 2025-12-05*
