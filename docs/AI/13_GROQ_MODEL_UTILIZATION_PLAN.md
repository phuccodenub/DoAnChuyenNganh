# 🧠 Kế hoạch tận dụng Groq Models (Reasoning / Tool Use / Vision / Speech)

**Tài liệu (Document):** 13 - Groq Model Utilization Plan  
**Phiên bản (Version):** 1.0  
**Cập nhật gần nhất (Last Updated):** December 27, 2025  
**Mục tiêu:** Mở rộng AI capability của LMS bằng cách tận dụng đầy đủ các nhóm model trên Groq (không chỉ Llama 3.3 70B).

---

## 0) Tóm tắt điều đang xảy ra

- Hiện hệ thống đã có 3-tier AI (Groq / Google / ProxyPal).  
- Groq đang chủ yếu dùng cho chat/text nhanh (Llama 3.3 70B) + math (Qwen 3 32B).  
- Config đã “đặt sẵn” các model Groq cho `vision` và `speech` trong `env.ai.groq.models`, nhưng code backend **chưa dùng** các capabilities này.
- Video analysis hiện phụ thuộc `GeminiVideoService` (direct Gemini API) và/hoặc ProxyPal Gemini (tài liệu cũ). Trong thực tế ProxyPal không còn hỗ trợ `gemini-3-pro-preview` nên cần **Video Understanding V2**.

---

## 1) Phân loại model trên Groq và điểm mạnh (theo nhóm)

> Lưu ý: danh sách model khả dụng có thể thay đổi theo thời điểm. Nên xác minh bằng API `GET /openai/v1/models`.

### 1.1 Reasoning models
**Giá trị cốt lõi trong LMS**
- Tạo output “đúng quy trình”, ít bỏ sót ràng buộc (rubric, mapping CLO → Bloom → câu hỏi).
- Tự kiểm tra/đối chiếu tốt hơn khi yêu cầu: “verify”, “self-check”, “consistency check”.
- Phù hợp tác vụ **không cần ultra-fast** nhưng cần correctness.

**Use cases đề xuất (P0/P1)**
- Rubric generator + rubric validator cho AI Grader.
- Quiz blueprint: mapping mục tiêu học tập → Bloom → question types → difficulty distribution.
- Lesson analysis: trích key concepts + prerequisites + misconceptions.
- Adaptive learning: lập kế hoạch học có điều kiện (if student mastery < X → remediate Y).

### 1.2 Function Calling / Tool Use (structured agents)
**Giá trị cốt lõi trong LMS**
- Cho phép backend “điều khiển” workflow bằng JSON schema: model trả về `tool_calls`, code thực thi tool, rồi model tổng hợp.
- Giảm lỗi “hợp lý nhưng sai” nhờ tách: (1) quyết định gọi tool, (2) tool trả dữ liệu thật, (3) model tổng hợp.

**Use cases đề xuất**
- Tutor có thể gọi tool: `getLessonContext`, `searchCourseMaterials`, `getUserProgress`, `getQuizHistory`.
- Debate workflow: agent gọi tool lấy facts (từ DB) trước khi tranh luận.
- Grader: tool `extractTextFromPdf/docx/xlsx` đã có, có thể biến thành tool-call pattern để model tự yêu cầu loại parsing phù hợp.

### 1.3 Speech to Text (Whisper)
**Giá trị cốt lõi trong LMS**
- Biến audio/video thành transcript → unlock hàng loạt workflow: lesson analysis, quiz generation, tutor context, note-taking.
- Là “mảnh ghép” bắt buộc để thay thế đọc video trực tiếp (khi không còn Gemini video model qua ProxyPal).

**Use cases đề xuất**
- Lesson video → transcript + timestamps → summary/key points.
- Student nộp bài bằng audio (đọc bài, thuyết trình) → chấm/feedback.
- Phân tích video bài giảng bằng pipeline: STT + Vision (xem tài liệu 14).

### 1.4 Vision models
**Giá trị cốt lõi trong LMS**
- Chấm bài có ảnh: bài toán viết tay, sơ đồ, ảnh chụp slide/whiteboard.
- Trích nội dung slide/diagram từ video bằng cách sample frame.

**Use cases đề xuất**
- Assignment grading: ảnh → OCR/caption → rubric-based evaluation.
- Lesson video: frame sampling → “slide outline”/“diagram understanding”.

### 1.5 Text to Speech
- Tạm thời chưa cần (như yêu cầu).

---

## 2) Routing đề xuất: “đúng model cho đúng việc”

### 2.1 Mapping nhanh (khuyến nghị mặc định)
- **Tutor realtime chat (P0):** model text nhanh (hiện có Llama 3.3 70B) + optional tool-use cho truy vấn dữ liệu.
- **Tutor “giải bài có ràng buộc” (P0):** reasoning model (đặc biệt khi user yêu cầu lập kế hoạch, giải thích từng bước, hoặc cần verify).
- **Quiz generator (P0):** reasoning model cho blueprint + validator; text model cho generation; premium polish giữ nguyên ProxyPal.
- **Grader (P1):**
  - Code: Qwen Coder (ProxyPal) như hiện tại.
  - Essay: có thể nâng cấp bằng reasoning model khi cần consistency / rubric adherence.
  - Image submissions: vision model → text → reasoning model.
- **Lesson analysis (P0):**
  - Nếu lesson là video: Video Understanding V2 (STT+Vision) → reasoning synthesis.
  - Nếu lesson là text: reasoning model tạo key concepts + misconceptions.

### 2.2 Quy tắc chọn model theo “độ ràng buộc”
- Nếu output là JSON schema, có ràng buộc chặt (rubric, mapping, plan) → ưu tiên **reasoning/tool-use**.
- Nếu cần tốc độ và câu hỏi đơn giản → ưu tiên **fast chat**.
- Nếu input có audio → **speech-to-text** trước.
- Nếu input có ảnh → **vision** trước.

---

## 3) Các tính năng AI mới (đề xuất) mở khóa nhờ Groq model đa dạng

### 3.1 P0: “Lesson Video → Lesson Context” thay thế ProxyPal Gemini
- Transcript (Whisper) + Keyframes caption/OCR (Vision) + Reasoning synthesis.
- Trả về JSON: transcript, keyPoints, summary, duration, slideOutline.

### 3.2 P0: Rubric & Blueprint Engine
- Tạo rubric chuẩn hoá theo course/assignment, có tiêu chí, trọng số, ví dụ lỗi thường gặp.
- Mapping CLO → Bloom → Question templates (Quiz generator) để giảm “quiz sai mục tiêu”.

### 3.3 P1: Image-based Grading
- Student upload ảnh bài làm → Vision → text → Reasoning chấm theo rubric.

### 3.4 P1: “Study Plan with Conditions” (Adaptive)
- Lập kế hoạch học có điều kiện: nếu mastery topic A < 60% → học remedial; nếu >= 80% → skip.

---

## 4) Xác minh khả năng “phân tích video” (verify)

- Groq hiện không cung cấp một “video understanding single-call” theo kiểu nạp file video và hỏi trực tiếp như Gemini video.  
- Nhưng **phân tích video là khả thi** theo cách industry-standard:  
  1) Tách audio → STT (Whisper)  
  2) Sample frame → Vision caption/OCR  
  3) Fusion (reasoning model) để tạo summary, key points, outline, Q/A.

Chi tiết pipeline nằm ở tài liệu: **14_VIDEO_UNDERSTANDING_V2_STT_VISION_PIPELINE.md**.

---

## 5) Checklist triển khai (tóm tắt)

- [ ] Mở rộng Groq provider để hỗ trợ speech-to-text endpoint.
- [ ] Thêm vision support (image input) cho Groq provider.
- [ ] Thêm tool-use / function calling (nếu model hỗ trợ).
- [ ] Xây dựng Video Understanding V2 service (STT + Vision + Reasoning).
- [ ] Gắn pipeline mới vào LessonAnalysis (giữ config cũ, add config mới).

Xem roadmap kỹ thuật chi tiết: **15_BACKEND_CHANGES_ROADMAP_GROQ_MULTIMODAL.md**.
