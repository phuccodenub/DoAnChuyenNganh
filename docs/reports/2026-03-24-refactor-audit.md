# Refactor Audit - 2026-03-24

## Project Understanding

Đây là một LMS full-stack tập trung vào trải nghiệm tương tác theo thời gian thực:

- Xác thực và phân quyền nhiều vai trò: student, instructor, admin, super_admin.
- Quản lý khóa học, curriculum, lesson, assignment, quiz, grade, enrollment.
- Nhắn tin, conversation, notification và chat theo course qua Socket.IO.
- Livestream/WebRTC cho lớp học trực tiếp.
- Tính năng AI: quiz generator, AI grader, learning support, tutor/workflow mở rộng.
- Chứng chỉ/blockchain, analytics, moderation, file/media management.

Nguồn xác nhận chính:

- `backend/src/api/v1/routes/index.ts`
- `frontend/src/routes/index.tsx`
- `frontend/src/constants/routes.ts`

## Strengths

- Chức năng nghiệp vụ đã khá rộng và bám đúng bài toán LMS.
- Backend đã tách module theo domain ở mức thư mục.
- Frontend đã có route guards, layout theo role, React Query, Zustand.
- Docker/dev scripts và dữ liệu mẫu đã có nền tảng.

## Priority Findings

### 1. Repository hygiene từng bị lẫn source với docs/manual artifacts

Triệu chứng:

- Trước khi cleanup, root repo, `backend/`, `frontend/` chứa nhiều file markdown, test script, SQL dump, file tạm, báo cáo AI.
- Điều này làm giảm khả năng onboarding và khiến boundary giữa source, docs, fixtures, và artifacts không rõ ràng.

Tác động:

- Dễ bỏ sót file quan trọng khi review.
- Tăng noise khi grep, diff, và điều hướng codebase.

Trạng thái:

- Đã được xử lý ở mức cấu trúc trong turn này bằng cách gom vào `docs/`, `backend/docs/`, `frontend/docs/`, `tests/manual/`, và `database/dumps/`.

### 2. Backend AI module là “god service”

Chỉ dấu:

- `backend/src/modules/ai/ai.service.ts` dài khoảng 1649 dòng.
- File này đang trộn nhiều trách nhiệm: provider selection, prompt orchestration, file parsing, HTTP calls, child process execution, logging, formatting, fallback logic.
- Có log preview của API key tại `backend/src/modules/ai/ai.service.ts:94`.
- Có `spawn(...)` để chạy process ngoài tại `backend/src/modules/ai/ai.service.ts:1267`.

Tác động:

- Khó test unit theo responsibility.
- Rủi ro bảo mật/quan sát vì logging và process execution nằm chung lớp nghiệp vụ.
- Mỗi thay đổi AI nhỏ đều có blast radius lớn.

### 3. Backend bootstrap đang ghép nhiều hạ tầng vào một entrypoint

Chỉ dấu:

- `backend/src/server.ts` vừa tạo HTTP server, Socket.IO, initialize nhiều gateway, health check AI, khởi động queue worker, vừa gán gateway lên global object.
- `backend/src/server.ts:80` dùng `(global as any).livestreamGateway = livestreamGateway`.

Tác động:

- Khó thay thế hạ tầng, khó test bootstrap, và khó quản lý vòng đời tiến trình.
- Tăng coupling ngầm giữa controller/service với global runtime state.

### 4. Frontend course detail page đang ôm quá nhiều use case

Chỉ dấu:

- `frontend/src/pages/course/detail/DetailPage.tsx` dài khoảng 1595 dòng.
- File này trộn data loading, permission/layout resolution, reviews, quiz/assignment loading, certificate UX, và UI rendering.
- Logic “chặn F12 / context menu / selectstart” nằm trong cùng page tại vùng quanh `frontend/src/pages/course/detail/DetailPage.tsx:135`.

Tác động:

- Rất khó bảo trì và viết test theo hành vi.
- Security-through-UI không thực sự bảo vệ nội dung nhưng lại ảnh hưởng UX/a11y.

### 5. WebRTC client service đang là singleton nhiều trạng thái, nhiều side effects

Chỉ dấu:

- `frontend/src/services/webrtcService.ts` dài khoảng 806 dòng.
- Service singleton quản lý peers, media streams, signaling listeners, localStorage, retry flow, logging dày đặc bằng `console.log`.

Tác động:

- Debug khó vì state sống lâu, phụ thuộc trình tự gọi.
- Khó tách behavior host/viewer và khó mô phỏng trong test.

### 6. Auth store đang kiêm luôn API orchestration, persistence và UI side effects

Chỉ dấu:

- `frontend/src/stores/authStore.enhanced.ts` dài khoảng 365 dòng.
- Store gọi service, hiển thị toast, setup localStorage watcher, restore auth, và chứa business flow trong cùng một nơi.

Tác động:

- Store state management bị dính chặt với delivery concerns.
- Test khó vì side effects phân tán trong layer state.

## Refactor Priorities

1. Ổn định baseline chất lượng: typecheck, lint, smoke test, integration test.
2. Tách backend AI thành application services/provider adapters/parser boundaries.
3. Làm sạch backend bootstrap và dependency wiring.
4. Tách frontend page lớn thành feature modules + hooks + presentational components.
5. Tách realtime stack (WebRTC/auth/socket) thành layer rõ ràng, testable hơn.
6. Thiết lập quality gate để lần refactor tiếp theo có regression safety.
