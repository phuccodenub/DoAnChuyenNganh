# KẾ HOẠCH KHẮC PHỤC RỦI RO - CHI TIẾT

**Ngày tạo:** 17/10/2025  
**Dự án:** Learning Management System (LMS) Backend  
**Mục tiêu:** Giảm tất cả rủi ro từ CAO xuống còn THẤP hoặc KHÔNG CÓ

---

## MỤC LỤC
1. [Phương Pháp Tiếp Cận](#1-phương-pháp-tiếp-cận)
2. [RỦI RO CAO - Priority 1](#2-rủi-ro-cao---priority-1)
3. [RỦI RO TRUNG BÌNH - Priority 2](#3-rủi-ro-trung-bình---priority-2)
4. [RỦI RO THẤP - Priority 3](#4-rủi-ro-thấp---priority-3)
5. [Testing Strategy](#5-testing-strategy)
6. [Deployment Plan](#6-deployment-plan)

---

## 1. PHƯƠNG PHÁP TIẾP CẬN

### 1.1. Nguyên Tắc Chỉ Đạo

```
🎯 MỤC TIÊU: Khắc phục lỗi TypeScript KHÔNG PHÁ VỠ chức năng hiện tại

📋 QUY TẮC:
1. Kiểm tra database schema TRƯỚC KHI sửa model
2. Nếu model khác với database → SỬA MODEL cho khớp database
3. Nếu cần thay đổi schema → TẠO MIGRATION riêng biệt
4. KHÔNG đổi field names trừ khi có migration
5. LUÔN LUÔN backward compatible
```

### 1.2. Phân Loại Hành Động

| Icon | Loại | Mô Tả | Rủi Ro |
|------|------|-------|--------|
| ✅ | SAFE | Chỉ thêm types, không đổi logic | KHÔNG |
| 🟡 | VERIFY | Cần kiểm tra database schema | THẤP |
| 🟠 | RESTORE | Restore fields đã bị xóa | TRUNG BÌNH |
| 🔴 | MIGRATE | Cần migration script | CAO |

---

## 2. RỦI RO CAO - Priority 1

### 🔴 RISK #1: assignment-submission.model.ts

#### 2.1.1. Phân Tích Hiện Trạng

**Vấn đề:**
```typescript
// ❌ CODE HIỆN TẠI (từ báo cáo)
interface AssignmentSubmissionAttributes {
  file_urls: string[];     // Array
  is_late: boolean;        // Boolean
}

// ❓ DATABASE SCHEMA: Chưa biết
// Cần kiểm tra xem database có columns:
// - file_url (TEXT) hay file_urls (JSON)?
// - status (VARCHAR) hay is_late (BOOLEAN)?
```

**Lỗi TypeScript hiện tại:**
- `status` does not exist (3 lỗi)
- Code đang dùng `status` nhưng model định nghĩa `is_late`

#### 2.1.2. Kế Hoạch Hành Động

**BƯỚC 1: Kiểm tra Database Schema** 🔍
```sql
-- Chạy trong MySQL/PostgreSQL
DESCRIBE assignment_submissions;
-- HOẶC
SHOW COLUMNS FROM assignment_submissions;
```

**BƯỚC 2: Quyết Định Chiến Lược**

**Option A: Database có `status` column** (Khả năng cao ✅)
```typescript
// ✅ SỬA MODEL cho khớp database
interface AssignmentSubmissionAttributes {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_text?: string;
  file_url?: string;              // ← Restore (TEXT column)
  submitted_at: Date;
  score?: number;
  feedback?: string;
  graded_at?: Date;
  graded_by?: string;
  status: 'submitted' | 'graded' | 'returned' | 'late';  // ← Restore (ENUM)
  created_at: Date;
  updated_at: Date;
}
```

**Option B: Database có `file_urls` và `is_late`** (Ít khả năng)
```typescript
// ✅ SỬA CODE repositories/services cho khớp model mới
// Đổi tất cả chỗ dùng `status` → `is_late`
```

**BƯỚC 3: Implementation**

Nếu chọn Option A (khuyến nghị):
```typescript
// File: src/types/model.types.ts
export interface AssignmentSubmissionAttributes {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_text?: string;
  file_url?: string;              // Single file URL
  submitted_at: Date;
  score?: number;
  feedback?: string;
  graded_at?: Date;
  graded_by?: string;
  status: 'submitted' | 'graded' | 'returned' | 'late';
  created_at: Date;
  updated_at: Date;
}

// File: src/models/assignment-submission.model.ts
const AssignmentSubmission = sequelize.define<AssignmentSubmissionInstance>(
  'AssignmentSubmission',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    assignment_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    submission_text: { type: DataTypes.TEXT },
    file_url: { type: DataTypes.STRING(500) },  // Restore
    submitted_at: { type: DataTypes.DATE, allowNull: false },
    score: { type: DataTypes.DECIMAL(5, 2) },
    feedback: { type: DataTypes.TEXT },
    graded_at: { type: DataTypes.DATE },
    graded_by: { type: DataTypes.UUID },
    status: {  // Restore
      type: DataTypes.ENUM('submitted', 'graded', 'returned', 'late'),
      allowNull: false,
      defaultValue: 'submitted'
    },
  },
  {
    tableName: 'assignment_submissions',
    timestamps: true,
    underscored: true,
  }
);
```

#### 2.1.3. Testing Checklist

- [ ] Verify database schema matches model
- [ ] Test assignment submission creation
- [ ] Test querying by status
- [ ] Test grading workflow
- [ ] Check API responses structure

---

### 🔴 RISK #2: lesson-progress.model.ts

#### 2.2.1. Phân Tích Hiện Trạng

**Vấn đề:**
```typescript
// ❌ CODE HIỆN TẠI (simplified - chỉ 6 fields)
interface LessonProgressAttributes {
  user_id: string;
  lesson_id: string;
  time_spent?: number;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ❌ CODE ĐANG SỬ DỤNG (course-content.repository.ts)
progress.started_at           // TS2339: Property does not exist
progress.last_position        // TS2339: Property does not exist
progress.completion_percentage // TS2339: Property does not exist
progress.time_spent_seconds   // TS2339: Property does not exist
progress.notes                // TS2339: Property does not exist
progress.bookmarked           // TS2339: Property does not exist
progress.last_accessed_at     // TS2339: Property does not exist
progress.completed            // TS2339: Did you mean completed_at?
```

**Root Cause:** Model đã bị over-simplified, xóa mất nhiều fields quan trọng.

#### 2.2.2. Kế Hoạch Hành Động

**BƯỚC 1: Kiểm tra Database Schema** 🔍
```sql
DESCRIBE lesson_progress;
```

**BƯỚC 2: Restore Full Schema** 🟠

```typescript
// File: src/types/model.types.ts
export interface LessonProgressAttributes {
  id: string;
  user_id: string;
  lesson_id: string;
  
  // Progress tracking
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;  // 0-100
  
  // Time tracking
  time_spent_seconds: number;   // Total time spent (renamed from time_spent)
  started_at?: Date;            // When first accessed
  last_accessed_at?: Date;      // Last access time
  completed_at?: Date;          // When completed
  
  // Video/content position
  last_position?: number;       // For video resume (seconds)
  
  // Student features
  notes?: string;               // Student notes
  bookmarked: boolean;          // Bookmark flag
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface LessonProgressCreationAttributes 
  extends Optional<
    LessonProgressAttributes, 
    'id' | 'created_at' | 'updated_at' | 'status' | 'progress_percentage' | 'time_spent_seconds' | 'bookmarked'
  > {}

export interface LessonProgressInstance 
  extends Model<LessonProgressAttributes, LessonProgressCreationAttributes>, 
  LessonProgressAttributes {}
```

**BƯỚC 3: Update Model File**

```typescript
// File: src/models/lesson-progress.model.ts
import { DataTypes } from 'sequelize';
import sequelize from '../config/db';
import { LessonProgressInstance } from '../types/model.types';

const LessonProgress = sequelize.define<LessonProgressInstance>(
  'LessonProgress',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lesson_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'not_started',
    },
    progress_percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    time_spent_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    started_at: {
      type: DataTypes.DATE,
    },
    last_accessed_at: {
      type: DataTypes.DATE,
    },
    completed_at: {
      type: DataTypes.DATE,
    },
    last_position: {
      type: DataTypes.INTEGER,
      comment: 'Video position in seconds for resume',
    },
    notes: {
      type: DataTypes.TEXT,
    },
    bookmarked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'lesson_progress',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'lesson_id'],
      },
      {
        fields: ['lesson_id'],
      },
      {
        fields: ['user_id', 'status'],
      },
    ],
  }
);

export default LessonProgress;
```

**BƯỚC 4: Update Repository Code**

```typescript
// File: src/modules/course-content/course-content.repository.ts
// Sửa logic để dùng fields mới (nếu có)

// ❌ TRƯỚC
if (progress.completed) { ... }

// ✅ SAU
if (progress.status === 'completed' || progress.completed_at !== null) { ... }
```

#### 2.2.3. Testing Checklist

- [ ] Database schema matches
- [ ] Video resume works (last_position)
- [ ] Progress tracking accurate (progress_percentage)
- [ ] Notes feature works
- [ ] Bookmark feature works
- [ ] Time tracking accurate
- [ ] Status transitions correct

---

### 🔴 RISK #3: lesson.model.ts

#### 2.3.1. Phân Tích Hiện Trạng

**Vấn đề:**
```typescript
// ❌ CODE HIỆN TẠI (6 fields)
interface LessonAttributes {
  title: string;
  section_id: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session';
  order_index: number;
  content?: string;
  is_published: boolean;
}

// ❌ MISSING FIELDS (từ requirements)
description?: string;
video_url?: string;
duration?: number;
is_free?: boolean;
```

**Lỗi hiện tại:**
- `content_type` vs `lesson_type` mismatch
- Missing video_url, duration, is_free fields

#### 2.3.2. Kế Hoạch Hành Động

**BƯỚC 1: Kiểm tra Database** 🔍
```sql
DESCRIBE lessons;
```

**BƯỚC 2: Restore Full Schema** 🟠

```typescript
// File: src/types/model.types.ts
export interface LessonAttributes {
  id: string;
  section_id: string;
  title: string;
  description?: string;         // Restore
  
  // Content
  content?: string;              // Rich text content
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session';
  video_url?: string;            // Restore - for video lessons
  duration?: number;             // Restore - in minutes
  
  // Ordering & Publishing
  order_index: number;
  is_published: boolean;
  is_free: boolean;              // Restore - for free preview
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}
```

**BƯỚC 3: Update DTO cho Consistency**

```typescript
// File: src/types/dtos/course.dto.ts
export interface CreateLessonDTO {
  section_id: string;
  title: string;
  description?: string;
  content?: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session';  // Consistency
  video_url?: string;
  duration?: number;
  order_index: number;
  is_published?: boolean;
  is_free?: boolean;
}

export interface UpdateLessonDTO {
  title?: string;
  description?: string;
  content?: string;
  lesson_type?: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session';
  video_url?: string;
  duration?: number;
  order_index?: number;
  is_published?: boolean;
  is_free?: boolean;
}
```

#### 2.3.3. Xử Lý `content_type` vs `lesson_type` Conflict

**Vấn đề:** Repository đang dùng `content_type` nhưng model có `lesson_type`

**Giải pháp:**
```typescript
// File: src/modules/course-content/course-content.repository.ts

// ❌ TRƯỚC
const lesson = await Lesson.create({
  content_type: 'video',  // Property doesn't exist
});

// ✅ SAU
const lesson = await Lesson.create({
  lesson_type: 'video',   // Match model definition
});
```

#### 2.3.4. Testing Checklist

- [ ] Video lessons display video_url correctly
- [ ] Free preview lessons accessible without enrollment
- [ ] Duration displayed in UI
- [ ] Description shown in lesson details
- [ ] All lesson types work (video, text, quiz, etc.)

---

## 3. RỦI RO TRUNG BÌNH - Priority 2

### 🟠 RISK #4: quiz-attempt.model.ts

#### 3.1.1. Phân Tích

**Vấn đề:**
- `submitted_at: null` causing type errors (null vs undefined)
- Op.not with null value

**Lỗi:**
```typescript
// ❌ HIỆN TẠI
submitted_at: null  // Type error: null not assignable

// ❌ HIỆN TẠI
{ submitted_at: { [Op.not]: null } }  // Type error with null
```

#### 3.1.2. Giải Pháp

```typescript
// File: src/modules/quiz/quiz.repository.ts

// ✅ SỬA #1: Dùng undefined thay vì null
const activeAttempt = await QuizAttempt.findOne({
  where: {
    quiz_id,
    user_id,
    submitted_at: undefined,  // undefined cho optional fields
  },
});

// ✅ SỬA #2: Dùng Op.is với null
import { Op } from 'sequelize';

const activeAttempt = await QuizAttempt.findOne({
  where: {
    quiz_id,
    user_id,
    submitted_at: { [Op.is]: null },  // SQL: WHERE submitted_at IS NULL
  },
});

// ✅ SỬA #3: Count completed attempts
const completedCount = await QuizAttempt.count({
  where: {
    quiz_id,
    submitted_at: { [Op.not]: null },  // Dùng Op.not với null cho WHERE NOT NULL
  },
});

// ✅ SỬA #4: Better approach - use Op.ne (not equal)
const completedAttempts = await QuizAttempt.findAll({
  where: {
    quiz_id,
    score: { [Op.ne]: null },  // WHERE score IS NOT NULL
  },
});
```

#### 3.1.3. Testing

- [ ] Active quiz attempts found correctly
- [ ] Completed attempts counted accurately
- [ ] Score filtering works

---

### 🟠 RISK #5: grade-component.model.ts

#### 3.2.1. Phân Tích

**Lỗi:**
```typescript
// TS2353: 'component_type' does not exist in type
```

**Root Cause:** Model định nghĩa không có `component_type` nhưng code đang cố gắng sử dụng.

#### 3.2.2. Kiểm Tra Schema

```sql
DESCRIBE grade_components;
```

**Nếu database CÓ `component_type`:**
```typescript
// ✅ Thêm vào GradeComponentAttributes
export interface GradeComponentAttributes {
  id: string;
  course_id: string;
  name: string;
  component_type?: 'assignment' | 'quiz' | 'exam' | 'project' | 'participation';  // Add this
  weight: number;
  max_score: number;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Nếu database KHÔNG CÓ `component_type`:**
```typescript
// ✅ Xóa khỏi code usage
// Tìm và xóa tất cả chỗ reference component_type
```

---

### 🟠 RISK #6: lesson-material file_name field

#### 3.3.1. Lỗi

```
Property 'file_name' is missing but required
```

#### 3.3.2. Giải Pháp

```typescript
// File: src/modules/course-content/course-content.repository.ts

// ❌ TRƯỚC
const material = await LessonMaterial.create({
  title: 'Document',
  file_type: 'pdf',
  file_url: 'url',
  file_size: 1024,
  lesson_id: 'id',
  uploaded_by: 'user_id',
});

// ✅ SAU
const material = await LessonMaterial.create({
  file_name: materialData.title || 'Untitled',  // Required field
  file_url: materialData.file_url,
  file_type: materialData.file_type,
  file_size: materialData.file_size,
  description: materialData.description,
  order_index: materialData.order_index || 0,
  lesson_id: lessonId,
  uploaded_by: userId,
});
```

---

## 4. RỦI RO THẤP - Priority 3

### 🟡 RISK #7: quiz-question question_type mismatch

#### 4.1.1. Lỗi

```
Type '"short_answer"' is not assignable to type '"single_choice" | "multiple_choice" | "true_false"'
```

#### 4.1.2. Giải Pháp

**Option A: Expand model types (nếu cần support short_answer/essay)**
```typescript
// File: src/types/model.types.ts
export interface QuizQuestionAttributes {
  question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
}
```

**Option B: Restrict DTO types (nếu chỉ support 3 loại)**
```typescript
// File: src/types/dtos/quiz.dto.ts
export interface UpdateQuizQuestionDTO {
  question_type?: 'single_choice' | 'multiple_choice' | 'true_false';  // Remove short_answer
}
```

---

### 🟡 RISK #8: PaginationMeta missing hasNext/hasPrev

#### 4.2.1. Lỗi

```typescript
// TS2345: Missing properties: hasNext, hasPrev
```

#### 4.2.2. Giải Pháp

```typescript
// File: src/controllers/user.controller.ts (hoặc response helper)

// ❌ TRƯỚC
const meta = {
  page: 1,
  limit: 10,
  total: 100,
  totalPages: 10,
};

// ✅ SAU
const meta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 100,
  totalPages: 10,
  hasNext: page < totalPages,
  hasPrev: page > 1,
};
```

---

## 5. TESTING STRATEGY

### 5.1. Unit Tests Priority

```typescript
// High Priority Tests
describe('AssignmentSubmission Model', () => {
  it('should create submission with status', async () => {
    const submission = await AssignmentSubmission.create({
      assignment_id: 'aid',
      user_id: 'uid',
      status: 'submitted',
      submitted_at: new Date(),
    });
    expect(submission.status).toBe('submitted');
  });
});

describe('LessonProgress Model', () => {
  it('should track video position', async () => {
    const progress = await LessonProgress.create({
      user_id: 'uid',
      lesson_id: 'lid',
      last_position: 120,  // 2 minutes
    });
    expect(progress.last_position).toBe(120);
  });
});
```

### 5.2. Integration Tests

```typescript
describe('Quiz Attempt Flow', () => {
  it('should handle null checks correctly', async () => {
    // Start attempt
    const attempt = await quizRepo.startAttempt(quizId, userId);
    expect(attempt.submitted_at).toBeNull();
    
    // Complete attempt
    await quizRepo.submitAttempt(attempt.id);
    const completed = await quizRepo.getAttempt(attempt.id);
    expect(completed.submitted_at).toBeDefined();
  });
});
```

---

## 6. DEPLOYMENT PLAN

### Phase 1: Type-Safe Changes (Deploy Immediately) ✅
- Fix null/undefined issues
- Add missing PaginationMeta fields
- Fix typos and import errors
- **Risk Level:** 🟢 KHÔNG

### Phase 2: Model Restoration (Deploy After Testing) 🟡
- Restore lesson-progress fields
- Restore lesson fields (video_url, duration, is_free)
- Fix assignment-submission model
- **Risk Level:** 🟡 THẤP (với proper testing)

### Phase 3: Schema Validation (Production Deployment) 🟠
- Verify all models match database
- Run full integration tests
- Monitor error logs
- **Risk Level:** 🟡 THẤP (với staging verification)

---

## 7. ROLLBACK PLAN

```bash
# Nếu có issues sau deploy

# Step 1: Revert code changes
git revert <commit-hash>

# Step 2: Redeploy previous version
npm run build
pm2 restart backend

# Step 3: Check logs
tail -f logs/error.log
```

---

## 8. SUCCESS CRITERIA

### Before Deployment
- [ ] All TypeScript errors < 10
- [ ] All high-risk items tested
- [ ] Database schema verified
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing

### After Deployment
- [ ] No 500 errors in logs
- [ ] API response times < 500ms
- [ ] All features working (manual test)
- [ ] No data corruption
- [ ] User workflows functional

---

## 9. TIMELINE

```
Day 1: 
  - Verify database schemas (all models)
  - Fix high-risk items (Risks #1, #2, #3)
  - Write unit tests

Day 2:
  - Fix medium-risk items (Risks #4, #5, #6)
  - Fix low-risk items (Risks #7, #8)
  - Run full test suite

Day 3:
  - Deploy to staging
  - Manual QA testing
  - Fix any remaining issues

Day 4:
  - Production deployment (off-peak hours)
  - Monitor logs
  - Quick rollback if issues
```

---

## 10. NOTES

⚠️ **QUAN TRỌNG:**
1. **LUÔN** verify database schema trước khi sửa model
2. **KHÔNG BAO GIỜ** assume schema - phải check thực tế
3. **ƯU TIÊN** sửa code cho khớp database, không phải ngược lại
4. **NẾU** cần thay đổi database → tạo migration riêng, không mix với type fixes
5. **TEST** thoroughly trước khi deploy

🎯 **MỤC TIÊU CUỐI CÙNG:**
- TypeScript errors: 227 → 0
- Type safety: 100%
- Breaking changes: 0
- Data loss: 0
- Features broken: 0

---

**Document Status:** 📝 DRAFT - Ready for Implementation  
**Next Action:** Verify database schemas → Start implementation  
**Owner:** Development Team  
**Reviewer:** Tech Lead
