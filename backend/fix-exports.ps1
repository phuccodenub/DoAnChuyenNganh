# Fix export statements in all model files
$modelFiles = @{
    "course-statistics.model.ts" = "CourseStatistics"
    "final-grade.model.ts" = "FinalGrade"
    "live-session-attendance.model.ts" = "LiveSessionAttendance"
    "user-activity-log.model.ts" = "UserActivityLog"
    "grade-component.model.ts" = "GradeComponent"
    "grade.model.ts" = "Grade"
    "live-session.model.ts" = "LiveSession"
    "notification-recipient.model.ts" = "NotificationRecipient"
    "lesson-material.model.ts" = "LessonMaterial"
    "lesson.model.ts" = "Lesson"
    "lesson-progress.model.ts" = "LessonProgress"
    "notification.model.ts" = "Notification"
    "section.model.ts" = "Section"
    "assignment-submission.model.ts" = "AssignmentSubmission"
    "category.model.ts" = "Category"
    "password-reset-token.model.ts" = "PasswordResetToken"
    "assignment.model.ts" = "Assignment"
    "quiz-answer.model.ts" = "QuizAnswer"
    "quiz-attempt.model.ts" = "QuizAttempt"
    "quiz-option.model.ts" = "QuizOption"
    "quiz-question.model.ts" = "QuizQuestion"
}

foreach ($file in $modelFiles.Keys) {
    $filePath = "src/models/$file"
    $modelName = $modelFiles[$file]
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $content = $content -replace 'export default \$1 as any;', "export default $modelName as any;"
        Set-Content $filePath -Value $content
        Write-Host "Fixed export in: $file -> $modelName"
    }
}

Write-Host "All export statements have been fixed!"

