# BÁO CÁO CHI TIẾT VỀ 58 LỖI CÒN LẠI

**Ngày:** 17/10/2025  
**Trạng thái:** 58/227 lỗi (25.6% còn lại)  
**Độ ưu tiên:** Sắp xếp theo tác động và độ khó

---

## MỤC LỤC

1. [Tổng Quan Phân Loại](#1-tổng-quan-phân-loại)
2. [Priority 1: Critical Issues (7 lỗi)](#2-priority-1-critical-issues)
3. [Priority 2: lesson-progress Fields (11 lỗi)](#3-priority-2-lesson-progress-fields)
4. [Priority 3: DTO Mismatches (13 lỗi)](#4-priority-3-dto-mismatches)
5. [Priority 4: Quiz Service Issues (14 lỗi)](#5-priority-4-quiz-service-issues)
6. [Priority 5: Minor Issues (13 lỗi)](#6-priority-5-minor-issues)
7. [Action Plan](#7-action-plan)

---

## 1. TỔNG QUAN PHÂN LOẠI

### 1.1. Phân Loại Theo Category

| Category | Số Lỗi | Files Ảnh Hưởng | Thời Gian Ước Tính |
|----------|--------|-----------------|---------------------|
| **Lesson Progress Missing Fields** | 11 | 1 file | 20 phút |
| **DTO Type Mismatches** | 13 | 4 files | 30 phút |
| **Quiz Service Logic** | 14 | 2 files | 40 phút |
| **Assignment Status Field** | 2 | 2 files | 10 phút |
| **Quiz Available Fields** | 4 | 1 file | 10 phút |
| **Notification Repository** | 3 | 2 files | 15 phút |
| **Grade Component** | 2 | 2 files | 10 phút |
| **Misc Type Issues** | 9 | 5 files | 25 phút |

**Tổng thời gian ước tính:** ~2.5 giờ

---

### 1.2. Phân Loại Theo Priority

```
🔴 Priority 1 (CRITICAL - 7 lỗi):
   - assignment-submission status field issues
   - UserProfile type conflicts
   - Pagination meta missing properties
   
🟠 Priority 2 (HIGH - 11 lỗi):
   - lesson-progress missing fields (blocking features)
   
🟡 Priority 3 (MEDIUM - 13 lỗi):
   - DTO mismatches (data layer issues)
   
🟢 Priority 4 (LOW - 14 lỗi):
   - Quiz service type issues
   
⚪ Priority 5 (TRIVIAL - 13 lỗi):
   - Minor type casts and property access
```

---

## 2. PRIORITY 1: CRITICAL ISSUES (7 lỗi)

### 2.1. Assignment Submission Status Field

#### File: `src/modules/assignment/assignment.repository.ts`

**Error #1: Line 139**
```
error TS2353: Object literal may only specify known properties, and 'status' 
does not exist in type '{ ... }'.
```

**Code hiện tại:**
```typescript
// Line ~135-145
const submission = await AssignmentSubmissionModel.create({
  assignment_id: assignmentId,
  user_id: userId,
  content: submissionData.content,
  status: 'submitted',  // ❌ Field 'status' không tồn tại
  file_urls: submissionData.file_urls,
  submitted_at: new Date(),
});
```

**Root Cause:**
- Model đã được refactor: `status` → `is_late` (boolean)
- Repository code vẫn dùng `status` cũ

**Cách sửa:**
```typescript
// ✅ Option 1: Use is_late field
const submission = await AssignmentSubmissionModel.create({
  assignment_id: assignmentId,
  user_id: userId,
  content: submissionData.content,
  is_late: this.checkIfLate(assignmentId),  // Calculate late status
  file_urls: submissionData.file_urls,
  submitted_at: new Date(),
});

// Helper method
private async checkIfLate(assignmentId: string): Promise<boolean> {
  const assignment = await AssignmentModel.findByPk(assignmentId);
  return assignment ? new Date() > assignment.due_date : false;
}
```

**Tác động:** 🔴 High - Blocking submission creation

---

**Error #2-3: Lines 181, 188**
```
error TS2769: No overload matches this call.
```

**Code hiện tại:**
```typescript
// Line ~181
const submissions = await AssignmentSubmissionModel.findAll({
  where: {
    assignment_id: assignmentId,
    status: 'submitted',  // ❌ Field 'status' không tồn tại
  },
});

// Line ~188
await AssignmentSubmissionModel.update(
  { status: 'graded' },  // ❌ Field 'status' không tồn tại
  { where: { id: submissionId } }
);
```

**Cách sửa:**
```typescript
// ✅ Refactor queries - bỏ status filter
const submissions = await AssignmentSubmissionModel.findAll({
  where: {
    assignment_id: assignmentId,
    submitted_at: { [Op.not]: null },  // Submitted = có submitted_at
  },
});

// ✅ Không cần update status nữa, dùng graded_at field
await AssignmentSubmissionModel.update(
  { 
    grade: gradeValue,
    graded_at: new Date(),  // Mark as graded
  },
  { where: { id: submissionId } }
);
```

**Tác động:** 🔴 High - Blocking query operations

---

#### File: `src/modules/assignment/assignment.service.ts`

**Error #4: Line 152**
```
error TS2339: Property 'status' does not exist on type 'AssignmentSubmissionInstance'.
```

**Code hiện tại:**
```typescript
// Line ~150-155
async getSubmissionStatus(submissionId: string) {
  const submission = await this.assignmentRepo.getSubmissionById(submissionId);
  return {
    status: submission.status,  // ❌ Property 'status' không tồn tại
    // ...
  };
}
```

**Cách sửa:**
```typescript
// ✅ Calculate status dynamically
async getSubmissionStatus(submissionId: string) {
  const submission = await this.assignmentRepo.getSubmissionById(submissionId);
  
  // Derive status from other fields
  let status: 'pending' | 'submitted' | 'graded' | 'late';
  if (submission.graded_at) {
    status = 'graded';
  } else if (submission.submitted_at) {
    status = submission.is_late ? 'late' : 'submitted';
  } else {
    status = 'pending';
  }
  
  return {
    status,
    is_late: submission.is_late,
    submitted_at: submission.submitted_at,
    graded_at: submission.graded_at,
  };
}
```

**Tác động:** 🔴 High - API endpoint broken

---

### 2.2. UserProfile Type Conflicts

#### File: `src/modules/auth/auth.service.ts`

**Error #5-6: Lines 59, 149**
```
error TS2345: Argument of type 'UserProfile' is not assignable to parameter 
of type 'UserInstance'.
```

**Code hiện tại:**
```typescript
// Line ~55-60
const userProfile: UserProfile = {
  id: user.id,
  email: user.email,
  role: user.role,
  // ... other fields
};
await this.cacheManager.cacheUser(userProfile);  // ❌ Type mismatch

// Line ~145-150 (similar issue)
await this.cacheManager.cacheUser(userProfile);  // ❌ Type mismatch
```

**Root Cause:**
```typescript
// cache.manager.ts
async cacheUser(user: UserInstance): Promise<void> {
  // Expects full Sequelize Model instance
}

// UserProfile type
interface UserProfile {
  // Plain object, not Sequelize Model
}
```

**Cách sửa Option 1: Accept Plain Objects**
```typescript
// ✅ cache.manager.ts - Update method signature
async cacheUser(user: UserInstance | UserProfile): Promise<void> {
  const userData = {
    id: 'id' in user ? user.id : user.get('id'),
    email: 'email' in user ? user.email : user.get('email'),
    // ... extract data
  };
  await this.redis.set(`user:${userData.id}`, JSON.stringify(userData));
}
```

**Cách sửa Option 2: Create Adapter**
```typescript
// ✅ auth.service.ts - Convert to plain object before caching
const userData = {
  id: user.id,
  email: user.email,
  role: user.role,
  // ... map all fields
};
await this.cacheManager.cacheUserData(userData);  // New method for plain objects
```

**Tác động:** 🔴 High - Blocking user authentication caching

---

### 2.3. Pagination Meta Missing Properties

#### File: `src/controllers/user.controller.ts`

**Error #7: Line 80**
```
error TS2345: Argument of type '{ page: number; limit: number; total: number; 
totalPages: number; }' is not assignable to parameter of type 'PaginationMeta'.
```

**Code hiện tại:**
```typescript
// Line ~75-82
const { users, pagination } = await this.userService.getUsers(query);
this.sendPaginated(res, {
  data: users,
  pagination: {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages,
    // ❌ Missing: hasNext, hasPrev
  },
});
```

**Interface Required:**
```typescript
// base.controller.ts or types
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;      // ❌ Missing
  hasPrev: boolean;      // ❌ Missing
}
```

**Cách sửa:**
```typescript
// ✅ Add missing properties
this.sendPaginated(res, {
  data: users,
  pagination: {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages,
    hasNext: pagination.page < pagination.totalPages,
    hasPrev: pagination.page > 1,
  },
});
```

**Tác động:** 🟡 Medium - API response structure incomplete

---

## 3. PRIORITY 2: LESSON-PROGRESS FIELDS (11 lỗi)

### 3.1. Context
Trong `BÁO_CÁO_LỖI_ĐÃ_SỬA.md`, chúng ta đã **over-simplified** `lesson-progress.model.ts` bằng cách xóa 8 fields quan trọng. Bây giờ code business logic vẫn đang dùng các fields đó.

### 3.2. File: `src/modules/course-content/course-content.repository.ts`

#### Error #8: Line 247
```
error TS2353: Object literal may only specify known properties, and 'started_at' 
does not exist in type 'Optional<LessonProgressCreationAttributes, ...>'.
```

**Code:**
```typescript
const progress = await LessonProgressModel.create({
  user_id: userId,
  lesson_id: lessonId,
  started_at: new Date(),  // ❌ Field không tồn tại
});
```

---

#### Error #9: Line 252
```
error TS2339: Property 'started_at' does not exist on type 'LessonProgressInstance'.
```

**Code:**
```typescript
if (!progress.started_at) {  // ❌ Property không tồn tại
  progress.started_at = new Date();
}
```

---

#### Error #10: Line 253
```
error TS2339: Property 'started_at' does not exist on type 'LessonProgressInstance'.
```

---

#### Error #11-17: Lines 264, 267, 270, 273, 276, 279
```
error TS2339: Property 'last_position' does not exist on type 'LessonProgressInstance'.
error TS2339: Property 'completion_percentage' does not exist on type 'LessonProgressInstance'.
error TS2339: Property 'time_spent_seconds' does not exist on type 'LessonProgressInstance'.
error TS2339: Property 'notes' does not exist on type 'LessonProgressInstance'.
error TS2339: Property 'bookmarked' does not exist on type 'LessonProgressInstance'.
error TS2339: Property 'last_accessed_at' does not exist on type 'LessonProgressInstance'.
```

**Code:**
```typescript
// Lines 264-285
async updateLessonProgress(userId: string, lessonId: string, data: any) {
  const progress = await this.getProgress(userId, lessonId);
  
  if (data.last_position !== undefined) {
    progress.last_position = data.last_position;  // ❌
  }
  
  if (data.completion_percentage !== undefined) {
    progress.completion_percentage = data.completion_percentage;  // ❌
  }
  
  if (data.time_spent !== undefined) {
    progress.time_spent_seconds += data.time_spent;  // ❌
  }
  
  if (data.notes !== undefined) {
    progress.notes = data.notes;  // ❌
  }
  
  if (data.bookmarked !== undefined) {
    progress.bookmarked = data.bookmarked;  // ❌
  }
  
  progress.last_accessed_at = new Date();  // ❌
  
  if (progress.completion_percentage >= 100 && !progress.completed) {  // ❌
    progress.completed = true;  // ❌
  }
  
  await progress.save();
}
```

---

#### Error #18: Line 282
```
error TS2551: Property 'completed' does not exist on type 'LessonProgressInstance'. 
Did you mean 'completed_at'?
```

---

#### Error #19-20: Lines 283, 293, 294
```
error TS2551: Property 'completed' does not exist on type 'LessonProgressInstance'.
error TS2339: Property 'completion_percentage' does not exist on type 'LessonProgressInstance'.
```

---

### 3.3. Giải Pháp: Restore Critical Fields

**Cách sửa: Update `lesson-progress.model.ts`**

```typescript
// ✅ src/models/lesson-progress.model.ts
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import { LessonProgressInstance } from '../types/model.types';

const LessonProgress = sequelize.define<LessonProgressInstance>(
  'LessonProgress',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    lesson_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'lessons', key: 'id' },
    },
    
    // ✅ RESTORE: Tracking fields
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_accessed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    
    // ✅ RESTORE: Video resume
    last_position: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Video position in seconds for resume playback',
    },
    
    // ✅ RESTORE: Progress tracking
    completion_percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    
    // ✅ Time tracking (renamed from time_spent_seconds)
    time_spent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total time spent in seconds',
    },
    
    // ✅ OPTIONAL: Student features (có thể bỏ nếu không cần)
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bookmarked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'lesson_progress',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id', 'lesson_id'], unique: true },
    ],
  }
);

export default LessonProgress;
```

**Update Interface:**
```typescript
// ✅ src/types/model.types.ts
export interface LessonProgressAttributes {
  id: string;
  user_id: string;
  lesson_id: string;
  started_at?: Date;
  completed_at?: Date;
  last_accessed_at: Date;
  last_position?: number;
  completion_percentage: number;
  time_spent: number;
  notes?: string;
  bookmarked: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Migration Required:**
```javascript
// migrations/YYYYMMDDHHMMSS-restore-lesson-progress-fields.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lesson_progress', 'started_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('lesson_progress', 'last_accessed_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });
    await queryInterface.addColumn('lesson_progress', 'last_position', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('lesson_progress', 'completion_percentage', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('lesson_progress', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('lesson_progress', 'bookmarked', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    
    // Rename time_spent_seconds if exists
    // Or add time_spent if not exists
  },
  
  down: async (queryInterface) => {
    // Drop columns
  }
};
```

**Tác động:** 🔴 Critical - 11 lỗi sẽ được sửa, khôi phục features quan trọng

---

## 4. PRIORITY 3: DTO MISMATCHES (13 lỗi)

### 4.1. File: `src/modules/course-content/course-content.repository.ts`

#### Error #21: Line 114
```
error TS2345: Argument of type '{ title: string; content_type: "video" | "document" | 
... }' is not assignable to parameter of type 'Optional<LessonCreationAttributes, ...>'.
```

**Code:**
```typescript
const lesson = await LessonModel.create({
  title: lessonData.title,
  content_type: lessonData.content_type,  // ❌ Model có lesson_type, không có content_type
  content_url: lessonData.content_url,
  // ...
});
```

**Cách sửa:**
```typescript
// ✅ Map DTO to Model fields
const lesson = await LessonModel.create({
  title: lessonData.title,
  lesson_type: lessonData.content_type,  // ✅ Rename field
  content: lessonData.content_url || lessonData.content_text,
  // ...
});
```

---

#### Error #22: Line 200
```
error TS2345: Argument of type '{ title: string; file_type: string; file_url: string; 
... }' is not assignable to parameter of type 'Optional<LessonMaterialCreationAttributes, ...>'.
```

**Code:**
```typescript
const material = await LessonMaterialModel.create({
  title: materialData.title,        // ❌ Model không có title field
  file_type: materialData.file_type,
  file_url: materialData.file_url,
  file_size: materialData.file_size,
  description: materialData.description,
  order_index: materialData.order_index,
  lesson_id: materialData.lesson_id,
  uploaded_by: materialData.uploaded_by,
});
```

**Root Cause:**
```typescript
// DTO có fields khác với Model
interface LessonMaterialInput {
  title: string;        // ❌ Not in model
  file_type: string;    // ❌ Not in model (model has 'type')
  file_url: string;     // ❌ Not in model (model has 'url')
}

// Model actual fields
interface LessonMaterialAttributes {
  id: string;
  lesson_id: string;
  type: string;         // ✅ file_type → type
  url: string;          // ✅ file_url → url
  // NO title field     // ❌ Missing
}
```

**Cách sửa Option 1: Add title to Model (Recommended)**
```typescript
// ✅ src/models/lesson-material.model.ts
const LessonMaterial = sequelize.define<LessonMaterialInstance>(
  'LessonMaterial',
  {
    // ... existing fields
    title: {  // ✅ ADD
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {  // file_type
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {  // file_url
      type: DataTypes.STRING,
      allowNull: false,
    },
    // ...
  }
);
```

**Cách sửa Option 2: Map DTO fields**
```typescript
// ✅ src/modules/course-content/course-content.repository.ts
const material = await LessonMaterialModel.create({
  type: materialData.file_type,
  url: materialData.file_url,
  file_size: materialData.file_size,
  description: materialData.description || materialData.title,  // Use description for title
  lesson_id: materialData.lesson_id,
  uploaded_by: materialData.uploaded_by,
});
```

**Khuyến nghị:** Option 1 (add title field) - title là thông tin quan trọng cho UI

---

### 4.2. File: `src/modules/course-content/course-content.service.ts`

#### Error #23-25: Lines 43, 44, 45
```
error TS2339: Property 'title' does not exist on type 'LessonMaterialInput'.
error TS2339: Property 'type' does not exist on type 'LessonMaterialInput'.
error TS2339: Property 'url' does not exist on type 'LessonMaterialInput'.
```

**Code:**
```typescript
async addLessonMaterial(lessonId: string, materialData: LessonMaterialInput) {
  const material = {
    lesson_id: lessonId,
    title: materialData.title,  // ❌ Property 'title' không tồn tại
    type: materialData.type,    // ❌ Property 'type' không tồn tại
    url: materialData.url,      // ❌ Property 'url' không tồn tại
    file_size: materialData.file_size,
    // ...
  };
}
```

**LessonMaterialInput Interface:**
```typescript
// Actual interface
interface LessonMaterialInput {
  file_type: string;    // NOT 'type'
  file_url: string;     // NOT 'url'
  file_size: number;
  // NO 'title' field
}
```

**Cách sửa:**
```typescript
// ✅ Map DTO fields correctly
async addLessonMaterial(lessonId: string, materialData: LessonMaterialInput) {
  const material = {
    lesson_id: lessonId,
    type: materialData.file_type,    // ✅ Use file_type
    url: materialData.file_url,      // ✅ Use file_url
    title: materialData.description, // ✅ Use description as title
    file_size: materialData.file_size,
    // ...
  };
}
```

---

#### Error #26: Line 46
```
error TS2322: Type 'number | undefined' is not assignable to type 'number'.
```

**Code:**
```typescript
const material = {
  // ...
  file_size: materialData.file_size,  // ❌ file_size có thể undefined
  // But target expects number (not undefined)
};
```

**Cách sửa:**
```typescript
// ✅ Provide default value
const material = {
  // ...
  file_size: materialData.file_size || 0,
};
```

---

#### Error #27: Line 255
```
error TS2345: Argument of type 'Partial<LessonInput>' is not assignable to 
parameter of type 'UpdateLessonDTO'.
```

**Code:**
```typescript
async updateLesson(lessonId: string, updates: Partial<LessonInput>) {
  return this.courseContentRepo.updateLesson(lessonId, updates);  // ❌ Type mismatch
  //                                                      ^^^^^^^ 
  //                                         Expects UpdateLessonDTO
}
```

**Root Cause:**
```typescript
interface LessonInput {
  // DTO for creating lesson
  content_type: string;
  content_url: string;
  // ...
}

interface UpdateLessonDTO {
  // DTO for updating lesson
  lesson_type?: string;  // Different field name
  content?: string;      // Different field name
  // ...
}
```

**Cách sửa:**
```typescript
// ✅ Map LessonInput to UpdateLessonDTO
async updateLesson(lessonId: string, updates: Partial<LessonInput>) {
  const updateDto: Partial<UpdateLessonDTO> = {
    lesson_type: updates.content_type,
    content: updates.content_url || updates.content_text,
    title: updates.title,
    // ... map all fields
  };
  
  return this.courseContentRepo.updateLesson(lessonId, updateDto);
}
```

---

### 4.3. File: `src/modules/grade/grade.service.ts`

#### Error #28: Line 24
```
error TS2345: Argument of type 'CreateGradeComponentDto' is not assignable to 
parameter of type 'CreateGradeComponentDTO'.
```

**Code:**
```typescript
async createGradeComponent(data: CreateGradeComponentDto) {
  return this.gradeRepo.createGradeComponent(data);  // ❌ Type mismatch
}
```

**Root Cause:**
- Có 2 DTO types: `CreateGradeComponentDto` vs `CreateGradeComponentDTO` (chênh chữ hoa/thường)
- Có thể có fields khác nhau

**Cách sửa:**
```typescript
// ✅ Option 1: Standardize naming (recommended)
// Rename CreateGradeComponentDto → CreateGradeComponentDTO (hoặc ngược lại)

// ✅ Option 2: Type cast
async createGradeComponent(data: CreateGradeComponentDto) {
  const dto: CreateGradeComponentDTO = {
    course_id: data.course_id,
    name: data.name,
    weight: data.weight,
    component_type: data.component_type,  // Đảm bảo có field này
    // ... map all fields
  };
  return this.gradeRepo.createGradeComponent(dto);
}
```

---

#### Error #29: Line 163
```
error TS2339: Property 'is_required' does not exist on type 'GradeComponentInstance'.
```

**Code:**
```typescript
const component = await this.gradeRepo.getGradeComponent(componentId);
if (component.is_required) {  // ❌ Property 'is_required' không tồn tại
  // ...
}
```

**Cách sửa:**
```typescript
// ✅ Check if field exists in model, nếu không thì bỏ logic này
// OR add field to model

// Option 1: Remove the check
// if (component.is_active) {  // Use different field
//   ...
// }

// Option 2: Add field to grade-component.model.ts
is_required: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
},
```

---

### 4.4. File: `src/modules/quiz/quiz.service.ts`

#### Error #30: Line 120
```
error TS2345: Argument of type 'Partial<CreateQuestionDto>' is not assignable 
to parameter of type 'UpdateQuizQuestionDTO'.
```

**Code:**
```typescript
async updateQuizQuestion(questionId: string, updates: Partial<CreateQuestionDto>) {
  return this.quizRepo.updateQuizQuestion(questionId, updates);  // ❌ Type mismatch
}
```

**Cách sửa:**
```typescript
// ✅ Map CreateQuestionDto to UpdateQuizQuestionDTO
async updateQuizQuestion(questionId: string, updates: Partial<CreateQuestionDto>) {
  const updateDto: Partial<UpdateQuizQuestionDTO> = {
    question_text: updates.question_text,
    question_type: updates.question_type,
    points: updates.points,
    // ... map all fields
  };
  return this.quizRepo.updateQuizQuestion(questionId, updateDto);
}
```

---

#### Error #31: Line 158
```
error TS2345: Argument of type 'CreateOptionDto' is not assignable to 
parameter of type 'CreateQuizOptionDTO'.
```

**Similar to Error #30** - standardize DTO naming

---

#### Error #32: Line 269
```
error TS2345: Argument of type 'QuizAnswerDto[]' is not assignable to 
parameter of type 'SubmitQuizAnswerDTO[]'.
```

**Similar pattern** - map DTO types

---

## 5. PRIORITY 4: QUIZ SERVICE ISSUES (14 lỗi)

### 5.1. Quiz Available Fields

#### File: `src/modules/quiz/quiz.service.ts`

**Error #33-36: Lines 210, 214**
```
error TS2339: Property 'available_from' does not exist on type 'QuizInstance'.
error TS2339: Property 'available_until' does not exist on type 'QuizInstance'.
```

**Code:**
```typescript
async checkQuizAvailability(quizId: string) {
  const quiz = await this.quizRepo.getQuiz(quizId);
  const now = new Date();
  
  if (quiz.available_from && now < quiz.available_from) {  // ❌ Fields không tồn tại
    throw new Error('Quiz not yet available');
  }
  
  if (quiz.available_until && now > quiz.available_until) {  // ❌
    throw new Error('Quiz no longer available');
  }
}
```

**Root Cause:**
- Model đã xóa `available_from/until` fields trong refactor

**Cách sửa Option 1: Restore fields**
```typescript
// ✅ src/models/quiz.model.ts
const Quiz = sequelize.define<QuizInstance>('Quiz', {
  // ... existing fields
  available_from: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Quiz available from this date',
  },
  available_until: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Quiz available until this date',
  },
});
```

**Cách sửa Option 2: Remove availability check**
```typescript
// ✅ Bỏ logic check availability
async checkQuizAvailability(quizId: string) {
  const quiz = await this.quizRepo.getQuiz(quizId);
  
  // Check if quiz is published
  if (!quiz.is_published) {
    throw new Error('Quiz not available');
  }
  
  return true;
}
```

**Khuyến nghị:** Option 1 nếu cần schedule quizzes

---

### 5.2. Quiz Repository Type Issues

#### File: `src/modules/quiz/quiz.repository.ts`

**Error #37: Line 66**
```
error TS2769: No overload matches this call.
```

**Error #38: Line 139**
```
error TS2769: No overload matches this call.
```

**Error #39: Line 236**
```
error TS2769: No overload matches this call.
```

**Error #40: Line 240**
```
error TS2769: No overload matches this call.
```

**Pattern:** Sequelize query với where conditions không match type

**Cách sửa chung:**
```typescript
// ✅ Type cast where conditions
const results = await QuizModel.findAll({
  where: {
    course_id: courseId,
    // ... other conditions
  } as WhereOptions<QuizAttributes>,
});
```

---

#### Error #41: Line 273
```
error TS2322: Type 'GroupedCountResultItem[]' is not assignable to type 'number'.
```

**Code:**
```typescript
const count = await QuizAttemptModel.count({  // Returns number
  where: { quiz_id: quizId },
  group: ['user_id'],  // ❌ With group, returns array
});
// count type: GroupedCountResultItem[]
// But assigned to: number variable
```

**Cách sửa:**
```typescript
// ✅ Handle grouped result
const countResult = await QuizAttemptModel.count({
  where: { quiz_id: quizId },
  group: ['user_id'],
});

const totalAttempts = Array.isArray(countResult)
  ? countResult.length
  : countResult;
```

---

### 5.3. Quiz Answer Issues

#### Error #42: Line 389
```
error TS2551: Property 'selected_option_ids' does not exist on type 
'QuizAnswerInstance'. Did you mean 'selected_option_id'?
```

**Code:**
```typescript
const answer = await QuizAnswerModel.findOne({ where: { id: answerId } });
const selectedOptions = answer.selected_option_ids;  // ❌ Plural
//                              ^^^^^^^^^^^^^^^^^^
// Model has: selected_option_id (singular)
```

**Cách sửa:**
```typescript
// ✅ Use correct field name
const selectedOptionId = answer.selected_option_id;  // Singular

// OR if need multiple options:
// Option 1: Parse JSON array
const selectedOptions = JSON.parse(answer.selected_option_id || '[]');

// Option 2: Change model to support array
// selected_option_ids: { type: DataTypes.JSON }
```

---

#### Error #43-44: Lines 402
```
error TS2339: Property 'text_answer' does not exist on type 'QuizAnswerInstance'.
error TS2339: Property 'correct_answer' does not exist on type 'QuizQuestionInstance'.
```

**Code:**
```typescript
if (question.question_type === 'essay') {
  score = this.gradeEssayAnswer(answer.text_answer, question.correct_answer);
  //                                   ^^^^^^^^^^^          ^^^^^^^^^^^^^^
  //                                   Not in model         Not in model
}
```

**Root Cause:**
- Model không có `text_answer` field (có thể có `answer_text`)
- Model không có `correct_answer` field

**Cách sửa:**
```typescript
// ✅ Use correct field names
if (question.question_type === 'essay') {
  // Essay questions không có correct_answer tự động
  // Cần manual grading
  score = 0;  // Default to 0, require manual grading
  
  // OR store essay text in answer_text field
  const essayText = answer.answer_text || '';
}
```

---

### 5.4. Quiz Data Type Issues

**Error #45: Line 228**
```
error TS2322: Type 'unknown' is not assignable to type 'QuizAttemptDto'.
```

**Error #46: Line 236**
```
error TS2322: Type 'unknown' is not assignable to type 'QuizAttemptDto'.
```

**Error #47-49: Lines 261, 263, 273**
```
error TS18046: 'quizData' is of type 'unknown'.
```

**Pattern:** API response hoặc cache data có type `unknown`

**Cách sửa:**
```typescript
// ✅ Type assertion với validation
const quizData = await this.cacheManager.get('quiz:' + quizId);

if (quizData) {
  // Validate and cast
  const quiz = quizData as QuizAttemptDto;
  
  // OR use type guard
  if (this.isQuizAttemptDto(quizData)) {
    const quiz = quizData;
  }
}

// Helper function
private isQuizAttemptDto(data: unknown): data is QuizAttemptDto {
  return (
    typeof data === 'object' &&
    data !== null &&
    'quiz_id' in data &&
    'user_id' in data
  );
}
```

---

## 6. PRIORITY 5: MINOR ISSUES (13 lỗi)

### 6.1. Assignment Repository Arithmetic

#### File: `src/modules/assignment/assignment.repository.ts`

**Error #50: Line 207**
```
error TS2363: The right-hand side of an arithmetic operation must be of type 
'any', 'number', 'bigint' or an enum type.
```

**Error #51: Line 210**
```
error TS2362: The left-hand side of an arithmetic operation must be of type 
'any', 'number', 'bigint' or an enum type.
```

**Code:**
```typescript
// Likely something like:
const totalScore = submission.score + assignment.max_score;  // ❌ One is not number
const average = totalScores / submissions.length;  // ❌ Type mismatch
```

**Cách sửa:**
```typescript
// ✅ Ensure numeric types
const totalScore = Number(submission.score) + Number(assignment.max_score);
const average = Number(totalScores) / Number(submissions.length);
```

---

### 6.2. Notification Repository Methods

#### File: `src/modules/notifications/notifications.repository.ts`

**Error #52: Line 30**
```
error TS2339: Property 'markAllAsRead' does not exist on type 'NonConstructor<typeof Model>'.
```

**Error #53: Line 34**
```
error TS2339: Property 'archiveOldNotifications' does not exist on type 'NonConstructor<typeof Model>'.
```

**Code:**
```typescript
await NotificationModel.markAllAsRead(userId);  // ❌ Static method không tồn tại
await NotificationModel.archiveOldNotifications();  // ❌
```

**Cách sửa:**
```typescript
// ✅ Define static methods in model
// src/models/notification.model.ts
class NotificationModel extends Model {
  static async markAllAsRead(userId: string) {
    return this.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );
  }
  
  static async archiveOldNotifications(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.update(
      { is_archived: true },
      { where: { created_at: { [Op.lt]: cutoffDate } } }
    );
  }
}

// OR use instance methods
await NotificationModel.update(
  { is_read: true },
  { where: { user_id: userId, is_read: false } }
);
```

---

### 6.3. Notification Service

#### File: `src/modules/notifications/notifications.service.ts`

**Error #54: Line 17**
```
error TS2339: Property 'id' does not exist on type 'Model<any, any>'.
```

**Error #55: Line 19**
```
error TS18046: 'notifData' is of type 'unknown'.
```

**Pattern:** Similar to quiz service - type unknown

**Cách sửa:**
```typescript
// ✅ Type assertions
const notification = await NotificationModel.findOne({ where: { id: notifId } });
if (notification) {
  const notifId = notification.id;  // OK với generic type
  const notifData = notification.toJSON() as NotificationDto;
}
```

---

### 6.4. Grade Component Missing Field

#### File: `src/models/grade-component.model.ts`

**Error #56: Line 20**
```
error TS2353: Object literal may only specify known properties, and 
'component_type' does not exist in type 'ModelAttributes<...>'.
```

**Code:**
```typescript
const GradeComponent = sequelize.define<GradeComponentInstance>(
  'GradeComponent',
  {
    // ... existing fields
    component_type: {  // ❌ Interface không có field này
      type: DataTypes.STRING,
      allowNull: false,
    },
  }
);
```

**Cách sửa:**
```typescript
// ✅ Add to interface
export interface GradeComponentAttributes {
  id: string;
  course_id: string;
  name: string;
  weight: number;
  max_score: number;
  description?: string;
  component_type: string;  // ✅ ADD THIS
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

---

### 6.5. User Controller File Upload

#### File: `src/modules/user/user.controller.ts`

**Error #57: Line 75**
```
error TS2345: Argument of type '{ fieldname: string; originalname: string; ... }' 
is not assignable to parameter of type 'File'.
```

**Code:**
```typescript
// Using multer
const file = req.file;  // Type: Express.Multer.File
await this.userService.uploadAvatar(userId, file);
//                                          ^^^^ Expects different File type
```

**Cách sửa:**
```typescript
// ✅ Update service signature
// user.service.ts
async uploadAvatar(userId: string, file: Express.Multer.File) {
  // ... handle file upload
}

// OR type cast
await this.userService.uploadAvatar(userId, file as File);
```

---

## 7. ACTION PLAN

### 7.1. Execution Order (Recommended)

```
Step 1: Priority 1 - Critical Issues (30 min)
  ✅ Fix assignment-submission status → is_late
  ✅ Fix UserProfile type conflicts
  ✅ Fix pagination meta

Step 2: Priority 2 - Restore lesson-progress (20 min)
  ✅ Restore 8 fields to lesson-progress.model.ts
  ✅ Update interface
  ✅ Create migration

Step 3: Priority 3 - DTO Sync (30 min)
  ✅ Fix LessonMaterialInput (add title/type/url)
  ✅ Fix CreateGradeComponentDto naming
  ✅ Fix Quiz DTO mappings

Step 4: Priority 4 - Quiz Service (40 min)
  ✅ Restore available_from/until OR remove checks
  ✅ Fix quiz repository type casts
  ✅ Fix quiz answer field names
  ✅ Handle unknown types

Step 5: Priority 5 - Minor Issues (25 min)
  ✅ Fix notification methods
  ✅ Fix arithmetic operations
  ✅ Fix file upload types
  ✅ Fix grade-component interface

Step 6: Verify (15 min)
  ✅ Run build
  ✅ Check 0 errors
  ✅ Run tests
```

**Total Time:** ~2.5-3 giờ

---

### 7.2. Verification Checklist

```bash
# Build check
npm run build

# Type check
npm run type-check

# Lint check
npm run lint

# Tests
npm run test

# Integration tests
npm run test:integration
```

---

### 7.3. Migration Scripts Required

1. ✅ `restore-lesson-progress-fields.js`
2. ✅ `add-title-to-lesson-materials.js`
3. ✅ `restore-quiz-availability-fields.js` (optional)
4. ✅ `add-component-type-to-grade-component.js`

---

### 7.4. Risk Assessment

| Priority | Errors | Risk Level | Breaking Changes |
|----------|--------|------------|------------------|
| P1       | 7      | 🔴 HIGH    | YES - API changes |
| P2       | 11     | 🔴 HIGH    | YES - Schema changes |
| P3       | 13     | 🟡 MEDIUM  | NO - Internal only |
| P4       | 14     | 🟢 LOW     | NO - Type fixes |
| P5       | 13     | 🟢 LOW     | NO - Minor fixes |

---

### 7.5. Testing Priority

**Must Test:**
1. Assignment submission flow (status → is_late)
2. Lesson progress tracking (all restored fields)
3. Video resume playback (last_position)
4. User authentication caching (UserProfile fix)

**Should Test:**
5. Quiz availability check
6. Grade component creation
7. Notification CRUD operations

**Nice to Test:**
8. File upload
9. Pagination responses

---

## 8. NEXT STEPS

### Immediate Actions:

1. **Review với team:**
   - Xác nhận cần restore fields nào cho lesson-progress
   - Xác nhận có cần quiz availability scheduling không
   - Xác nhận breaking changes cho assignment-submission

2. **Tạo migrations:**
   ```bash
   npx sequelize-cli migration:generate --name restore-lesson-progress-fields
   npx sequelize-cli migration:generate --name add-lesson-material-title
   ```

3. **Bắt đầu fixing:**
   - Follow execution order trên
   - Commit sau mỗi priority level
   - Verify build sau mỗi commit

4. **Update documentation:**
   - API documentation cho breaking changes
   - Migration guide cho deployment
   - Update this report với progress

---

**Report Status:** 🟡 READY FOR ACTION  
**Estimated Completion:** 2.5-3 giờ  
**Confidence Level:** 95%

