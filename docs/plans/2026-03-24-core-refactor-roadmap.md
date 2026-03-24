# LMS Core Refactor Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Chuyển codebase LMS hiện tại sang trạng thái dễ bảo trì, dễ test, ít coupling hơn mà không thay đổi hành vi nghiệp vụ chính.

**Architecture:** Ưu tiên refactor theo chiều dọc từng bounded area thay vì “đập lớn”. Giữ nguyên domain hiện tại nhưng bóc tách responsibility ở các điểm đang phình to: AI backend, bootstrap/runtime wiring, course detail UI, WebRTC stack, auth/session flow. Mỗi phase phải có quality gate riêng trước khi đi tiếp.

**Tech Stack:** Node.js, Express, TypeScript, Sequelize, PostgreSQL, Redis, Socket.IO, React, Vite, React Query, Zustand, Docker, Jest.

---

### Task 1: Thiết lập baseline chất lượng trước khi refactor sâu

**Files:**
- Review: `backend/package.json`
- Review: `frontend/package.json`
- Review: `backend/src/tests/`
- Review: `tests/manual/`
- Create/Modify: CI or validation docs as needed

**Step 1: Chạy và ghi nhận baseline hiện tại**

Run:

```bash
cd backend && npm run type-check
cd backend && npm run test
cd frontend && npm run type-check
cd frontend && npm run build
```

Expected:
- Có danh sách rõ cái gì pass/fail trước khi đổi kiến trúc.

**Step 2: Chuẩn hóa “minimum gate”**

Thiết lập gate tối thiểu cho mỗi PR/refactor batch:

- Backend: `type-check`, `test`
- Frontend: `type-check`, `build`
- Repo/manual: smoke test scripts trong `tests/manual/scripts/`

**Step 3: Tài liệu hóa baseline**

Lưu kết quả vào một report ngắn dưới `docs/reports/`.

### Task 2: Tách AI backend khỏi god service

**Files:**
- Modify: `backend/src/modules/ai/ai.service.ts`
- Create: `backend/src/modules/ai/application/`
- Create: `backend/src/modules/ai/providers/`
- Create: `backend/src/modules/ai/parsers/`
- Create: `backend/src/modules/ai/files/`
- Test: `backend/src/tests/unit/modules/ai/`

**Step 1: Chia responsibility**

Tách `AIService` thành ít nhất 4 nhóm:

- `AiProviderRouter`
- `AiPromptOrchestrator`
- `AiFileExtractor`
- `AiResultParser`

**Step 2: Đưa external calls ra adapter rõ ràng**

- Groq/Gemini/ProxyPal không được gọi trực tiếp từ orchestration class.
- Child process execution phải nằm trong adapter riêng có validate input và logging policy.

**Step 3: Viết test bao phủ behavior quan trọng**

Test:

- fallback giữa providers
- parse JSON từ LLM text
- guard cho file parsing / process spawning

### Task 3: Làm sạch backend bootstrap và dependency wiring

**Files:**
- Modify: `backend/src/server.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/src/bootstrap/`
- Create: `backend/src/realtime/`

**Step 1: Tách bootstrap theo concern**

Tạo các hàm rõ ràng:

- `bootstrapHttpServer`
- `bootstrapSocketGateways`
- `bootstrapWorkers`
- `bootstrapExternalHealthChecks`

**Step 2: Loại bỏ global mutable state**

- Không dùng `(global as any).livestreamGateway`.
- Thay bằng registry hoặc dependency injection tối thiểu ở layer bootstrap.

**Step 3: Giảm logic tạm/debug trong entrypoint**

- Gỡ route debug/console debug không cần thiết khỏi runtime production path.

### Task 4: Refactor course detail thành feature modules

**Files:**
- Modify: `frontend/src/pages/course/detail/DetailPage.tsx`
- Create: `frontend/src/features/course-detail/`
- Create: `frontend/src/features/course-detail/hooks/`
- Create: `frontend/src/features/course-detail/components/`

**Step 1: Tách page shell khỏi data orchestration**

Từ `DetailPage.tsx`, bóc ra:

- `useCourseDetailPageData`
- `useCourseCertificateGuard`
- `CourseDetailHeader`
- `CourseDetailTabs`
- `CourseDetailSidebar`

**Step 2: Loại bỏ security-through-UI**

- Gỡ logic chặn F12/right-click/select để không trộn “bảo vệ nội dung” với UI.
- Nếu cần bảo vệ certificate, dùng watermark/download policy ở backend hoặc signed resource flow.

**Step 3: Thêm tests**

- Hook tests cho layout/permission resolution
- Component tests cho tab switching và loading states

### Task 5: Refactor WebRTC stack thành realtime modules rõ ràng

**Files:**
- Modify: `frontend/src/services/webrtcService.ts`
- Create: `frontend/src/features/livestream/realtime/`
- Create: `frontend/src/features/livestream/realtime/peers/`
- Create: `frontend/src/features/livestream/realtime/signaling/`
- Create: `frontend/src/features/livestream/realtime/media/`

**Step 1: Tách host/viewer flow**

- signaling
- peer connection lifecycle
- media device selection
- session membership

**Step 2: Chuẩn hóa logging**

- Thay `console.log` tự do bằng logger util có env guard cho development.

**Step 3: Thêm integration-style tests ở mức service**

- peer creation
- listener registration/unregistration
- reconnect and leave flow

### Task 6: Refactor auth/session state

**Files:**
- Modify: `frontend/src/stores/authStore.enhanced.ts`
- Create: `frontend/src/features/auth/state/`
- Create: `frontend/src/features/auth/services/`
- Create: `frontend/src/features/auth/hooks/`

**Step 1: Tách action side effects khỏi persisted state**

- store chỉ giữ state + transitions
- service/hook lo API call, toast, token restore policy

**Step 2: Chuẩn hóa cross-tab sync**

- Gom localStorage watcher và restore flow thành module riêng, testable.

**Step 3: Thêm tests**

- init from persisted tokens
- logout cleanup
- unauthorized recovery

### Task 7: Xây regression net và completion gate

**Files:**
- Modify: `backend/package.json`
- Modify: `frontend/package.json`
- Create/Modify: CI workflow if needed
- Create: `docs/reports/refactor-checklists/`

**Step 1: Chuẩn hóa command để reviewer dễ chạy**

- một command backend verify
- một command frontend verify
- một command smoke/manual checklist

**Step 2: Tạo checklist theo phase**

Mỗi phase phải có:

- changed files
- risks
- tests run
- rollback note

**Step 3: Chỉ merge phase khi có bằng chứng**

Evidence:

- typecheck/build/test output mới chạy
- feature smoke test cho area vừa refactor

---

## Recommended Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7

## Success Criteria

- Không còn file “god object/page/service” vượt ngưỡng hợp lý mà giữ nhiều responsibility.
- Manual tests và docs không lẫn vào source roots.
- Backend bootstrap không dùng global mutable gateway state.
- Frontend course detail, auth, WebRTC có boundary rõ giữa state, effects, UI.
- Có quality gate để lần refactor tiếp theo đo được regression.
