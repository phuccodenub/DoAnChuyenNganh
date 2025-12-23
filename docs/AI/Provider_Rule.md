# 📜 Provider Rule & Usage (VI)

**Mục đích:** Hướng dẫn chọn và dùng đúng provider AI hiện có, nêu rõ ưu/nhược điểm, quota và quy tắc vận hành.  
**Phạm vi:** Google AI Studio API, Groq, ProxyPal (local dev).  
**Cập nhật:** December 23, 2025 - Loại bỏ Gemini models khỏi ProxyPal (bị chặn), giữ GPT và Qwen.

---

## 🧭 Chọn nhanh theo nhu cầu

| Tình huống | Ưu tiên | Fallback / Ghi chú |
| :--- | :--- | :--- |
| Chat tổng quát, hỏi nhanh | Groq (Llama 3.3 70B) | Google Gemini 2.5 Flash khi cần chất lượng cao hơn |
| Toán | Groq Qwen 32B (đã định tuyến riêng) | Không cần fallback |
| Sinh code, giải quyết logic phức tạp | Google Gemini 3 Flash | ProxyPal GPT-5.x hoặc Qwen Coder (chỉ local) |
| Nhiệm vụ đơn giản/cần phản hồi rất nhanh | Google Gemini 2.5 Flash Lite hoặc Groq | Tùy tải |
| Nội dung dài, cần bền phiên (chỉ local) | ProxyPal GPT-5.x | Dùng cho dev, không production |
| TTS | Google `gemini-2.5-flash-tts` | - |
| Video analysis | Google Gemini (direct API) | Cần GEMINI_API_KEY |

---

## 🛡️ Quy tắc chung

1) Google AI bị giới hạn **20 RPD/model/key** (free). Đã bật **xoay 3 key** để đạt tối đa ~180 RPD tổng.  
2) Groq free, hạn mức rộng, dùng cho lưu lượng lớn và tác vụ đơn giản/trung bình.  
3) ProxyPal **chỉ dùng local**; không chạy trên môi trường production.  
4) Luôn tuân thủ định tuyến theo loại nhiệm vụ (math/code/general) trong `ai-orchestrator`.  
5) Kiểm tra nhanh provider bằng endpoint test: `POST /api/ai/test-provider` với `{ "message": "test", "provider": "<id>" }`.

---

## 🟦 Google AI Studio API

- **Model sẵn có:** `gemini-3-flash-preview`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-flash-tts`.
- **Cách dùng:** đặt API key Google vào biến môi trường (`GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`). Orchestrator sẽ tự xoay key.
- **Điểm mạnh:**
  - Chất lượng cao cho code và reasoning phức tạp.
  - Có TTS (`gemini-2.5-flash-tts`).
- **Điểm yếu:**
  - **Rate limit rất thấp: 20 RPD/model/key** → phải xoay nhiều key.
  - Độ trễ cao hơn Groq (~2–6s).
- **Dùng khi:** cần chất lượng cao, sinh code, suy luận sâu, hoặc TTS. Hạn chế spam do quota.

---

## 🟧 Groq

- **Model sẵn có:** `llama-3.3-70b-versatile`, `qwen/qwen3-32b` (math).
- **Cách dùng:** thiết lập `GROQ_API_KEY`; gọi trực tiếp qua orchestrator.
- **Điểm mạnh:**
  - Nhanh (thường ~0.5–1.5s).
  - Hạn mức rộng, dùng thoải mái cho lưu lượng lớn.
  - Dễ tích hợp.
- **Điểm yếu:**
  - Chất lượng/thời lượng ngữ cảnh không bằng Gemini 3 cho tác vụ phức tạp.
- **Dùng khi:** chat chung, hỏi nhanh, math (đã định tuyến Qwen 32B), tác vụ đơn giản/trung bình.

---

## 🟩 ProxyPal (Local only)

- **Model sẵn có:** `gpt-5.2`, `gpt-5.1`, `gpt-5`, `gemini-2.5-flash`, `qwen3-coder-plus` và `qwen3-coder-flash`.
- **⚠️ QUAN TRỌNG:** Gemini models (`gemini-3-pro-preview`) đã bị **chặn/không stable** trong ProxyPal. Chỉ dùng GPT và Qwen models.
- **Cách dùng:** chạy ProxyPal trên máy cá nhân, cấu hình API key `proxypal-local`. Chỉ hoạt động ở `localhost`.
- **Điểm mạnh:**
  - GPT models mạnh, ổn định cho text analysis và summary generation.
  - Qwen models tốt cho code và technical content.
  - Không chịu quota cloud trong quá trình dev.
- **Điểm yếu:**
  - Chỉ chạy local, không dùng cho production.
  - Gemini models bị block - không reliable.
  - Phụ thuộc máy cá nhân (tài nguyên, kết nối).
- **Dùng khi:** phát triển/local testing, cần model mạnh cho text analysis, không muốn đốt quota cloud.
- **Video Analysis:** Phải dùng Google Gemini direct API (không qua ProxyPal), vì ProxyPal không hỗ trợ video input.

---

## 🔀 Định tuyến nhiệm vụ (tóm tắt)

| Loại tác vụ | Chính | Fallback |
| :--- | :--- | :--- |
| Math | Groq Qwen 32B | (không) |
| Code | Google Gemini 3 Flash | ProxyPal Qwen Coder (local) |
| Text Analysis | ProxyPal GPT-5.x (local) | Google Gemini 2.5 Flash |
| Reasoning phức tạp | Google Gemini 3 Flash | Groq Llama 70B |
| Nhanh/nhẹ | Google Gemini 2.5 Lite hoặc Groq | - |
| Chat chung | Groq Llama 70B | Google Gemini 2.5 Flash |
| Video Analysis | Google Gemini Direct API | (không fallback - cần GEMINI_API_KEY) |

---

## 📌 Ghi chú vận hành

- Ưu tiên Groq cho tải lớn; chỉ đẩy sang Google khi cần chất lượng cao.  
- Khi dev offline/không muốn tốn quota: bật ProxyPal, dùng `proxypal-local` với GPT hoặc Qwen models.
- **KHÔNG DÙNG** Gemini models trong ProxyPal (bị chặn) - dùng Google direct API thay thế.
- Video analysis **bắt buộc** dùng Google Gemini direct API (không qua ProxyPal).
- Giữ số lượng key Google đủ (>=3) để duy trì xoay vòng; theo dõi RPD hằng ngày.  
- TTS chỉ qua Google; kiểm tra độ trễ khi dùng chuỗi dài.
- Lesson analysis service tự động track model/provider được sử dụng vào metadata.
