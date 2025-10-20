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

// Define associations
const models: { [key: string]: any } = { 
  User, Course, Enrollment, Lesson, ChatMessage, 
  Section, LessonMaterial, LessonProgress, Notification, NotificationRecipient,
  Quiz, QuizQuestion, QuizAttempt, QuizAnswer, QuizOption
};

// Call associate methods
Object.keys(models).forEach((modelName: string) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});
