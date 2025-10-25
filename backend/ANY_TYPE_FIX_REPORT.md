Đã thực hiện refactor có hệ thống theo kế hoạch loại bỏ any, hoàn thành các bước sau:

Repository DTOs/generics
Bổ sung typing, loại bỏ any khỏi các entrypoints của repository Quiz:
Thay any bằng kiểu suy luận từ Sequelize method parameters (Parameters<typeof Model.create>[0], v.v.) trong backend/src/modules/quiz/quiz.repository.ts.
Cụ thể: createQuiz, updateQuiz, addQuestion, updateQuestion, addOption, submitAnswer, submitAnswers đã dùng các DTO suy luận và Omit phù hợp (ví dụ Omit<..., 'quiz_id'>/Omit<..., 'attempt_id'>).
Thu hẹp kiểu và loại bỏ cast any trong thống kê: parse giá trị trung bình và tỉ lệ hoàn thành bằng các row type an toàn (AvgScoreRow/CompletionRow).
Đã chuẩn hóa repository Course-Content theo DTO/generics trước đó trong backend/src/modules/course-content/course-content.repository.ts.
Chuẩn hóa Response utilities
Chuẩn hóa kiểu phản hồi:
ApiErrorItem, ApiResponse<T = unknown>, PaginatedResponse<T = unknown> trong backend/src/utils/response.util.ts.
data chuyển sang optional (data?: T), meta: Record<string, unknown>, errors: ApiErrorItem[].
Tương thích ngược và loại bỏ any:
sendSuccess, sendCreated, sendCustom chấp nhận data?: T, meta?: Record<string, unknown>.
sendError(errors?: unknown[]): tự động map qua formatValidationErrors để tạo ApiErrorItem[] an toàn.
sendValidationError(errors: unknown[] = []) gọi lại sendError với 400, đảm bảo typing đồng nhất.
success/error alias giữ thứ tự tham số cũ, nhưng tham số lỗi là unknown[]; mọi call-site cũ vẫn chạy an toàn.
Giữ các hàm legacy bind: sendSuccessResponse, sendErrorResponse, v.v. để không phá call-sites hiện tại.
Đồng bộ common types
Cập nhật kiểu chung để giảm any:
ApiResponse/ PaginatedResponse/ ApiErrorItem (phiên bản common) trong backend/src/types/common.types.ts.
SearchOptions.filters: Record<string, unknown>.
EmailOptions.attachments: unknown[].
shared re-export vẫn ổn định:
backend/src/shared/index.ts tiếp tục re-export responseUtils và các hàm legacy; đồng thời alias CommonApiResponse/CommonPaginatedResponse từ common.types để tránh xung đột tên.
Kiểm tra dấu vết any còn lại trong QuizRepository
Đã quét xác nhận không còn any trong backend/src/modules/quiz/quiz.repository.ts.
Tác động và tương thích

Các controller/service gọi responseUtils.*:
Không cần thay đổi bắt buộc: signature mới tương thích (errors?: unknown[], data?: T).
Các nơi truyền meta ở vị trí cuối vẫn hợp lệ vì meta đã được gõ Record<string, unknown>.
Các nơi truyền null làm data vẫn hợp lệ (data?: T; null là giá trị hợp lệ với T = null).
Typing lỗi nhất quán hơn: mọi mảng lỗi sẽ được chuẩn hóa về ApiErrorItem[].
Trạng thái TODO đã cập nhật

Đã hoàn thành:
Phase 2: Refactor quiz.repository.ts theo DTO/generics; thu hẹp getQuizStatistics.
Chuẩn hóa ApiResponse/PaginatedResponse và error item ở response.util.ts.
Đồng bộ định nghĩa tương ứng trong common.types.ts.
Đang thực hiện:
Rà soát call-sites để chuẩn hóa thêm nếu có cảnh báo lint/TS (ví dụ các nơi truyền meta với kiểu chuyên biệt → có thể cast nhẹ sang Record<string, unknown> khi cần).
Còn lại theo kế hoạch:
Phase 2: Rà soát và cập nhật controller dùng responseUtils.sendError()/sendValidationError()/success() nếu phát sinh lỗi kiểu.
Phase 3: Giảm dần any trong backend/src/utils/object.util.ts.
Kết quả cuối cùng của đợt refactor này: any đã được loại bỏ an toàn khỏi repository Quiz và Response utilities, các kiểu phản hồi API được chuẩn hóa, giữ nguyên khả năng tương thích với code hiện tại, sẵn sàng cho bước rà soát call-sites và tiếp tục Phase 3.

Đánh giá quá trình refactor
Điểm mạnh
Ưu tiên đúng trọng tâm:
Loại bỏ (req as any) trong error handler.
Chuẩn hóa 
jwt.util.ts
 theo generic/unknown.
Chuẩn hóa ApiResponse/PaginatedResponse và tái sử dụng từ common.types.ts.
Thay export default Model as any bằng addInstanceMethods/addStaticMethods/exportModel.
Typing Socket.IO events ở frontend.
Cách làm an toàn:
Refactor theo phase nhỏ, chạy tsc --noEmit để phát hiện lỗi dây chuyền.
Sửa lỗi kiểu dữ liệu bám sát schema thực (ví dụ: NotificationRecipient chuyển user_id -> recipient_id, thêm các cờ is_archived, is_dismissed...).
Sử dụng ModelStatic<TInstance> và WhereOptions<Attributes> để chọn đúng overload Sequelize.
Cải thiện tính nhất quán:
Repositories/module services đã dần trả về kiểu *Instance thay vì Model<any, any>.
Giảm ép as any trong cả backend lẫn frontend, đặc biệt ở Socket services.
Hạn chế/Điểm cần hoàn thiện
Rơi rớt cast tạm thời trong services:
Một số service vẫn cần cast thủ công Course.findByPk(...) as CourseInstance | null trước khi truy cập thuộc tính (instructor_id, user_id).
Các kết quả 
findAll
 cần đảm bảo typed mảng EnrollmentInstance[], tránh truy cập thuộc tính trên Model<any, any>.
Đồng bộ hóa kiểu ở toàn module:
Một số DTO/Attributes chưa thống nhất hoàn toàn giữa model.types.ts, model, repository (đã xử lý tốt với Notifications; nên tiếp tục áp dụng cho Grade, Quiz, Enrollment).
Tooling chưa khóa chặt:
Chưa thấy xác nhận đã bật @typescript-eslint/no-explicit-any với override có chủ đích cho bridge files (như 
model-extension.util.ts
).
Chưa có job CI type-check/lint để ngăn hồi quy.
Rủi ro
Độ phủ refactor không đồng đều:
Khi một số service đã chuẩn hóa còn số khác thì chưa, dễ phát sinh lỗi compile khi thay đổi interface model/repo.
Sequelize typing phức tạp:
Việc thiếu đồng bộ Attributes/CreationAttributes/Instance ở một vài model dễ dẫn đến overload mismatch ở update/count/findAll.
Tiêu chí chất lượng đạt được
Đã đạt:
Giảm đáng kể any ở luồng runtime trọng yếu (error handler, JWT).
Loại bỏ pattern export default Model as any ở các model đã sửa.
Socket events đã có định nghĩa payload typed ở frontend.
Cần đạt tiếp:
Hoàn tất cast Course/Enrollment/*Instance ở grade.service.ts, quiz.service.ts, và các service còn lại.
Khóa quy tắc lint và CI để ngăn quay lại dùng any bừa bãi.
Khuyến nghị tiếp theo (ngắn gọn)
[High] Sửa grade.service.ts, quiz.service.ts:
Course.findByPk(...) as CourseInstance | null trước khi truy cập instructor_id.
Kết quả Enrollment/Repository trả về EnrollmentInstance[] trước khi truy cập user_id.
[Medium] Quét toàn bộ services:
Tìm chỗ truy cập thuộc tính trên Model<any, any> và cast/định kiểu sang *Instance.
[Medium] Tooling/CI:
Bật @typescript-eslint/no-explicit-any với allowlist cho bridge (ví dụ 
model-extension.util.ts
).
Thêm job CI chạy npx tsc -p backend/tsconfig.json --noEmit và ESLint.
[Medium] Chuẩn hóa tiếp repositories:
Hoàn thiện DTO/generics cho các repo còn lại (Enrollment, Grade, Quiz), áp dụng WhereOptions<Attributes> nhất quán.
Đo lường tiến độ đề xuất
Compile clean: tsc --noEmit không lỗi ở backend.
Lint rule: Vi phạm no-explicit-any chỉ xuất hiện trong allowlist files.
Số occurrences: Theo dõi giảm dần export default .* as any (mục tiêu 0), và (data: any) trong frontend (mục tiêu 0).
PR nhỏ, độc lập: Mỗi PR < 300 LOC, bao gồm ghi chú thay đổi API/DTO nếu có.
Trạng thái
Kế hoạch refactor triển khai đúng hướng, đã xử lý các điểm rủi ro cao và thiết kế typing nền tảng.
Còn lại một số lỗi compile do casting/overload ở Grade/Quiz/Enrollment—có thể giải quyết nhanh theo các bước đề xuất trên.

Lưu ý quan trọng : Không cần thiết phải hoàn toàn loại bỏ any, những nơi cần thiết thì vẫn nên giữ lại. Chỉ loại bỏ những any không cần thiết hoặc những chỗ có thể thay thế được với những tài nguyên đã có trong dự án, hoặc những any có thể gây ra rủi ro cao. 