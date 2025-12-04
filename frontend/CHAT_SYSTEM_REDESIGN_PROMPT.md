# 📱 PROMPT: THIẾT KẾ LẠI HỆ THỐNG CHAT CHO LMS

> **Mục tiêu:** Refactor hệ thống chat để tất cả roles (Admin, Instructor, Student) đều có thể sử dụng.
> 
> **Nguyên tắc:** Tuân thủ mô hình **Hybrid Routing** - tách biệt Resource-Centric (tài nguyên chung) và Role-Centric (workspace riêng).

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### 1. Vấn đề hiện tại

| Vấn đề | Mô tả | Impact |
|--------|-------|--------|
| ❌ **Admin không có Chat** | Admin không có trang chat, không thể liên lạc với Student/Instructor | Cao |
| ❌ **Chat nằm sai chỗ** | Chat page đang nằm trong `/student/*` và `/instructor/*` thay vì shared | Cao |
| ❌ **Duplicate code** | `StudentChatPage.tsx` và `InstructorChatPage.tsx` gần như giống nhau 99% | Trung bình |
| ❌ **Chỉ hỗ trợ DM 1-1** | Chỉ có Direct Message giữa Student ↔ Instructor trong context khóa học | Trung bình |
| ❌ **Thiếu Group Chat** | Chưa có nhóm chat do Admin/Instructor tạo | Trung bình |
| ❌ **Course Discussion chưa integrate** | API `/api/chat/courses/:courseId/messages` đã có nhưng chưa dùng đúng | Trung bình |
| ❌ **AdminLayout thiếu "Tin nhắn"** | Sidebar của Admin không có link đến trang Tin nhắn | Cao |

### 2. Cấu trúc hiện tại

```
frontend/src/
├── pages/
│   ├── student/
│   │   └── ChatPage.tsx         ❌ Chỉ student mới access được
│   ├── instructor/
│   │   └── InstructorChatPage.tsx   ❌ Chỉ instructor mới access được
│   └── admin/
│       └── (không có chat)      ❌ Admin không có chat
│
├── features/
│   └── chat/                    ✅ Feature chat đã có sẵn (DM)
│       ├── components/
│       ├── types/
│       └── index.ts
│
└── routes/
    └── index.tsx                ❌ Routes đang hardcode theo role
```

### 3. Backend API đã sẵn sàng

#### Conversation API (Direct Message - `/api/v1/conversations`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy tất cả conversations của user hiện tại |
| GET | `/unread-count` | Đếm tổng tin nhắn chưa đọc |
| POST | `/` | Tạo conversation mới hoặc lấy existing |
| GET | `/:conversationId` | Lấy thông tin 1 conversation |
| GET | `/:conversationId/messages` | Lấy messages với pagination |
| POST | `/:conversationId/messages` | Gửi message mới |
| PUT | `/:conversationId/read` | Đánh dấu đã đọc tất cả messages |
| PUT | `/:conversationId/archive` | Archive/unarchive conversation |
| GET | `/:conversationId/search` | Tìm kiếm messages trong conversation |

#### Chat API (Course Discussion - `/api/chat`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/courses/:courseId/messages` | Lấy messages trong khóa học (pagination) |
| POST | `/courses/:courseId/messages` | Gửi message vào course chat |
| GET | `/courses/:courseId/messages/search` | Tìm kiếm messages |
| GET | `/courses/:courseId/statistics` | Thống kê chat của course |
| GET | `/courses/:courseId/messages/type/:messageType` | Lọc theo loại (text/file/image/announcement) |
| PUT | `/messages/:messageId` | Sửa message |
| DELETE | `/messages/:messageId` | Xóa message (soft delete) |

#### WebSocket Events đã implement

**Conversation Gateway (DM):**
- `dm:join_conversation` / `dm:leave_conversation`
- `dm:send_message` → `dm:new_message`
- `dm:mark_as_read` → `dm:message_read`
- `dm:typing_start` / `dm:typing_stop` → `dm:user_typing`
- `dm:get_unread_count` → `dm:unread_count`

**Chat Gateway (Course):**
- `chat:join_room` / `chat:leave_room`
- `chat:send_message` → `chat:new_message`
- `chat:edit_message` → `chat:message_updated`
- `chat:delete_message` → `chat:message_deleted`
- `chat:typing_start` / `chat:typing_stop` → `chat:user_typing`
- `chat:get_online_users` → `chat:online_users`

---

## 🎯 THIẾT KẾ MỚI

### 1. Kiến trúc Chat System

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHAT SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐    │
│  │   DIRECT     │   │    GROUP     │   │     COURSE       │    │
│  │   MESSAGE    │   │    CHAT      │   │    DISCUSSION    │    │
│  │   (1-1)      │   │  (Multiple)  │   │  (Per Course)    │    │
│  └──────────────┘   └──────────────┘   └──────────────────┘    │
│        │                   │                    │               │
│        │      ┌────────────┴────────────┐      │               │
│        │      │                         │      │               │
│        ▼      ▼                         ▼      ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              UNIFIED CHAT INTERFACE                      │   │
│  │         (ChatPage - Accessible by ALL roles)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│              ┌───────────────┼───────────────┐                 │
│              ▼               ▼               ▼                 │
│         ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│         │ STUDENT │    │INSTRUCTOR│   │  ADMIN  │             │
│         └─────────┘    └─────────┘    └─────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Loại Chat theo Nghiệp vụ

| Loại Chat | Mô tả | Participants | Ai có thể tạo |
|-----------|-------|--------------|---------------|
| **Direct Message** | Chat riêng 1-1 | 2 người bất kỳ | Bất kỳ ai |
| **Group Chat** | Nhóm chat tự do | N người | Admin, Instructor |
| **Course Discussion** | Thảo luận khóa học | Tất cả thành viên khóa học | Auto-created khi tạo course |

### 3. Ma trận quyền Chat

| Action | Student | Instructor | Admin |
|--------|---------|------------|-------|
| Xem danh sách conversations | ✅ | ✅ | ✅ |
| Gửi tin nhắn | ✅ | ✅ | ✅ |
| Bắt đầu DM với Instructor | ✅ | ✅ | ✅ |
| Bắt đầu DM với Student | ❌ | ✅ | ✅ |
| Bắt đầu DM với Admin | ❌ | ❌ | ✅ |
| Tạo Group Chat | ❌ | ✅ | ✅ |
| Thêm/xóa member trong Group | ❌ | ✅ (owner) | ✅ |
| Tham gia Course Discussion | ✅ (enrolled) | ✅ (owner) | ✅ |
| Gửi Announcement | ❌ | ✅ | ✅ |

---

## 📁 CẤU TRÚC THƯ MỤC MỚI

### Routing theo mô hình Hybrid

```
frontend/src/
├── pages/
│   ├── shared/                      🆕 SHARED PAGES (tất cả role đều dùng)
│   │   ├── ChatPage.tsx             ← Unified Chat Page
│   │   ├── MessagesPage.tsx         ← Alternative name (Tin nhắn)
│   │   └── ConversationDetailPage.tsx  ← Mobile-first detail view
│   │
│   ├── course/
│   │   └── detail/
│   │       └── CourseDiscussionTab.tsx  ← Tab thảo luận trong course detail
│   │
│   ├── student/
│   │   └── ... (các trang khác, KHÔNG có ChatPage)
│   │
│   ├── instructor/
│   │   └── ... (các trang khác, KHÔNG có ChatPage)
│   │
│   └── admin/
│       └── ... (các trang khác, KHÔNG có ChatPage)
│
├── features/
│   └── chat/                        ✅ GIỮA NGUYÊN (chỉ enhance)
│       ├── components/
│       │   ├── ChatLayout.tsx       ← Main layout với sidebar + panel
│       │   ├── ConversationList.tsx ← Danh sách conversations
│       │   ├── ConversationPanel.tsx← Panel chat chi tiết
│       │   ├── MessageBubble.tsx    ← Bubble tin nhắn
│       │   ├── MessageComposer.tsx  ← Input gửi tin
│       │   ├── ChatTabs.tsx         🆕 Tabs: DM | Groups | Courses
│       │   ├── NewChatModal.tsx     🆕 Modal tạo chat mới
│       │   └── GroupChatSettings.tsx 🆕 Settings cho group chat
│       ├── hooks/
│       │   ├── useChat.ts           ← Hook cho chat API
│       │   ├── useChatSocket.ts     🆕 Real-time socket integration
│       │   └── useChatPermissions.ts 🆕 Permission checking
│       ├── types/
│       │   └── index.ts             ← Enhanced types
│       └── index.ts
│
└── routes/
    └── index.tsx                    ← Updated routes
```

### Routes mới

```typescript
// constants/routes.ts - CẬP NHẬT

export const ROUTES = {
  // ... existing routes ...
  
  // SHARED ROUTES (accessible by all authenticated users)
  SHARED: {
    MESSAGES: '/messages',                     // Main chat page
    MESSAGES_DETAIL: '/messages/:conversationId', // Specific conversation (mobile)
  },
  
  // STUDENT routes - GIỮ NGUYÊN route cũ để backward compatible
  STUDENT: {
    // ... keep others ...
    CHAT: '/student/chat',  // ← GIỮ LẠI, sẽ redirect đến /messages
  },
  
  // INSTRUCTOR routes - GIỮ NGUYÊN route cũ để backward compatible
  INSTRUCTOR: {
    // ... keep others ...
    CHAT: '/instructor/chat',  // ← GIỮ LẠI, sẽ redirect đến /messages
  },
  
  // ADMIN routes - THÊM MỚI
  ADMIN: {
    // ... keep as is ...
    MESSAGES: '/admin/messages',  // ← THÊM MỚI (redirect đến /messages)
  },
}
```

```typescript
// routes/index.tsx - THÊM ROUTES MỚI

// Lazy load shared pages
const MessagesPage = lazy(() => import('@/pages/shared/MessagesPage'));

// Trong router configuration:

// SHARED ROUTES - Tất cả authenticated users đều access được
<Route element={<RequireAuth allowedRoles={['student', 'instructor', 'admin', 'super_admin']} />}>
  <Route path="/messages" element={<MessagesPage />} />
  <Route path="/messages/:conversationId" element={<MessagesPage />} />
</Route>

// REDIRECTS cho backward compatibility
<Route path="/student/chat" element={<Navigate to="/messages" replace />} />
<Route path="/instructor/chat" element={<Navigate to="/messages" replace />} />
```

---

## 🔧 IMPLEMENTATION PLAN

### Phase 1: Tạo Shared Chat Infrastructure (Priority: HIGH) 🚀

#### Task 1.1: Tạo MessagesPage chung (Unified Chat Page)

**File:** `frontend/src/pages/shared/MessagesPage.tsx`

**Yêu cầu:**
- [ ] Merge logic từ `StudentChatPage.tsx` và `InstructorChatPage.tsx`
- [ ] Sử dụng `useAuth()` để detect role hiện tại
- [ ] Xử lý transform data dựa trên role (student vs instructor vs admin)
- [ ] Support URL params: `?courseId=xxx` (từ course page navigate đến)
- [ ] Support route param: `/messages/:conversationId` (mobile deep link)

**Code skeleton:**
```tsx
// pages/shared/MessagesPage.tsx
import { useAuth } from '@/hooks/useAuth';
import { ChatLayout, Message, Conversation } from '@/features/chat';
import { useConversations, useMessages, useSendMessage } from '@/hooks/useConversations';

export function MessagesPage() {
  const { user } = useAuth();
  const currentRole = user?.role; // 'student' | 'instructor' | 'admin'
  
  // Transform logic based on role
  const transformConversation = (conv: ApiConversation): Conversation => {
    // Role-aware transformation
    const isStudent = currentRole === 'student';
    const participant = isStudent ? conv.instructor : conv.student;
    // ...
  };

  return (
    <div className="h-[calc(100vh-64px)]">
      <ChatLayout
        conversations={conversations}
        messages={messages}
        currentUserId={user?.id || ''}
        currentUserRole={currentRole}
        // ...
      />
    </div>
  );
}
```

#### Task 1.2: Cập nhật Routes

**File:** `frontend/src/routes/index.tsx`

- [ ] Thêm lazy import cho `MessagesPage`
- [ ] Thêm route `/messages` accessible by all authenticated roles
- [ ] Thêm route `/messages/:conversationId` cho mobile deep link
- [ ] Thêm `<Navigate>` component để redirect routes cũ

**File:** `frontend/src/constants/routes.ts`

- [ ] Thêm `SHARED.MESSAGES` và `SHARED.MESSAGES_DETAIL`
- [ ] Giữ nguyên `STUDENT.CHAT` và `INSTRUCTOR.CHAT` cho backward compatibility

#### Task 1.3: Cập nhật Navigation Sidebars

**Files cần sửa:**

1. `frontend/src/layouts/StudentDashboardLayout.tsx`
   - [ ] Đổi `href: ROUTES.STUDENT.CHAT` → `href: '/messages'`
   
2. `frontend/src/layouts/InstructorDashboardLayout.tsx`
   - [ ] Đổi `href: ROUTES.INSTRUCTOR.CHAT` → `href: '/messages'`
   
3. `frontend/src/layouts/AdminDashboardLayout.tsx`
   - [ ] THÊM navigation item mới cho "Tin nhắn"
   ```tsx
   {
     path: '/messages',
     icon: MessageCircle,
     label: 'Tin nhắn',
   }
   ```

#### Task 1.4: Xóa files deprecated (SAU KHI TEST XONG)

- [ ] Deprecate `pages/student/ChatPage.tsx` (không xóa, chỉ comment warning)
- [ ] Deprecate `pages/instructor/InstructorChatPage.tsx` (không xóa, chỉ comment warning)

### Phase 2: Enhance Chat Features (Priority: MEDIUM)

#### Task 2.1: Tạo ChatTabs Component
**File:** `frontend/src/features/chat/components/ChatTabs.tsx`

- [ ] Tab "Tin nhắn riêng" (DM) - sử dụng Conversation API
- [ ] Tab "Thảo luận khóa học" (Courses) - sử dụng Chat API
- [ ] (Future) Tab "Nhóm chat" (Groups)

```tsx
interface ChatTabsProps {
  activeTab: 'dm' | 'courses' | 'groups';
  onTabChange: (tab: 'dm' | 'courses' | 'groups') => void;
  dmUnreadCount?: number;
  courseUnreadCount?: number;
}
```

#### Task 2.2: Tích hợp Course Discussion
**File:** `frontend/src/features/chat/hooks/useCourseChat.ts`

- [ ] Hook để fetch messages từ `/api/chat/courses/:courseId/messages`
- [ ] Hook để send message
- [ ] Integration với Socket.IO `chat:*` events

#### Task 2.3: Real-time Socket Integration
**File:** `frontend/src/features/chat/hooks/useChatSocket.ts`

- [ ] Tích hợp với existing `socketService`
- [ ] Handle `dm:new_message` event
- [ ] Handle `dm:user_typing` event
- [ ] Handle `chat:new_message` event (course chat)
- [ ] Typing indicators
- [ ] Online status badge

#### Task 2.4: New Chat Modal
**File:** `frontend/src/features/chat/components/NewChatModal.tsx`

- [ ] Modal để bắt đầu conversation mới
- [ ] Search users (instructor có thể search student, admin có thể search tất cả)
- [ ] Select course context (nếu cần)
- [ ] Validation theo permissions matrix

### Phase 3: Group Chat (Priority: LOW - Future Enhancement)

> ⚠️ **Note:** Backend chưa có API cho Group Chat. Cần implement backend trước.

#### Task 3.1: Backend API (cần implement trước)
- [ ] Model `Group` và `GroupMessage`
- [ ] API tạo group chat
- [ ] API add/remove members
- [ ] API update group settings
- [ ] WebSocket gateway cho group events

#### Task 3.2: Frontend UI
- [ ] Group chat creation modal
- [ ] Member list & management
- [ ] Group settings panel
- [ ] Group avatar & name edit

---

## 📝 CHECKLIST CHI TIẾT CHO PHASE 1

### Pre-Implementation
- [ ] ✅ Đọc hiểu toàn bộ file này
- [ ] ✅ Review code hiện tại trong `features/chat/`
- [ ] ✅ Hiểu rõ mô hình Hybrid Routing (file ROUTING.md)
- [ ] ✅ Đọc AI_AGENT_INSTRUCTIONS.md

### Task 1.1: MessagesPage.tsx
- [ ] Tạo folder `frontend/src/pages/shared/`
- [ ] Tạo file `MessagesPage.tsx`
- [ ] Copy logic từ `StudentChatPage.tsx`
- [ ] Refactor để support multi-role
- [ ] Thêm role detection với `useAuth()`
- [ ] Test với Student account
- [ ] Test với Instructor account
- [ ] Test với Admin account

### Task 1.2: Routes Update
- [ ] Edit `frontend/src/routes/index.tsx`
- [ ] Add lazy import cho MessagesPage
- [ ] Add route `/messages` với proper guards
- [ ] Add Navigate redirects cho old routes
- [ ] Edit `frontend/src/constants/routes.ts`
- [ ] Add SHARED.MESSAGES constant

### Task 1.3: Navigation Update
- [ ] Edit `StudentDashboardLayout.tsx` - update navigation item
- [ ] Edit `InstructorDashboardLayout.tsx` - update navigation item  
- [ ] Edit `AdminDashboardLayout.tsx` - ADD MessageCircle import và nav item
- [ ] Test sidebar navigation cho tất cả roles

### Post-Implementation Verification
- [ ] `npm run type-check` - KHÔNG có lỗi TypeScript
- [ ] `npm run lint` - KHÔNG có ESLint errors
- [ ] Manual test: Student navigate đến /messages
- [ ] Manual test: Instructor navigate đến /messages
- [ ] Manual test: Admin navigate đến /messages
- [ ] Manual test: Old route /student/chat redirect đúng
- [ ] Manual test: Old route /instructor/chat redirect đúng
- [ ] Verify UI 100% tiếng Việt

---

## 🎨 UI/UX GUIDELINES

### Layout Desktop
```
┌─────────────────────────────────────────────────────────────────┐
│ Header (role-specific)                                          │
├─────────────┬───────────────────────────────────────────────────┤
│             │ ┌─────────────────────────────────────────────┐   │
│  Sidebar    │ │ Tabs: [Tin nhắn] [Nhóm] [Khóa học]         │   │
│  (đã có)    │ ├─────────────────────────────────────────────┤   │
│             │ │                                             │   │
│  - Dashboard│ │  ┌────────────┬──────────────────────────┐ │   │
│  - Tin nhắn │ │  │ Conv List  │   Conversation Panel     │ │   │
│  - ...      │ │  │            │                          │ │   │
│             │ │  │ [User 1]   │   [Message bubbles...]   │ │   │
│             │ │  │ [User 2]   │                          │ │   │
│             │ │  │ [User 3]   │   [Input composer]       │ │   │
│             │ │  └────────────┴──────────────────────────┘ │   │
│             │ └─────────────────────────────────────────────┘   │
└─────────────┴───────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌────────────────────┐     ┌────────────────────┐
│ Header             │     │ ← Back    User 1   │
├────────────────────┤     ├────────────────────┤
│                    │     │                    │
│ Tabs: DM|Groups    │ --> │ [Messages...]      │
│ ───────────────    │     │                    │
│ [Conv List]        │     │                    │
│                    │     │                    │
│                    │     │ [Input composer]   │
└────────────────────┘     └────────────────────┘
   List View                  Detail View
```

### Text Labels (Tiếng Việt)
```json
{
  "chat": {
    "title": "Tin nhắn",
    "tabs": {
      "direct": "Tin nhắn riêng",
      "groups": "Nhóm chat",
      "courses": "Thảo luận khóa học"
    },
    "empty": {
      "noConversations": "Chưa có cuộc trò chuyện nào",
      "startChat": "Bắt đầu trò chuyện mới"
    },
    "actions": {
      "newChat": "Tin nhắn mới",
      "newGroup": "Tạo nhóm",
      "search": "Tìm kiếm tin nhắn..."
    },
    "status": {
      "online": "Đang hoạt động",
      "offline": "Ngoại tuyến",
      "typing": "đang nhập..."
    }
  }
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### DO's ✅
1. **GIỮ backward compatibility** - Redirect routes cũ, không xóa ngay
2. **KHÔNG thay đổi** backend API structure - sử dụng API đã có
3. **PHẢI đảm bảo** existing conversations vẫn hoạt động
4. **PHẢI tuân thủ** AI_AGENT_INSTRUCTIONS.md
5. **PHẢI test** trên cả 3 roles trước khi coi là hoàn thành
6. **SỬ DỤNG** existing `features/chat/` components, không tạo mới nếu không cần

### DON'Ts ❌
1. **KHÔNG xóa** files cũ ngay lập tức
2. **KHÔNG tạo** route riêng cho mỗi role (đó là lý do ta đang refactor!)
3. **KHÔNG hardcode** text tiếng Anh trong UI
4. **KHÔNG bỏ qua** type checking và linting
5. **KHÔNG implement** Group Chat ở Phase 1 (backend chưa có)

---

## 🚀 NEXT STEPS - BẮT ĐẦU IMPLEMENTATION

Sau khi đọc và hiểu prompt này, hãy thực hiện theo thứ tự:

### Bước 1: Tạo MessagesPage.tsx

```bash
# Tạo folder và file
mkdir -p frontend/src/pages/shared
# Tạo MessagesPage.tsx (xem code skeleton ở Phase 1, Task 1.1)
```

### Bước 2: Update Routes

```bash
# Edit routes/index.tsx và constants/routes.ts
```

### Bước 3: Update Layouts

```bash
# Edit 3 layout files để thêm/update navigation
```

### Bước 4: Verify

```bash
cd frontend
npm run type-check
npm run lint
npm run dev  # Test manually
```

---

## 📎 REFERENCE FILES

Các files cần đọc/tham khảo khi implement:

| File | Mục đích |
|------|----------|
| `frontend/src/pages/student/ChatPage.tsx` | Code gốc để merge |
| `frontend/src/pages/instructor/InstructorChatPage.tsx` | Code gốc để merge |
| `frontend/src/features/chat/index.ts` | Export của chat feature |
| `frontend/src/features/chat/components/ChatLayout.tsx` | Main layout component |
| `frontend/src/hooks/useConversations.ts` | API hooks cho conversations |
| `frontend/src/services/api/conversation.api.ts` | API service |
| `frontend/src/layouts/StudentDashboardLayout.tsx` | Navigation reference |
| `frontend/src/layouts/AdminDashboardLayout.tsx` | Navigation reference (cần thêm) |
| `frontend/src/routes/index.tsx` | Routes configuration |
| `frontend/src/constants/routes.ts` | Route constants |

---

**Author:** AI Agent  
**Created:** 2024-12-03  
**Version:** 1.1  
**Status:** Ready for Implementation

---

## 📌 QUICK START COMMAND

Để bắt đầu implement, hãy request:

> "Hãy bắt đầu implement Phase 1 của CHAT_SYSTEM_REDESIGN_PROMPT.md. Tạo MessagesPage.tsx và update routes."

