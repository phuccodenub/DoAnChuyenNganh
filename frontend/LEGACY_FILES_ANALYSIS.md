# 🗂️ Legacy Files Analysis & Cleanup Plan

**Date**: November 12, 2025  
**Context**: Refactoring Phase Complete - Need to identify and handle old files

---

## 📊 Executive Summary

Sau khi hoàn thành **8 batches refactor** (53 files mới, 13,600 lines), frontend codebase hiện chứa **files cũ chưa được sử dụng** cùng tồn tại với files mới refactor.

### Quick Stats
- **Legacy Pages**: 6 files (CourseDetail.tsx, CoursePage.tsx, DashboardPage.tsx, MyCourses.tsx, HomePage.tsx, LiveStreamPage.tsx)
- **Legacy Components**: 15+ files (Chat, Quiz, LiveStream, Files, Layout, UI cũ)
- **Legacy Services**: 12+ files (old API services, mock services)
- **Legacy Stores**: 1 file (authStore.ts - replaced by authStore.enhanced.ts)
- **Status**: Chưa được xóa, chưa được import trong routing

### Recommendation: **KEEP FOR NOW → DELETE AFTER TESTING**

---

## 🔍 Detailed Analysis

### Category 1: DUPLICATE PAGES (Old vs New)

#### 1.1 Root-Level Pages (OLD - Not Used)
```
❌ src/pages/CourseDetail.tsx (331 lines)
   → Replaced by: src/pages/CourseDetailPage.tsx (Batch 2, refactored)
   Status: Old implementation with Chat/Quiz/FileManager tabs
   
❌ src/pages/CoursePage.tsx (24 lines)
   → Replaced by: src/pages/CourseCatalogPage.tsx (Batch 2)
   Status: Simple placeholder page
   
❌ src/pages/DashboardPage.tsx (266 lines)
   → Replaced by: 
      - src/pages/student/DashboardPage.tsx (Batch 2)
      - src/pages/instructor/DashboardPage.tsx (Batch 3)
      - src/pages/admin/DashboardPage.tsx (Batch 7)
   Status: Old combined dashboard for all roles
   
❌ src/pages/MyCourses.tsx
   → Replaced by: 
      - src/pages/student/DashboardPage.tsx (shows enrolled courses)
      - src/pages/instructor/MyCoursesPage.tsx (Batch 3)
   Status: Old student courses page
   
❌ src/pages/HomePage.tsx
   → Replaced by: src/pages/CourseCatalogPage.tsx (public catalog)
   Status: Old landing page
   
❌ src/pages/LiveStreamPage.tsx
   → Replaced by:
      - src/pages/instructor/LiveStreamManagementPage.tsx (Batch 6)
      - src/pages/instructor/CreateLiveStreamPage.tsx (Batch 6)
      - src/pages/instructor/LiveStreamHostPage.tsx (Batch 6)
   Status: Old livestream page
```

**Impact**: 6 pages ~700+ lines NOT imported in routes/index.tsx

---

#### 1.2 Duplicate Components (OLD - Not Used)

```
❌ src/components/ProtectedRoute.tsx
   → Replaced by: src/routes/ProtectedRoute.tsx (Batch 1, Phase 1)
   Status: Moved to routes/ folder with better structure
   
❌ src/components/Chat/ChatInterface.tsx
❌ src/components/Chat/ChatMessage.tsx
❌ src/components/Chat/MessageInput.tsx
❌ src/components/Chat/OnlineUsers.tsx
   → Status: NOT implemented in refactor (out of MVP scope)
   → Used in: OLD CourseDetail.tsx only
   
❌ src/components/Quiz/QuizInterface.tsx
❌ src/components/Quiz/QuizTaker.tsx
   → Replaced by: src/pages/student/QuizPage.tsx (Batch 2, standalone page)
   Status: Old embedded quiz component
   
❌ src/components/LiveStream/LiveStreamInterface.tsx
❌ src/components/LiveStream/LivestreamViewer.tsx
   → Replaced by: Batch 6 pages (3 new pages)
   Status: Old livestream components
   
❌ src/components/Files/FileManager.tsx
❌ src/components/Files/FileUploader.tsx
   → Partially replaced by: File upload in AssignmentPage (Batch 2)
   Status: Old file management system
   
❌ src/components/Layout/Layout.tsx
   → Replaced by: 
      - src/layouts/StudentDashboardLayout.tsx (Batch 2)
      - src/layouts/InstructorDashboardLayout.tsx (Batch 3)
      - src/layouts/AdminDashboardLayout.tsx (Batch 7)
   Status: Old combined layout
```

**Impact**: 15+ components ~2,000+ lines NOT imported anywhere

---

#### 1.3 Duplicate UI Components (MIXED - Some Used, Some Not)

```
✅ src/components/ui/Button.tsx (OLD)
❌ src/components/ui/ButtonNew.tsx (NEW - Batch 1)
   Status: NEW version used in all refactored pages
   
✅ src/components/ui/Input.tsx (OLD)
❌ src/components/ui/InputNew.tsx (NEW - Batch 1)
   Status: NEW version used in all refactored pages
   
✅ src/components/ui/Card.tsx (OLD)
❌ src/components/ui/CardNew.tsx (NEW - Batch 1)
   Status: NEW version used in all refactored pages
   
❓ src/components/ui/Badge.tsx
   Status: Used in both old and new code (KEEP)
   
❓ src/components/ui/Spinner.tsx
   Status: Used in both old and new code (KEEP)
   
❓ src/components/ui/Modal.tsx
   Status: Used in Batch 7 admin modals (KEEP)
   
❓ src/components/ui/DataTable.tsx
   Status: Created in Batch 7 for admin (KEEP)
   
❌ src/components/ui/EmojiPicker.tsx
   Status: Not used in refactor
   
❌ src/components/ui/LanguageSwitcher.tsx
   Status: Not used in refactor (i18n not implemented)
   
❌ src/components/ui/ChatbotAssistant.tsx
   Status: Not used in refactor (out of MVP scope)
   
❌ src/components/ui/ToastNotifications.tsx
   Status: Not used in refactor
   
❌ src/components/ui/RecommendationPanel.tsx
   Status: Not used in refactor (AI features out of scope)
   
❌ src/components/ui/NotificationPanel.tsx
   Status: Not used in refactor
   
❌ src/components/ui/LoadingSkeleton.tsx
   Status: Not used in refactor (using Spinner instead)
   
❌ src/components/ui/LearningAnalytics.tsx
   Status: Not used in refactor (analytics out of scope)
```

**Impact**: 
- 3 duplicate UI components (Button, Input, Card) - OLD versions not used
- 10+ specialized UI components not used in refactor

---

#### 1.4 Duplicate Services (MIXED)

```
❌ src/services/authService.ts (OLD - 162 lines)
   Status: Still used by authStore.enhanced.ts (KEEP FOR NOW)
   Note: Core authentication logic, not replaced yet
   
❌ src/services/courseService.ts (OLD)
   → Replaced by: src/services/api/course.api.ts (Batch 2)
   Status: Old course API, not used
   
❌ src/services/apiClient.ts (OLD)
   → Replaced by: src/services/http/client.ts (Batch 1)
   Status: Old HTTP client, not used
   
❌ src/services/mockAuthService.ts
❌ src/services/mockData.ts
   Status: Mock data for development, not used in refactor
   
❌ src/services/chatService.ts
❌ src/services/chatbotService.ts
❌ src/services/socketService.ts
❌ src/services/webRTCService.ts
   Status: Chat/realtime features not implemented in refactor
   
❌ src/services/quizService.ts
   → Replaced by: src/services/api/quiz.api.ts (Batch 2)
   
❌ src/services/notificationService.ts
   → Replaced by: src/services/api/notification.api.ts (Batch 2)
   
❌ src/services/livestreamService.ts
   → Replaced by: src/services/api/livestream.api.ts (Batch 6)
   
❌ src/services/fileService.ts
   → Replaced by: File upload logic in components
   
❌ src/services/recommendationService.ts
   Status: AI recommendations not implemented
```

**Impact**: 
- 1 service still used (authService.ts - KEEP)
- 12+ services not used (~2,000+ lines)

---

#### 1.5 Duplicate Stores

```
❌ src/stores/authStore.ts (OLD)
✅ src/stores/authStore.enhanced.ts (NEW - Batch 1)
   Status: Enhanced version used everywhere
   Note: Old version NOT imported
   
❌ src/stores/chatStore.ts
   Status: Chat not implemented in refactor
```

**Impact**: 2 stores not used (~300+ lines)

---

#### 1.6 Other Legacy Files

```
❌ src/components/demo/NotificationDemo.tsx
   Status: Demo component, not used
   
❌ src/components/analytics/AnalyticsDashboard.tsx
   Status: Analytics not implemented in refactor
   
❌ src/components/notifications/NotificationCenter.tsx
   Status: Not used in refactor (basic notification in layouts)
   
❌ src/contexts/ThemeContext.tsx
   Status: Theme switching not implemented
   
❓ src/i18n.ts
   Status: i18n setup exists but not used (100% Vietnamese hardcoded)
```

**Impact**: 5+ misc files (~500+ lines)

---

## 📋 Cleanup Strategy

### Phase 1: IMMEDIATE (During Testing) - DO NOT DELETE YET

**Rationale**: Keep old files as **reference and backup** during testing phase

**Actions**:
- ✅ Document all legacy files (this file)
- ✅ Verify old files NOT imported in routing
- ⏸️ Keep all files for potential reference
- ⏸️ Test new refactored pages thoroughly

**Timeline**: During manual testing (next 1-2 weeks)

---

### Phase 2: POST-TESTING CLEANUP (After Testing Complete)

**Condition**: Only proceed if testing confirms refactored pages work 100%

#### Step 1: Create Legacy Archive Branch
```bash
git checkout -b archive/legacy-files-pre-refactor
git add .
git commit -m "Archive: Legacy files before cleanup"
git push origin archive/legacy-files-pre-refactor
```

#### Step 2: Delete Legacy Files (Safe List)

**2.1 Duplicate Pages (6 files)**
```bash
rm src/pages/CourseDetail.tsx
rm src/pages/CoursePage.tsx
rm src/pages/DashboardPage.tsx
rm src/pages/MyCourses.tsx
rm src/pages/HomePage.tsx
rm src/pages/LiveStreamPage.tsx
```

**2.2 Unused Components (15+ files)**
```bash
rm -rf src/components/Chat/
rm -rf src/components/Quiz/
rm -rf src/components/LiveStream/
rm -rf src/components/Files/
rm src/components/Layout/Layout.tsx
rm src/components/ProtectedRoute.tsx
rm src/components/demo/NotificationDemo.tsx
rm src/components/analytics/AnalyticsDashboard.tsx
rm src/components/notifications/NotificationCenter.tsx
```

**2.3 Duplicate UI Components (3 files)**
```bash
rm src/components/ui/Button.tsx      # Keep ButtonNew.tsx
rm src/components/ui/Input.tsx       # Keep InputNew.tsx
rm src/components/ui/Card.tsx        # Keep CardNew.tsx
```

**2.4 Unused UI Components (10+ files)**
```bash
rm src/components/ui/EmojiPicker.tsx
rm src/components/ui/LanguageSwitcher.tsx
rm src/components/ui/ChatbotAssistant.tsx
rm src/components/ui/ToastNotifications.tsx
rm src/components/ui/RecommendationPanel.tsx
rm src/components/ui/NotificationPanel.tsx
rm src/components/ui/LoadingSkeleton.tsx
rm src/components/ui/LearningAnalytics.tsx
```

**2.5 Unused Services (12+ files)**
```bash
rm src/services/courseService.ts     # Replaced by api/course.api.ts
rm src/services/apiClient.ts         # Replaced by http/client.ts
rm src/services/mockAuthService.ts
rm src/services/mockData.ts
rm src/services/chatService.ts
rm src/services/chatbotService.ts
rm src/services/socketService.ts
rm src/services/webRTCService.ts
rm src/services/quizService.ts
rm src/services/notificationService.ts
rm src/services/livestreamService.ts
rm src/services/fileService.ts
rm src/services/recommendationService.ts
```

**2.6 Unused Stores (2 files)**
```bash
rm src/stores/authStore.ts           # Replaced by authStore.enhanced.ts
rm src/stores/chatStore.ts
```

**2.7 Unused Context/Config (2 files)**
```bash
rm src/contexts/ThemeContext.tsx
# Keep src/i18n.ts for future use
```

---

#### Step 3: Rename "New" Components (Remove "New" suffix)

**Rationale**: After deleting old versions, rename "New" versions to standard names

```bash
git mv src/components/ui/ButtonNew.tsx src/components/ui/Button.tsx
git mv src/components/ui/InputNew.tsx src/components/ui/Input.tsx
git mv src/components/ui/CardNew.tsx src/components/ui/Card.tsx
```

**Then update all imports:**
```typescript
// In all files, replace:
import { Button } from '@/components/ui/ButtonNew'
// With:
import { Button } from '@/components/ui/Button'
```

**Files to update** (~40-50 imports across):
- All pages (32 files)
- All components using these UI components
- Run global find/replace in VS Code

---

#### Step 4: Verify Build & TypeScript

```bash
# Verify no broken imports
npm run type-check

# Verify build succeeds
npm run build

# Run dev server
npm run dev
```

**Expected**: 0 TypeScript errors, successful build

---

#### Step 5: Clean Commit

```bash
git add .
git commit -m "chore: Remove legacy files after refactor completion

- Removed 6 duplicate pages (CourseDetail, CoursePage, etc.)
- Removed 15+ unused components (Chat, Quiz, LiveStream, Files)
- Removed 12+ unused services (old API services, mocks)
- Removed 2 unused stores (authStore.ts, chatStore.ts)
- Removed duplicate UI components (Button, Input, Card old versions)
- Removed 10+ specialized UI components not in MVP scope
- Renamed ButtonNew/InputNew/CardNew to standard names
- Updated all imports to use standard component names

Total: ~50+ files removed (~5,000+ lines)
Archived in branch: archive/legacy-files-pre-refactor"

git push origin 2025-11-08-vah4-mmIaI
```

---

## ⚠️ EXCEPTIONS - DO NOT DELETE

These files should be **KEPT** even after testing:

### 1. Keep - Still Used
```
✅ src/services/authService.ts
   Reason: Still used by authStore.enhanced.ts for authentication logic
   
✅ src/services/http/client.ts
✅ src/services/http/interceptors.ts
   Reason: Core HTTP client infrastructure (Batch 1)
   
✅ src/components/ui/Badge.tsx
✅ src/components/ui/Spinner.tsx
✅ src/components/ui/Modal.tsx
✅ src/components/ui/DataTable.tsx
   Reason: Used in refactored pages (Batch 7 admin)
   
✅ src/components/common/Pagination.tsx
✅ src/components/common/ErrorBoundary.tsx
   Reason: Core reusable components (Batch 1, 2)
   
✅ src/components/domain/learning/VideoPlayer.tsx
✅ src/components/domain/learning/DocumentViewer.tsx
✅ src/components/domain/learning/CurriculumSidebar.tsx
✅ src/components/domain/course/CourseCard.tsx
   Reason: Domain components created in refactor (Batch 2)
   
✅ src/components/admin/* (4 modal components)
   Reason: Created in Batch 7 (admin features)
```

### 2. Keep - Future Use
```
✅ src/i18n.ts
   Reason: i18n setup for future multi-language support
   Note: Currently not used (100% Vietnamese hardcoded)
```

### 3. Keep - Configuration
```
✅ src/lib/queryClient.ts
✅ src/lib/utils.ts
✅ src/constants/routes.ts
✅ src/constants/queryKeys.ts
   Reason: Core configuration files (Batch 1)
```

---

## 📊 Cleanup Impact Summary

### Files to Delete (After Testing)
- **Pages**: 6 files (~700 lines)
- **Components**: 30+ files (~3,000 lines)
- **Services**: 12 files (~2,000 lines)
- **Stores**: 2 files (~300 lines)
- **UI Components**: 13 files (~1,500 lines)
- **Other**: 3 files (~300 lines)

**Total**: ~50-60 files (~7,800 lines)

### Files to Keep
- **Current Production**: 53 files (~13,600 lines)
- **Reusable Infrastructure**: 20+ files (~2,000 lines)
- **Configuration**: 8 files (~300 lines)

**Total**: ~80 files (~16,000 lines) after cleanup

---

## 🎯 Decision Matrix

| File Type | Old Files | New Files | Action | When |
|-----------|-----------|-----------|--------|------|
| Pages (root level) | 6 | 32 | DELETE old | After testing |
| UI Components (duplicate) | 3 | 3 | DELETE old, RENAME new | After testing |
| UI Components (unused) | 10+ | N/A | DELETE | After testing |
| Domain Components | 0 | 15+ | KEEP | - |
| Services (duplicate) | 12 | 10+ | DELETE old | After testing |
| Services (core) | 1 | 2 | KEEP | - |
| Stores | 2 | 1 | DELETE old | After testing |
| Infrastructure | - | 20+ | KEEP | - |

---

## ✅ Recommended Actions (RIGHT NOW)

### Option A: Conservative Approach (RECOMMENDED)
1. **Do nothing** - Keep all files during testing
2. Wait for manual testing to complete (1-2 weeks)
3. Confirm refactored pages work 100%
4. Then execute Phase 2 cleanup (safe deletion with archive)

**Pros**: 
- Safe - can reference old code if needed
- No risk of accidentally deleting needed files
- Easy to compare old vs new implementation

**Cons**: 
- Cluttered codebase temporarily
- May confuse developers about which files to use

---

### Option B: Immediate Safe Cleanup (PARTIAL)
1. **Create archive branch** NOW
2. Delete **obviously unused** files only:
   - Chat components (not in MVP)
   - Mock services
   - Demo components
3. **Keep duplicate files** until after testing

**Pros**: 
- Reduces clutter immediately
- Still safe with archive
- Keeps critical duplicates for reference

**Cons**: 
- Requires careful review
- Risk of deleting something needed

---

### Option C: Full Cleanup (NOT RECOMMENDED)
1. Delete all legacy files immediately
2. Rename "New" components to standard names
3. Update all imports

**Pros**: 
- Clean codebase immediately
- No confusion about which files to use

**Cons**: 
- ⚠️ **HIGH RISK** - no easy rollback
- Cannot reference old code during testing
- May discover needed files after deletion

---

## 🏆 FINAL RECOMMENDATION

**Choose Option A: Conservative Approach**

**Reasoning**:
1. Currently in **testing phase** - need stable reference
2. Old files **not causing issues** (not imported, not breaking build)
3. TypeScript errors = **0** (no conflicts)
4. Can **safely delay** cleanup until after testing
5. Archive branch provides **full rollback capability**

**Next Steps**:
1. ✅ Read this analysis document
2. ⏸️ Continue with manual testing (use new refactored pages)
3. ✅ Confirm 0 TypeScript errors remain
4. ⏸️ After testing complete (1-2 weeks), execute Phase 2 cleanup
5. ✅ Document any legacy files discovered to be needed

---

## 📞 Questions to Answer Before Cleanup

Before executing Phase 2 cleanup, answer these:

1. **Has manual testing covered all 3 roles?** (Student, Instructor, Admin)
2. **Are all critical workflows tested?** (Login, Enroll, Learn, Create Course, Grade, Admin CRUD)
3. **Any legacy code referenced during bug fixes?** (If yes, document why)
4. **Any legacy components discovered to be needed?** (If yes, add to KEEP list)
5. **Is production deployment planned soon?** (If yes, cleanup can wait until after deploy)

---

**Status**: ⏸️ Waiting for testing completion  
**Owner**: Development Team  
**Timeline**: Execute cleanup after 1-2 weeks of successful testing

---

*Analysis Date: November 12, 2025*  
*Next Review: After Manual Testing Complete*
