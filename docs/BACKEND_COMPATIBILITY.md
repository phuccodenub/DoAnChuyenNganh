# Backend API Compatibility Notes

## Auto-Grading System

### Quiz - AUTO-GRADED ✅

Backend automatically grades quiz submissions:

- **Multiple Choice**: ✅ Auto-grading on submit
- **True/False**: ✅ Auto-grading on submit
- **Essay**: ❌ NOT SUPPORTED (backend limitation)

**Flow**: Student submits → `calculateScore()` runs → Score saved automatically

**Backend ENUM** (from Prisma schema):
```prisma
enum QuestionType {
  single_choice
  multiple_choice
  true_false
  // NOTE: NO essay type!
}
```

### Assignment - MANUAL GRADED ✅

All assignment submissions require instructor grading:

- **API**: `POST /assignments/submissions/:id/grade`
- **Fields**: 
  - `score`: number (0 to max_score)
  - `feedback`: string (optional)
- **Status**: Changes from 'submitted' to 'graded'

## Known Limitations

### 1. Essay Questions NOT Supported ❌

**Problem**: Frontend originally had essay type, but backend doesn't support it

**Why**: 
- Backend ENUM only has: `single_choice`, `multiple_choice`, `true_false`
- Auto-grading system (`calculateScore()`) cannot handle essay
- Would require:
  - DB migration to add essay to ENUM
  - Manual grading workflow for quiz questions
  - Instructor UI to review & grade essays

**Fixed**: Removed essay type from `QuizBuilderPage.tsx` (Batch 5.5)

### 2. Quiz Manual Grading Not Available ❌

**Current**: All quiz attempts are auto-graded
**Missing**: No API for instructor to manually grade or override quiz scores
**Workaround**: Don't use quiz for subjective questions

### 3. Bulk Operations Limited Support ⚠️

**Frontend-only features**:
- Bulk grading: Frontend shows UI, but no backend batch API
- Export CSV: Frontend stub, no backend endpoint
- Bulk announcements: Frontend stub only

**Workaround**: Operations run in loop (one API call per item)

### 4. Real-time Notifications ⚠️

**Current**: Polling-based (fetch every X seconds)
**Missing**: WebSocket or SSE for real-time updates
**Impact**: Slight delay in notification delivery

## API Endpoints Used

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Create new account
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Quiz
- `POST /quizzes` - Create quiz (instructor)
- `GET /quizzes/:id` - Get quiz info
- `GET /quizzes/:id/questions` - Get questions (during attempt)
- `POST /quizzes/:id/start` - Start new attempt
- `POST /attempts/:id/answers` - Save answer (auto-save)
- `POST /attempts/:id/submit` - Submit quiz (auto-grades!)
- `GET /attempts/:id` - Get attempt with results

### Assignment
- `POST /assignments` - Create assignment (instructor)
- `GET /assignments/:id` - Get assignment info
- `POST /assignments/:id/upload` - Upload file
- `POST /assignments/:id/submit` - Submit assignment
- `GET /assignments/:id/submission` - Get student's submission
- `POST /submissions/:id/grade` - Grade submission (instructor)
- `GET /submissions/:id` - Get graded submission

### Course & Enrollment
- `GET /courses` - List courses (with filters)
- `GET /courses/:id` - Get course details
- `POST /courses/:id/enroll` - Enroll in course
- `GET /enrollments` - Get user's enrollments
- `GET /courses/:id/lessons` - Get course lessons
- `POST /lessons/:id/progress` - Update lesson progress

### User
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update profile
- `PUT /users/me/password` - Change password
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read

## Type Mapping

### Frontend → Backend

**QuestionType**:
- Frontend: `'multiple_choice' | 'true_false'`
- Backend: `'single_choice' | 'multiple_choice' | 'true_false'`
- Note: Frontend uses `multiple_choice` for both single & multiple answer

**SubmissionStatus**:
- Frontend: `'submitted' | 'graded' | 'late' | 'draft'`
- Backend: `'submitted' | 'graded' | 'returned'`
- Note: 'late' calculated from `is_late` boolean field

**EnrollmentStatus**:
- Frontend: `'active' | 'completed' | 'dropped'`
- Backend: `'ACTIVE' | 'COMPLETED' | 'CANCELLED'`
- Note: Case sensitivity difference

## Migration Notes

### If Adding Essay Support Later:

1. **Backend changes needed**:
   ```prisma
   enum QuestionType {
     single_choice
     multiple_choice
     true_false
     essay  // ADD THIS
   }
   ```

2. **Create manual grading flow**:
   - `POST /quiz-attempts/:id/grade-question` endpoint
   - Store per-question grading (score, feedback)
   - Update total score after all essays graded

3. **Frontend changes**:
   - Re-enable essay type in QuizBuilderPage
   - Add essay grading UI for instructors
   - Show "Pending manual grading" state for students

### If Adding Bulk Operations:

1. **Backend batch endpoints**:
   - `POST /submissions/bulk-grade` - Grade multiple submissions
   - `POST /courses/:id/students/announcement` - Send to all
   - `GET /courses/:id/students/export` - Export CSV

2. **Frontend integration**:
   - Update GradingPage to use batch API
   - Update StudentManagementPage to use batch API
   - Add progress indicators for bulk operations

## Testing Recommendations

### Critical Paths to Test:

1. ✅ **Quiz Flow**: Create → Take → Auto-grade → View results
2. ✅ **Assignment Flow**: Create → Submit → Manual grade → View feedback
3. ✅ **Progress Tracking**: Complete lessons → Update progress → Show on dashboard
4. ⏸️ **Error Handling**: Network failures, validation errors, unauthorized access

### Known Edge Cases:

1. **Quiz timer expires**: Should auto-submit (frontend handles)
2. **Assignment late submission**: Check `is_late` flag correctly set
3. **Progress calculation**: Verify percentage matches backend calculation
4. **Token refresh**: Should happen automatically on 401 response

## Version Compatibility

- **Frontend**: React 18.2 + TypeScript 5.3
- **Backend**: Node.js 20 + Prisma 5.8 + Express 4.18
- **API Version**: v1 (assumed, no versioning in endpoints)
- **Last Updated**: November 12, 2025 (Batch 5.5)
