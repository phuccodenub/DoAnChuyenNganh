# 🔍 Báo cáo cập nhật loại bỏ `any` – Backend

Lưu ý quan trọng: Không cần thiết phải hoàn toàn loại bỏ `any`; chỉ loại bỏ những `any` không cần thiết hoặc có rủi ro cao. Các bridge runtime (Sequelize extensions, d.ts, tests) có thể vẫn dùng `any` với lint override kiểm soát.

Nguồn tham chiếu: [backend/ANY_TYPE_FIX_REPORT.md](backend/ANY_TYPE_FIX_REPORT.md:1)

## 📊 Tổng quan trạng thái
- Type check: sạch, biên dịch thành công với [npx tsc -p backend/tsconfig.json --noEmit](backend/tsconfig.json:1) (exit code 0).
- Khu vực đã xử lý: error handler, JWT, response utils, notifications, quiz repository, course-content service, enrollment repository, một phần controllers.
- Số liệu “any” còn lại sẽ được đo bằng grep/lint ở vòng kế tiếp sau khi chuẩn hoá GradeRepository.

## ✅ Hạng mục đã hoàn thành (tóm tắt theo phase)
- Error handler: xoá `(req as any)`, dùng helpers/typing an toàn.
- JWT: public API an toàn kiểu; `decodeToken()` trả về unknown; `verifyToken` generic.
- Response utilities: Chuẩn hoá ApiResponse/PaginatedResponse/ApiErrorItem; controllers chính đã chuyển sang helpers chuyên biệt (unauthorized/notFound).
- Notifications:
  - Đồng bộ schema NotificationRecipient (user_id → recipient_id; thêm is_archived/is_dismissed và timestamps).
  - Model export typed dùng helpers và [exportModel](backend/src/utils/model-extension.util.ts:1).
  - Repository typed: [backend/src/modules/notifications/notifications.repository.ts](backend/src/modules/notifications/notifications.repository.ts:1); `WhereOptions<NotificationRecipientAttributes>`, bulk payload `NotificationRecipientCreationAttributes[]`.
- Course-content service: cast về `SectionInstance/LessonInstance/LessonMaterialInstance`; [Course.findByPk](backend/src/services/global/user.service.ts:1) được cast `CourseInstance` khi cần.
- Enrollment repository: [backend/src/repositories/enrollment.repository.ts](backend/src/repositories/enrollment.repository.ts:1) trả về `ModelStatic<EnrollmentInstance>`.
- Quiz repository: DTO/generics; thu hẹp thống kê; loại bỏ `any` tại entrypoints quan trọng.
- Controllers audit: thay `sendError(401)` → `sendUnauthorized`; `sendError(404)` → `sendNotFound`; giữ `sendError(503, errors)` khi cần trả chi tiết lỗi.

## 🔧 Ghi chú về Sequelize typing
- Ưu tiên `ModelStatic<TInstance>` cho models/repositories; tránh `ModelCtor`.
- Đồng bộ `Attributes/CreationAttributes` với schema thực tế để chọn đúng overload `count/findAll/update`.
- Sử dụng `WhereOptions<Attributes>` nhất quán trong truy vấn.
- Mẫu export model: `addInstanceMethods/addStaticMethods/exportModel`, giữ `any` có kiểm soát trong [backend/src/utils/model-extension.util.ts](backend/src/utils/model-extension.util.ts:1).

## 🧩 Vấn đề đã giải quyết
- “Property 'instructor_id' does not exist on type 'Model<any, any>'”:
  - Ép kiểu `Course.findByPk(...) as CourseInstance | null` tại Grade/Quiz/Assignment/Chat trước khi truy thuộc tính.
- “Property 'user_id' does not exist...” ở GradeService:
  - Ép kiểu kết quả enrollments về `EnrollmentInstance[]` trước khi truy cập `enrollment.user_id`.
- Notifications overloads:
  - Dùng `WhereOptions<NotificationRecipientAttributes>`; bulk payload typed để chọn đúng overload.

## ⚠️ Hotspot còn tồn tại (cần chuẩn hoá ngay)
- [backend/src/modules/grade/grade.repository.ts](backend/src/modules/grade/grade.repository.ts:1):
  - Entry points còn `any`: `upsertGrade(data: any)`, `upsertFinalGrade(data: any)`, `createGradeComponent(dto: any)`, `updateGradeComponent(id, data: any)`.
  - Khuyến nghị:
    - Dùng `GradeCreationAttributes/FinalGradeCreationAttributes/GradeComponentCreationAttributes` (hoặc `Parameters<typeof Model.upsert>[0]`/`Parameters<typeof Model.create>[0]` với Omit phù hợp).
    - Truy vấn dùng `WhereOptions<GradeAttributes | FinalGradeAttributes | GradeComponentAttributes>`.

## 📌 Kế hoạch bước tiếp theo (ưu tiên)
1) Chuẩn hoá [GradeRepository](backend/src/modules/grade/grade.repository.ts:1) theo DTO/generics:
   - Ký hiệu mẫu:
     - `async upsertGrade(data: GradeCreationAttributes): Promise<GradeInstance>`
     - `async upsertFinalGrade(data: FinalGradeCreationAttributes): Promise<FinalGradeInstance>`
     - `async createGradeComponent(dto: GradeComponentCreationAttributes): Promise<GradeComponentInstance>`
     - `async updateGradeComponent(id: string, data: Partial<GradeComponentAttributes>): Promise<GradeComponentInstance | null>`
   - Dùng `WhereOptions<GradeAttributes>` cho các filter.
2) Audit services/repositories:
   - Đảm bảo mọi `findByPk/findOne/findAll` cast về `*Instance` trước khi truy thuộc tính.
   - Pre-typed `WhereOptions<Attributes>` để chọn đúng overload `count/findAll/update`.
3) Frontend continuity:
   - Rà soát [frontend/src/services/webRTCService.ts](frontend/src/services/webRTCService.ts:1) và [frontend/src/services/quizService.ts](frontend/src/services/quizService.ts:1) để xoá `(data: any)` nhờ typed SocketEvents.
4) CI quality gates:
   - Thêm workflow chạy `tsc --noEmit` và ESLint với `no-explicit-any` (allowlist: [backend/src/utils/model-extension.util.ts](backend/src/utils/model-extension.util.ts:1), tests, d.ts).
5) Định lượng:
   - Cập nhật thống kê occurrences của `any` và `export default .* as any`; ghi lại trong báo cáo này và [backend/ANY_TYPE_REFACTORING_SUMMARY.md](backend/ANY_TYPE_REFACTORING_SUMMARY.md:1).

## 🎯 Tiêu chí thành công
- GradeRepository hết `any` tại entrypoints; truy vấn typed với `WhereOptions<Attributes>`.
- Không còn truy cập thuộc tính trên `Model<any, any>` ở services sau khi cast `*Instance`.
- Frontend services không còn `(data: any)` cho Socket events.
- CI chặn hồi quy với tsc + ESLint; `any` chỉ xuất hiện ở allowlist đã định.

## 📎 Phụ lục – thay đổi tiêu biểu đã thực hiện
- [backend/src/modules/notifications/notifications.repository.ts](backend/src/modules/notifications/notifications.repository.ts:1): dùng `WhereOptions<NotificationRecipientAttributes>`, bulk payload typed, đếm/đọc/đánh dấu typed.
- [backend/src/models/notification-recipient.model.ts](backend/src/models/notification-recipient.model.ts:1): `addInstanceMethods/addStaticMethods` + `exportModel`.
- [backend/src/types/model.types.ts](backend/src/types/model.types.ts:1): cập nhật `NotificationRecipientAttributes` (recipient_id, is_archived/is_dismissed, clicked_at, interaction_data...).
- [backend/src/modules/course-content/course-content.service.ts](backend/src/modules/course-content/course-content.service.ts:1), [backend/src/modules/assignment/assignment.service.ts](backend/src/modules/assignment/assignment.service.ts:1), [backend/src/modules/chat/chat.repository.ts](backend/src/modules/chat/chat.repository.ts:1): cast `Course.findByPk(...) as CourseInstance`.
- [backend/src/repositories/enrollment.repository.ts](backend/src/repositories/enrollment.repository.ts:1): `getModel(): ModelStatic<EnrollmentInstance>`.
- Quiz repo: [backend/src/modules/quiz/quiz.repository.ts](backend/src/modules/quiz/quiz.repository.ts:1) chuẩn hoá DTO/overloads; bỏ `any`; thống kê thu hẹp.

---
Cập nhật: 25/10/2025
