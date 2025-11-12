# 🛠️ Frontend Utility Scripts

This directory contains utility scripts for maintaining the frontend codebase.

---

## 📜 Available Scripts

### `cleanup-legacy-files.ps1`

**Purpose**: Automated cleanup of legacy files after refactor completion

**What it does**:
- Creates archive branch for rollback safety
- Deletes ~50 legacy files (~5,000 lines):
  - 6 duplicate pages (old implementations)
  - 15+ unused components (Chat, Quiz, LiveStream, Files)
  - 12+ unused services (old API services, mocks)
  - 3 duplicate UI components (Button, Input, Card old versions)
  - 10+ specialized UI (Chatbot, Recommendations, Analytics)
  - 2 unused stores
- Renames "New" components to standard names (ButtonNew → Button)
- Verifies TypeScript compilation (0 errors)
- Verifies build success
- Commits and pushes changes

**Prerequisites**:
1. ✅ Manual testing completed and confirmed working
2. ✅ All refactored pages tested (Student, Instructor, Admin)
3. ✅ TypeScript errors = 0
4. ✅ Ready to commit cleanup

**Usage**:
```powershell
# From frontend/ directory
.\scripts\cleanup-legacy-files.ps1
```

**Safety Features**:
- Interactive confirmation prompts
- Creates archive branch before deletion
- Verifies build after cleanup
- Rollback instructions provided

**Rollback** (if needed):
```powershell
git checkout archive/legacy-files-pre-refactor
git checkout -b restore-legacy-files
# Cherry-pick specific files if needed
```

**Expected Outcome**:
- ~50 legacy files deleted
- ~5,000 lines of code removed
- TypeScript errors: 0
- Build: Successful
- Codebase cleaner and easier to maintain

**When to run**: ONLY AFTER manual testing confirms all features work 100%

---

## 📋 Script Execution Order

1. **During Development**: No scripts needed
2. **During Testing**: Do NOT run cleanup script
3. **After Testing Complete**: Run `cleanup-legacy-files.ps1`
4. **After Cleanup**: Re-test to verify nothing broken

---

## ⚠️ Important Notes

- **Never run cleanup during active development**
- **Always create archive branch first** (script does this automatically)
- **Test thoroughly after cleanup**
- **Keep script in version control** for future maintenance

---

## 🔍 Related Documentation

- **Legacy Files Analysis**: `../LEGACY_FILES_ANALYSIS.md` - Detailed analysis of what gets deleted
- **Project Summary**: `../PROJECT_COMPLETE_SUMMARY.md` - Complete project status
- **Refactor Plan**: `../REFACTOR_FRONTEND.md` - Original refactor specification

---

*Last Updated: November 12, 2025*
