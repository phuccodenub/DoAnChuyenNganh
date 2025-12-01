# 🔔 KẾ HOẠCH TRIỂN KHAI HỆ THỐNG NOTIFICATION

> **Tài liệu này mô tả chi tiết kế hoạch triển khai hệ thống thông báo (Notification) cho LMS**
> 
> **Ngày tạo:** 30/11/2025  
> **Trạng thái:** ✅ Hoàn thành Phase 1-5 + Routes/Navigation (Testing còn lại)

---

## 📋 MỤC LỤC

1. [Tổng quan nghiệp vụ](#1-tổng-quan-nghiệp-vụ)
2. [Phân tích hiện trạng](#2-phân-tích-hiện-trạng)
3. [Kế hoạch triển khai](#3-kế-hoạch-triển-khai)
4. [Chi tiết từng Phase](#4-chi-tiết-từng-phase)
5. [Checklist tiến độ](#5-checklist-tiến-độ)

---

## 1. TỔNG QUAN NGHIỆP VỤ

### 1.1 Các loại thông báo trong hệ thống

| Loại | Người tạo | Đối tượng nhận | Mô tả |
|------|-----------|----------------|-------|
| **System Broadcast** | Admin | Tất cả Users | Thông báo hệ thống, bảo trì, cập nhật |
| **Role-based** | Admin | Theo role (student/instructor) | Thông báo dành riêng cho 1 role |
| **Course Announcement** | Instructor | Students trong course | Thông báo về khóa học |
| **Assignment Notice** | Instructor | Students trong course | Thông báo bài tập mới, deadline |
| **Grade Notice** | Instructor | Student cụ thể | Thông báo điểm số |
| **Personal Notice** | Instructor | 1 hoặc nhiều students | Nhắc nhở cá nhân |

### 1.2 Chức năng theo Role

#### 👨‍💼 ADMIN
- ✅ Tạo thông báo broadcast (toàn bộ users)
- ✅ Tạo thông báo theo role (chỉ students hoặc chỉ instructors)
- ✅ Quản lý tất cả thông báo đã gửi
- ✅ Xóa thông báo

#### 👨‍🏫 INSTRUCTOR
- ✅ Tạo thông báo cho tất cả students trong course của mình
- ✅ Tạo thông báo cho 1 hoặc nhiều students cụ thể trong course
- ✅ Thông báo liên quan đến: bài tập, điểm số, quiz, deadline
- ✅ Xem danh sách thông báo đã gửi

#### 👨‍🎓 STUDENT
- ✅ Nhận và xem thông báo
- ✅ Đánh dấu đã đọc (1 hoặc tất cả)
- ✅ Lưu trữ (archive) thông báo
- ✅ Xem số lượng thông báo chưa đọc (badge trên header)
- ✅ Nhận thông báo real-time

### 1.3 UI/UX Requirements

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                        🔔(2) 👤     │
│                                                 ↓           │
│                                    ┌────────────────────────┤
│                                    │ Thông báo    2 mới  ✓⚙│
│                                    ├────────────────────────┤
│                                    │ HÔM NAY                │
│                                    │ ● Bài tập mới: React   │
│                                    │   7 phút trước         │
│                                    │ ● Huy hiệu mới         │
│                                    │   2 giờ trước          │
│                                    ├────────────────────────┤
│                                    │ HÔM QUA                │
│                                    │ ○ Minh Tú trả lời...   │
│                                    ├────────────────────────┤
│                                    │  Xem tất cả thông báo  │
│                                    └────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## 2. PHÂN TÍCH HIỆN TRẠNG

### 2.1 Database Schema ✅ ĐÃ CÓ

#### Notification Model
```typescript
// ✅ Đã có đầy đủ các trường cần thiết
{
  id, sender_id, notification_type, title, message,
  link_url, priority, category, related_resource_type,
  related_resource_id, scheduled_at, sent_at, expires_at,
  metadata, is_broadcast, total_recipients, read_count
}
```

#### NotificationRecipient Model
```typescript
// ✅ Đã có junction table cho M-N relationship
{
  id, notification_id, recipient_id,
  is_read, read_at, is_archived, archived_at,
  is_dismissed, clicked_at, interaction_data
}
```

### 2.2 Backend API

| Endpoint | Status | Ghi chú |
|----------|--------|---------|
| `POST /notifications` | ✅ Có | Tạo notification cơ bản |
| `GET /notifications/me` | ✅ Có | Lấy notifications của user |
| `GET /notifications/me/unread-count` | ✅ Có | Đếm chưa đọc |
| `POST /notifications/me/mark-all-read` | ✅ Có | Đánh dấu tất cả đã đọc |
| `POST /notifications/me/archive-old` | ✅ Có | Archive cũ |
| `POST /notifications/bulk` | ❌ THIẾU | **Gửi theo target_audience** |
| `PUT /notifications/:id/read` | ❌ THIẾU | **Đánh dấu 1 notification** |
| `DELETE /notifications/:id` | ❌ THIẾU | **Xóa notification** |
| `NotificationGateway (Socket.IO)` | ❌ THIẾU | **Real-time notifications** |

### 2.3 Frontend

| Component | Status | Ghi chú |
|-----------|--------|---------|
| NotificationPanel.tsx | ⚠️ Mock data | Cần tích hợp API thực |
| NotificationCenter.tsx | ⚠️ Incomplete | Hook chưa đúng |
| NotificationList.tsx | ✅ OK | Đã có grouping |
| NotificationItem.tsx | ✅ OK | Nhiều variants |
| NotificationsPage.tsx (Student) | ✅ OK | Đã tích hợp API |
| NotificationBell (Header) | ❌ THIẾU | **Cần tạo mới** |
| Admin NotificationsPage | ❌ THIẾU | **Cần tạo mới** |
| Instructor NotificationsPage | ❌ THIẾU | **Cần tạo mới** |
| Socket.IO integration | ❌ THIẾU | **Real-time update** |

---

## 3. KẾ HOẠCH TRIỂN KHAI

### Tổng quan các Phase

```
Phase 1: Backend Core APIs
    ↓
Phase 2: Backend Real-time (Socket.IO)
    ↓
Phase 3: Frontend Student (Bell + Panel)
    ↓
Phase 4: Frontend Admin (Create + Manage)
    ↓
Phase 5: Frontend Instructor (Create for Course)
    ↓
Phase 6: Testing & Polish
```

### Timeline ước tính

| Phase | Nội dung | Độ khó | Thời gian |
|-------|----------|--------|-----------|
| Phase 1 | Backend Core APIs | ⭐⭐ | 1-2 giờ |
| Phase 2 | Backend Socket.IO Gateway | ⭐⭐⭐ | 1-2 giờ |
| Phase 3 | Frontend Student Bell + Panel | ⭐⭐ | 1-2 giờ |
| Phase 4 | Frontend Admin Page | ⭐⭐⭐ | 2-3 giờ |
| Phase 5 | Frontend Instructor Page | ⭐⭐⭐ | 2-3 giờ |
| Phase 6 | Testing & Polish | ⭐⭐ | 1-2 giờ |

---

## 4. CHI TIẾT TỪNG PHASE

### 📦 PHASE 1: Backend Core APIs

#### 1.1 Mở rộng notifications.routes.ts

```typescript
// Thêm các routes mới:
router.post('/bulk', authorizeRoles([ADMIN, INSTRUCTOR]), controller.sendBulk);
router.put('/:id/read', controller.markAsRead);
router.put('/:id/archive', controller.archiveOne);
router.delete('/:id', authorizeRoles([ADMIN]), controller.delete);
router.get('/sent', authorizeRoles([ADMIN, INSTRUCTOR]), controller.getSentNotifications);
```

#### 1.2 Mở rộng notifications.types.ts

```typescript
export interface BulkNotificationDto {
  notification_type: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  link_url?: string;
  target_audience: {
    type: 'all' | 'role' | 'course' | 'users';
    role?: 'student' | 'instructor';
    course_id?: string;
    user_ids?: string[];
  };
  metadata?: Record<string, unknown>;
}
```

#### 1.3 Mở rộng notifications.service.ts

```typescript
// Thêm methods:
async sendBulk(senderId: string, dto: BulkNotificationDto): Promise<{notification, recipients_count}>
async markOneAsRead(userId: string, notificationId: string): Promise<void>
async archiveOne(userId: string, notificationId: string): Promise<void>
async deleteNotification(notificationId: string): Promise<void>
async getSentNotifications(senderId: string, pagination): Promise<Notification[]>
```

#### 1.4 Mở rộng notifications.repository.ts

```typescript
// Thêm methods:
async getRecipientIdsByTargetAudience(target: TargetAudience): Promise<string[]>
async findRecipientRecord(userId: string, notificationId: string): Promise<NotificationRecipient>
async getSentBySender(senderId: string, options): Promise<Notification[]>
```

---

### 📦 PHASE 2: Backend Real-time (Socket.IO Gateway)

#### 2.1 Tạo notifications.gateway.ts

```typescript
// File mới: backend/src/modules/notifications/notifications.gateway.ts
export class NotificationGateway {
  constructor(io: Server) {}
  
  // Gửi notification real-time đến user cụ thể
  sendToUser(userId: string, notification: Notification): void
  
  // Gửi notification đến nhiều users
  sendToUsers(userIds: string[], notification: Notification): void
  
  // Broadcast đến tất cả connected users
  broadcast(notification: Notification): void
  
  // Gửi đến users trong 1 course
  sendToCourse(courseId: string, notification: Notification): void
}
```

#### 2.2 Tích hợp Gateway vào Service

```typescript
// Khi tạo notification, emit real-time event
async create(...) {
  const notification = await this.repo.createNotification(...);
  // Emit to recipients via Socket.IO
  this.gateway.sendToUsers(recipientIds, notification);
  return notification;
}
```

#### 2.3 Socket Events

```typescript
// Events từ server -> client:
'notification:new'      // Thông báo mới
'notification:count'    // Update unread count

// Events từ client -> server:
'notification:read'     // User đánh dấu đã đọc
'notification:subscribe' // User subscribe notifications
```

---

### 📦 PHASE 3: Frontend Student (Bell + Panel)

#### 3.1 Tạo NotificationBell.tsx

```tsx
// Component hiển thị trên Header
export const NotificationBell: React.FC = () => {
  const { data: unreadCount } = useUnreadNotificationCount();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <Bell />
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </button>
      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
};
```

#### 3.2 Refactor NotificationPanel.tsx

```tsx
// Bỏ MOCK_DATA, tích hợp API thực
export const NotificationPanel: React.FC = () => {
  const { data: notifications, isLoading } = useNotifications(1, 10);
  const markAsReadMutation = useMarkNotificationAsRead();
  
  // Real data instead of mock
  // ...
};
```

#### 3.3 Thêm Socket.IO listener

```tsx
// useNotificationSocket.ts
export function useNotificationSocket() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    socketService.on('notification:new', (notification) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(QUERY_KEYS.notifications.all);
      queryClient.invalidateQueries(QUERY_KEYS.notifications.unreadCount);
      
      // Show toast notification
      toast.info(notification.title);
    });
    
    return () => socketService.off('notification:new');
  }, []);
}
```

#### 3.4 Tích hợp vào Header

```tsx
// Trong StudentDashboardLayout hoặc Header component
import { NotificationBell } from '@/components/notifications/NotificationBell';

// Thêm vào header:
<NotificationBell />
```

---

### 📦 PHASE 4: Frontend Admin (Create + Manage)

#### 4.1 Tạo AdminNotificationsPage.tsx

```tsx
// pages/admin/NotificationsPage.tsx
export default function AdminNotificationsPage() {
  return (
    <div>
      <h1>Quản lý thông báo</h1>
      
      <Tabs>
        <Tab label="Tạo thông báo">
          <CreateNotificationForm />
        </Tab>
        <Tab label="Đã gửi">
          <SentNotificationsList />
        </Tab>
      </Tabs>
    </div>
  );
}
```

#### 4.2 CreateNotificationForm (Admin)

```tsx
// Form tạo thông báo với options:
// - Broadcast to all users
// - Send to role (student/instructor)
// - Priority selection
// - Schedule sending (optional)

const schema = z.object({
  title: z.string().min(3).max(255),
  message: z.string().min(10),
  notification_type: z.enum(['announcement', 'system', 'update']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  target_type: z.enum(['all', 'students', 'instructors']),
  scheduled_at: z.date().optional(),
});
```

#### 4.3 SentNotificationsList

```tsx
// Danh sách thông báo đã gửi với:
// - Filtering by type, date
// - View recipients count
// - View read percentage
// - Delete option
```

---

### 📦 PHASE 5: Frontend Instructor (Create for Course)

#### 5.1 Tạo InstructorNotificationsPage.tsx

```tsx
// pages/instructor/NotificationsPage.tsx
export default function InstructorNotificationsPage() {
  return (
    <div>
      <h1>Thông báo khóa học</h1>
      
      <Tabs>
        <Tab label="Tạo thông báo">
          <CreateCourseNotificationForm />
        </Tab>
        <Tab label="Đã gửi">
          <SentCourseNotificationsList />
        </Tab>
      </Tabs>
    </div>
  );
}
```

#### 5.2 CreateCourseNotificationForm

```tsx
// Form với options:
// - Chọn course (dropdown courses của instructor)
// - Chọn recipients: all students / specific students
// - Notification type: announcement, assignment, grade, reminder
// - Link to resource (optional)

const schema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(3).max(255),
  message: z.string().min(10),
  notification_type: z.enum(['announcement', 'assignment', 'grade', 'quiz', 'reminder']),
  recipient_type: z.enum(['all_students', 'specific_students']),
  student_ids: z.array(z.string().uuid()).optional(),
  link_url: z.string().url().optional(),
});
```

#### 5.3 Student Picker Component

```tsx
// Component để chọn specific students từ course
export const CourseStudentPicker: React.FC<{courseId: string}> = ({ courseId }) => {
  const { data: students } = useCourseStudents(courseId);
  
  return (
    <MultiSelect
      options={students}
      placeholder="Chọn sinh viên..."
    />
  );
};
```

---

### 📦 PHASE 6: Testing & Polish

#### 6.1 Test Cases

```
Backend:
- [ ] Test POST /notifications/bulk với các target_audience types
- [ ] Test PUT /notifications/:id/read
- [ ] Test Socket.IO events
- [ ] Test concurrent notifications

Frontend:
- [ ] Test NotificationBell render và click
- [ ] Test real-time update khi có notification mới
- [ ] Test Admin form validation
- [ ] Test Instructor course selection
- [ ] Test responsive design
```

#### 6.2 Polish Tasks

```
- [ ] Thêm loading states
- [ ] Thêm error handling
- [ ] Thêm empty states với illustrations
- [ ] Optimize queries (pagination, caching)
- [ ] Add notification sound (optional)
- [ ] Add desktop notifications (optional)
```

---

## 5. CHECKLIST TIẾN ĐỘ

### Phase 1: Backend Core APIs
- [ ] Mở rộng `notifications.types.ts` với BulkNotificationDto
- [ ] Mở rộng `notifications.validate.ts` với validation rules mới
- [ ] Mở rộng `notifications.repository.ts` với methods mới
- [ ] Mở rộng `notifications.service.ts` với business logic
- [ ] Mở rộng `notifications.controller.ts` với handlers mới
- [ ] Mở rộng `notifications.routes.ts` với routes mới
- [ ] Test các endpoints mới

### Phase 2: Backend Socket.IO Gateway
- [ ] Tạo `notifications.gateway.ts`
- [ ] Tích hợp gateway vào server.ts
- [ ] Tích hợp gateway vào service
- [ ] Test real-time events

### Phase 3: Frontend Student
- [ ] Tạo `NotificationBell.tsx`
- [ ] Refactor `NotificationPanel.tsx` (bỏ mock data)
- [ ] Tạo `useNotificationSocket.ts`
- [ ] Cập nhật `notifications.api.ts` (dọn dẹp duplicate)
- [ ] Tích hợp NotificationBell vào Header/Layout
- [ ] Test UI và real-time

### Phase 4: Frontend Admin
- [x] Thêm route Admin Notifications
- [x] Tạo `AdminNotificationsPage.tsx`
- [x] Tạo `CreateNotificationForm.tsx` (Admin version)
- [x] Tạo `SentNotificationsList.tsx`
- [x] Thêm API calls cho admin operations
- [ ] Test form và list

### Phase 5: Frontend Instructor
- [x] Thêm route Instructor Notifications
- [x] Tạo `InstructorNotificationsPage.tsx`
- [x] Tạo `CreateCourseNotificationForm.tsx`
- [x] Tạo `CourseStudentPicker.tsx`
- [x] Thêm API calls cho instructor operations
- [ ] Test form và course selection

### Phase 6: Testing & Polish
- [ ] End-to-end testing
- [ ] Responsive design check
- [ ] Error handling review
- [ ] Performance optimization
- [ ] Documentation update

---

## 📝 GHI CHÚ THÊM

### API Response Format

```typescript
// Success response
{
  success: true,
  message: "Thông báo đã được gửi thành công",
  data: {
    notification: {...},
    recipients_count: 50
  }
}

// Error response
{
  success: false,
  message: "Không thể gửi thông báo",
  error: {
    code: "NOTIFICATION_ERROR",
    details: "..."
  }
}
```

### Socket Event Payload

```typescript
// notification:new
{
  id: "uuid",
  type: "assignment",
  title: "Bài tập mới: React Hooks",
  message: "...",
  created_at: "2025-11-30T10:00:00Z",
  sender: {
    id: "uuid",
    name: "Nguyễn Văn A",
    avatar: "..."
  }
}
```

---

*Cập nhật lần cuối: 30/11/2025*
