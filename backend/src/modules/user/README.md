# 👥 User Module Documentation

## 📋 Tổng quan

Module User được tổ chức lại để **tách biệt rõ ràng** giữa các nghiệp vụ:
- **User self-service operations** (người dùng tự quản lý)
- **Admin/System operations** (quản trị viên quản lý hệ thống)

---

## 🏗️ Cấu trúc Module

```
modules/user/
├── user.controller.ts          # User self-service controller
├── user.admin.controller.ts    # Admin operations controller (NEW)
├── user.service.ts            # User business logic
├── user.repository.ts         # Data access layer
├── user.routes.ts             # User self-service routes
├── user.admin.routes.ts       # Admin routes (NEW)
├── user.types.ts              # Type definitions
├── user.validate.ts           # Validation schemas
├── index.ts                   # Module exports
└── README.md                  # This file
```

---

## 🔄 Migration Summary

### ✅ **Đã hoàn thành:**

1. **Tạo `user.admin.controller.ts`**
   - Di chuyển tất cả admin operations từ `src/controllers/user.controller.ts`
   - Sử dụng class-based controller (nhất quán với `user.controller.ts`)
   - Sử dụng `GlobalUserService` cho operations

2. **Tạo `user.admin.routes.ts`**
   - Định nghĩa rõ ràng các routes cho admin
   - Phân quyền chi tiết theo từng endpoint
   - Có documentation cho mỗi route

3. **Cập nhật `index.ts`**
   - Export cả 2 controllers
   - Export cả 2 route handlers
   - Maintain backward compatibility

4. **Cập nhật `src/routes/user.routes.ts`**
   - Redirect sang `userAdminRoutes` từ module
   - Đánh dấu DEPRECATED
   - Giữ backward compatibility

---

## 📊 So sánh 2 Controllers

### **1️⃣ UserModuleController** (`user.controller.ts`)

**Mục đích:** Nghiệp vụ riêng của user - self-service operations

**Đặc điểm:**
- ✅ User tự quản lý profile của mình
- ✅ Lấy `userId` từ `req.user` (authenticated user)
- ✅ Không thể thao tác trên user khác
- ✅ Sử dụng `UserModuleService`

**Chức năng:**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `getProfile()` | `GET /profile` | Lấy thông tin profile của user hiện tại | ✓ |
| `updateProfile()` | `PUT /profile` | Cập nhật profile của user hiện tại | ✓ |
| `uploadAvatar()` | `POST /avatar` | Upload avatar | ✓ |
| `updatePreferences()` | `PATCH /preferences` | Cập nhật preferences | ✓ |
| `getActiveSessions()` | `GET /sessions` | Xem các session đang active | ✓ |
| `logoutAllDevices()` | `POST /logout-all` | Logout tất cả thiết bị | ✓ |
| `enableTwoFactor()` | `POST /2fa/enable` | Bật 2FA | ✓ |
| `disableTwoFactor()` | `POST /2fa/disable` | Tắt 2FA | ✓ |
| `linkSocialAccount()` | `POST /social/link` | Liên kết tài khoản mạng xã hội | ✓ |
| `getUserAnalytics()` | `GET /analytics` | Xem analytics cá nhân | ✓ |
| `updateNotificationSettings()` | `PATCH /notifications` | Cập nhật cài đặt thông báo | ✓ |
| `updatePrivacySettings()` | `PATCH /privacy` | Cập nhật cài đặt privacy | ✓ |

**Service:** `UserModuleService`

**Response Format:** `responseUtils.sendSuccess()` / `responseUtils.sendCreated()`

---

### **2️⃣ UserAdminController** (`user.admin.controller.ts`)

**Mục đích:** Quản lý user từ góc nhìn admin/system

**Đặc điểm:**
- ✅ Admin quản lý tất cả users
- ✅ Lấy `userId` từ `req.params.id` (target user)
- ✅ CRUD operations trên bất kỳ user nào
- ✅ Sử dụng `GlobalUserService`

**Chức năng:**

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| `getUserInfo()` | `GET /:id` | Lấy thông tin user theo ID | All authenticated |
| `getUserByEmail()` | `GET /email/search` | Tìm user theo email | Admin/Instructor |
| `createUser()` | `POST /` | Tạo user mới | Admin/Super Admin |
| `updateUser()` | `PATCH /:id` | Cập nhật user | Admin/Super Admin |
| `deleteUser()` | `DELETE /:id` | Xóa user | Admin/Super Admin |
| `getAllUsers()` | `GET /` | Lấy danh sách users (pagination) | Admin/Instructor |
| `getUsersByRole()` | `GET /role/:role` | Lấy users theo role | Admin/Instructor |
| `getUserStats()` | `GET /stats` | Thống kê users | Admin/Super Admin |
| `changeUserStatus()` | `PATCH /:id/status` | Thay đổi status user | Admin/Super Admin |

**Service:** `GlobalUserService`

**Response Format:** `responseUtils.sendSuccess()` / `responseUtils.sendCreated()`

---

## 🔑 Sự khác biệt chính

### **Về Service:**

#### **UserModuleService** (user.service.ts)
```typescript
// Nghiệp vụ riêng của user
- getProfile(userId) - Lấy profile của chính mình
- updateProfile(userId, data) - Cập nhật profile
- uploadAvatar(userId, file) - Upload avatar
- updatePreferences() - Cập nhật preferences
- enable2FA() / disable2FA() - Quản lý 2FA
- linkSocialAccount() - Liên kết tài khoản
```

#### **GlobalUserService** (services/global/user.service.ts)
```typescript
// Nghiệp vụ chung của hệ thống
- getUserById(id) - Lấy user bất kỳ
- getUserByEmail(email) - Tìm user theo email
- addUser(data) - Tạo user (admin)
- updateUserInfo(id, data) - Cập nhật user (admin)
- removeUser(id) - Xóa user (admin)
- getAllUsers(options) - Lấy danh sách users
- getUserStatistics() - Thống kê hệ thống
- changeUserStatus(id, status) - Thay đổi status
```

### **Về Authorization:**

#### **User Controller:**
```typescript
// Tất cả routes yêu cầu authentication
router.use(authMiddleware);

// Không cần phân quyền role (vì user chỉ thao tác trên chính mình)
router.get('/profile', userModuleController.getProfile);
```

#### **Admin Controller:**
```typescript
// Routes có phân quyền rõ ràng
router.post(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userAdminController.createUser
);

router.get(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  userAdminController.getAllUsers
);
```

### **Về Data Access:**

#### **User Controller:**
```typescript
// Lấy userId từ authenticated user
private getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error('User ID not found in request');
  }
  return userId;
}

// Usage
const userId = this.getUserId(req);
await this.userModuleService.getProfile(userId);
```

#### **Admin Controller:**
```typescript
// Lấy userId từ request params (target user)
async getUserInfo(req: Request, res: Response) {
  const user = await this.userService.getUserById(req.params.id);
  // ...
}
```

---

## 🛣️ Routes Configuration

### **User Self-Service Routes** (`/api/v1/users/*`)
```typescript
import { userModuleRoutes } from './modules/user';

router.use('/users', userModuleRoutes);

// Available routes:
// GET    /users/profile
// PUT    /users/profile
// POST   /users/avatar
// PATCH  /users/preferences
// GET    /users/sessions
// POST   /users/logout-all
// POST   /users/2fa/enable
// POST   /users/2fa/disable
// POST   /users/social/link
// GET    /users/analytics
// PATCH  /users/notifications
// PATCH  /users/privacy
```

### **Admin Routes** (`/api/v1/admin/users/*`)
```typescript
import { userAdminRoutes } from './modules/user';

router.use('/admin/users', userAdminRoutes);

// Available routes:
// POST   /admin/users               - Create user
// GET    /admin/users               - Get all users (pagination)
// GET    /admin/users/stats         - Get statistics
// GET    /admin/users/role/:role    - Get users by role
// GET    /admin/users/email/search  - Search by email
// GET    /admin/users/:id           - Get user by ID
// PATCH  /admin/users/:id           - Update user
// DELETE /admin/users/:id           - Delete user
// PATCH  /admin/users/:id/status    - Change user status
```

---

## 📝 Usage Examples

### **1. User tự cập nhật profile:**

```typescript
// Frontend request
PUT /api/v1/users/profile
Authorization: Bearer <token>
{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Developer"
}

// Flow:
// 1. authMiddleware extracts userId from token
// 2. UserModuleController.updateProfile() called
// 3. UserModuleService.updateProfile(userId, data)
// 4. Update user's own profile
```

### **2. Admin cập nhật user:**

```typescript
// Frontend request
PATCH /api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <admin-token>
{
  "status": "suspended",
  "role": "student"
}

// Flow:
// 1. authMiddleware + authorizeRoles checks admin permission
// 2. UserAdminController.updateUser() called
// 3. GlobalUserService.updateUserInfo(targetUserId, data)
// 4. Update target user's info
```

---

## 🎯 Best Practices

### **1. Khi nào dùng User Controller?**
- ✅ User tự quản lý profile
- ✅ User thay đổi settings cá nhân
- ✅ User upload avatar
- ✅ User quản lý sessions
- ✅ User bật/tắt 2FA

### **2. Khi nào dùng Admin Controller?**
- ✅ Admin tạo/sửa/xóa users
- ✅ Admin xem danh sách users
- ✅ Admin thay đổi role/status users
- ✅ Admin xem thống kê hệ thống
- ✅ Instructor xem danh sách students

### **3. Code Organization:**
```typescript
// ✅ GOOD - Trong UserModuleController
async getProfile(req: Request, res: Response) {
  const userId = this.getUserId(req); // Lấy từ authenticated user
  const profile = await this.userModuleService.getProfile(userId);
}

// ❌ BAD - Đừng làm thế này trong UserModuleController
async updateAnyUser(req: Request, res: Response) {
  const targetUserId = req.params.id; // ❌ Không nên
  // User không nên có quyền update user khác
}

// ✅ GOOD - Trong UserAdminController
async updateUser(req: Request, res: Response) {
  const targetUserId = req.params.id; // ✅ OK - Admin operation
  const user = await this.userService.updateUserInfo(targetUserId, req.body);
}
```

---

## 🔄 Migration Checklist

- [x] Tạo `user.admin.controller.ts`
- [x] Tạo `user.admin.routes.ts`
- [x] Cập nhật `index.ts` exports
- [x] Cập nhật `src/routes/user.routes.ts` (backward compatibility)
- [x] Đánh dấu old controller as DEPRECATED
- [ ] Cập nhật API documentation
- [ ] Cập nhật frontend API calls (nếu cần)
- [ ] Testing
- [ ] Xóa `src/controllers/user.controller.ts` (sau khi confirm không còn dùng)

---

## 🚀 Next Steps

1. **Kiểm tra backward compatibility:**
   - Đảm bảo các API cũ vẫn hoạt động
   - Test với frontend

2. **Cập nhật documentation:**
   - Swagger/OpenAPI specs
   - Frontend API documentation

3. **Migration path:**
   - Chuyển frontend từ old routes sang new routes
   - Monitor logs để đảm bảo không có breaking changes

4. **Cleanup:**
   - Sau khi confirm ổn, xóa `src/controllers/user.controller.ts`
   - Xóa folder `src/controllers/` nếu trống

---

## 📞 Support

Nếu có vấn đề gì trong quá trình migration, check:
1. Routes configuration trong `src/api/v1/routes/index.ts`
2. Validation schemas trong `validates/user.validate.ts`
3. Service layer trong `services/global/user.service.ts`
4. Authentication middleware trong `middlewares/auth.middleware.ts`

---

**Tóm lại:** Cấu trúc mới giúp **tách biệt rõ ràng** giữa user self-service và admin operations, dễ maintain và scale hơn! 🎉
