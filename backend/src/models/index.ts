// Export batch 1 models (core + batch 1)
export { default as User } from './user.model';
export { default as Course } from './course.model';
export { default as Enrollment } from './enrollment.model';
export { default as Lesson } from './lesson.model';
export { default as ChatMessage } from './chat-message.model';
export { default as Section } from './section.model';
export { default as LessonMaterial } from './lesson-material.model';
export { default as LessonProgress } from './lesson-progress.model';
export { default as Notification } from './notification.model';
export { default as NotificationRecipient } from './notification-recipient.model';
export { default as Quiz } from './quiz.model';
export { default as QuizQuestion } from './quiz-question.model';
export { default as QuizAttempt } from './quiz-attempt.model';
export { default as QuizAnswer } from './quiz-answer.model';
export { default as QuizOption } from './quiz-option.model';
export { default as Assignment } from './assignment.model';
export { default as AssignmentSubmission } from './assignment-submission.model';
export { default as CourseStatistics } from './course-statistics.model';
export { default as UserActivityLog } from './user-activity-log.model';
export { default as Grade } from './grade.model';
export { default as FinalGrade } from './final-grade.model';
export { default as GradeComponent } from './grade-component.model';
export { default as LiveSession } from './live-session.model';
export { default as LiveSessionAttendance } from './live-session-attendance.model';
export { default as LiveSessionMessage } from './live-session-message.model';
export { default as LivestreamPolicy } from './livestream-policy.model';
export { default as CommentModeration } from './comment-moderation.model';
export { default as Review } from './review.model';
export { default as Conversation } from './conversation.model';
export { default as DirectMessage } from './direct-message.model';
export { default as Certificate } from './certificate.model';
export { default as CourseChatReadStatus } from './course-chat-read-status.model';
export { default as CoursePrerequisite } from './course-prerequisite.model';

// Import models for associations
import User from './user.model';
import Course from './course.model';
import Enrollment from './enrollment.model';
import Lesson from './lesson.model';
import ChatMessage from './chat-message.model';
import Section from './section.model';
import LessonMaterial from './lesson-material.model';
import LessonProgress from './lesson-progress.model';
import Notification from './notification.model';
import NotificationRecipient from './notification-recipient.model';
import Quiz from './quiz.model';
import QuizQuestion from './quiz-question.model';
import QuizAttempt from './quiz-attempt.model';
import QuizAnswer from './quiz-answer.model';
import QuizOption from './quiz-option.model';
import Conversation from './conversation.model';
import DirectMessage from './direct-message.model';
import Certificate from './certificate.model';
import CourseChatReadStatus from './course-chat-read-status.model';
import CoursePrerequisite from './course-prerequisite.model';

// Define associations
const models: { [key: string]: any } = { 
  User, Course, Enrollment, Lesson, ChatMessage, 
  Section, LessonMaterial, LessonProgress, Notification, NotificationRecipient,
  Quiz, QuizQuestion, QuizAttempt, QuizAnswer, QuizOption,
  Conversation, DirectMessage, Certificate, CourseChatReadStatus, CoursePrerequisite
};

// Call associate methods
Object.keys(models).forEach((modelName: string) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});
