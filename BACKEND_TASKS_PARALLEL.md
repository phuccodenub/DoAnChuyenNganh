# 🔧 CÁC NHIỆM VỤ BACKEND CÓ THỂ LÀM SONG SONG VỚI FRONTEND REFACTOR

**Ngày tạo:** 29/10/2025  
**Mục đích:** Danh sách công việc backend có thể làm độc lập, không phụ thuộc vào frontend

---

## 🚨 PRIORITY 1: FIX CRITICAL AUTHORIZATION BUG (30 phút - 1 giờ) ⚡

### Vấn đề
**CRITICAL Security Issue:** Students có thể access admin-only endpoints!

**Phát hiện từ test:**
```
Test: Student access to admin stats
Expected: 403 Forbidden
Actual: 200 OK (student can access!)
```

### Giải pháp

**File đã kiểm tra:** `backend/src/middlewares/auth.middleware.ts`

Authorization middleware **ĐÃ ĐÚNG**! Code hiện tại:
```typescript
export const authorizeRoles = (...roles: string[] | [string[]]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED,
        data: null
      });
      return;
    }

    const allowed = Array.isArray(roles[0]) ? (roles[0] as string[]) : (roles as string[]);
    if (!allowed.includes(req.user.role)) {
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN).json({
        success: false,
        message: RESPONSE_CONSTANTS.ERROR.ACCESS_DENIED,
        data: null
      });
      return;
    }

    next();
  };
};
```

### ✅ Action Items

1. **Kiểm tra routes có đang dùng middleware không**
   ```bash
   cd backend
   grep -r "authorizeRoles" src/api/ src/routes/
   ```

2. **Kiểm tra các admin routes cụ thể:**
   - `src/api/v1/routes/user.routes.ts`
   - `src/api/v2/routes/user.routes.ts`
   - Đảm bảo PHẢI có pattern:
     ```typescript
     router.get('/admin/users/stats', 
       authMiddleware,               // ← Auth first
       authorizeRoles('admin', 'super_admin'),  // ← THEN authorization
       userAdminController.getUserStatistics
     );
     ```

3. **Test lại:**
   ```powershell
   cd backend
   .\test-admin-endpoints.ps1
   ```

---

## 🧪 PRIORITY 2: SETUP JEST & FIX TESTS (2-3 giờ)

### Vấn đề hiện tại
- Jest đã được config trong package.json
- Test files đã tạo nhưng chưa chạy được
- Lỗi: `'jest' is not recognized as command`
- TypeScript errors: Cannot find name 'describe', 'it', 'expect'

### ✅ Action Items

#### Step 1: Install Dependencies (10 phút)
```powershell
cd h:\DACN\backend
npm ci  # Install ALL dependencies including devDependencies
```

Packages sẽ được cài:
- `jest` - Test framework
- `ts-jest` - TypeScript support
- `@types/jest` - TypeScript types
- `supertest` - HTTP assertions
- `@types/supertest` - TypeScript types

#### Step 2: Verify Jest Config (5 phút)
**File:** `backend/jest.config.js`

Kiểm tra config có đúng không:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
```

#### Step 3: Create Test Setup File (10 phút)
**File mới:** `backend/src/tests/setup.ts`

```typescript
import { Sequelize } from 'sequelize';

// Setup test database connection
let sequelize: Sequelize;

beforeAll(async () => {
  // Use test database
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME_TEST || 'lms_db_test',
    username: process.env.DB_USER || 'lms_user',
    password: process.env.DB_PASSWORD || 'lms_password',
    logging: false,
  });

  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

export { sequelize };
```

#### Step 4: Update package.json test scripts (5 phút)
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

#### Step 5: Run Tests (5 phút)
```powershell
cd backend
npm test
```

#### Step 6: Fix Failing Tests
Sau khi chạy, sẽ có một số tests fail. Fix theo thứ tự:
1. Authorization tests (liên quan đến PRIORITY 1)
2. Validation tests
3. Query parameter tests

---

## 🔍 PRIORITY 3: FIX REMAINING TYPESCRIPT ERRORS (1-2 giờ)

### Hiện trạng
~25 lỗi TypeScript còn lại (không ảnh hưởng runtime)

### Categories

#### 3.1: Test Files TypeScript Errors (30 phút)
**Problem:** Cannot find name 'describe', 'it', 'expect'

**File:** `backend/tsconfig.json`

**Fix:** Thêm types vào compilerOptions:
```json
{
  "compilerOptions": {
    "types": ["node", "jest"],  // ← Thêm "jest"
    // ... other options
  },
  "include": [
    "src/**/*",
    "src/**/*.test.ts"  // ← Đảm bảo include test files
  ]
}
```

#### 3.2: Model Instance Methods (30 phút)
**Files cần fix:**
- `src/models/section.model.ts`
- `src/models/lesson.model.ts`
- Các models khác có custom methods

**Pattern hiện tại (có lỗi):**
```typescript
async getLessonCount() {
  return await Lesson.count({ ... });
}
```

**Pattern đúng:**
```typescript
async getLessonCount(this: Model<SectionAttributes>): Promise<number> {
  const section = this as unknown as SectionInstance;
  return await Lesson.count({ 
    where: { section_id: section.id } 
  });
}
```

#### 3.3: Controller Response Methods (20 phút)
**Review files:**
- `src/controllers/*.controller.ts`
- Ensure consistent response.util usage

**Common issues:**
```typescript
// ❌ Wrong parameter order
ErrorHandler.sendErrorResponse(message, res);

// ✅ Correct
ErrorHandler.sendErrorResponse(res, message);
```

---

## 🔧 PRIORITY 4: ADD INTEGRATION TESTS (2-3 giờ)

### Test Scenarios

#### Test 1: Course Creation & Enrollment Flow
**File mới:** `backend/src/tests/integration/course.flow.test.ts`

```typescript
import request from 'supertest';
import app from '../../../app';

describe('Course Flow Integration', () => {
  let adminToken: string;
  let studentToken: string;
  let courseId: string;

  beforeAll(async () => {
    // Login to get tokens
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin123!' });
    adminToken = adminRes.body.data.token;

    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student1@example.com', password: 'Student123!' });
    studentToken = studentRes.body.data.token;
  });

  it('should create course as instructor', async () => {
    const response = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Integration Test Course',
        description: 'Test description',
        category: 'Technology'
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    courseId = response.body.data.id;
  });

  it('should allow student to enroll', async () => {
    const response = await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
  });

  it('should allow enrolled student to access content', async () => {
    const response = await request(app)
      .get(`/api/v1/courses/${courseId}/content`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
  });
});
```

#### Test 2: File Upload Flow
**File mới:** `backend/src/tests/integration/file.upload.test.ts`

```typescript
import request from 'supertest';
import app from '../../../app';
import path from 'path';
import fs from 'fs';

describe('File Upload Integration', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'instructor1@example.com', password: 'Instructor123!' });
    token = res.body.data.token;
  });

  it('should upload a file', async () => {
    // Create a test file
    const testFilePath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(testFilePath, 'Test content');

    const response = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testFilePath)
      .field('folder', 'test-uploads');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('url');

    // Cleanup
    fs.unlinkSync(testFilePath);
  });
});
```

#### Test 3: Grade Calculation Flow
**File mới:** `backend/src/tests/integration/grade.calculation.test.ts`

---

## 🚀 PRIORITY 5: ENHANCE REAL-TIME FEATURES (2-3 giờ)

### 5.1: Add Message Rate Limiting (1 giờ)

**File:** `backend/src/modules/chat/chat.gateway.ts`

**Implementation:**
```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible';

export class ChatGateway {
  private rateLimiter: RateLimiterMemory;

  constructor() {
    // 5 messages per 5 seconds per user
    this.rateLimiter = new RateLimiterMemory({
      points: 5,
      duration: 5,
    });
  }

  @SubscribeMessage('chat:send_message')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      // Rate limit check
      await this.rateLimiter.consume(socket.user.id);

      // Process message...
      const message = await this.chatService.createMessage({
        course_id: data.course_id,
        sender_id: socket.user.id,
        message: data.message,
        message_type: data.message_type,
      });

      // Broadcast to room
      socket.to(`course_${data.course_id}`).emit('chat:new_message', message);

    } catch (rateLimitError) {
      if (rateLimitError instanceof Error) {
        socket.emit('chat:error', {
          message: 'Too many messages. Please slow down.',
        });
      }
    }
  }
}
```

**Install package:**
```powershell
cd backend
npm install rate-limiter-flexible
npm install -D @types/rate-limiter-flexible
```

**Test:**
```javascript
// Browser console
for (let i = 0; i < 10; i++) {
  socket.emit('chat:send_message', {
    course_id: 'test',
    message: `Message ${i}`
  });
}
// Should get error after 5 messages
```

---

### 5.2: Add Message Delivery Acknowledgment (45 phút)

**Backend:** `backend/src/modules/chat/chat.gateway.ts`

```typescript
@SubscribeMessage('chat:send_message')
async handleSendMessage(
  @ConnectedSocket() socket: Socket,
  @MessageBody() data: SendMessageDto & { tempId?: string },
) {
  // ... rate limit check ...

  // Save message
  const savedMessage = await this.chatService.createMessage({
    course_id: data.course_id,
    sender_id: socket.user.id,
    message: data.message,
    message_type: data.message_type,
  });

  // Send ACK to sender
  socket.emit('chat:message_delivered', {
    tempId: data.tempId,
    messageId: savedMessage.id,
    timestamp: savedMessage.created_at,
  });

  // Broadcast to others
  socket.to(`course_${data.course_id}`).emit('chat:new_message', savedMessage);
}
```

---

### 5.3: Add Message Search API (30 phút)

**File:** `backend/src/modules/chat/chat.routes.ts`

```typescript
router.get(
  '/courses/:courseId/messages/search',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;
      const { courseId } = req.params;

      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
      }

      const messages = await chatRepository.searchMessages(courseId, q);

      res.json({
        success: true,
        data: messages,
        count: messages.length,
      });
    } catch (error) {
      next(error);
    }
  },
);
```

**Add to repository:** `backend/src/modules/chat/chat.repository.ts`

```typescript
async searchMessages(courseId: string, query: string) {
  return await ChatMessage.findAll({
    where: {
      course_id: courseId,
      message: {
        [Op.iLike]: `%${query}%`,
      },
    },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'full_name', 'avatar'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: 50,
  });
}
```

**Test:**
```powershell
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/chat/courses/course-id/messages/search?q=hello"
```

---

## 📊 PRIORITY 6: ADD API DOCUMENTATION (1-2 giờ)

### 6.1: Complete Swagger/OpenAPI Docs

**File:** `backend/src/swagger/`

Đã có swagger setup, cần add documentation cho các endpoints mới:

**Example for Chat endpoints:**

```typescript
/**
 * @swagger
 * /api/v1/chat/courses/{courseId}/messages/search:
 *   get:
 *     summary: Search messages in a course
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Invalid query
 *       401:
 *         description: Unauthorized
 */
```

---

## 🔐 PRIORITY 7: SECURITY ENHANCEMENTS (2 giờ)

### 7.1: Add Request Rate Limiting (30 phút)

**Install:**
```powershell
npm install express-rate-limit
```

**File:** `backend/src/middlewares/rate-limit.middleware.ts`

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Auth endpoints - stricter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
});

// File upload - separate limit
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Upload limit reached, please try again later.',
});
```

**Apply in app.ts:**
```typescript
import { apiLimiter, authLimiter, uploadLimiter } from './middlewares/rate-limit.middleware';

// Apply to all routes
app.use('/api', apiLimiter);

// Apply stricter limit to auth
app.use('/api/*/auth', authLimiter);

// Apply to file uploads
app.use('/api/*/files/upload', uploadLimiter);
```

---

### 7.2: Add Helmet for Security Headers (15 phút)

**Install:**
```powershell
npm install helmet
```

**File:** `backend/src/app.ts`

```typescript
import helmet from 'helmet';

// Add near top of middleware stack
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

---

### 7.3: Input Sanitization (30 phút)

**Install:**
```powershell
npm install express-mongo-sanitize xss-clean
```

**File:** `backend/src/app.ts`

```typescript
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
```

---

## 📈 PRIORITY 8: MONITORING & LOGGING (1-2 giờ)

### 8.1: Enhanced Error Logging (30 phút)

**File:** `backend/src/utils/logger.util.ts`

Add structured logging:
```typescript
export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logApiRequest = (req: Request) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });
};
```

---

### 8.2: Performance Monitoring (30 phút)

**File:** `backend/src/middlewares/performance.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';

export const performanceMonitoring = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      logger.warn({
        message: 'Slow API request',
        method: req.method,
        url: req.url,
        duration,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};
```

---

## 🧪 PRIORITY 9: WRITE UNIT TESTS (2-3 giờ)

### Test các service layer functions

**Example:** `backend/src/tests/unit/services/user.service.test.ts`

```typescript
import { userService } from '../../../services/global/user.service';
import { User } from '../../../models';

// Mock Sequelize models
jest.mock('../../../models');

describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when exists', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'student',
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('123');

      expect(result).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith('123');
    });

    it('should return null when user not exists', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById('999');

      expect(result).toBeNull();
    });
  });

  describe('getUserStatistics', () => {
    it('should return correct statistics', async () => {
      const mockUsers = [
        { role: 'student', status: 'active' },
        { role: 'student', status: 'active' },
        { role: 'instructor', status: 'active' },
      ];

      (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const stats = await userService.getUserStatistics();

      expect(stats.totalUsers).toBe(3);
      expect(stats.students).toBe(2);
      expect(stats.instructors).toBe(1);
    });
  });
});
```

---

## ✅ CHECKLIST TỔNG HỢP

### Có thể làm NGAY (không phụ thuộc frontend)

- [ ] **P1:** Fix authorization bug (30 phút - 1 giờ) ⚡ **CRITICAL**
- [ ] **P2:** Setup Jest & run tests (2-3 giờ)
- [ ] **P3:** Fix TypeScript errors (1-2 giờ)
- [ ] **P4:** Add integration tests (2-3 giờ)
- [ ] **P5:** Enhance real-time features (2-3 giờ)
- [ ] **P6:** Complete API documentation (1-2 giờ)
- [ ] **P7:** Security enhancements (2 giờ)
- [ ] **P8:** Monitoring & logging (1-2 giờ)
- [ ] **P9:** Write unit tests (2-3 giờ)

### Tổng thời gian ước tính: **1-2 ngày làm việc**

---

## 🎯 KHUYẾN NGHỊ THỨ TỰ THỰC HIỆN

### Hôm nay (3-4 giờ):
1. ✅ P1: Fix authorization bug (CRITICAL)
2. ✅ P2: Setup Jest
3. ✅ P3: Fix TypeScript errors

### Ngày mai (4-5 giờ):
4. ✅ P4: Integration tests
5. ✅ P5: Real-time enhancements
6. ✅ P7: Security

### Ngày kế (3-4 giờ):
7. ✅ P6: API docs
8. ✅ P8: Monitoring
9. ✅ P9: Unit tests

---

## 📊 IMPACT ASSESSMENT

| Priority | Impact | Effort | Value |
|----------|--------|--------|-------|
| P1 - Authorization | 🔴 Critical | Low | ⭐⭐⭐⭐⭐ |
| P2 - Jest Setup | 🟡 High | Medium | ⭐⭐⭐⭐⭐ |
| P3 - TS Errors | 🟢 Medium | Low | ⭐⭐⭐⭐ |
| P4 - Integration Tests | 🟡 High | Medium | ⭐⭐⭐⭐⭐ |
| P5 - Real-time | 🟢 Medium | Medium | ⭐⭐⭐⭐ |
| P6 - API Docs | 🟢 Low | Low | ⭐⭐⭐ |
| P7 - Security | 🟡 High | Low | ⭐⭐⭐⭐⭐ |
| P8 - Monitoring | 🟢 Medium | Low | ⭐⭐⭐⭐ |
| P9 - Unit Tests | 🟡 High | High | ⭐⭐⭐⭐ |

---

## 🚀 BẮT ĐẦU NGAY

**Bước đầu tiên (5 phút):**

```powershell
# 1. Check authorization routes
cd h:\DACN\backend
grep -r "authorizeRoles" src/api/ src/routes/

# 2. Install dependencies
npm ci

# 3. Run tests to see current status
npm test
```

**Sau đó follow các Action Items ở mỗi Priority!**

---

**💪 Tất cả các task này có thể làm độc lập mà không cần frontend!**
