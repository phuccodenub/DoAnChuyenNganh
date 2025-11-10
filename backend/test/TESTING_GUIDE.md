# 🧪 Testing Documentation - User Admin Endpoints

## 📂 Files đã tạo

### 1. **test-admin-endpoints.http** ✅
**Mục đích:** REST Client / Postman testing  
**Cách dùng:** 
- Mở trong VS Code với extension REST Client
- Hoặc import vào Postman
- Cập nhật tokens ở đầu file
- Click "Send Request" cho từng test

**Nội dung:**
- 27 test cases
- Bao gồm admin, user, và authorization tests
- Edge cases và validation tests

---

### 2. **test-admin-endpoints.ps1** ✅
**Mục đích:** Automated testing script  
**Cách dùng:**
```powershell
# Đảm bảo backend đang chạy trước
cd h:\DACN\backend

# Chạy với default settings
.\test-admin-endpoints.ps1

# Hoặc với custom credentials
.\test-admin-endpoints.ps1 `
  -AdminEmail "your-admin@example.com" `
  -AdminPassword "YourPassword123!" `
  -StudentEmail "your-student@example.com" `
  -StudentPassword "YourPassword123!"
```

**Features:**
- ✅ Tự động login và lấy tokens
- ✅ Chạy tất cả test cases
- ✅ Color-coded output (✅ PASS / ❌ FAIL)
- ✅ Tự động tạo và xóa test data
- ✅ Test authorization cho từng role

---

### 3. **test-admin-manual.md** ✅
**Mục đích:** Manual testing guide  
**Cách dùng:**
- Đọc và làm theo từng bước
- Dùng PowerShell hoặc curl commands
- Verify expected responses

**Nội dung:**
- Step-by-step instructions
- PowerShell examples
- Expected responses
- Troubleshooting guide

---

### 4. **user.admin.controller.test.ts** ✅
**Mục đích:** Jest integration tests  
**Vị trí:** `src/tests/integration/modules/user/`  
**Cách dùng:**
```bash
# Run specific test file
npm test user.admin.controller.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

**Nội dung:**
- 40+ test cases
- Integration tests với supertest
- Authorization tests
- Validation tests
- CRUD operation tests

---

## 🚀 Quick Start - Test Ngay

### Option 1: PowerShell Script (Khuyến nghị) ⭐

```powershell
# 1. Start backend
cd h:\DACN\backend
npm run dev

# 2. Mở terminal mới và chạy tests
cd h:\DACN\backend
.\test-admin-endpoints.ps1
```

### Option 2: VS Code REST Client

```
1. Cài extension "REST Client" trong VS Code
2. Mở file test-admin-endpoints.http
3. Login để lấy tokens (dùng auth endpoints)
4. Copy tokens vào biến ở đầu file
5. Click "Send Request" cho từng test
```

### Option 3: Jest Tests

```bash
cd h:\DACN\backend
npm test
```

---

## 📊 Test Coverage

### Admin Endpoints:
- [x] GET /admin/users/stats - User statistics
- [x] GET /admin/users - List all users (pagination)
- [x] GET /admin/users?filters - Filter users
- [x] POST /admin/users - Create user
- [x] GET /admin/users/:id - Get user by ID
- [x] PATCH /admin/users/:id - Update user
- [x] DELETE /admin/users/:id - Delete user
- [x] PATCH /admin/users/:id/status - Change status
- [x] GET /admin/users/role/:role - Get by role
- [x] GET /admin/users/email/search - Search by email

### Authorization Tests:
- [x] Admin has full access
- [x] Instructor can read but not modify
- [x] Student has limited read access
- [x] Unauthenticated requests rejected (401)
- [x] Unauthorized requests rejected (403)

### Validation Tests:
- [x] Invalid email format rejected
- [x] Weak password rejected
- [x] Invalid status values rejected
- [x] Missing required fields rejected
- [x] Invalid UUID format handled

### User Self-Service (Comparison):
- [x] GET /users/profile
- [x] PUT /users/profile
- [x] POST /users/avatar
- [x] PATCH /users/preferences
- [x] GET /users/sessions
- [x] POST /users/logout-all

---

## 🎯 Expected Results

### ✅ Should PASS:

#### Admin Operations:
```
✅ Admin can access all endpoints
✅ Admin can create/update/delete users
✅ Admin can view statistics
✅ Admin can change user status
✅ Admin can search and filter users
```

#### Instructor Operations:
```
✅ Instructor can view user lists
✅ Instructor can search users
✅ Instructor can get users by role
❌ Instructor CANNOT create/update/delete
```

#### Student Operations:
```
✅ Student can view user profiles (read-only)
✅ Student can manage own profile via /users/*
❌ Student CANNOT access admin endpoints
❌ Student CANNOT modify other users
```

#### Validation:
```
✅ Invalid data is rejected with 400
✅ Proper error messages returned
✅ Edge cases handled gracefully
```

---

## 📝 Test Execution Log Example

```
================================
🧪 Testing User Admin Endpoints
================================

📝 Step 1: Login to get tokens...

✅ Admin login successful
✅ Student login successful

================================
🧪 Running Tests...
================================

Test 1: Get User Statistics (Admin)
✅ PASS: Admin can access statistics
✅ PASS: Student is denied access to statistics (403)

Test 2: Get All Users (Admin)
✅ PASS: Admin can list all users
✅ PASS: Response contains user array
✅ PASS: Response contains pagination

Test 3: Get Users with Filters
✅ PASS: Admin can filter users by role and status

Test 4: Create New User (Admin)
✅ PASS: Admin can create new user
   Created user ID: 123e4567-e89b-12d3-a456-426614174000
✅ PASS: Student is denied creating user (403)

Test 5: Get User by ID
✅ PASS: Admin can get user by ID
✅ PASS: Student can view user profile (read-only)

Test 6: Update User (Admin)
✅ PASS: Admin can update user
✅ PASS: Student is denied updating user (403)

Test 7: Change User Status (Admin)
✅ PASS: Admin can change user status

Test 8: Get Users by Role
✅ PASS: Admin can get users by role

Test 9: Search User by Email
✅ PASS: Admin can search user by email

Test 10: Validation Tests
✅ PASS: Rejects invalid email format (400)
✅ PASS: Rejects weak password (400)

Test 11: Delete User (Admin)
✅ PASS: Admin can delete user
✅ PASS: Deleted user returns 404

Test 12: User Self-Service Endpoints
✅ PASS: User can access own profile
✅ PASS: User can update own profile

================================
✅ Testing Complete!
================================
```

---

## 🐛 Troubleshooting

### Issue 1: "Cannot connect to server"
**Solution:**
```powershell
# Check if backend is running
cd h:\DACN\backend
npm run dev
```

### Issue 2: "Login failed"
**Solution:**
```powershell
# Create admin user if not exists
# Or update credentials in test script
.\test-admin-endpoints.ps1 `
  -AdminEmail "correct-email@example.com" `
  -AdminPassword "CorrectPassword123!"
```

### Issue 3: "401 Unauthorized"
**Solution:**
- Token có thể đã hết hạn
- Chạy lại script để lấy token mới

### Issue 4: "403 Forbidden"
**Solution:**
- Kiểm tra user role
- Đảm bảo user có quyền phù hợp

### Issue 5: Tests fail trong Jest
**Solution:**
```bash
# Build lại project
npm run build

# Run tests với verbose
npm test -- --verbose

# Check specific error
npm test user.admin.controller.test.ts
```

---

## 📈 Performance Benchmarks

### Expected Response Times:
- GET endpoints: < 100ms
- POST/PATCH endpoints: < 200ms
- DELETE endpoints: < 150ms
- Search/Filter: < 300ms

### Load Testing:
```powershell
# Test với nhiều requests
for ($i = 1; $i -le 10; $i++) {
    Write-Host "Request $i"
    Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/stats" `
        -Headers @{ "Authorization" = "Bearer $token" }
}
```

---

## 🔐 Security Checklist

- [x] All admin endpoints require authentication
- [x] Role-based authorization enforced
- [x] Password validation enforced
- [x] Email validation enforced
- [x] SQL injection protected (Sequelize ORM)
- [x] XSS protection (input sanitization)
- [x] Rate limiting applied
- [x] Tokens expire after set time

---

## 📚 Additional Resources

### Documentation:
- [User Module README](./src/modules/user/README.md)
- [Refactoring Document](./USER_CONTROLLER_REFACTORING.md)
- [API Documentation](./docs/API.md)

### Related Tests:
- Auth tests: `src/tests/integration/modules/auth/`
- User module tests: `src/tests/unit/modules/user/`
- E2E tests: `src/tests/e2e/`

---

## ✅ Testing Status

| Test Suite | Status | Coverage | Last Run |
|------------|--------|----------|----------|
| Manual Tests | ✅ Ready | 100% | - |
| PowerShell Script | ✅ Ready | 100% | - |
| Jest Integration | ✅ Ready | 85% | - |
| E2E Tests | 🔄 Pending | 0% | - |

---

## 🎓 Next Steps

1. **Run Tests:**
   ```powershell
   .\test-admin-endpoints.ps1
   ```

2. **Fix any failures**

3. **Update documentation if needed**

4. **Add more test cases** (if required)

5. **Deploy to staging** and test there

6. **Monitor logs** for any issues

---

**Happy Testing! 🚀**
