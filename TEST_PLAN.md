# 🧪 COMPREHENSIVE BACKEND TEST PLAN

**Date:** October 28, 2025  
**Project:** LMS Backend - User Admin Module  
**Environment:** Docker Compose (PostgreSQL + Redis + Backend)

---

## 📊 TEST OVERVIEW

### Test Scope
- ✅ Infrastructure & Environment
- ✅ Database Connectivity & Migrations
- ✅ Authentication & Authorization
- ✅ Admin User Management Endpoints (9 methods)
- ✅ Integration Tests
- ✅ Unit Tests
- ✅ Performance & Load Testing

### Test Environment
- **Backend:** Node.js 18 Alpine, TypeScript, Express
- **Database:** PostgreSQL 15 (Docker)
- **Cache:** Redis 7 Alpine (Docker)
- **Seed Data:** 12 users, 5 courses, 9 enrollments

---

## 🎯 PHASE 1: INFRASTRUCTURE VALIDATION

### 1.1 Docker Services Health Check
- [ ] Verify PostgreSQL container running & healthy
- [ ] Verify Redis container running & healthy
- [ ] Verify Backend container running & healthy
- [ ] Check network connectivity between containers

### 1.2 Database Validation
- [ ] Verify all migrations applied successfully
- [ ] Check database schema matches model definitions
- [ ] Verify seed data loaded correctly
  - [ ] 12 users (1 super_admin, 1 admin, 3 instructors, 7 students)
  - [ ] 5 courses
  - [ ] 9 enrollments

### 1.3 Backend Service Validation
- [ ] Health endpoint responding (GET /health)
- [ ] Metrics endpoint accessible (GET /metrics)
- [ ] Swagger documentation accessible (GET /api-docs)

**Success Criteria:**
- All containers healthy
- Database schema correct with `email_verified` column
- Seed data complete

---

## 🔐 PHASE 2: AUTHENTICATION TESTING

### 2.1 Login Functionality
- [ ] **Test 1:** Admin login with correct credentials
  - Endpoint: `POST /api/v1.2.0/auth/login`
  - Email: `admin@example.com`
  - Password: `Admin123!`
  - Expected: 200 OK, access token + refresh token

- [ ] **Test 2:** Student login with correct credentials
  - Email: `student1@example.com`
  - Password: `Student123!`
  - Expected: 200 OK, tokens returned

- [ ] **Test 3:** Login with invalid credentials
  - Expected: 401 Unauthorized

- [ ] **Test 4:** Login with non-existent email
  - Expected: 401 Unauthorized

### 2.2 Token Validation
- [ ] **Test 5:** Access protected endpoint with valid token
- [ ] **Test 6:** Access protected endpoint without token
  - Expected: 401 Unauthorized
- [ ] **Test 7:** Access protected endpoint with expired token
  - Expected: 401 Unauthorized
- [ ] **Test 8:** Access protected endpoint with malformed token
  - Expected: 401 Unauthorized

**Success Criteria:**
- All authentication flows work correctly
- JWT tokens generated and validated properly
- Proper error responses for invalid attempts

---

## 👥 PHASE 3: ADMIN USER MANAGEMENT ENDPOINTS

### 3.1 Statistics Endpoint
- [ ] **Test 9:** GET /admin/users/stats (Admin)
  - Expected: 200 OK, correct statistics
  - Verify: totalUsers=12, activeUsers=10, students=7, etc.

- [ ] **Test 10:** GET /admin/users/stats (Student)
  - Expected: 403 Forbidden

### 3.2 List All Users
- [ ] **Test 11:** GET /admin/users?page=1&limit=10 (Admin)
  - Expected: 200 OK, paginated user list
  - Verify: data array, pagination metadata

- [ ] **Test 12:** GET /admin/users with filters (role=student, status=active)
  - Expected: 200 OK, filtered results

- [ ] **Test 13:** GET /admin/users (unauthorized)
  - Expected: 401 Unauthorized

### 3.3 Get User by ID
- [ ] **Test 14:** GET /admin/users/:id (Admin accessing any user)
  - Expected: 200 OK, user details

- [ ] **Test 15:** GET /admin/users/:id (Student accessing own profile)
  - Expected: 200 OK, own user details

- [ ] **Test 16:** GET /admin/users/:id (Student accessing another user)
  - Expected: 403 Forbidden or limited data

- [ ] **Test 17:** GET /admin/users/invalid-uuid
  - Expected: 400 Bad Request

- [ ] **Test 18:** GET /admin/users/00000000-0000-0000-0000-000000000099
  - Expected: 404 Not Found

### 3.4 Create New User
- [ ] **Test 19:** POST /admin/users (Admin creates student)
  - Body: Valid student data
  - Expected: 201 Created, user object returned

- [ ] **Test 20:** POST /admin/users (Admin creates instructor)
  - Body: Valid instructor data with instructor-specific fields
  - Expected: 201 Created

- [ ] **Test 21:** POST /admin/users with duplicate email
  - Expected: 409 Conflict

- [ ] **Test 22:** POST /admin/users with invalid email format
  - Expected: 400 Bad Request, validation error

- [ ] **Test 23:** POST /admin/users with weak password
  - Expected: 400 Bad Request

- [ ] **Test 24:** POST /admin/users (Student attempting)
  - Expected: 403 Forbidden

### 3.5 Update User
- [ ] **Test 25:** PATCH /admin/users/:id (Admin updates user)
  - Body: Updated fields (first_name, last_name, phone)
  - Expected: 200 OK, updated user

- [ ] **Test 26:** PATCH /admin/users/:id (User updates own profile)
  - Expected: 200 OK if allowed fields

- [ ] **Test 27:** PATCH /admin/users/:id (Student updates role)
  - Expected: 403 Forbidden (can't change role)

- [ ] **Test 28:** PATCH /admin/users/invalid-id
  - Expected: 400 Bad Request

### 3.6 Delete User
- [ ] **Test 29:** DELETE /admin/users/:id (Admin deletes user)
  - Expected: 200 OK or 204 No Content

- [ ] **Test 30:** DELETE /admin/users/:id (Student attempting)
  - Expected: 403 Forbidden

- [ ] **Test 31:** DELETE /admin/users/:id (Delete non-existent user)
  - Expected: 404 Not Found

- [ ] **Test 32:** DELETE /admin/users/:id (Self-deletion prevention)
  - Expected: 400 Bad Request

### 3.7 Change User Status
- [ ] **Test 33:** PATCH /admin/users/:id/status (Admin activates user)
  - Body: { status: "active" }
  - Expected: 200 OK

- [ ] **Test 34:** PATCH /admin/users/:id/status (Admin suspends user)
  - Body: { status: "suspended" }
  - Expected: 200 OK

- [ ] **Test 35:** PATCH /admin/users/:id/status (Invalid status)
  - Body: { status: "invalid" }
  - Expected: 400 Bad Request

### 3.8 Get Users by Role
- [ ] **Test 36:** GET /admin/users/role/student (Admin)
  - Expected: 200 OK, array of students

- [ ] **Test 37:** GET /admin/users/role/instructor (Admin)
  - Expected: 200 OK, array of instructors

- [ ] **Test 38:** GET /admin/users/role/invalid
  - Expected: 400 Bad Request

### 3.9 Search User by Email
- [ ] **Test 39:** GET /admin/users/email/search?email=admin@example.com
  - Expected: 200 OK, user found

- [ ] **Test 40:** GET /admin/users/email/search?email=nonexistent@example.com
  - Expected: 404 Not Found

- [ ] **Test 41:** GET /admin/users/email/search (missing query param)
  - Expected: 400 Bad Request

**Success Criteria:**
- All 41 admin endpoint tests pass
- Proper authorization checks
- Correct data validation
- Appropriate error responses

---

## 🔬 PHASE 4: INTEGRATION TESTS

### 4.1 Jest Integration Tests
- [ ] Run existing Jest test suite
  - Command: `npm test` or `npm run test:integration`
  - Expected: All tests pass

### 4.2 End-to-End Workflows
- [ ] **Workflow 1:** Complete user lifecycle
  1. Admin creates new student
  2. Student logs in
  3. Student updates profile
  4. Admin suspends student
  5. Suspended student cannot login

- [ ] **Workflow 2:** Bulk operations
  1. Admin fetches all students (paginated)
  2. Admin filters by status
  3. Admin gets statistics
  4. Verify counts match

**Success Criteria:**
- Integration test suite passes
- E2E workflows complete successfully

---

## ⚡ PHASE 5: PERFORMANCE TESTING

### 5.1 Response Time Testing
- [ ] Health endpoint < 50ms
- [ ] Login endpoint < 200ms
- [ ] User list endpoint < 300ms
- [ ] User stats endpoint < 150ms

### 5.2 Concurrent Request Testing
- [ ] 10 concurrent login requests
- [ ] 20 concurrent GET /admin/users requests
- [ ] Verify no timeout errors

### 5.3 Database Query Performance
- [ ] Check slow query logs
- [ ] Verify proper indexes used
- [ ] Pagination efficiency test (page 1 vs page 10)

**Success Criteria:**
- All response times within acceptable limits
- System handles concurrent requests without errors

---

## 🧪 PHASE 6: UNIT TESTS

### 6.1 Utility Function Tests
- [ ] Run `npm test src/utils/user.util.test.ts`
- [ ] Run `npm test src/utils/role.util.test.ts`

### 6.2 Repository Tests
- [ ] UserRepository methods
- [ ] Error handling

### 6.3 Controller Tests
- [ ] UserAdminController methods
- [ ] Input validation

**Success Criteria:**
- All unit tests pass with >80% coverage

---

## 📝 PHASE 7: VALIDATION & ERROR HANDLING

### 7.1 Input Validation Tests
- [ ] Invalid email formats
- [ ] Password strength requirements
- [ ] Required field validation
- [ ] Type validation (string, number, boolean)
- [ ] UUID format validation

### 7.2 Error Response Format
- [ ] Verify consistent error structure
  ```json
  {
    "success": false,
    "message": "Error description",
    "errors": [...] // Optional validation errors
  }
  ```

### 7.3 Rate Limiting
- [ ] Auth rate limit (5 attempts/15 min)
- [ ] Registration rate limit (3 attempts/hour)
- [ ] Password reset rate limit (3 attempts/hour)

**Success Criteria:**
- All validation working correctly
- Consistent error responses
- Rate limiting prevents abuse

---

## 🔍 PHASE 8: SECURITY TESTING

### 8.1 Authentication Security
- [ ] No sensitive data in JWT payload
- [ ] Password hashing verified (bcrypt)
- [ ] Token expiration working

### 8.2 Authorization Security
- [ ] Role-based access control enforced
- [ ] User cannot access other user's private data
- [ ] Admin-only endpoints properly protected

### 8.3 SQL Injection Prevention
- [ ] Test malicious input in search queries
- [ ] Verify Sequelize parameterized queries

### 8.4 XSS Prevention
- [ ] Test script injection in text fields
- [ ] Verify input sanitization

**Success Criteria:**
- No security vulnerabilities found
- All security measures working

---

## 📊 FINAL REPORT GENERATION

### Test Execution Summary
- **Total Tests:** 41 endpoint tests + integration + unit tests
- **Passed:** _____
- **Failed:** _____
- **Skipped:** _____
- **Duration:** _____

### Coverage Report
- **Overall Coverage:** _____%
- **Controllers:** _____%
- **Services:** _____%
- **Repositories:** _____%
- **Utils:** _____%

### Issues Found
1. _____
2. _____
3. _____

### Recommendations
1. _____
2. _____
3. _____

---

## 🚀 EXECUTION COMMANDS

```bash
# Phase 1: Infrastructure
docker-compose -f docker-compose.dev.yml ps
docker logs dacn-backend-1 --tail 50
docker exec dacn-postgres-1 psql -U lms_user -d lms_db -c "SELECT COUNT(*) FROM users;"

# Phase 2-3: API Testing (PowerShell)
cd backend
.\test-admin-endpoints.ps1 -BaseUrl "http://localhost:3000/api/v1.2.0" -AdminEmail "admin@example.com" -AdminPassword "Admin123!"

# Phase 4: Integration Tests
npm run test:integration

# Phase 6: Unit Tests
npm test

# Phase 5: Performance (optional - using Artillery or similar)
# artillery quick --count 10 --num 5 http://localhost:3000/health
```

---

## ✅ COMPLETION CHECKLIST

- [ ] All phases executed
- [ ] Test report generated
- [ ] Issues documented
- [ ] Code coverage reviewed
- [ ] Performance benchmarks recorded
- [ ] Security audit completed
- [ ] Final sign-off obtained

**Test Lead:** GitHub Copilot  
**Date Completed:** __________  
**Status:** 🟡 IN PROGRESS
