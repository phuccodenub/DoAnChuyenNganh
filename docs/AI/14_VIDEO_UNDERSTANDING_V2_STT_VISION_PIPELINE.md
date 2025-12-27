# 🎬 Video Understanding V2 (STT + Vision) — Thay thế đọc video trực tiếp

**Tài liệu (Document):** 14 - Video Understanding V2  
**Phiên bản (Version):** 1.0  
**Cập nhật gần nhất (Last Updated):** December 27, 2025  
**Mục tiêu:** Khôi phục và nâng cấp khả năng “phân tích video bài giảng” khi ProxyPal không còn hỗ trợ `gemini-3-pro-preview`.

---

## 1) Bối cảnh hiện tại trong codebase

- Backend có `LessonAnalysisService.analyzeVideoContent()` đang gọi `GeminiVideoService` (direct Gemini API) với biến `GEMINI_VIDEO_MODEL` (default: `gemini-3-pro-preview`).
- Tài liệu cũ từng ưu tiên ProxyPal Gemini cho video understanding, nhưng hiện ProxyPal không còn support model đó.
- Trong `env.ai.groq.models` đã có:
  - `speech`: `whisper-large-v3`
  - `vision`: `llama-4-scout`
  nhưng chưa có code pipeline video.

---

## 2) Kết luận khả thi (Verify)

**Có thể “phân tích video” mà không cần model đọc video trực tiếp** bằng cách:
- **Speech-to-Text** để lấy nội dung lời nói (transcript)
- **Vision** để lấy nội dung hình ảnh quan trọng (slide/diagram/whiteboard)
- **Reasoning** để hợp nhất (fusion) và tạo output chuẩn (summary/key points/rubric/quiz).

Đây là hướng phổ biến khi không có video-native model.

---

## 3) Kiến trúc pipeline đề xuất

### 3.1 Input
- `videoUrl` (YouTube / public MP4 / R2 object public/signed URL)
- hoặc upload video lên backend (multipart) để xử lý server-side

### 3.2 Processing steps (deterministic)

**Step A — Fetch & Cache**
- Download video về temp storage (giới hạn size).
- Cache theo hash(URL + etag) để tránh xử lý lại.

**Step B — Audio extraction**
- Dùng `ffmpeg` để trích audio track → `audio.wav` hoặc `audio.mp3`.
- Option: chunk audio theo mỗi 5–10 phút nếu video dài.

**Step C — Speech to Text (Groq Whisper)**
- Gọi endpoint STT để tạo transcript.
- Nên lấy thêm timestamps (nếu API hỗ trợ) hoặc tự chunk để suy timestamps.

**Step D — Frame sampling (Keyframes)**
- Sample frame theo interval (ví dụ 1 frame/10–20s), hoặc detect scene changes.
- Lưu frame (JPEG/PNG) và limit số frame (ví dụ tối đa 60–120 ảnh).

**Step E — Vision caption / OCR**
- Với mỗi frame:
  - caption: “what is shown”
  - OCR: text trên slide/whiteboard
  - detect diagrams/code snippets (nếu cần)

**Step F — Fusion (Reasoning model)**
- Input: transcript + list frame findings (caption/OCR + timestamps)
- Output: JSON chuẩn hoá cho LMS:
  - `transcript` (raw hoặc cleaned)
  - `keyPoints` (5–10)
  - `summary` (3–7 câu)
  - `slideOutline` (dàn ý theo slide)
  - `glossary` (term → definition)
  - `quizBlueprint` (optional)

---

## 4) Output schema đề xuất (để thay thế `VideoAnalysisResult`)

```json
{
  "transcript": "...",
  "language": "vi|en|mixed",
  "keyPoints": ["..."],
  "summary": "...",
  "duration": 0,
  "timeline": [
    {
      "t": 120,
      "type": "speech|slide|diagram",
      "text": "...",
      "source": "stt|vision"
    }
  ],
  "slideOutline": [
    {
      "tStart": 300,
      "tEnd": 420,
      "title": "...",
      "bullets": ["..."],
      "ocr": "..."
    }
  ],
  "metadata": {
    "providers": {
      "stt": {"provider": "groq", "model": "whisper-large-v3"},
      "vision": {"provider": "groq", "model": "llama-4-scout"},
      "fusion": {"provider": "groq", "model": "<reasoning-model>"}
    }
  }
}
```

---

## 5) Cấu hình (giữ cũ + thêm mới)

### 5.1 Giữ cấu hình cũ (legacy)
- `GEMINI_API_KEY`
- `GEMINI_VIDEO_MODEL` (để nếu sau này Gemini/ProxyPal quay lại hỗ trợ thì bật lại nhanh)

### 5.2 Cấu hình mới (Video V2)
Đề xuất thêm env vars (không phá tương thích):

```env
# Toggle
AI_VIDEO_PIPELINE=v2   # legacy|v2

# Limits
AI_VIDEO_MAX_DOWNLOAD_MB=100
AI_VIDEO_MAX_FRAMES=90
AI_VIDEO_FRAME_INTERVAL_SEC=15
AI_VIDEO_AUDIO_CHUNK_MIN=10

# Tooling
FFMPEG_PATH=ffmpeg

# Groq models
GROQ_MODEL_SPEECH=whisper-large-v3
GROQ_MODEL_VISION=llama-4-scout
GROQ_MODEL_REASONING=<set-to-reasoning-model>
```

---

## 6) Rủi ro & cách giảm

- **Video dài** → chunk audio + hạn chế frames.
- **Video chất lượng âm thanh kém** → STT sai → cần post-processing: punctuation, cleaning.
- **Slide nhỏ/blur** → OCR fail → tăng quality frame, sample ít nhưng “đúng lúc” (scene-change).
- **YouTube/DRM/private R2** → không download được → yêu cầu signed URL hoặc upload trực tiếp.

---

## 7) Tích hợp vào LMS (điểm gắn)

- `LessonAnalysisService.analyzeVideoContent()`:
  - giữ nhánh legacy (GeminiVideoService)
  - thêm nhánh v2: gọi `VideoUnderstandingV2Service` (STT+Vision)
- `AIGraderService`:
  - thêm path xử lý bài nộp ảnh (vision → text → grade)
- `QuizGeneratorService`:
  - nếu lesson là video: dùng transcript + slideOutline để generate quiz chất lượng hơn

Roadmap code-level nằm ở: **15_BACKEND_CHANGES_ROADMAP_GROQ_MULTIMODAL.md**.
