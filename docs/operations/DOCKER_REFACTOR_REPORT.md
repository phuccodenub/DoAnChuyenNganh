# Docker Workflows (Dev/Test) - Báo cáo tổng kết

## Mục tiêu
- `npm run dev:api` mặc định chạy **Supabase mode** (DB external qua `DATABASE_URL`).
- `npm run dev:web` giữ **full-stack Docker** và frontend chạy dạng **Vite dev server (HMR)**.
- Môi trường test cô lập dùng **Postgres Docker** (tmpfs) để tránh động vào DB chính.

## Tổng quan các mode

### 1) Dev API (mặc định: Supabase)
- Lệnh:
  - `npm run dev:api`
- Compose:
  - `docker/environments/development/backend-only.yml`
- Services:
  - `backend-dev`, `redis-dev`
- DB:
  - Lấy từ `backend/.env` (cần có `DATABASE_URL=...` trỏ Supabase)
- Ghi chú:
  - **Không tự migrate/seed trên Supabase**.
  - Nếu muốn chạy migration khi start, thêm vào `backend/.env`:
    - `RUN_MIGRATIONS_ON_START=true`

### 2) Dev API (Local Postgres)
- Lệnh:
  - `npm run dev:api:localdb`
- Compose:
  - `docker/environments/development/backend-only.localdb.yml`
- Services:
  - `postgres-dev`, `redis-dev`, `backend-dev`
- DB:
  - Local docker `localhost:5432` (volume `lms_postgres_api_dev_data`)
  - Compose cố tình set `DATABASE_URL=` để backend dùng `DB_HOST/DB_PORT/...`

### 3) Dev Web (mặc định: Supabase + Vite HMR)
- Lệnh:
  - `npm run dev:web`
- Compose:
  - `docker/environments/development/full-stack.yml`
- Services:
  - `backend-dev`, `redis-dev`, `frontend-dev`
- Frontend:
  - Chạy **Vite dev server** trong container
  - Host URL: `http://localhost:3001` (map `3001 -> 5174`)
  - Vite proxy API/socket về backend container qua `VITE_PROXY_TARGET=http://backend-dev:3000`
- DB:
  - Supabase qua `backend/.env (DATABASE_URL)`

### 4) Dev Web (Local Postgres + Vite HMR)
- Lệnh:
  - `npm run dev:web:localdb`
- Compose:
  - `docker/environments/development/full-stack.localdb.yml`
- Services:
  - `postgres-dev`, `redis-dev`, `backend-dev`, `frontend-dev`

### 5) Test cô lập (Postgres tmpfs)
- Lệnh:
  - `npm run dev:test`
- Compose:
  - `docker-compose.test.yml`
- Services:
  - `postgres-test` (port `6543:5432`, tmpfs)
  - `redis-test` (port `6380:6379`, tmpfs)
- Cách chạy test backend (host):
  - `cd backend`
  - `npm run test:integration` (hoặc `npm run test:e2e`)
- Ghi chú:
  - `backend/src/tests/integration/test.env` đã trỏ DB port `6543`.

## Entry points (npm -> ps1 -> compose)
- `dev:api` -> `docker/scripts/start-api-dev.ps1` -> `backend-only.yml`
- `dev:api:localdb` -> `docker/scripts/start-api-dev.ps1 -LocalDb` -> `backend-only.localdb.yml`
- `dev:web` -> `docker/scripts/start-web-dev.ps1` -> `full-stack.yml`
- `dev:web:localdb` -> `docker/scripts/start-web-dev.ps1 -LocalDb` -> `full-stack.localdb.yml`
- `dev:test` -> `docker/scripts/start-test-e2e.ps1` -> `docker-compose.test.yml`

## Các thay đổi chính (file)

### Compose
- `docker/environments/development/backend-only.yml`
  - Mặc định Supabase: bỏ Postgres service
  - `env_file` chuyển sang `backend/.env`
  - Command wrapper để xử lý CRLF khi checkout trên Windows
- `docker/environments/development/full-stack.yml`
  - Mặc định Supabase
  - Frontend chạy Vite dev server (HMR)
  - `env_file` backend dùng `backend/.env`
- Mới:
  - `docker/environments/development/backend-only.localdb.yml`
  - `docker/environments/development/full-stack.localdb.yml`

### Dockerfile / scripts
- Mới:
  - `docker/dockerfiles/frontend.dev.Dockerfile` (Vite dev container)
  - `docker/scripts/start-frontend-dev.sh`
- `docker/scripts/start-backend-dev.sh`
  - Nếu có `DATABASE_URL` (không rỗng) => coi là external DB
  - Không tự migrate trừ khi `RUN_MIGRATIONS_ON_START=true`
  - Local DB logic dùng `DB_HOST` thay vì hardcode `postgres-dev`

### PowerShell orchestration
- `docker/scripts/start-api-dev.ps1`
  - Thêm `-LocalDb` để chọn compose localdb
- `docker/scripts/start-web-dev.ps1`
  - Thêm `-LocalDb`
  - `-Clean` chỉ `down -v` (không `docker system prune -f`)
- `docker/scripts/start-test-e2e.ps1`
  - Dùng `docker-compose.test.yml` (Postgres tmpfs)

### Frontend
- `frontend/vite.config.ts`
  - Proxy target lấy từ `process.env.VITE_PROXY_TARGET` (fallback `http://127.0.0.1:3000`)

## Yêu cầu trước khi chạy
- Đảm bảo network external tồn tại:
  - `lms-dev-network`
- Script `docker/scripts/init-volumes.ps1` sẽ tự tạo:
  - volumes: `lms_postgres_api_dev_data`, `lms_redis_api_dev_data`
  - network: `lms-dev-network`

## Checklist nhanh
- Supabase mode:
  - Kiểm tra `backend/.env` có `DATABASE_URL=...`
- Localdb mode:
  - Không set `DATABASE_URL` hoặc để compose override `DATABASE_URL=`
- Test mode:
  - DB ở `localhost:6543`

