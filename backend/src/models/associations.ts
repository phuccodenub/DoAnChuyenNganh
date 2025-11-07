/**
 * Model Associations
 * Thiết lập các mối quan hệ giữa các models theo schema database
 */

import User from './user.model';
import Course from './course.model';
import Enrollment from './enrollment.model';
import ChatMessage from './chat-message.model';
import PasswordResetToken from './password-reset-token.model';
import Category from './category.model';
import Section from './section.model';
import Lesson from './lesson.model';
import LessonMaterial from './lesson-material.model';
import LessonProgress from './lesson-progress.model';
import Notification from './notification.model';
import NotificationRecipient from './notification-recipient.model';

export const setupAssociations = () => {
  // ===================================
  // 1. USER & AUTHENTICATION RELATIONSHIPS
  // ===================================
  
  // User 1 ---< PasswordResetToken
  User.hasMany(PasswordResetToken, {
    foreignKey: 'user_id',
    as: 'passwordResetTokens',
    onDelete: 'CASCADE'
  });
  PasswordResetToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // ===================================
  // 2. COURSE MANAGEMENT RELATIONSHIPS
  // ===================================
  
  // Category 1 ---< Course
  Category.hasMany(Course, {
    foreignKey: 'category_id',
    as: 'courses'
  });
  Course.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'courseCategory'  // Changed from 'category' to avoid naming collision with attribute
  });

  // Category (self-referencing) - Parent/Child hierarchy
  Category.hasMany(Category, {
    foreignKey: 'parent_id',
    as: 'subcategories'
  });
  Category.belongsTo(Category, {
    foreignKey: 'parent_id',
    as: 'parent'
  });

  // User (Instructor) 1 ---< Course
  User.hasMany(Course, {
    foreignKey: 'instructor_id',
    as: 'taughtCourses' // Courses taught by instructor
  });
  Course.belongsTo(User, {
    foreignKey: 'instructor_id',
    as: 'instructor'
  });

  // User >---< Course (through Enrollments)
  User.belongsToMany(Course, {
    through: Enrollment,
    foreignKey: 'user_id',
    otherKey: 'course_id',
    as: 'enrolledCourses' // Courses enrolled by student
  });
  Course.belongsToMany(User, {
    through: Enrollment,
    foreignKey: 'course_id',
    otherKey: 'user_id',
    as: 'enrolledStudents' // Students enrolled in course
  });

  // Direct associations for Enrollment
  User.hasMany(Enrollment, {
    foreignKey: 'user_id',
    as: 'enrollments'
  });
  Enrollment.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'student'
  });

  Course.hasMany(Enrollment, {
    foreignKey: 'course_id',
    as: 'enrollments'
  });
  Enrollment.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // ===================================
  // 3. CHAT RELATIONSHIPS (Current Simple Version)
  // ===================================
  
  // User 1 ---< ChatMessage
  User.hasMany(ChatMessage, {
    foreignKey: 'sender_id',
    as: 'sentMessages'
  });
  ChatMessage.belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender'
  });

  // Course 1 ---< ChatMessage
  Course.hasMany(ChatMessage, {
    foreignKey: 'course_id',
    as: 'chatMessages'
  });
  ChatMessage.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // ChatMessage (self-referencing) - Reply functionality
  ChatMessage.hasMany(ChatMessage, {
    foreignKey: 'reply_to',
    as: 'replies'
  });
  ChatMessage.belongsTo(ChatMessage, {
    foreignKey: 'reply_to',
    as: 'replyToMessage'
  });

  // ===================================
  // 4. COURSE CONTENT RELATIONSHIPS
  // ===================================
  
  // Course 1 ---< Section
  Course.hasMany(Section, {
    foreignKey: 'course_id',
    as: 'sections',
    onDelete: 'CASCADE'
  });
  Section.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // Section 1 ---< Lesson
  Section.hasMany(Lesson, {
    foreignKey: 'section_id',
    as: 'lessons',
    onDelete: 'CASCADE'
  });
  Lesson.belongsTo(Section, {
    foreignKey: 'section_id',
    as: 'section'
  });

  // Lesson 1 ---< LessonMaterial
  Lesson.hasMany(LessonMaterial, {
    foreignKey: 'lesson_id',
    as: 'materials',
    onDelete: 'CASCADE'
  });
  LessonMaterial.belongsTo(Lesson, {
    foreignKey: 'lesson_id',
    as: 'lesson'
  });

  // User (uploader) 1 ---< LessonMaterial
  User.hasMany(LessonMaterial, {
    foreignKey: 'uploaded_by',
    as: 'uploadedMaterials'
  });
  LessonMaterial.belongsTo(User, {
    foreignKey: 'uploaded_by',
    as: 'uploader'
  });

  // User >---< Lesson (through LessonProgress)
  User.belongsToMany(Lesson, {
    through: LessonProgress,
    foreignKey: 'user_id',
    otherKey: 'lesson_id',
    as: 'learnedLessons'
  });
  Lesson.belongsToMany(User, {
    through: LessonProgress,
    foreignKey: 'lesson_id',
    otherKey: 'user_id',
    as: 'learners'
  });

  // Direct associations for LessonProgress
  User.hasMany(LessonProgress, {
    foreignKey: 'user_id',
    as: 'lessonProgress'
  });
  LessonProgress.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  Lesson.hasMany(LessonProgress, {
    foreignKey: 'lesson_id',
    as: 'progress'
  });
  LessonProgress.belongsTo(Lesson, {
    foreignKey: 'lesson_id',
    as: 'lesson'
  });

  // ===================================
  // 5. NOTIFICATION RELATIONSHIPS
  // ===================================
  
  // User (sender) 1 ---< Notification
  User.hasMany(Notification, {
    foreignKey: 'sender_id',
    as: 'sentNotifications'
  });
  Notification.belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender'
  });

  // User >---< Notification (through NotificationRecipient)
  User.belongsToMany(Notification, {
    through: NotificationRecipient,
    foreignKey: 'recipient_id',
    otherKey: 'notification_id',
    as: 'receivedNotifications'
  });
  Notification.belongsToMany(User, {
    through: NotificationRecipient,
    foreignKey: 'notification_id',
    otherKey: 'recipient_id',
    as: 'recipients'
  });

  // Direct associations for NotificationRecipient
  User.hasMany(NotificationRecipient, {
    foreignKey: 'recipient_id',
    as: 'notificationRecipients'
  });
  NotificationRecipient.belongsTo(User, {
    foreignKey: 'recipient_id',
    as: 'recipient'
  });

  Notification.hasMany(NotificationRecipient, {
    foreignKey: 'notification_id',
    as: 'notificationRecipients'
  });
  NotificationRecipient.belongsTo(Notification, {
    foreignKey: 'notification_id',
    as: 'notification'
  });

  console.log('✅ Model associations setup completed');
};

export default setupAssociations;


