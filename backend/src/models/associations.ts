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
import LiveSession from './live-session.model';
import LiveSessionAttendance from './live-session-attendance.model';
import LiveSessionMessage from './live-session-message.model';
import LivestreamPolicy from './livestream-policy.model';
import CommentModeration from './comment-moderation.model';
import Conversation from './conversation.model';
import DirectMessage from './direct-message.model';

export const setupAssociations = () => {
  // ===================================
  // 1. USER & AUTHENTICATION RELATIONSHIPS
  // ===================================
  
  // User 1 ---< PasswordResetToken
  (User as any).hasMany(PasswordResetToken, {
    foreignKey: 'user_id',
    as: 'passwordResetTokens',
    onDelete: 'CASCADE'
  });
  (PasswordResetToken as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // ===================================
  // 2. COURSE MANAGEMENT RELATIONSHIPS
  // ===================================
  
  // Category 1 ---< Course
  (Category as any).hasMany(Course, {
    foreignKey: 'category_id',
    as: 'courses'
  });
  (Course as any).belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'courseCategory'  // Changed from 'category' to avoid naming collision with attribute
  });

  // Category (self-referencing) - Parent/Child hierarchy
  (Category as any).hasMany(Category, {
    foreignKey: 'parent_id',
    as: 'subcategories'
  });
  (Category as any).belongsTo(Category, {
    foreignKey: 'parent_id',
    as: 'parent'
  });

  // User (Instructor) 1 ---< Course
  (User as any).hasMany(Course, {
    foreignKey: 'instructor_id',
    as: 'taughtCourses' // Courses taught by instructor
  });
  (Course as any).belongsTo(User, {
    foreignKey: 'instructor_id',
    as: 'instructor'
  });

  // User >---< Course (through Enrollments)
  (User as any).belongsToMany(Course, {
    through: Enrollment,
    foreignKey: 'user_id',
    otherKey: 'course_id',
    as: 'enrolledCourses' // Courses enrolled by student
  });
  (Course as any).belongsToMany(User, {
    through: Enrollment,
    foreignKey: 'course_id',
    otherKey: 'user_id',
    as: 'enrolledStudents' // Students enrolled in course
  });

  // Direct associations for Enrollment
  (User as any).hasMany(Enrollment, {
    foreignKey: 'user_id',
    as: 'enrollments'
  });
  (Enrollment as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'student'
  });

  (Course as any).hasMany(Enrollment, {
    foreignKey: 'course_id',
    as: 'enrollments'
  });
  (Enrollment as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // Live sessions relationships
  (User as any).hasMany(LiveSession, {
    foreignKey: 'host_user_id',
    as: 'hostedLiveSessions',
  });
  (LiveSession as any).belongsTo(User, {
    foreignKey: 'host_user_id',
    as: 'host',
  });

  (Course as any).hasMany(LiveSession, {
    foreignKey: 'course_id',
    as: 'liveSessions',
  });
  (LiveSession as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course',
  });

  (LiveSession as any).hasMany(LiveSessionAttendance, {
    foreignKey: 'session_id',
    as: 'attendance',
    onDelete: 'CASCADE',
  });
  (LiveSessionAttendance as any).belongsTo(LiveSession, {
    foreignKey: 'session_id',
    as: 'session',
  });

  (User as any).hasMany(LiveSessionAttendance, {
    foreignKey: 'user_id',
    as: 'liveSessionAttendance',
    onDelete: 'CASCADE',
  });
  (LiveSessionAttendance as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // Live session messages relationships
  (LiveSession as any).hasMany(LiveSessionMessage, {
    foreignKey: 'session_id',
    as: 'messages',
    onDelete: 'CASCADE',
  });
  (LiveSessionMessage as any).belongsTo(LiveSession, {
    foreignKey: 'session_id',
    as: 'session',
  });

  (User as any).hasMany(LiveSessionMessage, {
    foreignKey: 'sender_id',
    as: 'liveSessionMessages',
  });
  (LiveSessionMessage as any).belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender',
  });

  // Live session message self-referencing (replies)
  (LiveSessionMessage as any).hasMany(LiveSessionMessage, {
    foreignKey: 'reply_to',
    as: 'replies',
  });
  (LiveSessionMessage as any).belongsTo(LiveSessionMessage, {
    foreignKey: 'reply_to',
    as: 'replyTo',
  });

  // ===================================
  // 3. CHAT RELATIONSHIPS (Supabase Schema)
  // ===================================
  
  // User 1 ---< ChatMessage (Supabase uses user_id)
  (User as any).hasMany(ChatMessage, {
    foreignKey: 'user_id',
    as: 'sentMessages'
  });
  (ChatMessage as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'sender'
  });

  // Course 1 ---< ChatMessage
  (Course as any).hasMany(ChatMessage, {
    foreignKey: 'course_id',
    as: 'chatMessages'
  });
  (ChatMessage as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // ChatMessage (self-referencing) - Reply functionality (Supabase uses reply_to_message_id)
  (ChatMessage as any).hasMany(ChatMessage, {
    foreignKey: 'reply_to_message_id',
    as: 'replies'
  });
  (ChatMessage as any).belongsTo(ChatMessage, {
    foreignKey: 'reply_to_message_id',
    as: 'replyToMessage'
  });

  // ===================================
  // 4. COURSE CONTENT RELATIONSHIPS
  // ===================================
  
  // Course 1 ---< Section
  (Course as any).hasMany(Section, {
    foreignKey: 'course_id',
    as: 'sections',
    onDelete: 'CASCADE'
  });
  (Section as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // Section 1 ---< Lesson
  (Section as any).hasMany(Lesson, {
    foreignKey: 'section_id',
    as: 'lessons',
    onDelete: 'CASCADE'
  });
  (Lesson as any).belongsTo(Section, {
    foreignKey: 'section_id',
    as: 'section'
  });

  // Lesson 1 ---< LessonMaterial
  (Lesson as any).hasMany(LessonMaterial, {
    foreignKey: 'lesson_id',
    as: 'materials',
    onDelete: 'CASCADE'
  });
  (LessonMaterial as any).belongsTo(Lesson, {
    foreignKey: 'lesson_id',
    as: 'lesson'
  });

  // User (uploader) 1 ---< LessonMaterial
  (User as any).hasMany(LessonMaterial, {
    foreignKey: 'uploaded_by',
    as: 'uploadedMaterials'
  });
  (LessonMaterial as any).belongsTo(User, {
    foreignKey: 'uploaded_by',
    as: 'uploader'
  });

  // User >---< Lesson (through LessonProgress)
  (User as any).belongsToMany(Lesson, {
    through: LessonProgress,
    foreignKey: 'user_id',
    otherKey: 'lesson_id',
    as: 'learnedLessons'
  });
  (Lesson as any).belongsToMany(User, {
    through: LessonProgress,
    foreignKey: 'lesson_id',
    otherKey: 'user_id',
    as: 'learners'
  });

  // Direct associations for LessonProgress
  (User as any).hasMany(LessonProgress, {
    foreignKey: 'user_id',
    as: 'lessonProgress'
  });
  (LessonProgress as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  (Lesson as any).hasMany(LessonProgress, {
    foreignKey: 'lesson_id',
    as: 'progress'
  });
  (LessonProgress as any).belongsTo(Lesson, {
    foreignKey: 'lesson_id',
    as: 'lesson'
  });

  // ===================================
  // 5. NOTIFICATION RELATIONSHIPS
  // ===================================
  
  // User (sender) 1 ---< Notification
  (User as any).hasMany(Notification, {
    foreignKey: 'sender_id',
    as: 'sentNotifications'
  });
  (Notification as any).belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender'
  });

  // User >---< Notification (through NotificationRecipient)
  (User as any).belongsToMany(Notification, {
    through: NotificationRecipient,
    foreignKey: 'recipient_id',
    otherKey: 'notification_id',
    as: 'receivedNotifications'
  });
  (Notification as any).belongsToMany(User, {
    through: NotificationRecipient,
    foreignKey: 'notification_id',
    otherKey: 'recipient_id',
    as: 'recipients'
  });

  // Direct associations for NotificationRecipient
  (User as any).hasMany(NotificationRecipient, {
    foreignKey: 'recipient_id',
    as: 'notificationRecipients'
  });
  (NotificationRecipient as any).belongsTo(User, {
    foreignKey: 'recipient_id',
    as: 'recipient'
  });

  (Notification as any).hasMany(NotificationRecipient, {
    foreignKey: 'notification_id',
    as: 'notificationRecipients'
  });
  (NotificationRecipient as any).belongsTo(Notification, {
    foreignKey: 'notification_id',
    as: 'notification'
  });

  // ===================================
  // 7. LIVESTREAM MODERATION RELATIONSHIPS
  // ===================================

  // LiveSession 1 ---< LivestreamPolicy (one-to-one)
  (LiveSession as any).hasOne(LivestreamPolicy, {
    foreignKey: 'session_id',
    as: 'policy',
    onDelete: 'CASCADE'
  });
  (LivestreamPolicy as any).belongsTo(LiveSession, {
    foreignKey: 'session_id',
    as: 'session'
  });

  // LiveSessionMessage 1 ---< CommentModeration (one-to-one)
  (LiveSessionMessage as any).hasOne(CommentModeration, {
    foreignKey: 'message_id',
    as: 'moderation',
    onDelete: 'CASCADE'
  });
  (CommentModeration as any).belongsTo(LiveSessionMessage, {
    foreignKey: 'message_id',
    as: 'message'
  });

  // LiveSession 1 ---< CommentModeration
  (LiveSession as any).hasMany(CommentModeration, {
    foreignKey: 'session_id',
    as: 'commentModerations',
    onDelete: 'CASCADE'
  });
  (CommentModeration as any).belongsTo(LiveSession, {
    foreignKey: 'session_id',
    as: 'session'
  });

  // User 1 ---< CommentModeration (sender)
  (User as any).hasMany(CommentModeration, {
    foreignKey: 'user_id',
    as: 'commentModerations',
    onDelete: 'CASCADE'
  });
  (CommentModeration as any).belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // User 1 ---< CommentModeration (moderator)
  (User as any).hasMany(CommentModeration, {
    foreignKey: 'moderated_by',
    as: 'moderatedComments'
  });
  (CommentModeration as any).belongsTo(User, {
    foreignKey: 'moderated_by',
    as: 'moderator'
  });

  // ===================================
  // 8. DIRECT MESSAGE (DM) RELATIONSHIPS
  // ===================================

  // Course 1 ---< Conversation
  (Course as any).hasMany(Conversation, {
    foreignKey: 'course_id',
    as: 'conversations',
    onDelete: 'CASCADE'
  });
  (Conversation as any).belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // User (Student) 1 ---< Conversation
  (User as any).hasMany(Conversation, {
    foreignKey: 'student_id',
    as: 'studentConversations',
    onDelete: 'CASCADE'
  });
  (Conversation as any).belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  // User (Instructor) 1 ---< Conversation
  (User as any).hasMany(Conversation, {
    foreignKey: 'instructor_id',
    as: 'instructorConversations',
    onDelete: 'CASCADE'
  });
  (Conversation as any).belongsTo(User, {
    foreignKey: 'instructor_id',
    as: 'instructor'
  });

  // Conversation 1 ---< DirectMessage
  (Conversation as any).hasMany(DirectMessage, {
    foreignKey: 'conversation_id',
    as: 'messages',
    onDelete: 'CASCADE'
  });
  (DirectMessage as any).belongsTo(Conversation, {
    foreignKey: 'conversation_id',
    as: 'conversation'
  });

  // User 1 ---< DirectMessage (sender)
  (User as any).hasMany(DirectMessage, {
    foreignKey: 'sender_id',
    as: 'sentDirectMessages',
    onDelete: 'CASCADE'
  });
  (DirectMessage as any).belongsTo(User, {
    foreignKey: 'sender_id',
    as: 'sender'
  });

  console.log('✅ Model associations setup completed');
};

export default setupAssociations;


