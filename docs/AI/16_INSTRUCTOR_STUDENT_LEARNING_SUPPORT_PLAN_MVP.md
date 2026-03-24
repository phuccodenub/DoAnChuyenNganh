# 🎯 AI Learning Support Plan (MVP) — Instructor + Student

**Tài liệu:** 16 - Instructor/Student Learning Support (MVP)
**Cập nhật:** 27 Dec 2025
**Mục tiêu:** Biến 3 ý tưởng (Study Planner / Remediation Engine / Draft Coach + Artifacts) thành kế hoạch khả thi, bám sát data & code hiện có.

---

## 0) Verify nhanh với dự án hiện tại (Reality Check)

### Những gì hệ thống đã có (đủ để làm MVP)
- **Quiz attempts & answers** đã có sẵn DB model:
  - `quiz_attempts`: `quiz_id`, `user_id`, `attempt_number`, `score`, `max_score`, `time_spent_minutes`.
  - `quiz_answers`: `attempt_id`, `question_id`, `selected_option_id/selected_options`, `is_correct`, `points_earned`.
- **AI Lesson Analysis** đã có “concept-like” signals ở mức bài học:
  - `content_key_concepts`, `content_difficulty_level`, `video_transcript`, `video_key_points`.
- **Quiz Generator** đã có pipeline tạo quiz (Generate → Validate → Polish) và có khái niệm difficulty ở tầng AI.

### Những gì chưa có (nếu muốn “concept mastery” đúng nghĩa)
- `quiz_questions` hiện **chưa có** `concept_tags`, `difficulty`, `learning_outcome`.

**Kết luận:**
- MVP nên chạy được **ngay** trên dữ liệu attempt/answer (theo quiz/section), không đòi “concept map” trước.
- Khi cần nâng cấp, chỉ cần thêm **tagging nhẹ** vào `quiz_questions` là unlock được “mastery theo concept”.

---

## 1) Tổng quan kế hoạch: 3 hệ thống → 3 gói MVP

### Hệ thống 1 — Adaptive Study Planner (MVP)
**MVP deliverable (Student):** trả lời 3 câu hỏi:
1) “Mình đang yếu gì?”
2) “Nên học gì trước?”
3) “Khi nào kiểm tra lại?”

**MVP deliverable (Instructor):** xem nhanh lớp/nhóm đang yếu ở đâu (theo quiz/section) để điều chỉnh.

**Tối giản hoá:**
- Giai đoạn MVP-0: weakness **theo quiz/section** (không cần concept tags).
- Giai đoạn MVP-1: weakness **theo concept** (cần concept_tags).

### Hệ thống 2 — Remediation & Practice Engine (MVP)
**MVP deliverable (Student):** sau khi làm quiz, hệ thống tạo “remediation cards” cho câu sai + 3–5 câu luyện tập mới.

**Tối giản hoá:**
- MVP-0: remediation dựa trên **chính câu hỏi sai** + explanation (nếu có) + AI gợi ý misconception.
- MVP-1: targeted retake theo **concept_tags** + “novelty check” mức 1.

### Hệ thống 3 — Draft Coach & Learning Artifacts (MVP)
**MVP deliverable (Student):**
- “Coach an toàn”: phản hồi theo checklist/rubric, **không đưa đáp án hoàn chỉnh**.
- “Artifacts”: flashcards/notes ngắn gọn sinh từ lesson analysis (tóm tắt + key concepts).

**Tối giản hoá:**
- Dùng **LessonAnalysis output** làm nguồn (đã có) → generate flashcards.
- Coach: ban đầu chỉ cho phép “diagnosis + checklist + câu hỏi gợi mở”.

---

## 2) MVP-0 (Ưu tiên dễ làm, không cần thay DB)

### 2.1 Study Planner MVP-0 (không concept tags)

**Inputs (đã có):**
- Last N quiz attempts của user trong course/section.
- Score%, time_spent_minutes.

**Outputs:**
- `weakAreas`: top quizzes/sections có score thấp và/hoặc giảm dần.
- `nextActions`: 3–7 việc làm ngay (học lesson X, luyện quiz Y).
- `checkpoints`: đề xuất “mini-quiz lại” sau 2–3 ngày (spaced repetition level 0).

**Heuristic đơn giản (dễ code):**
- `performance = score/max_score` (0..1)
- `recencyWeight = exp(-daysSince/halfLifeDays)` với halfLifeDays = 7
- `weaknessScore(quizOrSection) = (1 - performance) * recencyWeight`

**Planning logic:**
- Sort weak areas by weaknessScore desc.
- Allocate suggested time slots dựa theo `weaknessScore` (ví dụ 30/45/60 phút).

**Instructor view (MVP):**
- Aggregation theo class/section: average score, completion rate, most missed questions.

### 2.2 Remediation Engine MVP-0

**Trigger:** ngay sau `submit quiz attempt`.

**For each incorrect question:** tạo remediation card gồm:
1) “Bạn sai ở đâu?” (misconception)
2) “Khái niệm nền” (1 đoạn ngắn)
3) “Luyện nhanh” (3 câu)

**Nguồn dữ liệu:**
- `quiz_answers` + `quiz_questions` + `quiz_options`
- Nếu `quiz_questions.explanation` có sẵn → reuse (ưu tiên không gọi AI).

**AI usage (tối giản):**
- Prompt “giải thích sai” + “tạo 3 câu cùng dạng nhưng đổi số/distractor”.
- Output JSON (đã có utils parse JSON).

### 2.3 Draft Coach + Flashcards MVP-0

**Flashcards/notes:**
- Nguồn: `AI Lesson Analysis` đã lưu `summary` + `content_key_concepts` (+ transcript nếu có).
- Generate 10–20 flashcards đơn giản theo key concepts.

**Draft Coach:**
- Với writing: dựa rubric đơn giản (structure, clarity, evidence), output checklist + 3 gợi ý cải thiện.
- Với code: chỉ output “likely bug patterns + tests to try + questions”; không output code hoàn chỉnh.

---

## 3) MVP-1 (Bật “mastery theo concept” bằng tagging tối thiểu)

### 3.1 “Concept tagging” tối thiểu

**Thêm vào `quiz_questions`:**
- `concept_tags: string[]` (JSONB hoặc TEXT[])
- `difficulty: 'easy'|'medium'|'hard'` (hoặc smallint)
- `learning_outcome?: string` (optional)

**Quy ước tagging (đơn giản):**
- 1–3 tags/câu hỏi là đủ.
- Tags lấy từ “key concepts” của lesson hoặc syllabus (ví dụ: `sql.join`, `arrays.two-pointer`).

### 3.2 Mastery Profile tối giản

**Mastery per (user, course, conceptTag):**
- `mastery` (0..1)
- `ema_accuracy` (0..1)
- `last_attempt_at`

**Cập nhật:** khi có attempt mới:
- accuracy per concept = correct/total (trên các câu có tag đó)
- EMA: `ema = alpha * accuracy + (1-alpha) * ema`
- recency decay apply khi đọc ra plan

**Gợi ý alpha:** 0.3 (ổn định, dễ giải thích).

### 3.3 Study Planner MVP-1

**Priority formula đơn giản (dễ trình bày):**
- `priority = importance * (1 - mastery) * recencyWeight`
- importance có thể set thủ công theo course/section (0.5 / 1.0 / 1.5).

### 3.4 Remediation & Practice MVP-1

**Targeted retake theo concept:**
- Student chọn “luyện concept yếu nhất” → engine pick concept có mastery thấp.

**Novelty check mức 1:**
- Hash `concept_tag + template_id + parameters` để tránh lặp y hệt.
- Nếu chưa có template system: treat “template_id” = question_id gốc.

---

## 4) MVP-2 (Tuỳ chọn, nếu muốn mạnh hơn nhưng vẫn không quá nặng)

- “Practice exam blueprint”: số câu theo concept/difficulty + thời gian.
- “Spaced repetition” đúng hơn (SM-2 nhẹ) cho flashcards.
- “Instructor remediation pack”: tổng hợp misconceptions phổ biến để giảng viên bổ sung bài giảng.

---

## 5) API/UX đề xuất (tối giản để dễ tích hợp)

### Student endpoints (gợi ý)
- `GET /api/v1/learning-support/plan?courseId=...` → study plan + weak areas
- `GET /api/v1/learning-support/remediation?attemptId=...` → remediation cards
- `POST /api/v1/learning-support/practice` → generate practice set (mode: retake|concept)
- `GET /api/v1/learning-support/flashcards?lessonId=...` → cards từ lesson analysis

### Instructor endpoints (gợi ý)
- `GET /api/v1/learning-support/instructor/insights?courseId=...` → weak areas aggregate

**Lưu ý:** đây chỉ là kế hoạch API; nên bám theo pattern Express modules hiện có.

---

## 6) Safety / Policy (đúng tinh thần “không đưa đáp án”)

- Draft Coach phải có rule: không trả lời “full solution/code hoàn chỉnh”.
- Remediation cho quiz: được giải thích misconception, nhưng tránh “lộ đáp án” nếu quiz đang graded & chưa cho show answers.
- Log + rate limit các AI calls.

---

## 7) Ưu tiên triển khai (đề xuất thực dụng)

**P0 (1–2 tuần):**
- Remediation MVP-0 (sau quiz) + Study Planner MVP-0 (weakness theo quiz/section)

**P1 (1–2 tuần):**
- Flashcards MVP-0 (từ lesson analysis)

**P2 (2–3 tuần):**
- Add concept_tags + Mastery MVP-1 + Targeted retake MVP-1

---

## 8) What to demo (để bạn trình bày đơn giản)

1) Student làm quiz → nhận “remediation cards” cho câu sai + 3 câu luyện.
2) Student mở “Kế hoạch học tuần này” → hệ thống chỉ ra 2 quiz/section yếu nhất + 3 checkpoint.
3) Instructor mở “Class insights” → thấy phần nào lớp yếu để điều chỉnh.

