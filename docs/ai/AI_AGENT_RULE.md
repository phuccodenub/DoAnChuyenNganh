1) CRITICAL RULES (Bắt buộc)
R1 — Không code trước khi hiểu hệ thống
Trước khi viết code:
Đọc/hiểu cấu trúc dự án hiện tại.
Đọc backend API:
backend/src/modules/*/routes.ts
Xác định endpoints cần tích hợp + request/response types
Nắm rõ context task.
Cấm:
Code khi chưa đọc codebase/docs
Tự ý đổi kiến trúc
Bỏ qua kiểm tra code hiện có
Làm khi chưa hiểu context
R2 — Quy trình “Done” (chạy kiểm tra theo thứ tự)
Bắt buộc trước khi kết thúc response : Type/Lint backend-frontend:
cd frontend && npm run type-check
cd backend && npm run lint
Yêu cầu:
Không lỗi 
Tránh any (chỉ dùng khi thật cần + comment)
Props & API responses có type/interface rõ ràng
ESLint (frontend):
npm run lint
Không error; warning nên fix nếu có thể
Manual test:
Render đúng, interaction đúng
Responsive (mobile/tablet/desktop)
API integration + loading/error states
R3 — Ngôn ngữ UI: 100% tiếng Việt
Mọi text UI (label/button/placeholder/error/empty/loading) phải là tiếng Việt
i18n default: vi
Không để text tiếng Anh trên UI
2) Chạy dự án (Docker-first)
Chỉ chạy đúng các lệnh sau:
# Full-stack: Frontend + Backend + Redis + Postgres
npm run dev:web
# Backend + Frontend Vite riêng
npm run dev:api
cd frontend && npm run dev   # port 5174
Cấm chạy trực tiếp backend dev (thiếu Redis/Postgres):
cd backend && npm run dev   # ❌ không hoạt động đúng
Tài khoản test
admin@example.com / Admin123!
instructor1@example.com / Instructor123!
student1@example.com / Student123!
Supabase (quan trọng)
Dự án cần hoạt động với Supabase → mọi seed/migration phải trỏ đúng Supabase.
3) Ports mặc định
Frontend (Docker nginx): 3001 → http://localhost:3001
Frontend (Vite dev): 5174 → http://localhost:5174
Backend API: 3000 → http://localhost:3000/api/v1.3.0
PostgreSQL: 5432
Redis: 6379
4) Logs & vận hành Docker
docker logs lms-backend-dev -f
docker logs lms-backend-dev --tail 50
docker logs lms-backend-dev 2>&1 | Select-String -Pattern "error|Error|ERROR"
docker-compose -p lms -f docker/environments/development/full-stack.yml restart backend-dev
5) Database Migration (quan trọng)
Chạy migration:
cd backend
npm run migrate migrate        # Chạy tất cả migration pending
npm run migrate status         # Kiểm tra trạng thái migration
npm run migrate rollback       # Rollback migration cuối cùng
npm run migrate rollbackAll    # Rollback tất cả migrations
npm run migrate seed           # Chạy seeders
npm run migrate reset          # Reset DB (rollback all + migrate + seed)
Lưu ý:
Migration tự động chạy khi start backend trong dev mode (không phải production và không có DATABASE_URL)
Với Supabase: Migration phải chạy thủ công → cd backend && npm run migrate migrate
Luôn kiểm tra status trước khi migrate: npm run migrate status
Backup database trước khi chạy migration trong production
Không sửa migration đã chạy → tạo migration mới thay thế
6) API/Auth: JWT payload (dễ sai)
interface JWTPayload {
  userId: string; // ✅ dùng userId
  email: string;
  role: string;
}
// controller:
const userId = req.user.userId; // ✅
const userId = req.user.id;     // ❌
7) Coding standards (ngắn gọn)
TypeScript
Strong typing cho props & responses
Hạn chế any
React Query
Luôn handle đủ: isLoading, error, data
Naming
Component: PascalCase
Function: camelCase
Constant: UPPER_SNAKE_CASE
Files: Component PascalCase.tsx, utils camelCase.ts
8) Workflow chuẩn
Nhận task
Đọc docs/code + phân tích
Plan
Code
Test local
type-check / lint
Manual test
Commit & push
9) Common pitfalls (nhớ nhanh)
any → dùng type/interface
Không hardcode strings → dùng i18n
Inline styles → Tailwind classes
useEffect thiếu cleanup
Thiếu loading/error states
Auth bug: req.user.userId (không phải id)
10) Final checklist (trước khi "Done")
Code chạy không lỗi
frontend: npm run type-check pass
lint pass (FE; BE theo script hiện có)
UI text 100% tiếng Việt
Responsive OK
Có loading/error states
API integration đã test (nếu có)
Commit message rõ ràng
Dọn console.log không cần thiết
11) Files quan trọng
backend/src/api/v1/routes/index.ts — đăng ký routes
backend/src/middlewares/auth.middleware.ts — JWT auth
frontend/src/services/http/client.ts — Axios client
frontend/src/services/socketService.ts — Socket.IO client
docker/environments/development/full-stack.yml — docker compose dev