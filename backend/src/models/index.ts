// Export all models
export { default as User } from './user.model';
export { default as Course } from './course.model';
export { default as Enrollment } from './enrollment.model';
export { default as ChatMessage } from './chat-message.model';
export { default as PasswordResetToken } from './password-reset-token.model';
export { default as Category } from './category.model';
export { default as Section } from './section.model';
export { default as Lesson } from './lesson.model';
export { default as LessonMaterial } from './lesson-material.model';
export { default as LessonProgress } from './lesson-progress.model';
export { default as Notification } from './notification.model';
export { default as NotificationRecipient } from './notification-recipient.model';
export { default as Quiz } from './quiz.model';
export { default as QuizQuestion } from './quiz-question.model';
export { default as QuizOption } from './quiz-option.model';
export { default as QuizAttempt } from './quiz-attempt.model';
export { default as QuizAnswer } from './quiz-answer.model';
export { default as Assignment } from './assignment.model';
export { default as AssignmentSubmission } from './assignment-submission.model';
export { default as GradeComponent } from './grade-component.model';
export { default as Grade } from './grade.model';
export { default as FinalGrade } from './final-grade.model';
export { default as LiveSession } from './live-session.model';
export { default as LiveSessionAttendance } from './live-session-attendance.model';
export { default as UserActivityLog } from './user-activity-log.model';
export { default as CourseStatistics } from './course-statistics.model';

// Export associations setup
export { setupAssociations } from './associations';

