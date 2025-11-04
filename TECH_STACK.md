# Công nghệ và dịch vụ đang sử dụng + đề xuất mở rộng

> Cập nhật: 2025-10-29 • Nhánh: `refactor`

## Hiện trạng công nghệ trong dự án

### Backend (Node.js + TypeScript)
- Runtime & Framework
  - Node.js 18, TypeScript 5
  - Express 5 (REST API), CORS, Helmet, express-rate-limit
- Auth & Bảo mật
  - JSON Web Token (jsonwebtoken) với issuer/audience, refresh token
  - BcryptJS cho băm mật khẩu, zxcvbn đánh giá độ mạnh mật khẩu
  - Middleware bảo mật cơ bản (Helmet, Rate Limit, CORS allowlist)
- Validation & DTO
  - express-validator, zod, class-validator + class-transformer
- ORM & Database
  - Sequelize v6, PostgreSQL (driver `pg`)
  - Migrations (thư mục `backend/migrations` + script `src/scripts/*`), sync có kiểm soát khi non-prod
- Cache & Hiệu năng
  - Redis (node-redis v5), chiến lược cache: memory, redis, hybrid (`src/cache/**`)
  - Cache middleware cho GET/user data, cơ chế invalidation tag-based cơ bản
- Realtime
  - Socket.IO server cho chat, quiz, signaling WebRTC (modules `chat`, `webrtc`, `livestream`)
- Email
  - Nodemailer (SMTP; cấu hình Gmail mặc định), helper gửi mail (welcome, reset, notify)
- Tệp & Upload
  - Multer, FilesService lưu local (`/uploads`) và sinh URL public; stub sẵn Signed URL cho cloud
- Quan sát hệ thống (Observability)
  - Health check `/health`
  - Metrics tùy biến `/metrics` (service tự xây dựng, thống kê request, lỗi, DB, Redis, memory)
  - Logging: Winston (console + file, mask dữ liệu nhạy cảm)
- Tài liệu API
  - Swagger (swagger-jsdoc + swagger-ui-express) tại `/api-docs`
- Kiểm thử & Chất lượng
  - Jest + ts-jest (unit/integration/e2e), cấu hình coverage
  - ESLint (@typescript-eslint) theo dõi "any" và promises; Nodemon/ts-node-dev cho dev

### Frontend (React + Vite)
- Build & Runtime
  - React 18 + Vite 5, TypeScript
  - Nginx serve build production (Docker)
- UI/UX & Styling
  - Tailwind CSS, clsx, lucide-react icons
- State & Data
  - Zustand (state), TanStack React Query (server state)
  - Axios cho HTTP; React Router v6
- Forms & Validation
  - React Hook Form + @hookform/resolvers (Zod)
- i18n & Thông báo
  - i18next + react-i18next (vi/en), react-hot-toast
- Realtime
  - socket.io-client kết nối đến backend

### Hạ tầng & DevOps
- Docker Compose (dev/prod) chạy: PostgreSQL 15, Redis 7, backend, frontend
- Dockerfile riêng cho backend (Node 18-alpine) và frontend (Nginx)
- Biến môi trường: dotenv-flow; map volume cho data/logs
- Chưa thấy file CI/CD trong repo (GitHub Actions/GitLab CI)

---

## Đề xuất công nghệ tiếp theo (ưu tiên theo tác động)

### 1) Lưu trữ media
- Ảnh, tài liệu nhỏ: Cloudinary
  - Lý do: CDN toàn cầu, biến đổi ảnh (resize, crop, webp), upload trực tiếp từ frontend với signed preset, UI/SDK phong phú
  - Tích hợp: thêm biến `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`; cài `cloudinary` (server) và/hoặc `multer-storage-cloudinary`
  - FilesService: thêm `StorageType.CLOUDINARY`, trả về URL chuẩn hóa; tạo thumbnail bằng transformation
- Video bài giảng, file lớn: Google Cloud Storage (GCS) + Cloud CDN
  - Lý do: ổn định, giá tốt cho dữ liệu lớn, signed URL, phân quyền IAM
  - Tích hợp: package `@google-cloud/storage`, biến `GCP_PROJECT_ID`, `GCS_BUCKET`, service account JSON; cập nhật FilesService hỗ trợ signed URL tải lên/tải xuống, tổ chức theo thư mục courseId/lessonId
  - Tuỳ chọn nâng cao: HLS/MP4 segmenting bằng FFmpeg + Cloud CDN để stream tốt hơn
- Thay thế/đồng hành cho video: Mux hoặc Cloudflare Stream
  - Lý do: ingest -> transcode -> playback (HLS/DASH) + analytics, thumbnail, captions, DRM nhẹ
  - Nhược: phí cao hơn GCS thuần; bù lại giảm công vận hành

### 2) Realtime ở quy mô lớn
- Socket.IO Redis Adapter (`@socket.io/redis-adapter`) để scale ngang nhiều instance
  - Dùng chung Redis đã có; đảm bảo sticky sessions phía load balancer nếu cần
- TURN/STUN cho WebRTC
  - Dịch vụ coturn tự host hoặc Twilio/NAT traversal managed; biến `TURN_URL`, `TURN_USER`, `TURN_PASS`

### 3) Quan sát hệ thống & ổn định
- Error tracking: Sentry (server + client)
  - Nhanh chóng phát hiện lỗi runtime, trace theo release/commit
- Metrics chuẩn Prometheus + Grafana
  - Thêm `prom-client` và endpoint `/metrics` ở định dạng Prometheus (song song với metrics hiện có), dashboard hoá trên Grafana
- Log tập trung: Loki hoặc ELK/OpenSearch
  - Ship log từ Winston -> stdout -> Promtail/Fluent Bit; truy vấn tập trung

### 4) Tìm kiếm và gợi ý
- Meilisearch/Typesense (self-host) hoặc Algolia (managed)
  - Index: course, lesson, user, tag; hỗ trợ gợi ý, typo tolerance
  - Đồng bộ qua job nền khi course cập nhật

### 5) Nhiệm vụ nền, lịch và hàng đợi
- BullMQ (Redis) cho hàng đợi
  - Use cases: gửi email, tạo thumbnail, transcode, reindex search, dọn cache
  - Thêm UI quản trị: `bull-board` hoặc `arena`
- Lịch định kỳ: `node-cron` hoặc agenda

### 6) Bảo mật & tuân thủ
- CDN + WAF: Cloudflare (cache tĩnh, bảo vệ DDoS, CSP headers)
- Secret management: GitHub Actions Secrets + Cloud Secret Manager/KMS (prod)
- Quét virus file upload: ClamAV (dịch vụ sidecar) cho tài liệu người dùng tải lên
- Cứng hoá Express: `hpp` (HTTP parameter pollution), giới hạn kích thước body theo route

### 7) Email & thông báo
- Email transactional: SendGrid/Mailgun/AWS SES thay cho SMTP thuần
  - Domain verified, template, analytic
- Web Push/Mobile Push: Firebase Cloud Messaging (FCM) cho thông báo học tập

### 8) Thanh toán và thương mại (nếu có)
- Stripe cho gói khoá học/đăng ký (subscription, invoice, webhook)
- Hoá đơn/thuế: Integ vùng phù hợp nếu triển khai thương mại

### 9) Ảnh & xử lý phương tiện
- Image processing: `sharp` (server-side) hoặc dùng transform của Cloudinary
- Tạo preview/PDF thumbnails với `pdf-lib`/`pdf-poppler` (nếu cần)

### 10) DX, CI/CD và chất lượng
- CI/CD: GitHub Actions
  - Jobs: lint + test -> build -> docker build & push -> deploy (Compose/Swarm/K8s)
- Tách cấu hình ENV theo môi trường: `.env.production`, `.env.staging`, `.env.development` (đang dùng dotenv-flow – giữ và chuẩn hoá)
- Tiêu chuẩn hoá validate: chọn 1 bộ (Zod cho DTO + schema) để giảm trùng lặp với express-validator/class-validator

---

## Tích hợp nhanh (gợi ý từng bước)

- Cloudinary (ảnh)
  1) `npm i cloudinary`
  2) Env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  3) Mở rộng `FilesService` với `StorageType.CLOUDINARY`, upload và trả về URL đã tối ưu (webp, quality)
- GCS (video/file lớn)
  1) `npm i @google-cloud/storage`
  2) Env: `GCP_PROJECT_ID`, `GCS_BUCKET`, `GOOGLE_APPLICATION_CREDENTIALS` (đường dẫn key JSON)
  3) Thêm hàm `getSignedUploadUrl`, `getSignedDownloadUrl` trong `FilesService`
- Socket.IO scale
  1) `npm i @socket.io/redis-adapter ioredis`
  2) Khởi tạo adapter với Redis hiện có
- Sentry
  1) `npm i @sentry/node @sentry/integrations @sentry/react`
  2) Khởi tạo trong `src/server.ts` và `frontend/src/main.tsx`
- Prometheus
  1) `npm i prom-client`
  2) Expose `/metrics` theo Prometheus và chạy Grafana + Prometheus bằng docker-compose profile

---

## Gợi ý ưu tiên triển khai (90 ngày)
1) Tháng 1: Cloudinary cho ảnh + GCS cho video; BullMQ cho jobs; Sentry
2) Tháng 2: Socket.IO Redis adapter; Prometheus + Grafana; CI/CD GitHub Actions
3) Tháng 3: Search (Meilisearch), Web Push (FCM), Cloudflare CDN/WAF

---

## Ghi chú nhỏ phát hiện trong code
- Logs backend đang ghi vào `src/logs/*` theo cấu hình Winston; docker volume map sang `backend/logs`. Nên thống nhất một vị trí (ví dụ `./logs`) để dễ thu thập.
- Dự án đang dùng 3 bộ validate (zod/express-validator/class-validator). Nên chuẩn hoá dần để giảm trùng lặp.

---

## Phụ lục: Liên kết cấu hình chính
- Backend
  - `backend/package.json` (Express, Sequelize, Redis, Socket.IO, Swagger, Jest, ESLint)
  - `backend/src/app.ts` (middleware, swagger, metrics, cache)
  - `backend/src/server.ts` (kết nối DB/Redis, khởi động)
  - `backend/src/config/*` (db, redis, jwt, mail, swagger)
  - `backend/src/cache/**` (chiến lược cache)
  - `backend/src/modules/files/**` (upload lưu local, sẵn sàng mở rộng)
- Frontend
  - `frontend/package.json`, `vite.config.ts`, `tailwind.config.js`, `src/i18n.ts`
- Hạ tầng
  - `docker-compose.yml`, `backend/docker/Dockerfile`, `frontend/Dockerfile`
