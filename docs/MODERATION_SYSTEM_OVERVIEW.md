# Tổng Quan Hệ Thống Kiểm Duyệt Livestream

## 📋 Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Tính Năng Chính](#tính-năng-chính)
4. [Workflow](#workflow)
5. [Cấu Hình Policy](#cấu-hình-policy)
6. [AI Moderation](#ai-moderation)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [Database Schema](#database-schema)

---

## 🎯 Giới Thiệu

Hệ thống kiểm duyệt tự động cho livestream và comment, sử dụng AI (Gemini) để phát hiện và chặn nội dung không phù hợp, vi phạm quy tắc cộng đồng hoặc pháp luật.

### ⚡ Quan Trọng: Hệ Thống Hoạt Động HOÀN TOÀN TỰ ĐỘNG

**KHÔNG CẦN host can thiệp!** Hệ thống có 2 chế độ:

#### 1. **Chế Độ Tự Động (Mặc Định)** ✅
- AI tự động phân tích và quyết định
- **KHÔNG CẦN** host thêm từ khóa
- **KHÔNG CẦN** host phê duyệt
- Hoạt động 24/7, tự động chặn nội dung vi phạm

#### 2. **Chế Độ Thủ Công (Tùy Chọn)**
- Host có thể bật để phê duyệt từng comment
- Chỉ dùng khi cần kiểm soát chặt chẽ hơn

**Từ khóa bị chặn là TÙY CHỌN** - chỉ để bổ sung cho AI, không bắt buộc. AI vẫn hoạt động tốt mà không cần từ khóa.

### Mục Tiêu
- **Bảo vệ người dùng**: Ngăn chặn nội dung độc hại, spam, quấy rối
- **Tuân thủ pháp luật**: Phát hiện nội dung vi phạm pháp luật
- **Môi trường giáo dục**: Duy trì môi trường học tập lành mạnh
- **Tự động hóa**: Giảm tải công việc kiểm duyệt thủ công

---

## 🏗️ Kiến Trúc Hệ Thống

### Backend Components

```
backend/src/
├── models/
│   ├── livestream-policy.model.ts      # Policy cho từng livestream
│   └── comment-moderation.model.ts     # Lịch sử moderation
├── modules/
│   └── moderation/
│       ├── moderation.service.ts       # Business logic + AI integration
│       ├── moderation.controller.ts    # HTTP handlers
│       └── moderation.routes.ts       # API routes
└── modules/livestream/
    └── livestream.gateway.ts           # Socket.IO integration
```

### Frontend Components

```
frontend/src/
├── services/api/
│   └── moderation.api.ts              # API client
├── hooks/
│   └── useModeration.ts                # React Query hooks
└── pages/livestream/
    ├── create/components/
    │   └── ModerationSettings.tsx      # UI cấu hình policy
    └── host/components/
        └── ModerationPanel.tsx         # Panel quản lý moderation
```

---

## ✨ Tính Năng Chính

### 1. **Comment Moderation (Kiểm Duyệt Bình Luận)**

#### Tự Động
- ✅ **AI Detection**: Sử dụng Gemini AI để phát hiện:
  - Toxicity (nội dung độc hại)
  - Spam (tin nhắn rác)
  - Profanity (từ ngữ thô tục)
  - Harassment (quấy rối)
  - Illegal content (nội dung vi phạm pháp luật)
  - Inappropriate (không phù hợp)
  - Self-harm (tự hại)
  - Violence (bạo lực)

- ✅ **Keyword Filtering**: Chặn comment chứa từ khóa bị cấm
- ✅ **Rate Limiting**: Chống spam (giới hạn thời gian giữa các comment)
- ✅ **Length Validation**: Giới hạn độ dài comment
- ✅ **Violation Tracking**: Theo dõi số lần vi phạm của user

#### Thủ Công (Tùy Chọn)
- ✅ Host có thể bật chế độ "Manual Moderation" để phê duyệt từng comment trước khi hiển thị
- ✅ Host có thể phê duyệt/từ chối/chặn comment thủ công trong Moderation Panel

### 2. **Content Moderation (Kiểm Duyệt Nội Dung Livestream)**

- ✅ **Title/Description Check**: Kiểm tra tiêu đề và mô tả khi tạo livestream
- ✅ **AI Analysis**: Phân tích nội dung bằng AI
- ✅ **Keyword Filtering**: Chặn từ khóa không phù hợp trong title/description

### 3. **Policy Management (Quản Lý Policy)**

- ✅ **Per-Session Policy**: Mỗi livestream có policy riêng
- ✅ **Default Policy**: Tự động tạo policy mặc định khi tạo livestream
- ✅ **Customizable Settings**: Host có thể tùy chỉnh:
  - Bật/tắt moderation
  - Bật/tắt AI moderation
  - Bật/tắt manual moderation
  - Danh sách từ khóa bị chặn
  - Giới hạn độ dài comment
  - Khoảng cách thời gian giữa các comment
  - Ngưỡng vi phạm (số lần trước khi bị chặn)

### 4. **Moderation History (Lịch Sử Kiểm Duyệt)**

- ✅ **Complete Log**: Lưu trữ tất cả actions moderation
- ✅ **AI Results**: Lưu risk score, categories, và lý do từ AI
- ✅ **Manual Actions**: Lưu actions thủ công của host
- ✅ **Filtering & Search**: Lọc và tìm kiếm trong lịch sử

---

## 🔄 Workflow

### 1. Tạo Livestream với Policy

```
User tạo livestream
    ↓
Cấu hình Moderation Settings (trong form)
    ↓
Tạo session
    ↓
Tự động tạo/update policy
    ↓
Kiểm tra title/description bằng AI
    ↓
Log cảnh báo nếu có rủi ro (không block creation)
```

### 2. Comment Moderation Flow

```
User gửi comment
    ↓
Kiểm tra rate limiting (chống spam) - TỰ ĐỘNG
    ↓
Kiểm tra độ dài comment - TỰ ĐỘNG
    ↓
Kiểm tra từ khóa bị chặn (nếu có) - TỰ ĐỘNG
    ↓
AI Moderation (nếu bật) - TỰ ĐỘNG, KHÔNG CẦN HOST
    ├─→ Risk Score: 0.0 - 1.0
    ├─→ Risk Categories: [toxicity, spam, ...]
    └─→ Reason: Lý do từ AI
    ↓
Kiểm tra violation count của user - TỰ ĐỘNG
    ↓
Quyết định TỰ ĐỘNG:
    ├─→ APPROVED: Hiển thị comment ngay
    ├─→ REJECTED: Từ chối, gửi error cho user
    ├─→ BLOCKED: Chặn, gửi error cho user
    └─→ PENDING: Chờ host phê duyệt (CHỈ KHI bật manual mode)
    ↓
Lưu moderation record vào database
```

**Lưu ý**: 
- Với chế độ mặc định (AI + Auto), tất cả đều **TỰ ĐỘNG**
- Host **KHÔNG CẦN** làm gì, hệ thống tự xử lý
- Chỉ khi bật "Manual Moderation" thì comment mới chờ host phê duyệt

### 3. Host Moderation Management

```
Host mở Moderation Panel
    ↓
Xem danh sách moderation history
    ├─→ Filter theo status (pending, approved, rejected, blocked)
    ├─→ Search theo keyword
    └─→ Xem risk score và categories
    ↓
Xử lý comment pending (nếu manual mode)
    ├─→ Approve: Phê duyệt comment
    ├─→ Reject: Từ chối comment
    └─→ Block: Chặn comment và user
```

---

## ⚙️ Cấu Hình Policy

### Policy Structure

```typescript
interface LivestreamPolicy {
  // Comment Moderation
  comment_moderation_enabled: boolean;        // Bật/tắt kiểm duyệt comment
  comment_ai_moderation: boolean;             // Sử dụng AI
  comment_manual_moderation: boolean;         // Yêu cầu phê duyệt thủ công
  comment_blocked_keywords: string[];         // Từ khóa bị chặn
  comment_max_length: number;                 // Độ dài tối đa (ký tự)
  comment_min_interval_seconds: number;       // Khoảng cách tối thiểu (giây)
  
  // Content Moderation
  content_moderation_enabled: boolean;        // Bật/tắt kiểm duyệt nội dung
  content_ai_moderation: boolean;              // Sử dụng AI cho content
  content_blocked_keywords: string[];         // Từ khóa bị chặn cho content
  
  // Violation Settings
  auto_block_violations: boolean;              // Tự động chặn vi phạm
  auto_warn_violations: boolean;              // Tự động cảnh báo
  violation_threshold: number;                 // Ngưỡng vi phạm (số lần)
}
```

### Default Policy

Khi tạo livestream mới, policy mặc định:
- ✅ Comment moderation: **Bật**
- ✅ AI moderation: **Bật**
- ✅ Manual moderation: **Tắt**
- ✅ Max length: **500 ký tự**
- ✅ Min interval: **2 giây**
- ✅ Violation threshold: **3 lần**
- ✅ Auto block: **Bật**
- ✅ Auto warn: **Bật**

---

## 🤖 AI Moderation

### Gemini AI Integration

**Model**: `gemini-1.5-flash` (Free tier)

**System Prompt**:
```
Bạn là một hệ thống kiểm duyệt nội dung tự động cho nền tảng giáo dục trực tuyến.

Nhiệm vụ: Phân tích nội dung và đánh giá mức độ rủi ro (0.0 - 1.0)

Các loại rủi ro:
- toxicity: Nội dung độc hại, xúc phạm, kỳ thị
- spam: Spam, quảng cáo không mong muốn
- profanity: Từ ngữ thô tục
- harassment: Quấy rối, đe dọa
- illegal: Nội dung vi phạm pháp luật
- inappropriate: Không phù hợp với môi trường giáo dục
- self_harm: Nội dung tự hại
- violence: Bạo lực
```

**Response Format**:
```json
{
  "riskScore": 0.0-1.0,
  "riskCategories": ["category1", "category2"],
  "approved": true/false,
  "reason": "Lý do",
  "shouldBlock": true/false,
  "shouldWarn": true/false
}
```

**Risk Score Interpretation**:
- `0.0 - 0.3`: An toàn (Green)
- `0.3 - 0.7`: Cảnh báo (Orange)
- `0.7 - 1.0`: Nguy hiểm (Red) - Tự động chặn

### 📋 Ví Dụ Cụ Thể: Comment Nào Bị Cấm?

#### 1. **Toxicity (Nội Dung Độc Hại)** - Risk: 0.8-1.0
**Bị chặn:**
- ❌ "Mày ngu quá, học lại đi"
- ❌ "Giảng viên này dạy dở quá"
- ❌ "Đồ ngu, không hiểu gì cả"
- ❌ "Mấy đứa này toàn là lũ ngu"

**Được phép:**
- ✅ "Câu hỏi này khó quá, em chưa hiểu"
- ✅ "Thầy có thể giải thích lại được không?"
- ✅ "Em nghĩ cách này có thể tốt hơn"

#### 2. **Spam (Tin Nhắn Rác)** - Risk: 0.7-0.9
**Bị chặn:**
- ❌ "Click vào link này: http://spam.com"
- ❌ "Mua khóa học giá rẻ tại..."
- ❌ "Like page của tôi nhé: facebook.com/..."
- ❌ "aaaaaaaaaaaaaaaa" (ký tự lặp lại)
- ❌ "123456789" (số liên tiếp)

**Được phép:**
- ✅ "Cảm ơn thầy đã giải thích"
- ✅ "Em có câu hỏi về bài học"

#### 3. **Profanity (Từ Ngữ Thô Tục)** - Risk: 0.8-1.0
**Bị chặn:**
- ❌ Các từ tục tĩu, chửi thề
- ❌ Từ ngữ không phù hợp môi trường giáo dục

**Được phép:**
- ✅ "Bài học này hay quá"
- ✅ "Em rất thích cách giảng của thầy"

#### 4. **Harassment (Quấy Rối, Đe Dọa)** - Risk: 0.9-1.0
**Bị chặn:**
- ❌ "Tao sẽ tìm mày ngoài đời"
- ❌ "Mày đừng có mà nói nữa"
- ❌ "Đồ con chó, im đi"
- ❌ Đe dọa, đe dọa bạo lực

**Được phép:**
- ✅ "Em không đồng ý với ý kiến này"
- ✅ "Theo em nghĩ thì..."

#### 5. **Illegal Content (Vi Phạm Pháp Luật)** - Risk: 1.0
**Bị chặn:**
- ❌ "Mua bán ma túy, vũ khí"
- ❌ "Hack tài khoản, lừa đảo"
- ❌ "Chia sẻ nội dung bất hợp pháp"
- ❌ "Tổ chức hoạt động bất hợp pháp"

#### 6. **Inappropriate (Không Phù Hợp)** - Risk: 0.6-0.8
**Bị chặn:**
- ❌ Nội dung khiêu dâm, tình dục
- ❌ Nội dung chính trị nhạy cảm
- ❌ Nội dung tôn giáo gây tranh cãi
- ❌ Nội dung không liên quan đến học tập

**Được phép:**
- ✅ Câu hỏi về bài học
- ✅ Thảo luận về nội dung khóa học

#### 7. **Self-Harm (Tự Hại)** - Risk: 0.9-1.0
**Bị chặn:**
- ❌ "Tao muốn tự tử"
- ❌ "Tao sẽ làm hại bản thân"
- ❌ Nội dung khuyến khích tự hại

#### 8. **Violence (Bạo Lực)** - Risk: 0.8-1.0
**Bị chặn:**
- ❌ "Tao sẽ đánh mày"
- ❌ "Giết chết nó đi"
- ❌ Mô tả bạo lực, đe dọa bạo lực

### 🎯 Ví Dụ Thực Tế

#### Scenario 1: Comment Bình Thường
```
User: "Thầy ơi, em chưa hiểu phần này lắm, thầy có thể giải thích lại không?"
→ Risk Score: 0.1
→ Status: ✅ APPROVED (Hiển thị ngay)
```

#### Scenario 2: Comment Có Rủi Ro Nhẹ
```
User: "Bài này khó quá, em không hiểu gì cả"
→ Risk Score: 0.4
→ Status: ⚠️ APPROVED + WARNING (Hiển thị nhưng cảnh báo)
```

#### Scenario 3: Comment Có Từ Ngữ Không Phù Hợp
```
User: "Mày ngu quá, học lại đi"
→ Risk Score: 0.85
→ Categories: ["toxicity", "harassment"]
→ Status: ❌ BLOCKED (Tự động chặn)
→ Response: "Comment của bạn không phù hợp với quy tắc cộng đồng"
```

#### Scenario 4: Comment Spam
```
User: "Click vào link này để nhận quà: http://spam.com"
→ Risk Score: 0.9
→ Categories: ["spam", "inappropriate"]
→ Status: ❌ BLOCKED (Tự động chặn)
```

#### Scenario 5: Comment Vi Phạm Pháp Luật
```
User: "Ai muốn mua ma túy không?"
→ Risk Score: 1.0
→ Categories: ["illegal"]
→ Status: ❌ BLOCKED (Tự động chặn + có thể báo cáo)
```

### 📊 Bảng Tóm Tắt

| Loại Nội Dung | Risk Score | Hành Động | Ví Dụ |
|--------------|------------|-----------|-------|
| An toàn | 0.0 - 0.3 | ✅ Approve | "Cảm ơn thầy" |
| Cảnh báo | 0.3 - 0.7 | ⚠️ Approve + Warn | "Khó quá không hiểu" |
| Nguy hiểm | 0.7 - 1.0 | ❌ Block | "Mày ngu quá" |
| Vi phạm pháp luật | 1.0 | ❌ Block + Report | "Mua bán ma túy" |

### 🔍 Keyword Filtering (Nếu Host Thêm)

Nếu host thêm từ khóa vào danh sách chặn, ví dụ:
- `["spam", "quảng cáo", "link"]`

Thì comment chứa các từ này sẽ bị chặn ngay lập tức, không cần qua AI:
```
User: "Click vào link này"
→ Keyword Check: ✅ Found "link"
→ Status: ❌ BLOCKED (Ngay lập tức, không cần AI)
```

**Lưu ý**: Keyword filtering chỉ là bổ sung. AI vẫn sẽ phát hiện các biến thể và ngữ cảnh mà keyword không bắt được.

---

## 🔌 API Endpoints

### Base Path: `/api/v1/moderation`

#### 1. Get Policy
```
GET /sessions/:sessionId/policy
```
**Response**: `LivestreamPolicy`

#### 2. Update Policy
```
PUT /sessions/:sessionId/policy
Authorization: Required (INSTRUCTOR/ADMIN)
Body: UpdatePolicyPayload
```
**Response**: `LivestreamPolicy`

#### 3. Get Moderation History
```
GET /sessions/:sessionId/moderation-history
Authorization: Required (INSTRUCTOR/ADMIN)
Query Params:
  - page?: number
  - limit?: number
  - status?: 'pending' | 'approved' | 'rejected' | 'blocked' | 'flagged'
```
**Response**: `{ data: CommentModeration[], total?: number }`

#### 4. Moderate Comment (Manual)
```
POST /messages/:messageId/moderate
Authorization: Required (INSTRUCTOR/ADMIN)
Body: {
  action: 'approve' | 'reject' | 'block',
  reason?: string
}
```
**Response**: `CommentModeration`

---

## 🎨 Frontend Components

### 1. ModerationSettings Component

**Location**: `frontend/src/pages/livestream/create/components/ModerationSettings.tsx`

**Features**:
- Cấu hình policy khi tạo livestream
- Toggle bật/tắt các tính năng
- Thêm/xóa từ khóa bị chặn
- Cấu hình giới hạn và ngưỡng

**Usage**:
```tsx
<ModerationSettings
  value={moderationSettings}
  onChange={setModerationSettings}
/>
```

### 2. ModerationPanel Component

**Location**: `frontend/src/pages/livestream/host/components/ModerationPanel.tsx`

**Features**:
- Xem lịch sử moderation
- Filter theo status
- Search trong lịch sử
- Phê duyệt/từ chối/chặn comment thủ công
- Hiển thị risk score và categories từ AI

**Usage**:
```tsx
<ModerationPanel
  sessionId={sessionId}
  className="h-full"
/>
```

### 3. Integration trong SessionPage

Host có thể chuyển đổi giữa **Chat** và **Kiểm duyệt** tab trong session page.

---

## 💾 Database Schema

### 1. livestream_policies

```sql
CREATE TABLE livestream_policies (
  id UUID PRIMARY KEY,
  session_id UUID UNIQUE NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  
  -- Comment Moderation
  comment_moderation_enabled BOOLEAN DEFAULT true,
  comment_ai_moderation BOOLEAN DEFAULT true,
  comment_manual_moderation BOOLEAN DEFAULT false,
  comment_blocked_keywords TEXT[] DEFAULT '{}',
  comment_max_length INTEGER DEFAULT 500,
  comment_min_interval_seconds INTEGER DEFAULT 2,
  
  -- Content Moderation
  content_moderation_enabled BOOLEAN DEFAULT true,
  content_ai_moderation BOOLEAN DEFAULT true,
  content_blocked_keywords TEXT[] DEFAULT '{}',
  
  -- Violation Settings
  auto_block_violations BOOLEAN DEFAULT true,
  auto_warn_violations BOOLEAN DEFAULT true,
  violation_threshold INTEGER DEFAULT 3,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. comment_moderations

```sql
CREATE TABLE comment_moderations (
  id UUID PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES live_session_messages(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked', 'flagged')),
  
  -- AI Results
  ai_checked BOOLEAN DEFAULT false,
  ai_risk_score DECIMAL(5,2),
  ai_risk_categories TEXT[] DEFAULT '{}',
  ai_reason TEXT,
  
  -- Manual Moderation
  moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  moderation_reason TEXT,
  moderated_at TIMESTAMP,
  
  -- Violation Tracking
  violation_count INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comment_moderations_session ON comment_moderations(session_id);
CREATE INDEX idx_comment_moderations_user ON comment_moderations(user_id);
CREATE INDEX idx_comment_moderations_status ON comment_moderations(status);
```

---

## 📊 Moderation Result Flow

### Decision Tree

```
Comment được gửi
    ↓
Rate Limit Check
    ├─→ Fail → Reject (wait X seconds)
    └─→ Pass → Continue
    ↓
Length Check
    ├─→ Too Long → Reject
    └─→ OK → Continue
    ↓
Keyword Check
    ├─→ Found → Reject (high risk)
    └─→ Not Found → Continue
    ↓
AI Moderation (if enabled)
    ├─→ Risk Score >= 0.7 → Block
    ├─→ Risk Score >= 0.4 → Warn + Approve
    └─→ Risk Score < 0.4 → Approve
    ↓
Violation Count Check
    ├─→ >= Threshold → Block User
    └─→ < Threshold → Continue
    ↓
Manual Moderation (if enabled)
    ├─→ Pending → Wait for host approval
    └─→ Auto → Use AI result
    ↓
Final Decision
    ├─→ APPROVED → Broadcast to all viewers
    ├─→ REJECTED → Send error to sender
    ├─→ BLOCKED → Send error + block user
    └─→ PENDING → Wait in queue
```

---

## 🛡️ Security & Privacy

### Data Protection
- ✅ Moderation records chỉ host/admin mới xem được
- ✅ AI chỉ phân tích nội dung, không lưu trữ dữ liệu cá nhân
- ✅ Violation tracking chỉ lưu số lần, không lưu chi tiết

### Performance
- ✅ AI moderation chạy async, không block user
- ✅ Rate limiting giảm tải server
- ✅ Keyword filtering nhanh (in-memory check)

---

## 🚀 Future Enhancements

### Potential Improvements
- [ ] Machine Learning model training từ dữ liệu moderation
- [ ] Real-time notification cho host khi có comment pending
- [ ] Auto-moderation rules dựa trên pattern
- [ ] Integration với third-party moderation services
- [ ] Analytics dashboard cho moderation metrics
- [ ] Bulk moderation actions
- [ ] Appeal system cho user bị chặn

---

## 📝 Notes

### Best Practices
1. **Luôn bật AI moderation** cho livestream công khai
2. **Cấu hình từ khóa bị chặn** phù hợp với ngữ cảnh
3. **Theo dõi violation count** để phát hiện user có vấn đề
4. **Review moderation history** định kỳ để cải thiện policy

### Limitations
- AI có thể có false positives/negatives
- Keyword filtering có thể bỏ sót biến thể từ ngữ
- Manual moderation cần host online để xử lý

---

## 📞 Support

Nếu có vấn đề với hệ thống moderation:
1. Kiểm tra policy settings
2. Xem moderation history để debug
3. Kiểm tra AI service status
4. Review logs trong backend

---

**Last Updated**: 2025-12-01
**Version**: 1.0.0

