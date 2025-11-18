# API TEST PLAN - LMS SYSTEM

> **Ngày tạo:** 04/11/2025  
> **Phiên bản:** 1.0  
> **Mục đích:** Test toàn bộ API endpoints của hệ thống LMS

---

## 📋 MỤC LỤC

1. [Test Environment Setup](#1-test-environment-setup)
2. [Authentication Tests](#2-authentication-tests)
3. [User Management Tests](#3-user-management-tests)
4. [Course Management Tests](#4-course-management-tests)
5. [Course Content Tests](#5-course-content-tests)
6. [Assessment Tests](#6-assessment-tests)
7. [Communication Tests](#7-communication-tests)
8. [Test Execution Plan](#8-test-execution-plan)

---

## 1. TEST ENVIRONMENT SETUP

### 1.1. Prerequisites
```bash
# Backend should be running
npm run dev:api

# Database should be ready
# Redis should be ready
# Check health
GET http://localhost:3000/health
```

### 1.2. Test Data Setup
- Test users with different roles
- Sample courses
- Sample content
- Sample quizzes

### 1.3. Environment Variables
```
BASE_URL=http://localhost:3000/api
API_VERSION=v1
```

---

## 2. AUTHENTICATION TESTS

### 2.1. User Registration

#### TC-AUTH-001: Register New User (Success)
```
Method: POST
Endpoint: /api/auth/register
Body:
{
  "full_name": "Test Student",
  "email": "student@test.com",
  "password": "Test@123456",
  "role": "student"
}

Expected:
- Status: 201
- Response contains: user, tokens
- Email verification sent
```

#### TC-AUTH-002: Register with Existing Email (Fail)
```
Method: POST
Endpoint: /api/auth/register
Body: { Same email as above }

Expected:
- Status: 400/409
- Error: Email already exists
```

#### TC-AUTH-003: Register with Weak Password (Fail)
```
Method: POST
Endpoint: /api/auth/register
Body: { password: "123" }

Expected:
- Status: 400
- Error: Password too weak
```

### 2.2. User Login

#### TC-AUTH-004: Login with Valid Credentials
```
Method: POST
Endpoint: /api/auth/login
Body:
{
  "email": "student@test.com",
  "password": "Test@123456"
}

Expected:
- Status: 200
- Response contains: accessToken, refreshToken, user
- Token is valid JWT
```

#### TC-AUTH-005: Login with Wrong Password
```
Method: POST
Endpoint: /api/auth/login
Body: { wrong password }

Expected:
- Status: 401
- Error: Invalid credentials
```

#### TC-AUTH-006: Login with Non-existent Email
```
Expected:
- Status: 401
- Error: Invalid credentials
```

### 2.3. Token Management

#### TC-AUTH-007: Refresh Access Token
```
Method: POST
Endpoint: /api/auth/refresh
Body:
{
  "refreshToken": "{{refreshToken}}"
}

Expected:
- Status: 200
- New accessToken returned
```

#### TC-AUTH-008: Verify Token
```
Method: GET
Endpoint: /api/auth/verify
Headers: Authorization: Bearer {{accessToken}}

Expected:
- Status: 200
- User info returned
```

### 2.4. Two-Factor Authentication

#### TC-AUTH-009: Enable 2FA
```
Method: POST
Endpoint: /api/auth/2fa/enable
Headers: Authorization: Bearer {{accessToken}}

Expected:
- Status: 200
- QR code returned
- Secret returned
```

#### TC-AUTH-010: Verify 2FA Setup
```
Method: POST
Endpoint: /api/auth/2fa/verify-setup
Headers: Authorization: Bearer {{accessToken}}
Body:
{
  "code": "123456"
}

Expected:
- Status: 200
- 2FA activated
```

#### TC-AUTH-011: Login with 2FA
```
Method: POST
Endpoint: /api/auth/login-2fa
Body:
{
  "email": "student@test.com",
  "password": "Test@123456",
  "code": "123456"
}

Expected:
- Status: 200
- Tokens returned
```

### 2.5. Password Management

#### TC-AUTH-012: Change Password
```
Method: POST
Endpoint: /api/auth/change-password
Headers: Authorization: Bearer {{accessToken}}
Body:
{
  "currentPassword": "Test@123456",
  "newPassword": "NewTest@123456"
}

Expected:
- Status: 200
- Password changed successfully
```

### 2.6. Logout

#### TC-AUTH-013: Logout
```
Method: POST
Endpoint: /api/auth/logout
Headers: Authorization: Bearer {{accessToken}}

Expected:
- Status: 200
- Token invalidated
```

---

## 3. USER MANAGEMENT TESTS

### 3.1. User Profile

#### TC-USER-001: Get Own Profile
```
Method: GET
Endpoint: /api/users/profile
Headers: Authorization: Bearer {{accessToken}}

Expected:
- Status: 200
- User profile returned
```

#### TC-USER-002: Update Profile
```
Method: PUT
Endpoint: /api/users/profile
Headers: Authorization: Bearer {{accessToken}}
Body:
{
  "full_name": "Updated Name",
  "bio": "Updated bio"
}

Expected:
- Status: 200
- Profile updated
```

#### TC-USER-003: Upload Avatar
```
Method: POST
Endpoint: /api/users/avatar
Headers: Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data
Body: avatar file

Expected:
- Status: 200
- Avatar URL returned
```

### 3.2. User Preferences

#### TC-USER-004: Update Preferences
```
Method: PATCH
Endpoint: /api/users/preferences
Headers: Authorization: Bearer {{accessToken}}
Body:
{
  "language": "vi",
  "timezone": "Asia/Ho_Chi_Minh",
  "theme": "dark"
}

Expected:
- Status: 200
- Preferences updated
```

### 3.3. Admin Operations

#### TC-USER-005: Get All Users (Admin)
```
Method: GET
Endpoint: /api/admin/users?page=1&limit=10
Headers: Authorization: Bearer {{adminToken}}

Expected:
- Status: 200
- Paginated user list
```

#### TC-USER-006: Get User by ID
```
Method: GET
Endpoint: /api/admin/users/:userId
Headers: Authorization: Bearer {{adminToken}}

Expected:
- Status: 200
- User details
```

#### TC-USER-007: Create User (Admin)
```
Method: POST
Endpoint: /api/admin/users
Headers: Authorization: Bearer {{adminToken}}
Body:
{
  "full_name": "New User",
  "email": "newuser@test.com",
  "password": "Test@123456",
  "role": "student"
}

Expected:
- Status: 201
- User created
```

#### TC-USER-008: Update User (Admin)
```
Method: PATCH
Endpoint: /api/admin/users/:userId
Headers: Authorization: Bearer {{adminToken}}
Body:
{
  "full_name": "Updated Name"
}

Expected:
- Status: 200
- User updated
```

#### TC-USER-009: Delete User (Admin)
```
Method: DELETE
Endpoint: /api/admin/users/:userId
Headers: Authorization: Bearer {{adminToken}}

Expected:
- Status: 200
- User deleted
```

#### TC-USER-010: Change User Status
```
Method: PATCH
Endpoint: /api/admin/users/:userId/status
Headers: Authorization: Bearer {{adminToken}}
Body:
{
  "status": "inactive"
}

Expected:
- Status: 200
- Status changed
```

#### TC-USER-011: Get User Statistics
```
Method: GET
Endpoint: /api/admin/users/stats
Headers: Authorization: Bearer {{adminToken}}

Expected:
- Status: 200
- Statistics returned
```

---

## 4. COURSE MANAGEMENT TESTS

### 4.1. Course CRUD

#### TC-COURSE-001: Get All Courses (Public)
```
Method: GET
Endpoint: /api/courses?page=1&limit=10

Expected:
- Status: 200
- Paginated course list
```

#### TC-COURSE-002: Get Course by ID
```
Method: GET
Endpoint: /api/courses/:courseId

Expected:
- Status: 200
- Course details
```

#### TC-COURSE-003: Create Course (Instructor)
```
Method: POST
Endpoint: /api/courses
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "title": "Test Course",
  "description": "Test course description",
  "category_id": "{{categoryId}}",
  "level": "beginner",
  "status": "draft"
}

Expected:
- Status: 201
- Course created
```

#### TC-COURSE-004: Update Course
```
Method: PUT
Endpoint: /api/courses/:courseId
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "title": "Updated Course Title"
}

Expected:
- Status: 200
- Course updated
```

#### TC-COURSE-005: Delete Course
```
Method: DELETE
Endpoint: /api/courses/:courseId
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- Course deleted
```

### 4.2. Course Enrollment

#### TC-COURSE-006: Enroll in Course
```
Method: POST
Endpoint: /api/courses/:courseId/enroll
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 201
- Enrollment created
```

#### TC-COURSE-007: Get Enrolled Courses
```
Method: GET
Endpoint: /api/courses/enrolled
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- List of enrolled courses
```

#### TC-COURSE-008: Unenroll from Course
```
Method: DELETE
Endpoint: /api/courses/:courseId/unenroll
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Enrollment removed
```

#### TC-COURSE-009: Get Course Students (Instructor)
```
Method: GET
Endpoint: /api/courses/:courseId/students
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- List of enrolled students
```

### 4.3. Instructor Courses

#### TC-COURSE-010: Get My Courses (Instructor)
```
Method: GET
Endpoint: /api/courses/instructor/my-courses
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- Instructor's courses
```

---

## 5. COURSE CONTENT TESTS

### 5.1. Section Management

#### TC-CONTENT-001: Create Section
```
Method: POST
Endpoint: /api/course-content/courses/:courseId/sections
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "title": "Section 1: Introduction",
  "description": "Introduction to the course",
  "order_index": 1,
  "is_published": true
}

Expected:
- Status: 201
- Section created
```

#### TC-CONTENT-002: Get Course Sections
```
Method: GET
Endpoint: /api/course-content/courses/:courseId/sections
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- List of sections
```

#### TC-CONTENT-003: Update Section
```
Method: PUT
Endpoint: /api/course-content/sections/:sectionId
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "title": "Updated Section Title"
}

Expected:
- Status: 200
- Section updated
```

#### TC-CONTENT-004: Delete Section
```
Method: DELETE
Endpoint: /api/course-content/sections/:sectionId
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- Section deleted
```

#### TC-CONTENT-005: Reorder Sections
```
Method: POST
Endpoint: /api/course-content/courses/:courseId/sections/reorder
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "sections": [
    {"id": "section1", "order_index": 2},
    {"id": "section2", "order_index": 1}
  ]
}

Expected:
- Status: 200
- Sections reordered
```

### 5.2. Lesson Management

#### TC-CONTENT-006: Create Lesson
```
Method: POST
Endpoint: /api/course-content/sections/:sectionId/lessons
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "title": "Lesson 1: Getting Started",
  "content": "Lesson content here",
  "lesson_type": "video",
  "duration": 600,
  "order_index": 1,
  "is_published": true
}

Expected:
- Status: 201
- Lesson created
```

#### TC-CONTENT-007: Get Lesson
```
Method: GET
Endpoint: /api/course-content/lessons/:lessonId
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Lesson details
```

#### TC-CONTENT-008: Update Lesson
```
Method: PUT
Endpoint: /api/course-content/lessons/:lessonId
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "title": "Updated Lesson Title"
}

Expected:
- Status: 200
- Lesson updated
```

#### TC-CONTENT-009: Delete Lesson
```
Method: DELETE
Endpoint: /api/course-content/lessons/:lessonId
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- Lesson deleted
```

### 5.3. Lesson Materials

#### TC-CONTENT-010: Add Material to Lesson
```
Method: POST
Endpoint: /api/course-content/lessons/:lessonId/materials
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "title": "Lecture Notes",
  "material_type": "document",
  "file_url": "https://example.com/notes.pdf",
  "file_size": 1024000
}

Expected:
- Status: 201
- Material added
```

#### TC-CONTENT-011: Delete Material
```
Method: DELETE
Endpoint: /api/course-content/materials/:materialId
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- Material deleted
```

#### TC-CONTENT-012: Track Material Download
```
Method: POST
Endpoint: /api/course-content/materials/:materialId/download
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Download tracked
```

### 5.4. Progress Tracking

#### TC-CONTENT-013: Update Lesson Progress
```
Method: PUT
Endpoint: /api/course-content/lessons/:lessonId/progress
Headers: Authorization: Bearer {{studentToken}}
Body:
{
  "progress_percentage": 50,
  "time_spent": 300
}

Expected:
- Status: 200
- Progress updated
```

#### TC-CONTENT-014: Mark Lesson as Completed
```
Method: POST
Endpoint: /api/course-content/lessons/:lessonId/complete
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Lesson marked completed
```

#### TC-CONTENT-015: Get Course Progress
```
Method: GET
Endpoint: /api/course-content/courses/:courseId/progress
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Course progress data
```

#### TC-CONTENT-016: Get Recent Activity
```
Method: GET
Endpoint: /api/course-content/users/me/recent-activity?limit=10
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Recent activities
```

---

## 6. ASSESSMENT TESTS

### 6.1. Quiz Management

#### TC-QUIZ-001: Create Quiz
```
Method: POST
Endpoint: /api/quizzes
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "course_id": "{{courseId}}",
  "title": "Quiz 1: Introduction",
  "description": "Test your knowledge",
  "time_limit": 1800,
  "passing_score": 70,
  "max_attempts": 3,
  "is_published": true
}

Expected:
- Status: 201
- Quiz created
```

#### TC-QUIZ-002: Get Quiz
```
Method: GET
Endpoint: /api/quizzes/:quizId
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Quiz details
```

#### TC-QUIZ-003: Update Quiz
```
Method: PUT
Endpoint: /api/quizzes/:quizId
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "title": "Updated Quiz Title"
}

Expected:
- Status: 200
- Quiz updated
```

#### TC-QUIZ-004: Delete Quiz
```
Method: DELETE
Endpoint: /api/quizzes/:quizId
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- Quiz deleted
```

### 6.2. Question Management

#### TC-QUIZ-005: Add Question to Quiz
```
Method: POST
Endpoint: /api/quizzes/:quizId/questions
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "question_text": "What is 2+2?",
  "question_type": "multiple_choice",
  "points": 10,
  "order_index": 1
}

Expected:
- Status: 201
- Question created
```

#### TC-QUIZ-006: Add Options to Question
```
Method: POST
Endpoint: /api/quizzes/questions/:questionId/options
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "option_text": "4",
  "is_correct": true,
  "order_index": 1
}

Expected:
- Status: 201
- Option added
```

#### TC-QUIZ-007: Update Question
```
Method: PUT
Endpoint: /api/quizzes/questions/:questionId
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "question_text": "Updated question?"
}

Expected:
- Status: 200
- Question updated
```

#### TC-QUIZ-008: Delete Question
```
Method: DELETE
Endpoint: /api/quizzes/questions/:questionId
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- Question deleted
```

#### TC-QUIZ-009: Get Quiz Questions
```
Method: GET
Endpoint: /api/quizzes/:quizId/questions
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- List of questions with options
```

### 6.3. Quiz Attempts

#### TC-QUIZ-010: Start Quiz Attempt
```
Method: POST
Endpoint: /api/quizzes/:quizId/attempts
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 201
- Attempt created with attemptId
```

#### TC-QUIZ-011: Submit Quiz Attempt
```
Method: POST
Endpoint: /api/quizzes/attempts/:attemptId/submit
Headers: Authorization: Bearer {{studentToken}}
Body:
{
  "answers": [
    {
      "question_id": "{{questionId}}",
      "selected_option_id": "{{optionId}}"
    }
  ]
}

Expected:
- Status: 200
- Score calculated
- Feedback returned
```

#### TC-QUIZ-012: Get My Attempts
```
Method: GET
Endpoint: /api/quizzes/:quizId/my-attempts
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- List of attempts with scores
```

#### TC-QUIZ-013: Get Attempt Details
```
Method: GET
Endpoint: /api/quizzes/attempts/:attemptId
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Attempt details with answers
```

### 6.4. Quiz Analytics

#### TC-QUIZ-014: Get Quiz Statistics (Instructor)
```
Method: GET
Endpoint: /api/quizzes/:quizId/statistics
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- Average score, completion rate, etc.
```

#### TC-QUIZ-015: Get All Attempts (Instructor)
```
Method: GET
Endpoint: /api/quizzes/:quizId/attempts
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- All student attempts
```

### 6.5. Assignment Management

#### TC-ASSIGN-001: Create Assignment
```
Method: POST
Endpoint: /api/assignments
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "course_id": "{{courseId}}",
  "title": "Assignment 1",
  "description": "Complete the exercises",
  "due_date": "2025-12-31T23:59:59Z",
  "max_score": 100
}

Expected:
- Status: 201
- Assignment created
```

#### TC-ASSIGN-002: Get Assignment
```
Method: GET
Endpoint: /api/assignments/:assignmentId
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Assignment details
```

#### TC-ASSIGN-003: Submit Assignment
```
Method: POST
Endpoint: /api/assignments/:assignmentId/submissions
Headers: Authorization: Bearer {{studentToken}}
Body:
{
  "submission_text": "My solution...",
  "attachments": ["url1", "url2"]
}

Expected:
- Status: 201
- Submission created
```

#### TC-ASSIGN-004: Grade Submission
```
Method: POST
Endpoint: /api/assignments/submissions/:submissionId/grade
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "score": 85,
  "feedback": "Good work!"
}

Expected:
- Status: 200
- Submission graded
```

### 6.6. Grading

#### TC-GRADE-001: Upsert Grade
```
Method: POST
Endpoint: /api/grades
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "user_id": "{{studentId}}",
  "course_id": "{{courseId}}",
  "gradeable_type": "quiz",
  "gradeable_id": "{{quizId}}",
  "score": 85,
  "max_score": 100
}

Expected:
- Status: 200
- Grade saved
```

#### TC-GRADE-002: Upsert Final Grade
```
Method: POST
Endpoint: /api/grades/final
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "user_id": "{{studentId}}",
  "course_id": "{{courseId}}",
  "final_score": 88.5,
  "letter_grade": "B+",
  "passed": true
}

Expected:
- Status: 200
- Final grade saved
```

#### TC-GRADE-003: Get User Grades
```
Method: GET
Endpoint: /api/grades/users/:userId/courses/:courseId
Headers: Authorization: Bearer {{token}}

Expected:
- Status: 200
- All grades for user in course
```

---

## 7. COMMUNICATION TESTS

### 7.1. Chat

#### TC-CHAT-001: Get Course Messages
```
Method: GET
Endpoint: /api/chat/courses/:courseId/messages?limit=50&offset=0
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- List of messages
```

#### TC-CHAT-002: Send Message (REST)
```
Method: POST
Endpoint: /api/chat/courses/:courseId/messages
Headers: Authorization: Bearer {{studentToken}}
Body:
{
  "message_text": "Hello everyone!",
  "message_type": "text"
}

Expected:
- Status: 201
- Message sent
```

#### TC-CHAT-003: Search Messages
```
Method: GET
Endpoint: /api/chat/courses/:courseId/messages/search?q=hello
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Matching messages
```

#### TC-CHAT-004: Update Message
```
Method: PUT
Endpoint: /api/chat/messages/:messageId
Headers: Authorization: Bearer {{studentToken}}
Body:
{
  "message_text": "Updated message"
}

Expected:
- Status: 200
- Message updated
```

#### TC-CHAT-005: Delete Message
```
Method: DELETE
Endpoint: /api/chat/messages/:messageId
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Message deleted
```

#### TC-CHAT-006: Get Chat Statistics
```
Method: GET
Endpoint: /api/chat/courses/:courseId/statistics
Headers: Authorization: Bearer {{instructorToken}}

Expected:
- Status: 200
- Message count, active users, etc.
```

### 7.2. Livestream

#### TC-LIVE-001: Create Live Session
```
Method: POST
Endpoint: /api/livestreams
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "course_id": "{{courseId}}",
  "title": "Live Lecture 1",
  "scheduled_start": "2025-11-05T10:00:00Z",
  "duration": 3600
}

Expected:
- Status: 201
- Session created
```

#### TC-LIVE-002: Get Live Session
```
Method: GET
Endpoint: /api/livestreams/:sessionId
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Session details
```

#### TC-LIVE-003: Update Session Status
```
Method: PUT
Endpoint: /api/livestreams/:sessionId/status
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "status": "live"
}

Expected:
- Status: 200
- Status updated
```

#### TC-LIVE-004: Join Session
```
Method: POST
Endpoint: /api/livestreams/:sessionId/join
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Attendance recorded
```

### 7.3. Notifications

#### TC-NOTIF-001: Create Notification
```
Method: POST
Endpoint: /api/notifications
Headers: Authorization: Bearer {{instructorToken}}
Body:
{
  "title": "New Assignment Posted",
  "message": "Assignment 1 is now available",
  "category": "assignment",
  "priority": "normal",
  "recipient_ids": ["{{studentId}}"]
}

Expected:
- Status: 201
- Notification created
```

#### TC-NOTIF-002: Get My Notifications
```
Method: GET
Endpoint: /api/notifications/me?limit=20&offset=0
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- List of notifications
```

#### TC-NOTIF-003: Get Unread Count
```
Method: GET
Endpoint: /api/notifications/me/unread-count
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- { "count": 5 }
```

#### TC-NOTIF-004: Mark All as Read
```
Method: POST
Endpoint: /api/notifications/me/mark-all-read
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- All marked as read
```

#### TC-NOTIF-005: Archive Old Notifications
```
Method: POST
Endpoint: /api/notifications/me/archive-old?days=30
Headers: Authorization: Bearer {{studentToken}}

Expected:
- Status: 200
- Old notifications archived
```

---

## 8. TEST EXECUTION PLAN

### 8.1. Test Sequence

**Phase 1: Authentication (Day 1)**
- Setup test environment
- Run all AUTH tests (TC-AUTH-001 to TC-AUTH-013)
- Create test users for all roles

**Phase 2: User Management (Day 1)**
- Run all USER tests (TC-USER-001 to TC-USER-011)
- Verify admin operations

**Phase 3: Course & Content (Day 2)**
- Create test categories
- Run COURSE tests (TC-COURSE-001 to TC-COURSE-010)
- Run CONTENT tests (TC-CONTENT-001 to TC-CONTENT-016)
- Verify content hierarchy

**Phase 4: Assessment (Day 3)**
- Run QUIZ tests (TC-QUIZ-001 to TC-QUIZ-015)
- Run ASSIGNMENT tests (TC-ASSIGN-001 to TC-ASSIGN-004)
- Run GRADE tests (TC-GRADE-001 to TC-GRADE-003)

**Phase 5: Communication (Day 4)**
- Run CHAT tests (TC-CHAT-001 to TC-CHAT-006)
- Run LIVE tests (TC-LIVE-001 to TC-LIVE-004)
- Run NOTIF tests (TC-NOTIF-001 to TC-NOTIF-005)

**Phase 6: Integration Tests (Day 5)**
- End-to-end user journeys
- Performance tests
- Security tests

### 8.2. Success Criteria

- ✅ All critical endpoints return expected status codes
- ✅ All responses match expected schema
- ✅ Authentication and authorization work correctly
- ✅ CRUD operations work for all entities
- ✅ Pagination works correctly
- ✅ Error handling is consistent
- ✅ No 500 errors for valid requests

### 8.3. Test Data Cleanup

After each test phase:
- Delete test users (except role templates)
- Delete test courses
- Delete test content
- Reset database sequences

### 8.4. Test Reporting

Generate report with:
- Total tests executed
- Passed / Failed count
- Response time metrics
- Coverage percentage
- Failed test details

---

**Document Version:** 1.0  
**Last Updated:** 04/11/2025  
**Total Test Cases:** 90+
