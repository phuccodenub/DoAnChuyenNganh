# 🚀 Hướng Dẫn Setup Groq API

## 📋 Tổng Quan

Groq đã được tích hợp vào hệ thống với **fallback tự động** sang Gemini:
- **Groq** được ưu tiên (nhanh, rate limit tốt)
- **Gemini** làm fallback (nếu Groq fail)

---

## ⚡ Quick Setup (5 Phút)

### Bước 1: Lấy API Key từ Groq

1. Truy cập: https://console.groq.com/
2. Đăng ký/Đăng nhập (miễn phí)
3. Vào **API Keys** → **Create API Key**
4. Copy API key

### Bước 2: Thêm vào `.env`

```bash
# Groq API (Free, rate limit tốt)
GROQ_API_KEY=your_groq_api_key_here

# Gemini API (Fallback - đã có sẵn)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Bước 3: Restart Server

```bash
npm run dev
```

---

## 📊 So Sánh

| Provider | Rate Limit | Daily Limit | Tốc Độ | Chi Phí |
|----------|-----------|-------------|--------|---------|
| **Groq** | 30 req/min | Không giới hạn | ⚡⚡⚡⚡⚡ | Free |
| **Gemini Free** | 5 req/min | 20 req/ngày | ⚡⚡⚡ | Free |

**Kết quả:** Groq tốt hơn Gemini **6x** về rate limit!

---

## 🎯 Cách Hoạt Động

1. **Request đến** → Thử Groq trước
2. **Nếu Groq thành công** → Trả về kết quả
3. **Nếu Groq fail** → Tự động fallback sang Gemini
4. **Nếu cả 2 fail** → Trả về lỗi

---

## ✅ Kiểm Tra Setup

Sau khi restart, check logs:

```
[AIService] Groq API configured (Model: llama-3.3-70b-versatile)
[AIService] Gemini API initialized successfully (Model: gemini-2.5-flash)
```

Khi gọi AI, bạn sẽ thấy:
```
[AIService] Trying Groq API first
[AIService] Groq API request completed in XXXms
```

Hoặc nếu Groq fail:
```
[AIService] Groq failed, falling back to Gemini
```

---

## 🔧 Cấu Hình Nâng Cao

### Groq Models

```bash
# Model mặc định (llama-3.3-70b-versatile - thay thế llama-3.1-70b-versatile)
GROQ_MODEL=llama-3.3-70b-versatile

# Hoặc các model khác:
# - llama-3.1-8b-instant (nhanh hơn, nhẹ hơn)
# - mixtral-8x7b-32768 (context window lớn)
# - llama-3.1-70b-versatile (đã bị decommissioned, không dùng nữa)
```

### Temperature & Tokens

```bash
GROQ_TEMPERATURE=0.7
GROQ_MAX_TOKENS=4096
```

---

## 🆘 Troubleshooting

### Groq Console bị 502 Bad Gateway?

- **Giải pháp:** Hệ thống tự động fallback sang Gemini
- Chờ Groq console hoạt động lại

### Không có provider nào available?

- Kiểm tra `.env` có ít nhất 1 API key (`GROQ_API_KEY` hoặc `GEMINI_API_KEY`)
- Restart server sau khi thêm key

### Groq API error?

- Kiểm tra API key đúng chưa
- Kiểm tra internet connection
- Hệ thống sẽ tự động fallback sang Gemini

---

## 💡 Tips

1. **Groq là primary** → Nhanh, rate limit tốt
2. **Gemini là backup** → Đảm bảo luôn có AI hoạt động
3. **Tự động fallback** → Không cần config gì thêm

---

## 📚 Tài Liệu Tham Khảo

- Groq Console: https://console.groq.com/
- Groq Docs: https://groq.com/docs
- Groq Models: https://console.groq.com/docs/models
