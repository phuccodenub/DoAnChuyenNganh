# 🎯 ACTION PLAN: BACKEND TEST IMPROVEMENTS

**Created:** 16/11/2025  
**Priority:** Parallel với Frontend BATCH 9

---

## 🚨 IMMEDIATE ACTIONS (Làm ngay - 1 giờ)

### 1. Enable Code Coverage (15 phút)

**File:** `jest.config.js`

```javascript
module.exports = {
  // ... existing config
  collectCoverage: true,  // ← Change to true
  coverageThreshold: {
    global: {
      statements: 60,  // Start low, increase gradually
      branches: 50,
      functions: 60,
      lines: 60
    }
  }
};
```

**Run:**
```bash
cd backend
npm run test:coverage
```

**Expected Output:**
- Coverage report in terminal
- HTML report in `coverage/` folder
- Identify low-coverage areas

---

### 2. Setup GitHub Actions (30 phút)

**File:** `.github/workflows/backend-tests.yml` (NEW)

```yaml
name: Backend Tests

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'backend/**'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: lms_db
          POSTGRES_USER: lms_user
          POSTGRES_PASSWORD: 123456
        ports:
          - 6543:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:alpine
        ports:
          - 6380:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: backend
        run: npm ci
      
      - name: Run unit tests
        working-directory: backend
        run: npm run test:unit
      
      - name: Run integration tests
        working-directory: backend
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://lms_user:123456@localhost:6543/lms_db
          REDIS_URL: redis://localhost:6380
      
      - name: Run E2E tests
        working-directory: backend
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://lms_user:123456@localhost:6543/lms_db
          E2E_SUITE: true
      
      - name: Generate coverage
        working-directory: backend
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json
          flags: backend
          name: backend-coverage
```

**Test:**
```bash
git add .github/workflows/backend-tests.yml
git commit -m "Add CI/CD for backend tests"
git push
```

---

### 3. Add Coverage Badge (5 phút)

**File:** `backend/README.md`

Add at the top:
```markdown
# Backend LMS

[![Tests](https://github.com/phuccodenub/DoAnChuyenNganh/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/phuccodenub/DoAnChuyenNganh/actions/workflows/backend-tests.yml)
[![Coverage](https://codecov.io/gh/phuccodenub/DoAnChuyenNganh/branch/main/graph/badge.svg)](https://codecov.io/gh/phuccodenub/DoAnChuyenNganh)
```

---

### 4. Update Test Commands (10 phút)

**File:** `backend/package.json`

Add/update scripts:
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit --silent",
    "test:integration": "TEST_CATEGORY=integration jest --testPathPattern=integration --runInBand --silent",
    "test:e2e": "E2E_SUITE=true jest --testPathPattern=e2e --runInBand --silent",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --silent",
    "test:coverage:watch": "jest --coverage --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:changed": "jest --onlyChanged",
    "test:verbose": "jest --verbose"
  }
}
```

---

## 📝 SHORT TERM TASKS (Week 1 - 12 giờ)

### Task 1: Assignment Module Tests (3 giờ)

**File:** `src/tests/integration/modules/assignment/assignment.test.ts` (NEW)

**Test Cases (25-30):**
```typescript
describe('Assignment Module - Integration Tests', () => {
  describe('POST /api/v1/assignments', () => {
    it('should create assignment as instructor');
    it('should validate required fields');
    it('should set deadline correctly');
    it('should allow file attachments');
    it('should deny student access');
  });

  describe('GET /api/v1/assignments/:id', () => {
    it('should get assignment details');
    it('should include submissions for instructor');
    it('should hide submissions for students');
  });

  describe('POST /api/v1/assignments/:id/submit', () => {
    it('should submit assignment as student');
    it('should prevent duplicate submissions');
    it('should mark as late if past deadline');
    it('should allow file uploads');
  });

  describe('PATCH /api/v1/assignments/:id/submissions/:submissionId/grade', () => {
    it('should grade submission as instructor');
    it('should validate grade range');
    it('should add feedback');
  });
});
```

---

### Task 2: Quiz Module Tests (3 giờ)

**File:** `src/tests/integration/modules/quiz/quiz.test.ts` (NEW)

**Test Cases (30-35):**
```typescript
describe('Quiz Module - Integration Tests', () => {
  describe('POST /api/v1/quizzes', () => {
    it('should create quiz as instructor');
    it('should add multiple questions');
    it('should set time limit');
    it('should randomize questions');
  });

  describe('POST /api/v1/quizzes/:id/attempts', () => {
    it('should start quiz attempt');
    it('should prevent multiple concurrent attempts');
    it('should enforce time limits');
  });

  describe('POST /api/v1/quizzes/:id/attempts/:attemptId/submit', () => {
    it('should submit quiz answers');
    it('should auto-grade multiple choice');
    it('should calculate score');
    it('should save attempt');
  });
});
```

---

### Task 3: Category Module Tests (2 giờ)

**File:** `src/tests/integration/modules/category/category.test.ts` (NEW)

**Test Cases (15-20):**
```typescript
describe('Category Module - Integration Tests', () => {
  describe('CRUD Operations', () => {
    it('should create category');
    it('should get all categories');
    it('should update category');
    it('should delete category');
  });

  describe('Hierarchical Categories', () => {
    it('should create nested categories');
    it('should get category tree');
    it('should validate parent-child relationships');
  });

  describe('Course Association', () => {
    it('should assign category to course');
    it('should filter courses by category');
  });
});
```

---

### Task 4: Security Tests (3 giờ)

**File:** `src/tests/security/security.test.ts` (NEW)

**Test Cases (20-25):**
```typescript
describe('Security Tests', () => {
  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in search');
    it('should sanitize user inputs');
  });

  describe('XSS Protection', () => {
    it('should escape HTML in user content');
    it('should prevent script injection');
  });

  describe('Rate Limiting', () => {
    it('should limit login attempts');
    it('should limit API requests');
    it('should return 429 when limit exceeded');
  });

  describe('Authorization', () => {
    it('should require authentication');
    it('should enforce role permissions');
    it('should prevent privilege escalation');
  });
});
```

---

### Task 5: Performance Tests (1 giờ initial)

**File:** `src/tests/performance/load.test.ts` (NEW)

**Test Cases (5-10):**
```typescript
describe('Performance Tests', () => {
  describe('API Response Times', () => {
    it('should respond to /health in < 100ms');
    it('should load user list in < 500ms');
    it('should search courses in < 1000ms');
  });

  describe('Concurrent Requests', () => {
    it('should handle 10 concurrent logins');
    it('should handle 50 concurrent course views');
  });
});
```

---

## 📅 MEDIUM TERM TASKS (Week 2-3 - 20 giờ)

### Week 2: Core Learning Modules (12 giờ)

1. **Course Module Integration Tests** (3 giờ)
   - File: `src/tests/integration/modules/course/course.test.ts`
   - 30-35 test cases

2. **Section Module Tests** (2 giờ)
   - File: `src/tests/integration/modules/section/section.test.ts`
   - 15-20 test cases

3. **Lesson Module Tests** (2.5 giờ)
   - File: `src/tests/integration/modules/lesson/lesson.test.ts`
   - 20-25 test cases

4. **Enrollment Integration Tests** (2.5 giờ)
   - File: `src/tests/integration/modules/enrollment/enrollment.test.ts`
   - 20-25 test cases

5. **Grade Module Tests** (2 giờ)
   - File: `src/tests/integration/modules/grade/grade.test.ts`
   - 15-20 test cases

### Week 3: Supporting Modules (8 giờ)

1. **Notifications Module Tests** (2 giờ)
   - File: `src/tests/integration/modules/notifications/notifications.test.ts`
   - 15-20 test cases

2. **Course Content Module Tests** (2 giờ)
   - File: `src/tests/integration/modules/course-content/course-content.test.ts`
   - 15-20 test cases

3. **Files Module Tests** (2 giờ)
   - File: `src/tests/integration/modules/files/files.test.ts`
   - 15-20 test cases

4. **Analytics Module Tests** (2 giờ)
   - File: `src/tests/integration/modules/analytics/analytics.test.ts`
   - 15-20 test cases

---

## 🚀 LONG TERM TASKS (Month 2 - Optional)

### Advanced Testing

1. **Visual Regression Tests** (nếu có UI admin)
   - Percy.io or Chromatic
   - Screenshot comparison

2. **Contract Testing** (nếu có microservices)
   - Pact testing
   - API schema validation

3. **Chaos Engineering**
   - Database failure scenarios
   - Network partition tests
   - Service degradation tests

4. **Stress Testing**
   - Artillery or k6
   - Load testing với 1000+ concurrent users
   - Database connection pool testing

---

## 📊 PROGRESS TRACKING

### Coverage Goals by Week

| Week | Target Coverage | New Tests | Total Tests |
|------|----------------|-----------|-------------|
| Current | ~40% | 159 | 159 |
| Week 1 | 55% | +80 | 239 |
| Week 2 | 65% | +100 | 339 |
| Week 3 | 75% | +80 | 419 |
| Week 4 | 80% | +50 | 469 |

### Module Coverage Tracking

Create file: `backend/.coverage-goals.json`
```json
{
  "goals": {
    "auth": 100,
    "user": 100,
    "assignment": 80,
    "quiz": 80,
    "category": 80,
    "course": 80,
    "section": 70,
    "lesson": 70,
    "enrollment": 80,
    "grade": 70,
    "notifications": 70,
    "courseContent": 70
  },
  "lastUpdated": "2025-11-16"
}
```

---

## 🎯 SUCCESS CRITERIA

### Week 1 Success
- ✅ Coverage tracking enabled
- ✅ CI/CD pipeline running
- ✅ Assignment tests complete (80% coverage)
- ✅ Quiz tests complete (80% coverage)
- ✅ Category tests complete (80% coverage)
- ✅ Security tests added (20 test cases)

### Overall Success (4 weeks)
- ✅ 80%+ overall code coverage
- ✅ All critical modules tested
- ✅ CI/CD passing consistently
- ✅ < 5 minute test execution time
- ✅ Zero failing tests
- ✅ Security tests comprehensive

---

## 📝 NOTES FOR PARALLEL WORK

### While Frontend BATCH 9 in Progress:

**Safe to do in parallel:**
- ✅ Add new test files
- ✅ Improve existing tests
- ✅ Setup CI/CD
- ✅ Add coverage tracking

**Coordinate with frontend:**
- ⚠️ API contract changes
- ⚠️ Response format changes
- ⚠️ Authentication flow changes
- ⚠️ New endpoints

**Communication:**
- Update API docs when adding tests
- Document any bugs found during testing
- Share test utils that frontend might need

---

## 🚦 READY TO START

### Immediate Next Steps:

1. ✅ Review this plan
2. ✅ Enable coverage (15 min)
3. ✅ Setup CI/CD (30 min)
4. ✅ Start Assignment tests (3h)
5. ⏸️ Continue with Quiz tests OR proceed to Frontend BATCH 9

**Decision Point:** Có thể bắt đầu BATCH 9 ngay sau khi hoàn thành steps 1-2 (45 phút), và làm tests song song!

