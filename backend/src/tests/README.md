# Tests

This folder contains all test files for the backend.

## Structure
```
tests/
├── setup.ts                  # Global test setup
├── utils/                    # Test utilities
│   └── test.utils.ts        # Common test utilities
├── factories/               # Test data factories
│   ├── user.factory.ts      # User factory
│   └── course.factory.ts    # Course factory
├── unit/                    # Unit tests
│   └── utils/
│       └── hash.util.test.ts # Hash utility tests
├── integration/             # Integration tests
│   ├── api/
│   │   ├── auth.integration.test.ts # Auth API tests
│   │   └── user.integration.test.ts # User API tests
│   ├── database/
│   │   └── database.integration.test.ts # Database tests
│   └── test.env             # Test environment variables
└── e2e/                     # End-to-end tests (future)
```

## Test Commands
```bash
npm run test                 # Run all tests
npm run test:unit           # Run unit tests only
npm run test:integration    # Run integration tests only
npm run test:e2e           # Run e2e tests only
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
npm run test:ci            # Run tests for CI/CD
```

## Test Configuration
- **Jest**: Testing framework with TypeScript support
- **Supertest**: HTTP API testing
- **ts-jest**: TypeScript preprocessor for Jest
- **Factory Pattern**: Test data generation
- **Test Database**: Separate test database
- **Mock Services**: External service mocking

## Test Types

### Unit Tests
- Test individual functions and utilities
- Mock external dependencies
- Fast execution
- High coverage

### Integration Tests
- Test API endpoints with real database
- Test database operations
- Test service interactions
- Slower execution but more realistic

### E2E Tests (Future)
- Test complete user workflows
- Test frontend-backend integration
- Test real user scenarios

## Test Database Setup

> ⚠️ **Tuyệt đối không chạy Jest trên database production/local chính**.  
> Các bài test (đặc biệt e2e) luôn chạy `sequelize.sync({ force: true })` và sẽ xóa toàn bộ dữ liệu.  
> Sử dụng Postgres riêng cho tests theo hướng dẫn dưới đây.

1. **Khởi động Postgres dành riêng cho tests (port 6543)**:
   ```powershell
   docker run -d --name lms-postgres-e2e `
     -e POSTGRES_DB=lms_db `
     -e POSTGRES_USER=lms_user `
     -e POSTGRES_PASSWORD=123456 `
     -p 6543:5432 postgres:15
   ```

2. **(Tuỳ chọn) Dừng/Xóa container khi không cần**:
   ```powershell
   docker stop lms-postgres-e2e
   docker rm lms-postgres-e2e
   ```

3. **Run tests** (integration/e2e sẽ tự kết nối `localhost:6543` theo `src/tests/integration/test.env`):
   ```bash
   npm run test:integration
   npm run test:e2e
   ```

> Nếu thật sự cần chạy test trên database chính, buộc phải đặt `ALLOW_MAIN_DB_TESTS=true` **và** chấp nhận mất dữ liệu. Điều này không được khuyến khích.

## Test Data Factories

### UserFactory
```typescript
// Create different types of users
const student = await UserFactory.createStudent();
const admin = await UserFactory.createAdmin();
const instructor = await UserFactory.createInstructor();
const pending = await UserFactory.createPending();
const suspended = await UserFactory.createSuspended();
```

### CourseFactory
```typescript
// Create different types of courses
const course = CourseFactory.create();
const programming = CourseFactory.createProgramming();
const webDev = CourseFactory.createWebDev();
const draft = CourseFactory.createDraft();
```

## Test Utilities

### Test Utils
```typescript
// Generate test data
const user = generateTestUser();
const course = generateTestCourse();
const uuid = generateUUID();

// Hash passwords
const hashedPassword = await hashTestPassword('password');

// Generate tokens
const token = generateTestToken({ userId: '123', role: 'student' });

// Mock objects
const req = createMockRequest();
const res = createMockResponse();
const next = createMockNext();
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after each test
3. **Factories**: Use factories for consistent test data
4. **Mocking**: Mock external services and dependencies
5. **Coverage**: Aim for high test coverage
6. **Performance**: Keep tests fast and efficient
7. **Readability**: Write clear and descriptive test names

## Running Tests

### Development
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- hash.util.test.ts

# Run tests with coverage
npm run test:coverage
```

### CI/CD
```bash
# Run tests for CI
npm run test:ci
```

## Test Environment

- **Database**: `lms_db_test` (separate from development)
- **Redis**: Database 1 (separate from development)
- **Port**: 3001 (separate from development)
- **Logging**: Error level only
- **JWT**: Test secret keys
