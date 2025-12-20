# 📜 Xử Lý Certificate Khi Course Được Cập Nhật

## 🎯 Vấn Đề

Khi một khóa học được **cập nhật thêm nội dung mới** (thêm lessons/sections):
- `total_lessons` tăng lên
- `completion_percentage` của học viên đã hoàn thành sẽ **giảm xuống** (< 100%)
- Enrollment status có thể bị thay đổi từ `completed` → `active`
- **Certificate đã được issue** có thể bị invalidate về mặt logic

---

## ✅ Giải Pháp Đề Xuất

### **1. Course Versioning + Snapshot Progress** ⭐⭐⭐ (Recommended)

**Concept:**
- Mỗi khi course được cập nhật (thêm/xóa lessons), tăng `version`
- Khi issue certificate, lưu `course_version` và `snapshot_progress` vào certificate metadata
- Progress của enrollment được tính dựa trên **version tại thời điểm hoàn thành**

**Implementation:**

#### **Step 1: Thêm Course Version**

```typescript
// backend/src/models/course.model.ts
// Thêm field:
version: {
  type: DataTypes.INTEGER,
  defaultValue: 1,
  allowNull: false,
  comment: 'Version của course - tăng lên mỗi khi có thay đổi nội dung'
},
last_content_update: {
  type: DataTypes.DATE,
  allowNull: true,
  comment: 'Thời gian cập nhật nội dung lần cuối'
}
```

#### **Step 2: Snapshot Progress trong Certificate Metadata**

```typescript
// backend/src/modules/certificate/certificate.service.ts

interface CertificateMetadata {
  student: {...},
  course: {
    id: string;
    title: string;
    version: number;  // ← Thêm version
    totalLessonsAtCompletion: number;  // ← Snapshot
    completedLessonsAtCompletion: number;  // ← Snapshot
    ...
  },
  completion: {
    date: string;
    progress: 100;  // Luôn là 100% tại thời điểm issue
    courseVersion: number;  // ← Version tại thời điểm hoàn thành
    ...
  },
  ...
}
```

#### **Step 3: Logic Tính Progress**

```typescript
// backend/src/modules/course-content/course-content.service.ts

async getCourseProgress(userId: string, courseId: string) {
  const progress = await this.repository.getUserCourseProgress(userId, courseId);
  
  // Check if user has certificate for this course
  const hasCertificate = await certificateRepository.existsForUserAndCourse(userId, courseId);
  
  if (hasCertificate) {
    // Nếu đã có certificate, lấy progress từ certificate metadata (snapshot)
    const certificate = await certificateRepository.findByUserAndCourse(userId, courseId);
    const metadata = certificate.metadata as CertificateMetadata;
    
    return {
      ...progress,
      // Override với snapshot progress từ certificate
      completion_percentage: 100,  // Luôn 100% nếu đã có cert
      total_lessons: metadata.course.totalLessonsAtCompletion,
      completed_lessons: metadata.course.completedLessonsAtCompletion,
      isLocked: true,  // Flag để UI biết không thể update
      certificateVersion: metadata.completion.courseVersion
    };
  }
  
  // Nếu chưa có certificate, tính progress bình thường
  return progress;
}
```

#### **Step 4: Bảo Vệ Enrollment Status**

```typescript
// backend/src/modules/course-content/course-content.service.ts

async getCourseProgress(userId: string, courseId: string) {
  const progress = await this.repository.getUserCourseProgress(userId, courseId);
  
  // Check if user has certificate
  const hasCertificate = await certificateRepository.existsForUserAndCourse(userId, courseId);
  
  if (hasCertificate) {
    // KHÔNG update enrollment status nếu đã có certificate
    // Certificate đã được issue = đã hoàn thành version đó
    return progress;
  }
  
  // Chỉ update enrollment nếu chưa có certificate
  const enrollment = await Enrollment.findOne({...});
  if (enrollment) {
    const newProgress = Number(progress.completion_percentage);
    const oldProgress = Number(enrollment.progress_percentage) || 0;
    
    // Chỉ update nếu chưa có certificate
    if (Math.abs(newProgress - oldProgress) > 0.01) {
      await enrollment.update({
        progress_percentage: newProgress,
        status: newProgress >= 100 ? 'completed' : enrollment.status,
        // KHÔNG thay đổi status từ 'completed' về 'active' nếu đã có certificate
        completion_date: newProgress >= 100 && !enrollment.completion_date 
          ? new Date() 
          : enrollment.completion_date,
      });
    }
  }
  
  return progress;
}
```

---

### **2. Course Content Snapshot trong Certificate** ⭐⭐

**Concept:**
- Lưu toàn bộ course structure (sections, lessons) vào certificate metadata tại thời điểm issue
- Certificate luôn reference đến version cụ thể của course

**Implementation:**

```typescript
interface CertificateMetadata {
  course: {
    id: string;
    title: string;
    version: number;
    // Snapshot toàn bộ structure
    structure: {
      sections: Array<{
        id: string;
        title: string;
        order_index: number;
        lessons: Array<{
          id: string;
          title: string;
          order_index: number;
        }>;
      }>;
    };
    totalLessonsAtCompletion: number;
    completedLessonsAtCompletion: number;
  },
  ...
}
```

---

### **3. Separate Progress Tracking** ⭐⭐⭐ (Best Practice)

**Concept:**
- Tách biệt **Progress cho Certificate** và **Progress hiện tại**
- Certificate progress = snapshot tại thời điểm issue (không đổi)
- Current progress = tính dựa trên course hiện tại (có thể thay đổi)

**Implementation:**

```typescript
// Enrollment model - thêm fields
certificate_progress_snapshot: {
  type: DataTypes.JSONB,
  allowNull: true,
  comment: 'Snapshot progress tại thời điểm issue certificate'
},
certificate_issued_at: {
  type: DataTypes.DATE,
  allowNull: true,
  comment: 'Thời gian issue certificate'
},
course_version_at_completion: {
  type: DataTypes.INTEGER,
  allowNull: true,
  comment: 'Version của course tại thời điểm hoàn thành'
}
```

**Logic:**

```typescript
async getCourseProgress(userId: string, courseId: string) {
  const enrollment = await Enrollment.findOne({...});
  
  // Nếu đã có certificate
  if (enrollment?.certificate_issued_at) {
    return {
      // Current progress (có thể < 100% nếu course được update)
      currentProgress: await this.calculateCurrentProgress(userId, courseId),
      
      // Certificate progress (luôn 100%, snapshot)
      certificateProgress: {
        completion_percentage: 100,
        total_lessons: enrollment.certificate_progress_snapshot.total_lessons,
        completed_lessons: enrollment.certificate_progress_snapshot.completed_lessons,
        course_version: enrollment.course_version_at_completion,
        issued_at: enrollment.certificate_issued_at
      },
      
      hasCertificate: true,
      // UI có thể hiển thị: "Đã hoàn thành version X, có Y lessons mới"
      newContentAvailable: await this.checkNewContent(
        courseId, 
        enrollment.course_version_at_completion
      )
    };
  }
  
  // Chưa có certificate - tính progress bình thường
  return await this.calculateCurrentProgress(userId, courseId);
}
```

---

## 🔧 Implementation Plan

### **Phase 1: Course Versioning**

1. Thêm `version` và `last_content_update` vào Course model
2. Tăng version khi:
   - Thêm lesson mới
   - Xóa lesson
   - Thêm section mới
   - Xóa section

### **Phase 2: Certificate Snapshot**

1. Update `createCertificateMetadata` để lưu:
   - `course.version`
   - `totalLessonsAtCompletion`
   - `completedLessonsAtCompletion`
   - Course structure snapshot (optional)

### **Phase 3: Progress Protection**

1. Check certificate trước khi update enrollment progress
2. Nếu đã có certificate:
   - Không update `status` từ `completed` → `active`
   - Không update `completion_date`
   - Return snapshot progress từ certificate

### **Phase 4: UI Updates**

1. Hiển thị thông báo nếu có content mới:
   - "Bạn đã hoàn thành khóa học (version X). Có Y bài học mới!"
   - Option để học tiếp hoặc giữ nguyên certificate

---

## 📝 Code Examples

### **Update Course Version khi thêm Lesson**

```typescript
// backend/src/modules/course-content/course-content.service.ts

async createLesson(sectionId: string, data: CreateLessonData) {
  const lesson = await this.repository.createLesson(sectionId, data);
  
  // Get section để lấy course_id
  const section = await Section.findByPk(sectionId);
  if (section) {
    // Increment course version
    await this.incrementCourseVersion(section.course_id);
  }
  
  return lesson;
}

async incrementCourseVersion(courseId: string) {
  const course = await Course.findByPk(courseId);
  if (course) {
    await course.update({
      version: (course.version || 1) + 1,
      last_content_update: new Date()
    });
  }
}
```

### **Certificate Metadata với Version**

```typescript
async createCertificateMetadata(userId: string, courseId: string, enrollmentId?: string) {
  const course = await Course.findByPk(courseId);
  const progress = await this.getCourseProgress(userId, courseId);
  
  const metadata: CertificateMetadata = {
    course: {
      id: course.id,
      title: course.title,
      version: course.version || 1,  // ← Lưu version
      totalLessonsAtCompletion: progress.total_lessons,  // ← Snapshot
      completedLessonsAtCompletion: progress.completed_lessons,  // ← Snapshot
      ...
    },
    completion: {
      date: new Date().toISOString(),
      progress: 100,
      courseVersion: course.version || 1,  // ← Version tại thời điểm hoàn thành
      ...
    },
    ...
  };
  
  return metadata;
}
```

### **Protected Progress Update**

```typescript
async getCourseProgress(userId: string, courseId: string) {
  const progress = await this.repository.getUserCourseProgress(userId, courseId);
  
  // Check certificate
  const certificate = await this.certificateRepository.findByUserAndCourse(userId, courseId);
  
  if (certificate) {
    // Đã có certificate - return snapshot progress
    const metadata = certificate.metadata as CertificateMetadata;
    return {
      total_lessons: metadata.course.totalLessonsAtCompletion,
      completed_lessons: metadata.course.completedLessonsAtCompletion,
      completion_percentage: 100,
      course_version: metadata.completion.courseVersion,
      current_course_version: (await Course.findByPk(courseId))?.version || 1,
      hasNewContent: (await Course.findByPk(courseId))?.version > metadata.completion.courseVersion,
      isLocked: true  // Không thể update
    };
  }
  
  // Chưa có certificate - tính progress bình thường và update enrollment
  const enrollment = await Enrollment.findOne({...});
  if (enrollment) {
    const newProgress = Number(progress.completion_percentage);
    
    // Chỉ update nếu chưa có certificate
    await enrollment.update({
      progress_percentage: newProgress,
      status: newProgress >= 100 ? 'completed' : enrollment.status,
      completion_date: newProgress >= 100 && !enrollment.completion_date 
        ? new Date() 
        : enrollment.completion_date,
    });
  }
  
  return progress;
}
```

---

## 🎨 UI/UX Considerations

### **1. Hiển Thị Progress**

```
┌─────────────────────────────────────┐
│ Progress: 100% (Certificate)        │
│ ✅ Đã hoàn thành version 1          │
│                                     │
│ 📚 Có 5 bài học mới (version 2)    │
│ [Học tiếp] [Xem Certificate]       │
└─────────────────────────────────────┘
```

### **2. Certificate Display**

```
Certificate của bạn:
- Khóa học: Python Fundamentals
- Version: 1 (10 bài học)
- Hoàn thành: 15/01/2025
- Status: ✅ Valid

Lưu ý: Khóa học hiện tại có 15 bài học (version 2)
```

---

## ✅ Checklist Implementation

- [ ] Thêm `version` và `last_content_update` vào Course model
- [ ] Increment version khi thêm/xóa lessons/sections
- [ ] Update `createCertificateMetadata` để lưu version và snapshot
- [ ] Update `getCourseProgress` để check certificate và return snapshot
- [ ] Protect enrollment status nếu đã có certificate
- [ ] Update UI để hiển thị version và new content notification
- [ ] Add migration để update existing courses với version = 1
- [ ] Add migration để update existing certificates với version info

---

## 🎯 Recommendation

**Best Solution:** **Option 3 (Separate Progress Tracking)** + **Course Versioning**

**Lý do:**
1. ✅ Rõ ràng, dễ hiểu
2. ✅ Linh hoạt - có thể track cả current và certificate progress
3. ✅ Cho phép học viên học tiếp content mới
4. ✅ Certificate vẫn valid cho version đã hoàn thành
5. ✅ UI có thể hiển thị thông báo về content mới

---

**Lưu ý:** Certificate đã được issue **KHÔNG BAO GIỜ** bị invalidate khi course được update. Certificate là snapshot của achievement tại thời điểm hoàn thành.

