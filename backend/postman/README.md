# Postman Collection - LMS API Testing Guide

## 📦 Files

1. **LMS_API_Collection.postman_collection.json** - Collection chứa 90+ API endpoints
2. **LMS_Environment.postman_environment.json** - Environment variables

## 🚀 Import vào Postman

### Bước 1: Import Collection
1. Mở Postman Desktop hoặc Postman Web
2. Click **Import** (góc trên bên trái)
3. Chọn file `LMS_API_Collection.postman_collection.json`
4. Click **Import**

### Bước 2: Import Environment
1. Click **Import** lần nữa
2. Chọn file `LMS_Environment.postman_environment.json`
3. Click **Import**

### Bước 3: Chọn Environment
1. Ở góc phải trên cùng, chọn dropdown **"No Environment"**
2. Chọn **"LMS Development Environment"**

## 🎯 Test Flow - Khuyến nghị

### Phase 1: Authentication (QUAN TRỌNG - TEST TRƯỚC)
Chạy theo thứ tự:

1. **Register Student** → Tự động lưu `userId` và `accessToken`
2. **Login** → Tự động update `accessToken` và `refreshToken`
3. **Verify Token** → Kiểm tra token còn hiệu lực
4. **Get My Profile** → Verify authentication hoạt động

✅ **Sau khi chạy xong 4 APIs này, bạn sẽ có:**
- `accessToken` được tự động lưu vào Environment
- `userId` được lưu để dùng cho các request khác
- Authentication header tự động apply cho tất cả requests

### Phase 2: Categories & Courses
5. **Create Category** → Tạo danh mục khóa học
6. **Create Course** → Tự động lưu `courseId`
7. **Get All Courses** → Xem danh sách
8. **Enroll in Course** → Đăng ký học
9. **Get Enrolled Courses** → Kiểm tra đã enroll

### Phase 3: Course Content
10. **Create Section** → Tạo chương, tự động lưu `sectionId`
11. **Create Lesson** → Tạo bài học, tự động lưu `lessonId`
12. **Add Material to Lesson** → Upload tài liệu
13. **Update Lesson Progress** → Cập nhật tiến độ
14. **Mark Lesson as Completed** → Đánh dấu hoàn thành
15. **Get Course Progress** → Xem tổng quan tiến độ

### Phase 4: Assessment (Quiz)
16. **Create Quiz** → Tạo bài quiz, tự động lưu `quizId`
17. **Add Question** → Thêm câu hỏi, tự động lưu `questionId`
18. **Add Option to Question** → Thêm đáp án (chạy 4 lần cho 4 đáp án)
19. **Get Quiz Questions** → Xem tất cả câu hỏi
20. **Start Quiz Attempt** → Bắt đầu làm quiz, lưu `attemptId`
21. **Submit Quiz Attempt** → Nộp bài
22. **Get My Attempts** → Xem lịch sử làm bài
23. **Get Quiz Statistics** → Thống kê quiz

### Phase 5: Assignment
24. **Create Assignment** → Tạo bài tập, lưu `assignmentId`
25. **Get Assignment** → Xem chi tiết
26. **Submit Assignment** → Nộp bài
27. **Grade Submission** (Instructor) → Chấm điểm

### Phase 6: Grades
28. **Upsert Grade** → Tạo/cập nhật điểm
29. **Upsert Final Grade** → Điểm tổng kết
30. **Get User Grades** → Xem bảng điểm

### Phase 7: Communication
31. **Send Message** (Chat) → Gửi tin nhắn trong khóa học
32. **Get Course Messages** → Xem lịch sử chat
33. **Search Messages** → Tìm kiếm tin nhắn
34. **Create Live Session** → Tạo buổi học trực tuyến
35. **Join Session** → Tham gia livestream
36. **Create Notification** → Gửi thông báo
37. **Get My Notifications** → Xem thông báo
38. **Mark All as Read** → Đánh dấu đã đọc

### Phase 8: Analytics
39. **Get Course Stats** → Thống kê khóa học
40. **Get User Activities** → Lịch sử hoạt động

## 🔧 Automatic Variable Management

Collection sử dụng **Test Scripts** để tự động lưu biến:

```javascript
// Ví dụ: Sau khi Register/Login
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set('accessToken', jsonData.data.accessToken);
    pm.collectionVariables.set('userId', jsonData.data.user.user_id);
}
```

✨ **Lợi ích:**
- Không cần copy-paste ID thủ công
- Workflow liền mạch giữa các request
- Giảm thiểu lỗi khi test

## 📋 Environment Variables

| Variable | Purpose | Auto-set by |
|----------|---------|-------------|
| `baseUrl` | API base URL (localhost:3000/api) | Manual |
| `accessToken` | JWT access token | Register, Login, Refresh Token |
| `refreshToken` | JWT refresh token | Login |
| `userId` | User ID | Register, Login |
| `courseId` | Course ID | Create Course |
| `sectionId` | Section ID | Create Section |
| `lessonId` | Lesson ID | Create Lesson |
| `quizId` | Quiz ID | Create Quiz |
| `questionId` | Question ID | Add Question |
| `attemptId` | Quiz Attempt ID | Start Quiz Attempt |
| `assignmentId` | Assignment ID | Create Assignment |

## 🛠️ Manual Testing với cURL

Nếu muốn test trực tiếp từ terminal:

### 1. Register
```powershell
curl -X POST http://localhost:3000/api/auth/register `
-H "Content-Type: application/json" `
-d '{
  "full_name": "Test Student",
  "email": "student@test.com",
  "password": "Test@123456",
  "role": "student"
}'
```

### 2. Login
```powershell
curl -X POST http://localhost:3000/api/auth/login `
-H "Content-Type: application/json" `
-d '{
  "email": "student@test.com",
  "password": "Test@123456"
}'
```

### 3. Get Profile (cần token)
```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
curl -X GET http://localhost:3000/api/users/profile `
-H "Authorization: Bearer $token"
```

## 📊 Expected Results

### Successful Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🎭 Test Scenarios

### Scenario 1: Student Enrollment Journey
1. Register as student
2. Browse courses
3. Enroll in a course
4. View course content
5. Complete lessons
6. Take quizzes
7. Submit assignments
8. Check grades

### Scenario 2: Instructor Course Management
1. Register/Login as instructor
2. Create course
3. Add sections and lessons
4. Create quiz with questions
5. Create assignment
6. Monitor student progress
7. Grade submissions

### Scenario 3: Admin Operations
1. Login as admin
2. View all users
3. Create new users
4. Change user status
5. View system statistics

## ⚠️ Common Issues

### Issue 1: Token Expired
**Error:** `401 Unauthorized`

**Solution:**
1. Run **Refresh Token** request
2. Or run **Login** again to get new token

### Issue 2: Invalid Credentials
**Error:** `401 Invalid email or password`

**Solution:**
- Make sure you ran **Register** first
- Check email/password match
- Password must have: uppercase, lowercase, number, special char, min 8 chars

### Issue 3: Course Not Found
**Error:** `404 Course not found`

**Solution:**
- Run **Create Course** first to populate `courseId`
- Check environment variable has valid `courseId`

### Issue 4: Forbidden Access
**Error:** `403 Forbidden`

**Solution:**
- Some endpoints require specific roles (instructor, admin)
- Register with appropriate role or use admin account

## 🔍 Debugging Tips

1. **Check Environment:** Ensure "LMS Development Environment" is selected
2. **View Console:** Postman Console (View → Show Postman Console) shows all requests
3. **Check Variables:** Hover over `{{variableName}}` to see current value
4. **Manual Override:** You can manually set variables in Environment panel
5. **Backend Logs:** Check `backend/logs/` for server-side errors

## 📈 Test Coverage

| Module | Endpoints | Coverage |
|--------|-----------|----------|
| Authentication | 7 | ✅ 100% |
| User Management | 5 | ✅ 100% |
| Admin Users | 7 | ✅ 100% |
| Categories | 2 | ✅ 100% |
| Courses | 9 | ✅ 100% |
| Course Content | 9 | ✅ 100% |
| Quizzes | 11 | ✅ 100% |
| Assignments | 4 | ✅ 100% |
| Grades | 3 | ✅ 100% |
| Chat | 4 | ✅ 100% |
| Livestream | 4 | ✅ 100% |
| Notifications | 4 | ✅ 100% |
| Analytics | 2 | ✅ 100% |
| Files | 4 | ✅ 100% |
| **TOTAL** | **75+** | **✅ 100%** |

## 🚀 Next Steps

1. **Import collection vào Postman**
2. **Chạy Phase 1 (Authentication)** - QUAN TRỌNG
3. **Chạy từng Phase theo thứ tự**
4. **Document các lỗi phát hiện được**
5. **Report test results**

## 📞 Support

Nếu gặp vấn đề:
1. Check backend logs: `backend/logs/`
2. Verify database connection
3. Ensure all environment variables are set correctly
4. Check API_TEST_PLAN.md for detailed test cases
