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
  // Cast to any to ease mixed model typing during migration to class-based models
  const U: any = User as any;
  const C: any = Course as any;
  const E: any = Enrollment as any;
  const CM: any = ChatMessage as any;
  const PRT: any = PasswordResetToken as any;
  const CAT: any = Category as any;
  const SEC: any = Section as any;
  const LES: any = Lesson as any;
  const LMT: any = LessonMaterial as any;
  const LPR: any = LessonProgress as any;
  const NOTI: any = Notification as any;
  const NR: any = NotificationRecipient as any;
  // ===================================
  // 1. USER & AUTHENTICATION RELATIONSHIPS
  // ===================================
  
  // User 1 ---< PasswordResetToken
  U.hasMany(PRT, {
    foreignKey: 'user_id',
    as: 'passwordResetTokens',
    onDelete: 'CASCADE'
  });
  PRT.belongsTo(U, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // ===================================
  // 2. COURSE MANAGEMENT RELATIONSHIPS
  // ===================================
  
  // Category 1 ---< Course
  CAT.hasMany(C, {
    foreignKey: 'category_id',
    as: 'courses'
  });
  C.belongsTo(CAT, {
    foreignKey: 'category_id',
    as: 'category'
  });

  // Category (self-referencing) - Parent/Child hierarchy
  CAT.hasMany(CAT, {
    foreignKey: 'parent_id',
    as: 'subcategories'
  });
  CAT.belongsTo(CAT, {
    foreignKey: 'parent_id',
    as: 'parent'
  });

  // User (Instructor) 1 ---< Course
  U.hasMany(C, {
    foreignKey: 'instructor_id',
    as: 'taughtCourses' // Courses taught by instructor
  });
  C.belongsTo(U, {
    foreignKey: 'instructor_id',
    as: 'instructor'
  });

  // User >---< Course (through Enrollments)
  U.belongsToMany(C, {
    through: E,
    foreignKey: 'user_id',
    otherKey: 'course_id',
    as: 'enrolledCourses' // Courses enrolled by student
  });
  C.belongsToMany(U, {
    through: E,
    foreignKey: 'course_id',
    otherKey: 'user_id',
    as: 'enrolledStudents' // Students enrolled in course
  });

  // Direct associations for Enrollment
  U.hasMany(E, {
    foreignKey: 'user_id',
    as: 'enrollments'
  });
  E.belongsTo(U, {
    foreignKey: 'user_id',
    as: 'student'
  });

  C.hasMany(E, {
    foreignKey: 'course_id',
    as: 'enrollments'
  });
  E.belongsTo(C, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // ===================================
  // 3. CHAT RELATIONSHIPS (Current Simple Version)
  // ===================================
  
  // User 1 ---< ChatMessage
  U.hasMany(CM, {
    foreignKey: 'sender_id',
    as: 'sentMessages'
  });
  CM.belongsTo(U, {
    foreignKey: 'sender_id',
    as: 'sender'
  });

  // Course 1 ---< ChatMessage
  C.hasMany(CM, {
    foreignKey: 'course_id',
    as: 'chatMessages'
  });
  CM.belongsTo(C, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // ChatMessage (self-referencing) - Reply functionality
  CM.hasMany(CM, {
    foreignKey: 'reply_to',
    as: 'replies'
  });
  CM.belongsTo(CM, {
    foreignKey: 'reply_to',
    as: 'replyToMessage'
  });

  // ===================================
  // 4. COURSE CONTENT RELATIONSHIPS
  // ===================================
  
  // Course 1 ---< Section
  C.hasMany(SEC, {
    foreignKey: 'course_id',
    as: 'sections',
    onDelete: 'CASCADE'
  });
  SEC.belongsTo(C, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // Section 1 ---< Lesson
  SEC.hasMany(LES, {
    foreignKey: 'section_id',
    as: 'lessons',
    onDelete: 'CASCADE'
  });
  LES.belongsTo(SEC, {
    foreignKey: 'section_id',
    as: 'section'
  });

  // Lesson 1 ---< LessonMaterial
  LES.hasMany(LMT, {
    foreignKey: 'lesson_id',
    as: 'materials',
    onDelete: 'CASCADE'
  });
  LMT.belongsTo(LES, {
    foreignKey: 'lesson_id',
    as: 'lesson'
  });

  // User (uploader) 1 ---< LessonMaterial
  U.hasMany(LMT, {
    foreignKey: 'uploaded_by',
    as: 'uploadedMaterials'
  });
  LMT.belongsTo(U, {
    foreignKey: 'uploaded_by',
    as: 'uploader'
  });

  // User >---< Lesson (through LessonProgress)
  U.belongsToMany(LES, {
    through: LPR,
    foreignKey: 'user_id',
    otherKey: 'lesson_id',
    as: 'learnedLessons'
  });
  LES.belongsToMany(U, {
    through: LPR,
    foreignKey: 'lesson_id',
    otherKey: 'user_id',
    as: 'learners'
  });

  // Direct associations for LessonProgress
  U.hasMany(LPR, {
    foreignKey: 'user_id',
    as: 'lessonProgress'
  });
  LPR.belongsTo(U, {
    foreignKey: 'user_id',
    as: 'user'
  });

  LES.hasMany(LPR, {
    foreignKey: 'lesson_id',
    as: 'progress'
  });
  LPR.belongsTo(LES, {
    foreignKey: 'lesson_id',
    as: 'lesson'
  });

  // ===================================
  // 5. NOTIFICATION RELATIONSHIPS
  // ===================================
  
  // User (sender) 1 ---< Notification
  U.hasMany(NOTI, {
    foreignKey: 'sender_id',
    as: 'sentNotifications'
  });
  NOTI.belongsTo(U, {
    foreignKey: 'sender_id',
    as: 'sender'
  });

  // User >---< Notification (through NotificationRecipient)
  U.belongsToMany(NOTI, {
    through: NR,
    foreignKey: 'recipient_id',
    otherKey: 'notification_id',
    as: 'receivedNotifications'
  });
  NOTI.belongsToMany(U, {
    through: NR,
    foreignKey: 'notification_id',
    otherKey: 'recipient_id',
    as: 'recipients'
  });

  // Direct associations for NotificationRecipient
  U.hasMany(NR, {
    foreignKey: 'recipient_id',
    as: 'notificationRecipients'
  });
  NR.belongsTo(U, {
    foreignKey: 'recipient_id',
    as: 'recipient'
  });

  NOTI.hasMany(NR, {
    foreignKey: 'notification_id',
    as: 'notificationRecipients'
  });
  NR.belongsTo(NOTI, {
    foreignKey: 'notification_id',
    as: 'notification'
  });

  console.log('✅ Model associations setup completed');
};

export default setupAssociations;


