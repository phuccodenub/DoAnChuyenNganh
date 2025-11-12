# ============================================================================
# Legacy Files Cleanup Script
# ============================================================================
# Purpose: Remove old files after refactor completion
# Warning: Only run AFTER manual testing is complete and confirmed working
# Date: November 12, 2025
# ============================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Legacy Files Cleanup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Safety check
Write-Host "⚠️  WARNING: This will DELETE ~50 legacy files!" -ForegroundColor Red
Write-Host ""
Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "  1. Manual testing completed and confirmed working" -ForegroundColor Yellow
Write-Host "  2. All refactored pages tested (Student, Instructor, Admin)" -ForegroundColor Yellow
Write-Host "  3. TypeScript errors = 0" -ForegroundColor Yellow
Write-Host "  4. Archive branch created" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Have you completed ALL prerequisites above? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "❌ Cleanup cancelled. Complete prerequisites first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting cleanup process..." -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 1: Create Archive Branch
# ============================================================================
Write-Host "[Step 1/6] Creating archive branch..." -ForegroundColor Cyan

git checkout -b archive/legacy-files-pre-refactor
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create archive branch" -ForegroundColor Red
    exit 1
}

git add .
git commit -m "Archive: Legacy files before cleanup"
git push origin archive/legacy-files-pre-refactor

Write-Host "✅ Archive branch created successfully" -ForegroundColor Green
Write-Host ""

# Switch back to main development branch
git checkout 2025-11-08-vah4-mmIaI

# ============================================================================
# Step 2: Delete Legacy Pages
# ============================================================================
Write-Host "[Step 2/6] Deleting legacy pages..." -ForegroundColor Cyan

$legacyPages = @(
    "src/pages/CourseDetail.tsx",
    "src/pages/CoursePage.tsx",
    "src/pages/DashboardPage.tsx",
    "src/pages/MyCourses.tsx",
    "src/pages/HomePage.tsx",
    "src/pages/LiveStreamPage.tsx"
)

$deletedCount = 0
foreach ($file in $legacyPages) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ❌ Deleted: $file" -ForegroundColor Gray
        $deletedCount++
    }
}

Write-Host "✅ Deleted $deletedCount legacy pages" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 3: Delete Unused Components
# ============================================================================
Write-Host "[Step 3/6] Deleting unused components..." -ForegroundColor Cyan

# Delete entire folders
$legacyFolders = @(
    "src/components/Chat",
    "src/components/Quiz",
    "src/components/LiveStream",
    "src/components/Files",
    "src/components/demo",
    "src/components/analytics"
)

foreach ($folder in $legacyFolders) {
    if (Test-Path $folder) {
        Remove-Item $folder -Recurse -Force
        Write-Host "  ❌ Deleted folder: $folder" -ForegroundColor Gray
        $deletedCount++
    }
}

# Delete individual files
$legacyComponentFiles = @(
    "src/components/Layout/Layout.tsx",
    "src/components/ProtectedRoute.tsx",
    "src/components/notifications/NotificationCenter.tsx"
)

foreach ($file in $legacyComponentFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ❌ Deleted: $file" -ForegroundColor Gray
        $deletedCount++
    }
}

Write-Host "✅ Deleted unused component folders and files" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 4: Delete Duplicate & Unused UI Components
# ============================================================================
Write-Host "[Step 4/6] Deleting duplicate and unused UI components..." -ForegroundColor Cyan

$legacyUIComponents = @(
    # Duplicates (old versions)
    "src/components/ui/Button.tsx",
    "src/components/ui/Input.tsx",
    "src/components/ui/Card.tsx",
    # Unused
    "src/components/ui/EmojiPicker.tsx",
    "src/components/ui/LanguageSwitcher.tsx",
    "src/components/ui/ChatbotAssistant.tsx",
    "src/components/ui/ToastNotifications.tsx",
    "src/components/ui/RecommendationPanel.tsx",
    "src/components/ui/NotificationPanel.tsx",
    "src/components/ui/LoadingSkeleton.tsx",
    "src/components/ui/LearningAnalytics.tsx"
)

foreach ($file in $legacyUIComponents) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ❌ Deleted: $file" -ForegroundColor Gray
        $deletedCount++
    }
}

Write-Host "✅ Deleted duplicate and unused UI components" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 5: Delete Unused Services & Stores
# ============================================================================
Write-Host "[Step 5/6] Deleting unused services and stores..." -ForegroundColor Cyan

$legacyServices = @(
    "src/services/courseService.ts",
    "src/services/apiClient.ts",
    "src/services/mockAuthService.ts",
    "src/services/mockData.ts",
    "src/services/chatService.ts",
    "src/services/chatbotService.ts",
    "src/services/socketService.ts",
    "src/services/webRTCService.ts",
    "src/services/quizService.ts",
    "src/services/notificationService.ts",
    "src/services/livestreamService.ts",
    "src/services/fileService.ts",
    "src/services/recommendationService.ts"
)

foreach ($file in $legacyServices) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ❌ Deleted: $file" -ForegroundColor Gray
        $deletedCount++
    }
}

# Delete unused stores
$legacyStores = @(
    "src/stores/authStore.ts",
    "src/stores/chatStore.ts"
)

foreach ($file in $legacyStores) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ❌ Deleted: $file" -ForegroundColor Gray
        $deletedCount++
    }
}

# Delete unused contexts
if (Test-Path "src/contexts/ThemeContext.tsx") {
    Remove-Item "src/contexts/ThemeContext.tsx" -Force
    Write-Host "  ❌ Deleted: src/contexts/ThemeContext.tsx" -ForegroundColor Gray
    $deletedCount++
}

Write-Host "✅ Deleted unused services, stores, and contexts" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 6: Rename "New" Components
# ============================================================================
Write-Host "[Step 6/6] Renaming 'New' components to standard names..." -ForegroundColor Cyan

# Rename files
git mv src/components/ui/ButtonNew.tsx src/components/ui/Button.tsx
git mv src/components/ui/InputNew.tsx src/components/ui/Input.tsx
git mv src/components/ui/CardNew.tsx src/components/ui/Card.tsx

Write-Host "  ✅ Renamed ButtonNew.tsx → Button.tsx" -ForegroundColor Gray
Write-Host "  ✅ Renamed InputNew.tsx → Input.tsx" -ForegroundColor Gray
Write-Host "  ✅ Renamed CardNew.tsx → Card.tsx" -ForegroundColor Gray

Write-Host "✅ Renamed components successfully" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 7: Update Imports (Manual Step Required)
# ============================================================================
Write-Host "⚠️  MANUAL STEP REQUIRED:" -ForegroundColor Yellow
Write-Host ""
Write-Host "You need to update imports in all files:" -ForegroundColor Yellow
Write-Host "  1. Open VS Code" -ForegroundColor Yellow
Write-Host "  2. Press Ctrl+Shift+H (Find and Replace in Files)" -ForegroundColor Yellow
Write-Host "  3. Replace the following:" -ForegroundColor Yellow
Write-Host ""
Write-Host "     Find:    @/components/ui/ButtonNew" -ForegroundColor Cyan
Write-Host "     Replace: @/components/ui/Button" -ForegroundColor Green
Write-Host ""
Write-Host "     Find:    @/components/ui/InputNew" -ForegroundColor Cyan
Write-Host "     Replace: @/components/ui/Input" -ForegroundColor Green
Write-Host ""
Write-Host "     Find:    @/components/ui/CardNew" -ForegroundColor Cyan
Write-Host "     Replace: @/components/ui/Card" -ForegroundColor Green
Write-Host ""
Write-Host "  4. Review all changes carefully" -ForegroundColor Yellow
Write-Host "  5. Save all files" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter after you've completed the import updates..."

# ============================================================================
# Step 8: Verify Build
# ============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Verification Phase" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[Verification 1/3] Running TypeScript check..." -ForegroundColor Cyan
npm run type-check

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript errors found!" -ForegroundColor Red
    Write-Host "Fix errors before committing." -ForegroundColor Red
    exit 1
}

Write-Host "✅ TypeScript check passed (0 errors)" -ForegroundColor Green
Write-Host ""

Write-Host "[Verification 2/3] Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "Fix build errors before committing." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

Write-Host "[Verification 3/3] Starting dev server for final check..." -ForegroundColor Cyan
Write-Host "Please manually verify the application works correctly." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the dev server when done." -ForegroundColor Yellow
Write-Host ""

npm run dev

# ============================================================================
# Step 9: Commit Changes
# ============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Commit Changes" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$commitConfirmation = Read-Host "Ready to commit cleanup changes? (yes/no)"
if ($commitConfirmation -ne "yes") {
    Write-Host "❌ Commit cancelled. Review changes manually." -ForegroundColor Red
    exit 0
}

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
Archived in branch: archive/legacy-files-pre-refactor

Verified:
- TypeScript errors: 0
- Build: Successful
- Dev server: Working"

Write-Host ""
Write-Host "✅ Changes committed successfully!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 10: Push Changes
# ============================================================================
$pushConfirmation = Read-Host "Push changes to remote? (yes/no)"
if ($pushConfirmation -eq "yes") {
    git push origin 2025-11-08-vah4-mmIaI
    Write-Host "✅ Changes pushed to remote!" -ForegroundColor Green
}

# ============================================================================
# Cleanup Complete
# ============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - Legacy files deleted: ~50 files" -ForegroundColor Gray
Write-Host "  - Code removed: ~5,000+ lines" -ForegroundColor Gray
Write-Host "  - Archive branch: archive/legacy-files-pre-refactor" -ForegroundColor Gray
Write-Host "  - TypeScript errors: 0" -ForegroundColor Gray
Write-Host "  - Build status: Successful" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Run full manual testing again" -ForegroundColor Yellow
Write-Host "  2. Verify all features work correctly" -ForegroundColor Yellow
Write-Host "  3. If issues found, restore from archive branch" -ForegroundColor Yellow
Write-Host ""
Write-Host "Rollback (if needed):" -ForegroundColor Yellow
Write-Host "  git checkout archive/legacy-files-pre-refactor" -ForegroundColor Cyan
Write-Host "  git checkout -b restore-legacy-files" -ForegroundColor Cyan
Write-Host "  git cherry-pick <specific-files>" -ForegroundColor Cyan
Write-Host ""
