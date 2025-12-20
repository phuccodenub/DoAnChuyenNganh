# 🎯 CHIẾN LƯỢC AI CÂN BẰNG - TẬN DỤNG GROQ

**Ngày cập nhật:** 19/12/2025  
**Dựa trên:** Phân tích thực tế các providers có sẵn

---

## 📊 TÓM TẮT PROVIDERS

### 🟢 Tier 1: Fast + Free (Groq)

Groq cung cấp **NHIỀU models tuyệt vời** với free tier rộng rãi:

| Model | Strengths | Use Cases | Latency |
|-------|-----------|-----------|---------|
| **Llama 3.3 70B Versatile** | General purpose, reasoning, multilingual | AI Tutor chính, general chat | 0.5-1.5s |
| **Qwen 3 32B** | Math, logic, technical reasoning | Math tutoring, logic problems | 0.8-2s |
| **Llama 4 Scout** | Vision, multimodal | Image analysis (future) | 1-2s |
| **Whisper Large v3** | Speech to text, transcription | Audio transcription (future) | 1-3s |
| **GPT OSS 120B** | Advanced reasoning (backup) | Complex reasoning fallback | 1-2s |

**✅ Ưu điểm:**
- Free tier rộng rãi
- Latency thấp (< 2s)
- Nhiều models chuyên biệt
- Rate limit cao

**⚠️ Hạn chế:**
- Context window nhỏ hơn (32K-128K)
- Không có model code chuyên sâu

---

### 🟡 Tier 1.5: Free Fallback (Google AI)

| Model | Context | Use Cases |
|-------|---------|-----------|
| **Gemini 2.5 Flash** | 1M tokens | General fallback, batch processing |

**✅ Ưu điểm:**
- Context window lớn (1M)
- Free tier
- Ổn định cao

**⚠️ Hạn chế:**
- Chỉ có 1 model
- Latency cao hơn Groq (2-4s)
- Rate limit thấp hơn (60 req/min)

---

### 🔵 Tier 2: Powerful + Local (ProxyPal)

**⚠️ CHỈ DÙNG KHI CẦN THIẾT - Phụ thuộc vào tài khoản cá nhân**

| Model | Context | Strengths |
|-------|---------|-----------|
| **Gemini 3 Pro Preview** | 2M tokens | Large context, content repurposing |
| **Qwen 3 Coder Plus** | 32K tokens | Code review, technical grading |
| **Qwen 3 Coder Flash** | 128K tokens | Fast code generation |

**✅ Ưu điểm:**
- Models rất mạnh
- Context cực lớn (Gemini 3: 2M)
- Chuyên sâu về code (Qwen Coder)

**⚠️ Hạn chế:**
- Cần chạy ProxyPal local
- Latency cao (3-8s)
- Phụ thuộc subscription cá nhân
- Chỉ dùng dev/testing

---

### 🔴 Tier 3: Premium (MegaLLM)

**🚨 DÙNG CỰC KỲ TIẾT KIỆM - $150 credit không hồi phục**

| Model | Input/Output | Use Cases |
|-------|--------------|-----------|
| **Claude Sonnet 4.5** | $3/$15 per M | Critical decisions, grade appeals |
| **Claude Opus 4.5** | $5/$25 per M | Highest quality needed |

**✅ Ưu điểm:**
- Chất lượng cao nhất
- Reasoning tốt nhất
- Chuyên sâu nhiều lĩnh vực

**⚠️ Hạn chế:**
- Rất đắt
- Credit có giới hạn ($150 total)
- Chỉ dùng cho critical operations

---

## 🎯 CHIẾN LƯỢC MỚI

### Nguyên tắc cốt lõi

```
1. Groq FIRST - Tận dụng tối đa các models của Groq
2. Google Fallback - Dùng khi Groq không available
3. ProxyPal RARELY - Chỉ dùng cho dev hoặc tasks cần context lớn
4. MegaLLM CRITICAL ONLY - Chỉ dùng cho quyết định quan trọng
```

### Phân bổ theo Use Case

#### 1. AI Tutor (Chatbot học tập)

```
Priority 1: Groq Llama 3.3 70B (General)
   ↓ (if math question)
Priority 1: Groq Qwen 3 32B (Math)
   ↓ (if complex reasoning)
Priority 1: Groq Llama 3.3 70B (Reasoning)
   ↓ (if all Groq fail)
Fallback: Google Gemini 2.5 Flash
   ↓ (if all fail)
Error: "AI tạm thời không khả dụng"
```

**Tỷ lệ sử dụng mong đợi:**
- Groq: 85-90%
- Google: 10-15%
- ProxyPal: 0% (production), <5% (dev)

#### 2. Quiz Generator

```
Priority 1: Groq Llama 3.3 70B (Content < 32K tokens)
   ↓ (if content > 32K tokens)
Priority 2: Google Gemini 2.5 Flash (Context 1M)
   ↓ (if need very large context > 1M)
Priority 3: ProxyPal Gemini 3 Pro (Context 2M) - DEV ONLY
   ↓ (if critical final exam)
Priority 4: MegaLLM Claude Sonnet 4.5
```

**Tỷ lệ sử dụng mong đợi:**
- Groq: 60-70%
- Google: 25-35%
- ProxyPal: 0% (production), <5% (dev)
- MegaLLM: <1% (critical exams only)

#### 3. AI Grader

**Code Grading:**
```
Priority 1: Groq Llama 3.3 70B (Simple code < 500 lines)
   ↓ (if complex code or need deep review)
Priority 2: ProxyPal Qwen Coder Plus - DEV ONLY
   ↓ (if grade appeal)
Priority 3: MegaLLM Claude Sonnet 4.5
```

**Essay Grading:**
```
Priority 1: Groq Llama 3.3 70B (Essays < 32K tokens)
   ↓ (if large essay)
Priority 2: Google Gemini 2.5 Flash
   ↓ (if grade appeal)
Priority 3: MegaLLM Claude Sonnet 4.5
```

**Tỷ lệ sử dụng mong đợi:**
- Groq: 70-80%
- Google: 15-20%
- ProxyPal: 0% (production), <5% (dev)
- MegaLLM: <2% (appeals only)

#### 4. Content Repurposing (Video → Summary)

```
Priority 1: Google Gemini 2.5 Flash (Context 1M)
   ↓ (if transcript > 1M tokens - DEV ONLY)
Priority 2: ProxyPal Gemini 3 Pro (Context 2M)
```

**Tỷ lệ sử dụng mong đợi:**
- Google: 95-98%
- ProxyPal: 0% (production), 2-5% (dev)

---

## 💰 DỰ PHÓNG CHI PHÍ

### Scenario 1: Pure Free Tier (Production Recommended)

**Setup:**
- Groq: Primary (85-90% usage)
- Google: Fallback (10-15% usage)
- ProxyPal: Disabled
- MegaLLM: Disabled

**Chi phí:** **$0/tháng** ✅

**Limitations:**
- Không có grade appeals
- Không có premium features
- Context giới hạn 1M tokens

---

### Scenario 2: With Grade Appeals (Production with Premium)

**Setup:**
- Groq: Primary (85-90%)
- Google: Fallback (10-15%)
- ProxyPal: Disabled
- MegaLLM: Critical only (<2%)

**Chi phí dự kiến:**
- 100 students × 2 appeals/month = 200 appeals
- Average 5K tokens input + 2K output per appeal
- Cost: 200 × (5K × $3 + 2K × $15) / 1M = $9/month

**Total:** **~$10/month** from $150 credit = **15 tháng sử dụng**

---

### Scenario 3: Development với ProxyPal

**Setup:**
- Groq: Primary (70-80%)
- Google: Fallback (15-20%)
- ProxyPal: Dev testing (<5%)
- MegaLLM: Disabled

**Chi phí:** **$0/tháng** (dùng subscription cá nhân)

---

## 🔧 CẤU HÌNH KHUYẾN NGHỊ

### Production (Recommended)

```bash
# Tier 1: Groq (Primary)
GROQ_API_KEY=your-key
GROQ_MODEL_DEFAULT=llama-3.3-70b-versatile
GROQ_MODEL_REASONING=llama-3.3-70b-versatile
GROQ_MODEL_MATH=qwen-3-32b

# Tier 1.5: Google (Fallback)
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash

# Tier 2: ProxyPal (Disabled)
PROXYPAL_ENABLED=false

# Tier 3: MegaLLM (Enabled but limited)
MEGALM_API_KEY=your-key-if-you-want-appeals
MEGALM_BASE_URL=https://api.megallm.com

# Features
AI_TUTOR_ENABLED=true
AI_QUIZ_GENERATOR_ENABLED=true
AI_GRADER_ENABLED=true
AI_CONTENT_REPURPOSING_ENABLED=false  # Bật khi cần
```

### Development

```bash
# Same as production but enable ProxyPal
PROXYPAL_ENABLED=true
PROXYPAL_BASE_URL=http://localhost:8317

# Test với powerful models
AI_CONTENT_REPURPOSING_ENABLED=true
```

---

## 📈 MONITORING & OPTIMIZATION

### Metrics cần theo dõi

1. **Provider Usage Distribution**
   ```
   Groq:      85-90%  ✅ Healthy
   Google:    10-15%  ✅ Good fallback rate
   ProxyPal:  0-5%    ✅ Dev only
   MegaLLM:   <2%     ✅ Critical only
   ```

2. **Latency Targets**
   ```
   Groq:      < 2s    ✅
   Google:    < 4s    ✅
   ProxyPal:  < 8s    ⚠️ (Dev acceptable)
   ```

3. **Cost Tracking**
   ```
   MegaLLM usage: < $10/month
   Remaining credit: Monitor weekly
   ```

### Optimization Actions

**If Groq usage < 80%:**
- Kiểm tra availability
- Review fallback logic
- Optimize question classification

**If MegaLLM usage > $15/month:**
- Review critical operation criteria
- Consider disabling grade appeals
- Add human review layer

**If latency > targets:**
- Check network
- Review provider selection logic
- Consider caching strategies

---

## 🚀 IMPLEMENTATION CHECKLIST

- [x] Update env.example với Groq multi-model config
- [x] Update env.config.ts với Groq models object
- [x] Update AI Orchestrator với specialized model selection
- [x] Create strategy document
- [ ] Test Groq Math model với math questions
- [ ] Test fallback chain: Groq → Google
- [ ] Monitor provider distribution in logs
- [ ] Setup MegaLLM (optional, for grade appeals)

---

## 📚 REFERENCES

- [Groq Console](https://console.groq.com/) - API keys & model list
- [Google AI Studio](https://aistudio.google.com/) - Gemini API
- [ProxyPal](https://proxypal.ai/) - Local gateway setup
- [AI Orchestrator Code](src/modules/ai/orchestrator/ai-orchestrator.ts)

---

**✅ Chiến lược này cho phép:**
1. ✅ Dùng free tier tối đa (Groq + Google)
2. ✅ Tận dụng nhiều specialized models của Groq
3. ✅ Tiết kiệm ProxyPal cho dev/testing only
4. ✅ Dự phòng MegaLLM cho critical operations
5. ✅ Chi phí production: $0-10/tháng

**🎯 Mục tiêu cuối cùng: Zero cost trong 90% use cases, premium available khi cần!**
