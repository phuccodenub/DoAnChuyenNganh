# 🛠️ Roadmap Backend: Groq Multimodal (Speech + Vision) + Tool Use

**Tài liệu (Document):** 15 - Backend Roadmap  
**Phiên bản (Version):** 1.0  
**Cập nhật gần nhất (Last Updated):** December 27, 2025  
**Mục tiêu:** Từ “Groq text chat” → mở rộng sang STT/Vision/Tool-use để có AI features hiện đại hơn.

---

## 1) Trạng thái hiện tại (codebase)

- Có `GroqProvider` dùng OpenAI-compatible `POST /v1/chat/completions` (text-only).
- `AIOrchestrator` đã init Groq: default + math + reasoning.
- `env.ai.groq.models` có `vision` và `speech` nhưng chưa được gọi ở đâu.
- Video analysis hiện nằm ở `LessonAnalysisService` và phụ thuộc `GeminiVideoService`.

---

## 2) Thiết kế mở rộng provider layer (không phá API cũ)

### 2.1 Mở rộng interface ở provider layer
Hiện `AIGenerateRequest` chỉ có `prompt/systemPrompt`. Để hỗ trợ tool-use & multimodal, đề xuất thêm **interface mới** (không sửa breaking):

- `AIChatMessage` (role, content)
- `AIContentPart` (text | image | audio-ref)
- `AIToolSchema` (name, description, jsonSchema)
- `AIToolCall` (name, arguments)

Vẫn giữ `generateContent()` cho text-only.

### 2.2 Groq speech-to-text client
Implement thêm method (gợi ý):
- `GroqProvider.transcribeAudio({ filePath|buffer, language?, prompt?, temperature? })`
- gọi OpenAI-compatible endpoint (thường là `/v1/audio/transcriptions`).

### 2.3 Groq vision chat
Implement method:
- `GroqProvider.generateVisionContent({ messages: [ {role, contentParts:[text + image]} ] })`
- encode ảnh base64 hoặc gửi URL (tuỳ API hỗ trợ).

### 2.4 Tool use / function calling
Nếu model/endpoint hỗ trợ `tools` (OpenAI-style) thì:
- add optional `tools` + `tool_choice` vào payload chat completions
- parse `tool_calls` từ response

---

## 3) Service layer mới

### 3.1 `GroqSpeechService`
- wrapper gọi STT, retry, chunking, normalize transcript.

### 3.2 `GroqVisionService`
- caption/OCR cho images.

### 3.3 `VideoUnderstandingV2Service`
- orchestrate pipeline:
  1) download video
  2) extract audio (ffmpeg)
  3) transcribe (groq speech)
  4) sample frames (ffmpeg)
  5) vision caption/OCR
  6) fusion reasoning (groq reasoning)
  7) output JSON schema

---

## 4) Tích hợp vào Lesson Analysis (giữ cũ + thêm mới)

- `LessonAnalysisService.analyzeVideoContent()`:
  - `AI_VIDEO_PIPELINE=legacy` → dùng GeminiVideoService như hiện tại
  - `AI_VIDEO_PIPELINE=v2` → dùng VideoUnderstandingV2Service

**Yêu cầu:** không xoá code/config legacy để có đường quay lại.

---

## 5) Các endpoint/API cần bổ sung (theo docs/AI/10_API_DESIGN.md)

Đề xuất thêm (P0):
- `POST /api/v1/ai/video/analyze` (async) → trả `jobId` + polling
- `GET /api/v1/ai/video/jobs/:jobId`

Hoặc tích hợp luôn vào lesson analysis:
- `POST /api/v1/ai/lesson/:lessonId/analyze` (đã có logic) và internal worker.

---

## 6) Hạ tầng & dependency

- Cần `ffmpeg` trên máy chạy backend (dev/prod).  
  - Nếu backend chạy container: add ffmpeg vào image.
- Giới hạn kích thước video download + số frame.
- Cache: Redis (đã có) + disk temp.

---

## 7) Kiểm thử & quan sát (observability)

- Unit tests:
  - parse STT response
  - parse vision response
  - fusion JSON schema validation
- Integration tests:
  - video nhỏ (10–30s) → transcript + summary
- Logging:
  - log `provider/model` cho từng stage
  - latency per stage
- Safety:
  - size limit, timeout, input URL allowlist (nếu cần)

---

## 8) Phân kỳ (phù hợp thực tế)

### Sprint 1 (P0)
- GroqSpeechService + audio transcription
- VideoUnderstandingV2: audio-only (không vision) → đủ để khôi phục “transcript + key points”
- Gắn vào LessonAnalysis theo `AI_VIDEO_PIPELINE=v2`

### Sprint 2 (P0/P1)
- Frame sampling + vision caption/OCR
- Fusion reasoning đầy đủ → slide outline

### Sprint 3 (P1)
- Image-based grading (assignment submissions)
- Tool-use cho tutor (getLessonContext, getProgress)
