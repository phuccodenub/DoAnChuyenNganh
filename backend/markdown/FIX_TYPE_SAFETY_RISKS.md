# 🔧 HƯỚNG DẪN SỬA LỖI RỦI RO TYPE SAFETY

**Ngày:** 19/10/2025  
**Mục tiêu:** Fix 2 rủi ro còn lại trong type safety implementation

---

## 🚨 FIX 1: EMAIL_VERIFIED_AT COLUMN

### Step 1: Chạy Migration

```bash
# Di chuyển vào thư mục backend
cd backend

# Chạy migration để thêm column email_verified_at
npx sequelize-cli db:migrate --migrations-path migrations --config src/config/database.config.js
```

### Step 2: Verify Database

```bash
# Kiểm tra xem column đã được thêm chưa
psql postgresql://lms_user:123456@localhost:5432/lms_db -c "\d users" | grep email_verified_at

# Expected output:
# email_verified_at | timestamp with time zone |           |          |
```

### Step 3: Test Email Verification

Tạo file test: `backend/src/tests/user-email-verification.test.ts`

```typescript
import userRepository from '../repositories/user.repository';
import User from '../models/user.model';

describe('User Email Verification', () => {
  let testUser: any;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password_hash: 'hashedpassword',
      first_name: 'Test',
      last_name: 'User',
      role: 'student',
      status: 'pending',
      is_email_verified: false
    });
  });

  afterEach(async () => {
    // Cleanup
    await User.destroy({ where: { email: 'test@example.com' } });
  });

  it('should set email_verified_at when verifying email', async () => {
    // Act
    const updatedUser = await userRepository.updateEmailVerification(
      testUser.id,
      true
    );

    // Assert
    expect(updatedUser.is_email_verified).toBe(true);
    expect(updatedUser.email_verified_at).not.toBeNull();
    expect(updatedUser.email_verified_at).toBeInstanceOf(Date);
  });

  it('should clear email_verified_at when unverifying email', async () => {
    // Arrange - first verify
    await userRepository.updateEmailVerification(testUser.id, true);

    // Act - then unverify
    const updatedUser = await userRepository.updateEmailVerification(
      testUser.id,
      false
    );

    // Assert
    expect(updatedUser.is_email_verified).toBe(false);
    expect(updatedUser.email_verified_at).toBeNull();
  });
});
```

### Step 4: Run Test

```bash
npm test -- user-email-verification.test.ts
```

### ✅ Verification Checklist

- [ ] Migration chạy thành công
- [ ] Column `email_verified_at` tồn tại trong database
- [ ] Index `idx_users_email_verified_at` đã được tạo
- [ ] Existing verified users có `email_verified_at` != NULL
- [ ] Test pass thành công
- [ ] API endpoint email verification hoạt động bình thường

---

## ⚠️ FIX 2: ENROLLMENT STATUS ENUM

### Step 1: Update Enrollment Model

**File:** `backend/src/models/enrollment.model.ts`

Tìm và thay thế:

```typescript
// ❌ CŨ:
status: {
  type: DataTypes.ENUM('enrolled', 'completed', 'dropped'),
  defaultValue: 'enrolled',
},

// ✅ MỚI:
status: {
  type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled', 'suspended'),
  defaultValue: 'pending',
},
```

### Step 2: Update Type Definition

**File:** `backend/src/types/model.types.ts`

Tìm dòng 248 và thay thế:

```typescript
// ❌ CŨ:
status: 'active' | 'completed' | 'dropped' | 'suspended';

// ✅ MỚI:
status: 'pending' | 'active' | 'completed' | 'cancelled' | 'suspended';
```

Thêm export type ở đầu file (sau import statements):

```typescript
// Add this after imports
export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'suspended';
```

Sau đó update lại EnrollmentAttributes:

```typescript
export interface EnrollmentAttributes {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: Date;
  status: EnrollmentStatus; // ✅ Use type alias
  progress: number;
  grade?: number;
  completion_date?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Step 3: Update Repository

**File:** `backend/src/repositories/enrollment.repository.ts`

Thêm import ở đầu file:

```typescript
import { EnrollmentStatus } from '../types/model.types';
```

Update method `updateStatus`:

```typescript
// ❌ CŨ:
async updateStatus(enrollmentId: string, status: string): Promise<EnrollmentInstance> {
  const enrollment = await this.update(enrollmentId, { 
    status: status as 'active' | 'completed' | 'dropped' | 'suspended'
  });
  return enrollment;
}

// ✅ MỚI:
async updateStatus(enrollmentId: string, status: EnrollmentStatus): Promise<EnrollmentInstance> {
  const enrollment = await this.update(enrollmentId, { status });
  return enrollment;
}
```

### Step 4: Create DTO with Validation

**File:** `backend/src/types/dtos/enrollment.dto.ts` (tạo mới nếu chưa có)

```typescript
import { IsEnum, IsUUID, IsOptional, IsNumber, Min, Max } from 'class-validator';

export enum EnrollmentStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export class CreateEnrollmentDTO {
  @IsUUID()
  user_id: string;

  @IsUUID()
  course_id: string;

  @IsOptional()
  @IsEnum(EnrollmentStatusEnum, {
    message: 'Status must be one of: pending, active, completed, cancelled, suspended'
  })
  status?: EnrollmentStatusEnum;
}

export class UpdateEnrollmentStatusDTO {
  @IsEnum(EnrollmentStatusEnum, {
    message: 'Status must be one of: pending, active, completed, cancelled, suspended'
  })
  status: EnrollmentStatusEnum;
}

export class UpdateEnrollmentProgressDTO {
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  grade?: number;
}
```

### Step 5: Create Validation Middleware

**File:** `backend/src/middlewares/validate-dto.middleware.ts` (tạo mới nếu chưa có)

```typescript
import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ApiError } from '../errors/api.error';

export function ValidateDTO(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert plain object to class instance
      const dtoInstance = plainToClass(dtoClass, req.body);

      // Validate
      const errors: ValidationError[] = await validate(dtoInstance);

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map(error => ({
          field: error.property,
          constraints: error.constraints
        }));

        throw new ApiError(400, 'Validation failed', formattedErrors);
      }

      // Replace req.body with validated DTO instance
      req.body = dtoInstance;
      next();
    } catch (error) {
      next(error);
    }
  };
}
```

### Step 6: Update Controller (nếu có)

**File:** `backend/src/controllers/enrollment.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import enrollmentRepository from '../repositories/enrollment.repository';
import { UpdateEnrollmentStatusDTO } from '../types/dtos/enrollment.dto';
import { ValidateDTO } from '../middlewares/validate-dto.middleware';

export class EnrollmentController {
  // ... existing methods

  // Add validation middleware to route
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdateEnrollmentStatusDTO;

      const enrollment = await enrollmentRepository.updateStatus(id, status);

      res.json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EnrollmentController();
```

### Step 7: Update Routes

**File:** `backend/src/routes/enrollment.routes.ts`

```typescript
import { Router } from 'express';
import enrollmentController from '../controllers/enrollment.controller';
import { ValidateDTO } from '../middlewares/validate-dto.middleware';
import { UpdateEnrollmentStatusDTO } from '../types/dtos/enrollment.dto';

const router = Router();

// ... existing routes

router.put(
  '/:id/status',
  ValidateDTO(UpdateEnrollmentStatusDTO), // ✅ Add validation
  enrollmentController.updateStatus.bind(enrollmentController)
);

export default router;
```

### Step 8: Install Dependencies (nếu chưa có)

```bash
npm install class-validator class-transformer
npm install --save-dev @types/class-validator @types/class-transformer
```

### Step 9: Test Validation

Tạo file test: `backend/src/tests/enrollment-validation.test.ts`

```typescript
import request from 'supertest';
import app from '../app';

describe('Enrollment Status Validation', () => {
  const enrollmentId = 'valid-uuid-here';

  it('should accept valid status values', async () => {
    const validStatuses = ['pending', 'active', 'completed', 'cancelled', 'suspended'];

    for (const status of validStatuses) {
      const response = await request(app)
        .put(`/api/enrollments/${enrollmentId}/status`)
        .send({ status })
        .expect(200);

      expect(response.body.success).toBe(true);
    }
  });

  it('should reject invalid status values', async () => {
    const response = await request(app)
      .put(`/api/enrollments/${enrollmentId}/status`)
      .send({ status: 'invalid_status' })
      .expect(400);

    expect(response.body.error).toBeDefined();
    expect(response.body.error.details).toContainEqual(
      expect.objectContaining({
        field: 'status',
        constraints: expect.objectContaining({
          isEnum: expect.stringContaining('pending, active, completed, cancelled, suspended')
        })
      })
    );
  });

  it('should reject missing status', async () => {
    const response = await request(app)
      .put(`/api/enrollments/${enrollmentId}/status`)
      .send({})
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it('should reject wrong type (number instead of string)', async () => {
    const response = await request(app)
      .put(`/api/enrollments/${enrollmentId}/status`)
      .send({ status: 123 })
      .expect(400);

    expect(response.body.error).toBeDefined();
  });
});
```

### Step 10: Run Tests

```bash
# Run specific test
npm test -- enrollment-validation.test.ts

# Run all tests
npm test
```

### ✅ Verification Checklist

- [ ] Model enum values match database
- [ ] Type definition includes all 5 status values
- [ ] Repository method signature uses `EnrollmentStatus` type
- [ ] DTO validation class created
- [ ] Validation middleware applied to route
- [ ] `class-validator` and `class-transformer` installed
- [ ] Tests pass thành công
- [ ] API rejects invalid status values
- [ ] API accepts all valid status values

---

## 🧪 INTEGRATION TESTING

### Test Both Fixes Together

**File:** `backend/src/tests/integration/type-safety.test.ts`

```typescript
import userRepository from '../../repositories/user.repository';
import enrollmentRepository from '../../repositories/enrollment.repository';
import User from '../../models/user.model';
import Enrollment from '../../models/enrollment.model';
import Course from '../../models/course.model';

describe('Type Safety Integration Tests', () => {
  let testUser: any;
  let testCourse: any;
  let testEnrollment: any;

  beforeAll(async () => {
    // Create test data
    testUser = await User.create({
      email: 'typetest@example.com',
      password_hash: 'hashed',
      first_name: 'Type',
      last_name: 'Test',
      role: 'student'
    });

    testCourse = await Course.create({
      title: 'Test Course',
      instructor_id: testUser.id,
      status: 'published'
    });

    testEnrollment = await Enrollment.create({
      user_id: testUser.id,
      course_id: testCourse.id,
      status: 'pending'
    });
  });

  afterAll(async () => {
    // Cleanup
    await Enrollment.destroy({ where: { id: testEnrollment.id } });
    await Course.destroy({ where: { id: testCourse.id } });
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('Fix 1: email_verified_at', () => {
    it('should properly track email verification timestamp', async () => {
      const beforeVerification = new Date();

      const verifiedUser = await userRepository.updateEmailVerification(
        testUser.id,
        true
      );

      const afterVerification = new Date();

      expect(verifiedUser.is_email_verified).toBe(true);
      expect(verifiedUser.email_verified_at).not.toBeNull();
      expect(verifiedUser.email_verified_at!.getTime()).toBeGreaterThanOrEqual(
        beforeVerification.getTime()
      );
      expect(verifiedUser.email_verified_at!.getTime()).toBeLessThanOrEqual(
        afterVerification.getTime()
      );
    });

    it('should clear email_verified_at when unverifying', async () => {
      await userRepository.updateEmailVerification(testUser.id, true);
      
      const unverifiedUser = await userRepository.updateEmailVerification(
        testUser.id,
        false
      );

      expect(unverifiedUser.is_email_verified).toBe(false);
      expect(unverifiedUser.email_verified_at).toBeNull();
    });
  });

  describe('Fix 2: enrollment status type safety', () => {
    it('should accept all valid enum values', async () => {
      const statuses: Array<'pending' | 'active' | 'completed' | 'cancelled' | 'suspended'> = [
        'pending',
        'active',
        'completed',
        'cancelled',
        'suspended'
      ];

      for (const status of statuses) {
        const updated = await enrollmentRepository.updateStatus(
          testEnrollment.id,
          status
        );

        expect(updated.status).toBe(status);
      }
    });

    it('should have type checking at compile time', () => {
      // This should not compile (TypeScript error)
      // enrollmentRepository.updateStatus(testEnrollment.id, 'invalid' as any);
      
      // This should compile
      const validStatus: 'pending' | 'active' | 'completed' | 'cancelled' | 'suspended' = 'active';
      expect(() => 
        enrollmentRepository.updateStatus(testEnrollment.id, validStatus)
      ).not.toThrow();
    });
  });

  describe('Full workflow test', () => {
    it('should handle complete user enrollment lifecycle', async () => {
      // 1. Create unverified user
      const newUser = await User.create({
        email: 'workflow@example.com',
        password_hash: 'hashed',
        first_name: 'Work',
        last_name: 'Flow',
        role: 'student',
        is_email_verified: false
      });

      expect(newUser.email_verified_at).toBeNull();

      // 2. Verify email
      const verifiedUser = await userRepository.updateEmailVerification(
        newUser.id,
        true
      );

      expect(verifiedUser.is_email_verified).toBe(true);
      expect(verifiedUser.email_verified_at).not.toBeNull();

      // 3. Enroll in course
      const enrollment = await Enrollment.create({
        user_id: newUser.id,
        course_id: testCourse.id,
        status: 'pending'
      });

      expect(enrollment.status).toBe('pending');

      // 4. Activate enrollment
      const activeEnrollment = await enrollmentRepository.updateStatus(
        enrollment.id,
        'active'
      );

      expect(activeEnrollment.status).toBe('active');

      // 5. Complete enrollment
      const completedEnrollment = await enrollmentRepository.updateStatus(
        enrollment.id,
        'completed'
      );

      expect(completedEnrollment.status).toBe('completed');

      // Cleanup
      await Enrollment.destroy({ where: { id: enrollment.id } });
      await User.destroy({ where: { id: newUser.id } });
    });
  });
});
```

### Run Integration Tests

```bash
npm test -- integration/type-safety.test.ts
```

---

## 📋 FINAL CHECKLIST

### Fix 1: email_verified_at
- [ ] Migration created: `20251019000000-add-email-verified-at-column.js`
- [ ] Migration executed successfully
- [ ] Column exists in database
- [ ] Index created
- [ ] Existing data migrated
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] API endpoints tested manually

### Fix 2: enrollment status
- [ ] Model updated with correct enum values
- [ ] Type definition updated
- [ ] Repository signature updated
- [ ] DTO classes created
- [ ] Validation middleware created
- [ ] Routes updated with validation
- [ ] Dependencies installed
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] API validation tested manually

### Overall
- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] Documentation updated
- [ ] Code committed to git
- [ ] PR created and reviewed

---

## 🎯 SUCCESS CRITERIA

### ✅ Fix 1 Success
```typescript
// This should work without runtime errors:
const user = await userRepository.updateEmailVerification(userId, true);
console.log(user.email_verified_at); // Date object, not undefined
```

### ✅ Fix 2 Success
```typescript
// This should have type safety:
const enrollment = await enrollmentRepository.updateStatus(enrollmentId, 'pending'); // ✅ OK
const enrollment2 = await enrollmentRepository.updateStatus(enrollmentId, 'invalid'); // ❌ TypeScript error

// Runtime validation should work:
POST /api/enrollments/:id/status
Body: { "status": "invalid" }
Response: 400 Bad Request - "Status must be one of: pending, active, completed, cancelled, suspended"
```

---

**Nếu có lỗi xảy ra, check:**
1. Database connection
2. Migration ran successfully
3. Model-Database sync
4. TypeScript compilation
5. Test database setup

**Liên hệ để được hỗ trợ nếu gặp vấn đề!**
