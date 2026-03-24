# 🧪 Manual Testing Guide - User Admin Endpoints

## 📋 Chuẩn bị

### 1. Start Backend Server
```bash
cd h:\DACN\backend
npm run dev
```

### 2. Get Authentication Tokens

#### Tạo Admin User (nếu chưa có):
```bash
# Sử dụng script hoặc database
# Hoặc đăng ký qua API và cập nhật role trong database
```

#### Login để lấy token:
```bash
# Login as Admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'

# Login as Instructor
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "your-password"
  }'

# Login as Student
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "your-password"
  }'
```

### 3. Lưu tokens
```bash
# Lưu vào biến môi trường (PowerShell)
$ADMIN_TOKEN = "your-admin-token-here"
$INSTRUCTOR_TOKEN = "your-instructor-token-here"
$STUDENT_TOKEN = "your-student-token-here"
```

---

## ✅ Test Cases

### 1️⃣ **Get User Statistics** (Admin Only)

**Expected:** ✅ Success for Admin, ❌ 403 for others

```powershell
# Admin - Should work
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/stats" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $ADMIN_TOKEN" }

# Student - Should fail with 403
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/stats" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $STUDENT_TOKEN" }
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalUsers": 100,
    "activeUsers": 85,
    "students": 70,
    "instructors": 15,
    "admins": 5,
    "verifiedUsers": 90
  }
}
```

---

### 2️⃣ **Get All Users** (Admin/Instructor)

**Expected:** ✅ Success for Admin & Instructor, ❌ 403 for Student

```powershell
# Admin - Should work
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users?page=1&limit=10" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $ADMIN_TOKEN" }

# Instructor - Should work
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users?page=1&limit=10" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $INSTRUCTOR_TOKEN" }

# With filters
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users?page=1&limit=10&role=student&status=active" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $ADMIN_TOKEN" }
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "student",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 3️⃣ **Create New User** (Admin Only)

**Expected:** ✅ Success for Admin, ❌ 403 for others

```powershell
# Admin - Should work
$newUser = @{
  email = "newuser@example.com"
  password = "SecurePass123!"
  first_name = "New"
  last_name = "User"
  phone = "+84912345678"
  role = "student"
  bio = "Test user"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users" `
  -Method POST `
  -Headers @{ 
    "Authorization" = "Bearer $ADMIN_TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body $newUser

# Student - Should fail with 403
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users" `
  -Method POST `
  -Headers @{ 
    "Authorization" = "Bearer $STUDENT_TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body $newUser
```

---

### 4️⃣ **Get User by ID** (All Authenticated)

**Expected:** ✅ Success for all authenticated users

```powershell
$userId = "uuid-here"

# Admin - Should work
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/$userId" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $ADMIN_TOKEN" }

# Student - Should work (can view profiles)
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/$userId" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $STUDENT_TOKEN" }
```

---

### 5️⃣ **Update User** (Admin Only)

**Expected:** ✅ Success for Admin, ❌ 403 for others

```powershell
$userId = "uuid-here"
$updates = @{
  first_name = "Updated"
  last_name = "Name"
  bio = "Updated bio"
} | ConvertTo-Json

# Admin - Should work
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/$userId" `
  -Method PATCH `
  -Headers @{ 
    "Authorization" = "Bearer $ADMIN_TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body $updates

# Student - Should fail
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/$userId" `
  -Method PATCH `
  -Headers @{ 
    "Authorization" = "Bearer $STUDENT_TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body $updates
```

---

### 6️⃣ **Change User Status** (Admin Only)

**Expected:** ✅ Success for Admin, ❌ 403 for others

```powershell
$userId = "uuid-here"
$statusUpdate = @{
  status = "suspended"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/$userId/status" `
  -Method PATCH `
  -Headers @{ 
    "Authorization" = "Bearer $ADMIN_TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body $statusUpdate
```

---

### 7️⃣ **Get Users by Role** (Admin/Instructor)

**Expected:** ✅ Success for Admin & Instructor

```powershell
# Get all students
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/role/student" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $ADMIN_TOKEN" }

# Get all instructors
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/role/instructor" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $INSTRUCTOR_TOKEN" }
```

---

### 8️⃣ **Search User by Email** (Admin/Instructor)

**Expected:** ✅ Success for Admin & Instructor

```powershell
$email = "test@example.com"

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/email/search?email=$email" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $ADMIN_TOKEN" }
```

---

### 9️⃣ **Delete User** (Admin Only)

**Expected:** ✅ Success for Admin, ❌ 403 for others

```powershell
$userId = "uuid-here"

# Admin - Should work
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/$userId" `
  -Method DELETE `
  -Headers @{ "Authorization" = "Bearer $ADMIN_TOKEN" }

# Student - Should fail
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users/$userId" `
  -Method DELETE `
  -Headers @{ "Authorization" = "Bearer $STUDENT_TOKEN" }
```

---

## 🔒 User Self-Service Endpoints (For Comparison)

### 1️⃣ **Get Own Profile**

```powershell
# Any authenticated user can access
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/users/profile" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $STUDENT_TOKEN" }
```

### 2️⃣ **Update Own Profile**

```powershell
$profileUpdate = @{
  first_name = "Jane"
  last_name = "Smith"
  bio = "Updated my profile"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/users/profile" `
  -Method PUT `
  -Headers @{ 
    "Authorization" = "Bearer $STUDENT_TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body $profileUpdate
```

### 3️⃣ **Get Active Sessions**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/users/sessions" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $STUDENT_TOKEN" }
```

---

## 📊 Expected Test Results

### ✅ Should PASS:
- [ ] Admin can access all endpoints
- [ ] Instructor can view users and search
- [ ] Students can view user profiles (read-only)
- [ ] All users can manage their own profiles via `/users/*`
- [ ] Validation errors for invalid data
- [ ] 401 for unauthenticated requests
- [ ] 403 for unauthorized requests

### ❌ Should FAIL:
- [ ] Students accessing admin-only endpoints
- [ ] Students creating/updating/deleting users
- [ ] Unauthenticated requests
- [ ] Invalid email formats
- [ ] Weak passwords
- [ ] Invalid status values

---

## 🐛 Common Issues & Solutions

### Issue 1: "Unauthorized" error
**Solution:** Check if token is valid and not expired

### Issue 2: "Forbidden" error  
**Solution:** Check user role - may need admin privileges

### Issue 3: "User not found"
**Solution:** Verify user ID exists in database

### Issue 4: Validation errors
**Solution:** Check request body matches schema requirements

---

## 📝 Testing Checklist

### Authorization Tests:
- [ ] Admin can perform all operations
- [ ] Instructor can read but not modify
- [ ] Student has read-only access to profiles
- [ ] Unauthenticated requests are rejected

### CRUD Operations:
- [ ] Create user with valid data
- [ ] Read user by ID
- [ ] Update user information
- [ ] Delete user
- [ ] Get user statistics

### Validation Tests:
- [ ] Invalid email format rejected
- [ ] Weak password rejected
- [ ] Invalid status rejected
- [ ] Missing required fields rejected

### Edge Cases:
- [ ] Non-existent user returns 404
- [ ] Duplicate email returns 409
- [ ] Large pagination limits handled
- [ ] Special characters in search

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ Correct HTTP status codes
- ✅ Proper authorization checks
- ✅ Valid response formats
- ✅ No server errors in logs
- ✅ Consistent behavior across roles

---

**Happy Testing! 🚀**
