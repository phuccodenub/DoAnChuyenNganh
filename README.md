# Compact Real-Time LMS (Hệ thống LMS Tương tác Thời gian thực)

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

1. Cấu hình file `.env` trong `backend` như phần hướng dẫn ở trên.

2. Khởi động bằng Docker Compose:

```bash
docker-compose up -d --build
```

Lệnh trên sẽ build image và khởi chạy các service (frontend, backend, postgres, redis).

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

## Đóng góp

Rất hoan nghênh PR, issue và ý tưởng cải thiện. Vui lòng tạo issue trước khi gửi pull request để thảo luận các thay đổi lớn.

---

## Giấy phép

Ghi rõ giấy phép của dự án ở đây (ví dụ: MIT) hoặc xóa phần nếu chưa quyết định.

---

Nếu bạn muốn, tôi có thể:

- Thêm các huy hiệu (badges) CI / coverage / license.
- Viết file CONTRIBUTING.md và mẫu issue/PR.
- Dịch sang tiếng Anh song song.