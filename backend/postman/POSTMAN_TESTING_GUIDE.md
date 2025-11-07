# Hướng dẫn chạy test toàn bộ API bằng Postman

## 1. Mục tiêu
Tài liệu này giúp bạn:
- Thiết lập Postman để làm việc với toàn bộ API của hệ thống LMS Backend.
- Tự động hóa bước đăng nhập và gán token cho nhiều vai trò (admin, instructor, student).
- Sử dụng Collection Runner hoặc Newman để chạy hàng loạt và thu thập kết quả test.

## 2. Chuẩn bị hệ thống
1. **Cài Postman Desktop** (phiên bản mới nhất): <https://www.postman.com/downloads/>
2. **Khởi chạy backend ở môi trường local**:
   ```bash
   npm install
   npm run dev # hoặc npm run start:dev nếu bạn dùng Nodemon
   ```
3. **Sao chép biến môi trường**:
   - Tạo file `.env.local` dựa trên `env.example`.
   - Đảm bảo thông tin cơ sở dữ liệu, Redis, JWT, các tài khoản dùng để test đều chính xác.
4. **Chuẩn bị tài khoản test** (ít nhất):
   - 1 admin, 1 instructor, 1 student.
   - Nếu chưa có, có thể tạo thông qua `/auth/register` hoặc dùng script seed hiện có.

## 3. Tạo Postman Environment
1. Vào **Environments → Create Environment** đặt tên `LMS Backend`.
2. Thêm các biến sau (Initial Value nên trùng Current Value):

| Tên biến | Giá trị gợi ý | Giải thích |
| --- | --- | --- |
| `baseUrl` | `http://localhost:3000/api/v1` | Base URL kèm version mà bạn muốn test |
| `adminEmail` | `admin@example.com` | Email tài khoản admin |
| `adminPassword` | `Admin123!` | Mật khẩu admin |
| `instructorEmail` | `instructor@example.com` | Email giảng viên |
| `instructorPassword` | `Instructor123!` | Mật khẩu giảng viên |
| `studentEmail` | `student@example.com` | Email sinh viên |
| `studentPassword` | `Student123!` | Mật khẩu sinh viên |
| `adminToken` | *(để trống)* | Token sẽ được set sau khi đăng nhập |
| `instructorToken` | *(để trống)* | Token sau khi đăng nhập |
| `studentToken` | *(để trống)* | Token sau khi đăng nhập |
| `refreshToken` | *(để trống)* | Dùng khi cần test refresh |

> **Mẹo:** Nếu backend có nhiều version (`/api/v2`), chỉ cần nhân bản environment và thay đổi `baseUrl`.

## 4. Import toàn bộ API từ Swagger
1. Khi backend chạy, mở <http://localhost:3000/api-docs>.
2. Trong Swagger UI, chọn nút **"Download" → "Download JSON"** để lấy file `swagger.json`.
3. Trong Postman:
   - Chọn **Import → File → Upload Files** và chọn file `swagger.json` vừa tải.
   - Postman sẽ tạo Collection chứa mọi endpoint theo mô tả trong Swagger.
4. Đổi tên Collection thành `LMS Backend API` và gắn environment `LMS Backend` làm mặc định.

> **Lưu ý:** Nếu Swagger được cập nhật, chỉ cần import lại file JSON để làm mới Collection.

## 5. Tự động đăng nhập và gán token
### 5.1 Tạo các request đăng nhập
1. Trong Collection, tạo folder `Authentication` (nếu chưa có).
2. Thêm 3 request mới:
   - `Login Admin`
   - `Login Instructor`
   - `Login Student`
3. Nội dung body (raw JSON, `application/json`):
   ```json
   {
     "email": "{{adminEmail}}",
     "password": "{{adminPassword}}"
   }
   ```
   (Tương tự với instructor, student – chỉ cần thay biến email/password.)
4. Tab **Tests** của từng request chèn script lưu token:
   ```javascript
   if (pm.response.code === 200) {
     const data = pm.response.json().data;
     pm.environment.set("adminToken", data.accessToken);
     pm.environment.set("refreshToken", data.refreshToken);
   } else {
     pm.environment.unset("adminToken");
   }
   ```
   Đổi khóa `adminToken` thành `instructorToken` hoặc `studentToken` cho các request tương ứng.

### 5.2 Gắn token tự động cho các folder
1. Với folder yêu cầu quyền **Admin**, mở tab **Pre-request Script** và chèn:
   ```javascript
   const token = pm.environment.get("adminToken");
   if (token) {
     pm.request.headers.add({ key: "Authorization", value: `Bearer ${token}` });
   }
   ```
2. Folder dành cho giảng viên/sinh viên đổi tên biến thành `instructorToken` hoặc `studentToken`.
3. Với các request public (ví dụ `/health`), không cần script này.

### 5.3 Quy trình chuẩn trước khi chạy test
1. Chạy lần lượt 3 request đăng nhập để cập nhật token.
2. Kiểm tra tab **Environment → Current Value** đã có token chưa.
3. Mở một request bất kỳ cần xác thực và bấm **Send** để xác nhận header đã được đính kèm.

## 6. Chạy test cho từng nhóm API
### 6.1 Authentication
- Login, refresh token, logout, change password.
- Kiểm tra response code, message, và payload.

### 6.2 Users (Quản trị)
- CRUD người dùng, phân quyền, đổi trạng thái, thống kê.
- Một số request yêu cầu `adminToken` và dữ liệu hợp lệ (UUID, email).

### 6.3 Courses & Enrollments
- Tạo khóa học, cập nhật, duyệt, đăng ký/huỷ đăng ký.
- Nhiều request yêu cầu instructorToken hoặc studentToken.

### 6.4 Health & Monitoring
- `/health` và `/metrics` (nếu bật) không cần token.
- `/metrics` trả về định dạng Prometheus; dùng để kiểm tra nhanh trạng thái hệ thống.

### 6.5 Các module khác
- Cứ theo từng folder trong Collection và nhấn **Send**.
- Điều chỉnh query params/body theo nhu cầu test và dữ liệu hiện có.

> **Tip:** Ghi chú kết quả kỳ vọng ngay trong phần `Description` của mỗi request để dễ review.

## 7. Chạy hàng loạt với Collection Runner
1. Chọn Collection `LMS Backend API` → **Run Collection**.
2. Chọn Environment `LMS Backend` và đảm bảo đã chạy request đăng nhập trước đó.
3. Tùy chọn:
   - `Save responses` để xem lại.
   - `Iterations` để lặp lại với nhiều bộ dữ liệu (CSV/JSON).
4. Nhấn **Run** để Postman chạy toàn bộ hoặc theo folder.

## 8. Tự động hoá bằng Newman (tuỳ chọn)
1. Xuất Collection và Environment (`Export → Collection v2.1`).
2. Cài Newman toàn cục:
   ```bash
   npm install -g newman
   ```
3. Chạy test ngoài terminal:
   ```bash
   newman run LMS_Backend_API.postman_collection.json \
     -e LMS_Backend.postman_environment.json \
     --reporters cli,html \
     --reporter-html-export newman-report.html
   ```
4. Tích hợp lệnh trên vào CI/CD hoặc script kiểm tra định kỳ.

## 9. Ghi chú & xử lý sự cố
- **401/403**: Token hết hạn hoặc sai quyền → chạy lại request login tương ứng.
- **422/400**: Kiểm tra lại payload, đặc biệt với các trường UUID hoặc enum.
- **429**: Có rate limiting → thiết lập `DISABLE_RATE_LIMIT=true` trong `.env` khi test hàng loạt.
- Có thể tham khảo thêm file `test-admin-endpoints.http` để lấy ví dụ payload mẫu cho các request quản trị.

## 10. Kết luận
Sau khi hoàn thành các bước trên, bạn có thể test toàn bộ API thông qua Postman, dễ dàng chuyển đổi giữa các môi trường (local, staging, production) và tự động hóa quá trình kiểm thử bằng Collection Runner hoặc Newman.

# Phụ lục: Danh sách endpoint chi tiết (API v1)

Lưu ý chung:
- Base URL mặc định: `http://localhost:3000/api/v1`
- Trừ nơi ghi “Public”, các endpoint còn lại cần header `Authorization: Bearer {{token}}`.
- Tham số kiểu UUID yêu cầu định dạng hợp lệ.

## A. Authentication (/auth)

- GET /auth/verify-email/:token
  - Mô tả: Xác thực email (Public)
  - Test nhanh: Dán token vào URL và Send

- POST /auth/register
  - Body JSON:
    ```json
    {
      "email": "user@example.com",
      "username": "user01",
      "password": "StrongPass1!",
      "first_name": "User",
      "last_name": "Example",
      "phone": "+84912345678",
      "role": "student"
    }
    ```

- POST /auth/login
  - Body JSON:
    ```json
    {
      "email": "{{adminEmail}}",
      "password": "{{adminPassword}}"
    }
    ```
  - Tests tab: Lưu `accessToken`, `refreshToken` vào environment.

- POST /auth/refresh-token (alias: /auth/refresh)
  - Body JSON:
    ```json
    { "refreshToken": "{{refreshToken}}" }
    ```

- POST /auth/logout
  - Auth: Bearer {{anyToken}}

- GET /auth/verify
  - Auth: Bearer {{anyToken}}

- POST /auth/change-password
  - Auth: Bearer {{anyToken}}
  - Body JSON:
    ```json
    {
      "currentPassword": "OldPass1!",
      "newPassword": "NewPass1!",
      "confirmPassword": "NewPass1!"
    }
    ```

- POST /auth/2fa/enable
  - Auth: Bearer {{anyToken}}

- POST /auth/2fa/verify-setup
  - Auth: Bearer {{anyToken}}
  - Body JSON:
    ```json
    { "code": "123456" }
    ```

- POST /auth/2fa/disable
  - Auth: Bearer {{anyToken}}
  - Body JSON:
    ```json
    { "code": "123456" }
    ```

## B. User self-service (/users)

- GET /users/profile
  - Auth: Bearer {{anyToken}}

- PUT /users/profile
  - Auth: Bearer {{anyToken}}
  - Body JSON (chỉ gửi các trường cần đổi, ví dụ):
    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+84987654321",
      "bio": "Student",
      "avatar": "https://example.com/avatar.png",
      "student_id": "STU1001",
      "class": "K19",
      "major": "Computer Science",
      "year": 2025,
      "gpa": 3.5,
      "date_of_birth": "2003-01-20",
      "gender": "male",
      "address": "HCM"
    }
    ```

- POST /users/avatar
  - Auth: Bearer {{anyToken}}
  - Loại: form-data, key `avatar` (type: File)

- PATCH /users/preferences
  - Auth: Bearer {{anyToken}}
  - Body JSON (mẫu rút gọn):
    ```json
    {
      "theme": "dark",
      "language": "vi",
      "timezone": "Asia/Ho_Chi_Minh",
      "notifications": {
        "email": { "course_updates": true }
      },
      "privacy": {
        "profile_visibility": "friends_only",
        "data_sharing": { "analytics": true }
      }
    }
    ```

- GET /users/sessions
  - Auth: Bearer {{anyToken}}

- POST /users/logout-all
  - Auth: Bearer {{anyToken}}

- PUT /users/change-password
  - Auth: Bearer {{anyToken}}
  - Body JSON giống /auth/change-password

- POST /users/2fa/enable, POST /users/2fa/disable
  - Auth: Bearer {{anyToken}}

- POST /users/social/link
  - Auth: Bearer {{anyToken}}
  - Body JSON:
    ```json
    { "provider": "google", "socialId": "google-uid-123" }
    ```

- GET /users/analytics
  - Auth: Bearer {{anyToken}}

- PATCH /users/notifications
  - Auth: Bearer {{anyToken}}
  - Body JSON (ví dụ):
    ```json
    { "email": { "announcements": true }, "push": { "reminders": false } }
    ```

- PATCH /users/privacy
  - Auth: Bearer {{anyToken}}
  - Body JSON (ví dụ):
    ```json
    { "show_online_status": true, "profile_visibility": "public" }
    ```

## C. Admin Users (/admin/users) và alias (/users)

Lưu ý:
- Quyền: Admin hoặc Super Admin (một số GET cho Instructor).
- Một số endpoint admin cũng có alias dưới `/api/v1/users` (đã mount), nhưng nên dùng đường dẫn `/admin/users` để rõ ràng.

- GET /admin/users/stats
  - Quyền: admin, super_admin

- GET /admin/users/email/search?email=someone@example.com
  - Quyền: admin, super_admin, instructor

- GET /admin/users/role/:role
  - role ∈ [student, instructor, admin, super_admin]
  - Quyền: admin, super_admin, instructor

- GET /admin/users
  - Query: `page`, `limit`, `role`, `status`, `search`
  - Quyền: admin, super_admin, instructor

- POST /admin/users
  - Quyền: admin, super_admin
  - Body JSON:
    ```json
    {
      "email": "newuser@example.com",
      "password": "StrongPass1!",
      "first_name": "New",
      "last_name": "User",
      "phone": "+84912345678",
      "bio": "Bio here",
      "avatar": "https://example.com/a.png",
      "role": "student"
    }
    ```

- GET /admin/users/:id
  - Param: `id` (UUID)

- PATCH /admin/users/:id
  - Quyền: admin, super_admin
  - Body JSON (ví dụ):
    ```json
    { "first_name": "John", "status": "active" }
    ```

- DELETE /admin/users/:id
  - Quyền: admin, super_admin

- PATCH /admin/users/:id/status (alias: PUT /admin/users/:id/status)
  - Quyền: admin, super_admin
  - Body JSON:
    ```json
    { "status": "suspended" }
    ```

- PUT /admin/users/:id/role
  - Quyền: admin, super_admin
  - Body JSON:
    ```json
    { "role": "instructor" }
    ```

## D. Courses (/courses)

- GET /courses
  - Public
  - Query hỗ trợ: `page`, `limit`, `status`, `instructor_id`, `search`

- GET /courses/:id
  - Public
  - Param: `id` (UUID)

- POST /courses
  - Quyền: instructor, admin, super_admin
  - Body JSON:
    ```json
    {
      "title": "Intro to Flutter",
      "description": "Basics of Flutter development",
      "category": "mobile",
      "level": "beginner",
      "duration": 20,
      "price": 0,
      "thumbnail": "https://example.com/t.png",
      "isPublished": false
    }
    ```

- PUT /courses/:id
  - Quyền: instructor, admin, super_admin
  - Body JSON (chỉ các trường cần đổi):
    ```json
    { "title": "Flutter for Beginners", "isPublished": true }
    ```

- DELETE /courses/:id
  - Quyền: instructor, admin, super_admin

- GET /courses/instructor/:instructorId
  - Quyền: instructor, admin, super_admin
  - Query: `page`, `limit`, `status`

- GET /courses/instructor/my-courses
  - Quyền: instructor, admin, super_admin
  - Query: `page`, `limit`, `status`

- GET /courses/enrolled
  - Quyền: student, instructor, admin, super_admin

- POST /courses/:courseId/enroll
  - Quyền: student, instructor, admin, super_admin
  - Param: `courseId` (UUID)

- DELETE /courses/:courseId/unenroll
  - Quyền: student, instructor, admin, super_admin
  - Param: `courseId` (UUID)

# Hướng dẫn test nhanh trong Postman theo từng phần

- Auth
  - Chạy `Login Admin/Instructor/Student` để lấy token.
  - Dùng token tương ứng để test các nhóm yêu cầu quyền.

- Users (self-service)
  - Test `GET /users/profile` trước để kiểm tra token hợp lệ.
  - `PUT /users/profile` gửi vài trường cơ bản để tránh lỗi validate.
  - `POST /users/avatar` dùng form-data, key `avatar` (File).

- Admin Users
  - Luồng cơ bản: `POST /admin/users` → `GET /admin/users` → `GET /admin/users/:id` → `PATCH /admin/users/:id` → `PATCH /admin/users/:id/status` → `DELETE /admin/users/:id`.

- Courses
  - Tạo course với instructor token → `POST /courses`.
  - Sinh viên enroll: `POST /courses/:courseId/enroll` → check `GET /courses/enrolled`.
  - Instructor xem danh sách của mình: `GET /courses/instructor/my-courses`.
