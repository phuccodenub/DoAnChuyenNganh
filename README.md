# Compact Real-Time LMS (Hệ thống LMS Tương tác Thời gian thực)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Coverage](https://img.shields.io/badge/Coverage-70%25-brightgreen?style=for-the-badge)](https://github.com/your-username/DoAnChuyenNganh)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)](https://github.com/your-username/DoAnChuyenNganh/actions)

Một hệ thống quản lý học tập (LMS) nhẹ, dành cho giảng viên và sinh viên, tập trung vào trải nghiệm tương tác real-time: chat, livestream và quiz.

Dự án này hướng tới việc thay thế nhiều công cụ rời rạc (Zoom, Kahoot, Slack) bằng một giải pháp tích hợp, đơn giản và tập trung.

---

## ✨ Tính năng chính

- Quản lý vai trò (RBAC): Giảng viên và Sinh viên với quyền khác nhau.
- Quản lý khóa học: CRUD cho khóa học và học phần.
- Chat thời gian thực: Phòng chat theo lớp, hỗ trợ text, chia sẻ file, trạng thái online/offline.
- Livestream tương tác: Giảng viên phát trực tiếp, sinh viên tham gia và tương tác.
- Quiz thời gian thực: Tạo/khởi chạy trắc nghiệm (MCQ, True/False, short answer) với bảng xếp hạng và kết quả cập nhật ngay lập tức.
- Xác thực & bảo mật: JWT, OAuth (tùy chọn), kiểm soát truy cập theo vai trò.
- Thông báo real-time: Thông báo khi có tin nhắn, quiz mới, v.v.

## 🛠️ Ngăn xếp công nghệ

| Lĩnh vực              | Công nghệ                        |
|----------------------:|:---------------------------------|
| Frontend              | React (hoặc Vue)                 |
| Backend               | Node.js + Express                |
| Real-time             | Socket.IO                        |
| Database              | PostgreSQL                       |
| Caching / Pub/Sub     | Redis                            |
| Triển khai            | Docker, Docker Compose           |

---

## 🚀 Bắt đầu

Hướng dẫn này giúp bạn chạy dự án trên máy cục bộ.

### Yêu cầu

- Node.js v18+
- npm hoặc yarn
- PostgreSQL
- Redis
- Docker (khuyến nghị)

### Cài đặt

1. Clone repository:

```bash
git clone https://github.com/your-username/real-time-lms.git
cd real-time-lms
```

2. Cài đặt backend:

```bash
cd backend
npm install
```

3. Tạo file môi trường (`.env`) từ `.env.example` trong thư mục `backend` và cập nhật các biến sau (ví dụ):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lms_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_super_secret_key"
```

4. Cài đặt frontend:

```bash
cd ../frontend
npm install
```

### Chạy dịch vụ (local)

Đảm bảo PostgreSQL và Redis đang chạy, sau đó mở 2 terminal:

Terminal A (Backend):

```bash
cd backend
npm run dev
```

Terminal B (Frontend):

```bash
cd frontend
npm start
```

---

## 🐳 Chạy với Docker

### Quick Start (Khuyến nghị cho Flutter development)

Dự án hỗ trợ 2 môi trường Docker:

#### 1. Backend Only (Cho Mobile/Flutter App)
```bash
# Start backend + database + redis
npm run dev:api

# Stop services
npm run dev:down:api
```

**Containers created:**
- `lms-postgres-dev` - PostgreSQL database (port 5432)
- `lms-redis-dev` - Redis cache (port 6379)
- `lms-backend-dev` - Backend API (port 3000)

**API Endpoint:** `http://localhost:3000/api`

#### 2. Full Stack (Backend + Frontend)
```bash
# Start all services including React frontend
npm run dev:web

# Stop services
npm run dev:down:web
```

**Containers created:**
- `lms-postgres-dev` - PostgreSQL database (port 5432)
- `lms-redis-dev` - Redis cache (port 6379)
- `lms-backend-dev` - Backend API (port 3000)
- `lms-frontend-dev` - React frontend (port 3001)

### Useful Docker Commands

```bash
# View running containers
docker ps

# View logs
docker logs lms-backend-dev
docker logs lms-postgres-dev
docker logs lms-redis-dev

# Execute commands in containers
docker exec lms-backend-dev npm run seed
docker exec lms-postgres-dev psql -U lms_user -d lms_db
docker exec lms-redis-dev redis-cli PING

# Restart a service
docker restart lms-backend-dev

# Access backend shell
docker exec -it lms-backend-dev sh
```

### Seed dữ liệu mẫu trong Docker

Backend tự động seed dữ liệu khi khởi động lần đầu. Nếu cần seed lại:

```bash
# Seed database
docker exec lms-backend-dev npm run seed

# Clear and reseed
docker exec lms-backend-dev npm run reset-db-simple
docker exec lms-backend-dev npm run seed
```

Sau đó có thể kiểm tra nhanh đăng nhập 3 vai trò:

```bash
# Test login với tất cả roles
docker exec lms-backend-dev npm run test:auth

# Hoặc test bằng curl
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

### Tài khoản mẫu (Test Credentials)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@example.com | SuperAdmin123! |
| Admin | admin@example.com | Admin123! |
| Instructor | instructor1@example.com | Instructor123! |
| Student | student1@example.com | Student123! |

### Kết nối từ Flutter/Mobile App

**Android Emulator:**
```dart
final apiUrl = 'http://10.0.2.2:3000/api';
```

**iOS Simulator:**
```dart
final apiUrl = 'http://localhost:3000/api';
```

**Physical Device (same network):**
```dart
final apiUrl = 'http://YOUR_COMPUTER_IP:3000/api';
// Example: http://192.168.1.100:3000/api
```

### Troubleshooting

**Backend không start:**
```bash
# Check logs
docker logs lms-backend-dev

# Restart backend
docker restart lms-backend-dev
```

**Database connection failed:**
```bash
# Check if postgres is running
docker ps | grep lms-postgres-dev

# Check connection
docker exec lms-postgres-dev pg_isready -U lms_user
```

**Redis connection failed:**
```bash
# Check if redis is running
docker exec lms-redis-dev redis-cli PING
# Should return: PONG
```

**Port already in use:**
```bash
# Stop services
npm run dev:down:api

# Or stop specific container
docker stop lms-backend-dev
```

---

## 🔎 Tracing (OpenTelemetry)

- Mặc định ở môi trường development, tracing chỉ chạy cục bộ và KHÔNG export ra OTLP collector để tránh lỗi kết nối.
- Để bật/tắt export:

### Dev (khuyến nghị)

```env
ENABLE_OTLP=false
```

### Prod hoặc khi có collector cục bộ

1) Chạy OTLP Collector (ví dụ qua Docker) và mở cổng 4318.
2) Đặt biến môi trường:

```env
ENABLE_OTLP=true
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
```

Ghi chú: Khi `ENABLE_OTLP=false`, hệ thống sẽ chủ động vô hiệu hoá các biến OTEL liên quan để ngăn auto-export.

---

## 🗺️ Lộ trình (Roadmap)

- [ ] Tích hợp Docker để đơn giản hóa triển khai
- [ ] PWA: trải nghiệm mobile & offline cơ bản
- [ ] Tích hợp chia sẻ màn hình cho livestream
- [ ] Dashboard thống kê tương tác và kết quả quiz
- [ ] Tối ưu caching với Redis
- [ ] Nâng cao bảo mật: Rate limiting, input validation
- [ ] Cải thiện UX/UI: Dark mode, phím tắt, hệ thống thông báo

---
