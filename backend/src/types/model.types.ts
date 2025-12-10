import { Model } from 'sequelize';
import type { Optional } from './sequelize-types';

// ===================================
// USER MODEL INTERFACES
// ===================================

export interface UserAttributes {
  id: string;
  email: string;
  username?: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified: boolean;
  email_verified_at?: Date;
  token_version: number;
  last_login?: Date;

  // Student fields
  student_id?: string;
  class?: string;
  major?: string;
  year?: number;
  gpa?: number;

  // Instructor fields
  instructor_id?: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor';
  research_interests?: string;

  // Common fields
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'token_version' | 'email_verified'> {}

// Model definition attributes (without timestamps as Sequelize adds them automatically)
export interface UserModelAttributes extends Omit<UserAttributes, 'created_at' | 'updated_at'> {}

export interface UserInstance extends Model, UserAttributes {}

// ===================================
// COURSE MODEL INTERFACES
// ===================================

export type CourseStatus = 'draft' | 'published' | 'archived' | 'suspended';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface CourseAttributes {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  instructor_id: string;
  category_id?: string;
  category?: string;
  status: CourseStatus;
  level: CourseLevel;
  language: string;
  thumbnail?: string;
  duration_hours?: number;
  total_lessons: number;
  tags?: any;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CourseCreationAttributes extends Optional<CourseAttributes, 'id' | 'created_at' | 'updated_at' | 'status' | 'level' | 'language' | 'total_lessons'> {}

export interface CourseInstance extends Model, CourseAttributes {}

// ===================================
// QUIZ MODEL INTERFACES
// ===================================

export interface QuizAttributes {
  id: string;
  course_id: string;
  section_id?: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  available_from?: Date | null;
  available_until?: Date | null;
  is_published: boolean;
  is_practice: boolean; // true = Practice Quiz, false = Graded Quiz
  created_at: Date;
  updated_at: Date;
}

export interface QuizCreationAttributes extends Optional<
  QuizAttributes,
  'id' | 'created_at' | 'updated_at' |
  'duration_minutes' | 'passing_score' | 'max_attempts' |
  'shuffle_questions' | 'show_correct_answers' |
  'available_from' | 'available_until' | 'is_published' | 'section_id'
> {}

export interface QuizInstance extends Model, QuizAttributes {}

// ===================================
// QUIZ QUESTION MODEL INTERFACES
// ===================================

export interface QuizQuestionAttributes {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false';
  points: number;
  order_index: number;
  explanation?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuizQuestionCreationAttributes extends Optional<QuizQuestionAttributes, 'id' | 'created_at' | 'updated_at' | 'points'> {}

export interface QuizQuestionInstance extends Model, QuizQuestionAttributes {}

// ===================================
// QUIZ OPTION MODEL INTERFACES
// ===================================

export interface QuizOptionAttributes {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuizOptionCreationAttributes extends Optional<QuizOptionAttributes, 'id' | 'created_at' | 'updated_at' | 'is_correct'> {}

export interface QuizOptionInstance extends Model, QuizOptionAttributes {}

// ===================================
// QUIZ ATTEMPT MODEL INTERFACES
// ===================================

export interface QuizAttemptAttributes {
  id: string;
  quiz_id: string;
  user_id: string;
  attempt_number: number;
  started_at: Date;
  submitted_at?: Date | null;
  score?: number | null;
  max_score?: number | null;
  time_spent_minutes?: number | null;
  is_passed?: boolean | null;
  created_at: Date;
  updated_at: Date;
}

export interface QuizAttemptCreationAttributes extends Optional<
  QuizAttemptAttributes,
  'id' | 'created_at' | 'updated_at' | 'submitted_at' | 'score' | 'max_score' | 'time_spent_minutes' | 'is_passed'
> {}

export interface QuizAttemptInstance extends Model, QuizAttemptAttributes {}

// ===================================
// QUIZ ANSWER MODEL INTERFACES
// ===================================

export interface QuizAnswerAttributes {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string;
  selected_options?: string[];
  is_correct?: boolean;
  points_earned?: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuizAnswerCreationAttributes extends Optional<QuizAnswerAttributes, 'id' | 'created_at' | 'updated_at' | 'is_correct' | 'points_earned'> {}

export interface QuizAnswerInstance extends Model, QuizAnswerAttributes {}

// ===================================
// ASSIGNMENT MODEL INTERFACES
// ===================================

export interface AssignmentAttributes {
  id: string;
  course_id: string;
  section_id?: string;
  title: string;
  description?: string;
  max_score: number;
  due_date?: Date;
  allow_late_submission: boolean;
  submission_type: 'file' | 'text' | 'both';
  is_published: boolean;
  is_practice: boolean; // true = Practice Assignment, false = Graded Assignment
  created_at: Date;
  updated_at: Date;
}

export interface AssignmentCreationAttributes extends Optional<AssignmentAttributes, 'id' | 'created_at' | 'updated_at' | 'max_score' | 'allow_late_submission' | 'is_published'> {}

export interface AssignmentInstance extends Model, AssignmentAttributes {}

// ===================================
// ASSIGNMENT SUBMISSION MODEL INTERFACES
// ===================================

export interface AssignmentSubmissionAttributes {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_text?: string;
  file_url?: string;
  file_name?: string;
  submitted_at: Date;
  score?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: Date;
  status: 'submitted' | 'graded' | 'returned';
  is_late: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AssignmentSubmissionCreationAttributes extends Optional<AssignmentSubmissionAttributes, 'id' | 'created_at' | 'updated_at' | 'is_late' | 'status'> {}

export interface AssignmentSubmissionInstance extends Model, AssignmentSubmissionAttributes {}

// ===================================
// ENROLLMENT MODEL INTERFACES
// ===================================

export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'suspended';
export type EnrollmentType = 'free' | 'paid' | 'trial';

export interface EnrollmentAttributes {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrollment_type: EnrollmentType;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed_at?: Date;
  completion_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface EnrollmentCreationAttributes extends Optional<EnrollmentAttributes, 'id' | 'created_at' | 'updated_at' | 'status' | 'enrollment_type' | 'progress_percentage' | 'completed_lessons' | 'total_lessons'> {}

export interface EnrollmentInstance extends Model, EnrollmentAttributes {}

// ===================================
// CATEGORY MODEL INTERFACES
// ===================================

export interface CategoryAttributes {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  order_index: number;
  is_active: boolean;
  course_count: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'order_index' | 'course_count'> {}

export interface CategoryInstance extends Model, CategoryAttributes {
  // Instance methods
  isRootCategory(): boolean;
}

export interface CategoryModelStatic {
  // Static methods
  findActiveCategories(includeSubcategories?: boolean): Promise<CategoryInstance[]>;
  findBySlug(slug: string): Promise<CategoryInstance | null>;
  updateCourseCount(categoryId: string): Promise<number>;
}

// ===================================
// SECTION MODEL INTERFACES
// ===================================

export interface SectionAttributes {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SectionCreationAttributes extends Optional<SectionAttributes, 'id' | 'created_at' | 'updated_at' | 'is_published'> {}

export interface SectionInstance extends Model, SectionAttributes {}

// ===================================
// LESSON MODEL INTERFACES
// ===================================

export interface LessonAttributes {
  id: string;
  section_id: string;
  title: string;
  content?: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session';
  video_url?: string;
  duration?: number;
  order_index: number;
  is_published: boolean;
  is_free: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LessonCreationAttributes extends Optional<LessonAttributes, 'id' | 'created_at' | 'updated_at' | 'is_published' | 'is_free'> {}

export interface LessonInstance extends Model, LessonAttributes {}

// ===================================
// NOTIFICATION MODEL INTERFACES
// ===================================

export interface NotificationAttributes {
  id: string;
  sender_id?: string | null;
  notification_type: string;
  title: string;
  message: string;
  link_url?: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'course' | 'assignment' | 'quiz' | 'grade' | 'message' | 'system' | 'announcement' | 'achievement';
  related_resource_type?: string | null;
  related_resource_id?: string | null;
  scheduled_at?: Date | null;
  sent_at?: Date | null;
  expires_at?: Date | null;
  metadata?: Record<string, unknown> | null;
  is_broadcast: boolean;
  total_recipients: number;
  read_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationCreationAttributes extends Optional<
  NotificationAttributes,
  'id' | 'created_at' | 'updated_at' |
  'sender_id' | 'link_url' |
  'priority' | 'category' |
  'related_resource_type' | 'related_resource_id' |
  'scheduled_at' | 'sent_at' | 'expires_at' |
  'metadata' | 'is_broadcast' |
  'total_recipients' | 'read_count'
> {}

export interface NotificationInstance extends Model, NotificationAttributes {}

// ===================================
// GRADE MODEL INTERFACES
// ===================================

export interface GradeAttributes {
  id: string;
  user_id: string;
  course_id: string;
  component_id: string;
  score: number;
  max_score: number;
  graded_by: string;
  graded_at: Date;
  feedback?: string;
  created_at: Date;
  updated_at: Date;
}

export interface GradeCreationAttributes extends Optional<GradeAttributes, 'id' | 'created_at' | 'updated_at'> {}

export interface GradeInstance extends Model, GradeAttributes {}

// ===================================
// LIVE SESSION MODEL INTERFACES
// ===================================

export interface LiveSessionAttributes {
  id: string;
  host_user_id: string;
  course_id?: string | null;
  title: string;
  description?: string;
  scheduled_start?: Date | null;
  scheduled_end?: Date | null;
  actual_start?: Date | null;
  actual_end?: Date | null;
  duration_minutes?: number | null;
  meeting_url?: string | null;
  meeting_id?: string | null;
  meeting_password?: string | null;
  platform: string;
  ingest_type: 'webrtc' | 'rtmp';
  webrtc_room_id?: string | null;
  webrtc_config?: Record<string, unknown>;
  viewer_count: number;
  thumbnail_url?: string | null;
  stream_key?: string | null;
  playback_url?: string | null;
  recording_url?: string | null;
  max_participants?: number | null;
  is_public: boolean;
  is_recorded: boolean;
  category?: string | null;
  metadata?: Record<string, unknown>;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface LiveSessionCreationAttributes extends Optional<
  LiveSessionAttributes,
  'id' |
  'created_at' |
  'updated_at' |
  'course_id' |
  'description' |
  'scheduled_start' |
  'scheduled_end' |
  'actual_start' |
  'actual_end' |
  'duration_minutes' |
  'meeting_url' |
  'meeting_id' |
  'meeting_password' |
  'platform' |
  'ingest_type' |
  'webrtc_room_id' |
  'webrtc_config' |
  'viewer_count' |
  'thumbnail_url' |
  'stream_key' |
  'playback_url' |
  'recording_url' |
  'max_participants' |
  'is_public' |
  'is_recorded' |
  'category' |
  'metadata' |
  'status'
> {}

export interface LiveSessionInstance extends Model, LiveSessionAttributes {}

// ===================================
// LIVE SESSION MESSAGE MODEL INTERFACES
// ===================================

export interface LiveSessionMessageAttributes {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'emoji' | 'system';
  reply_to?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface LiveSessionMessageCreationAttributes extends Optional<
  LiveSessionMessageAttributes,
  'id' | 'created_at' | 'updated_at' | 'message_type' | 'reply_to'
> {}

export interface LiveSessionMessageInstance extends Model, LiveSessionMessageAttributes {}

// ===================================
// CHAT MESSAGE MODEL INTERFACES (Supabase Schema)
// ===================================

export interface ChatMessageAttributes {
  id: string;
  course_id: string;
  user_id: string;  // Supabase uses user_id
  content: string;  // Supabase uses content
  message_type: 'text' | 'file' | 'image' | 'system' | 'announcement';
  attachment_url?: string;  // Supabase uses attachment_*
  attachment_name?: string;
  attachment_size?: number;
  attachment_type?: string;
  reply_to_message_id?: string;  // Supabase uses reply_to_message_id
  is_edited: boolean;
  edited_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
  is_pinned?: boolean;
  pinned_at?: Date;
  pinned_by?: string;
  reactions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessageCreationAttributes extends Optional<ChatMessageAttributes, 'id' | 'created_at' | 'updated_at' | 'message_type' | 'is_edited' | 'is_deleted' | 'is_pinned'> {}

export interface ChatMessageInstance extends Model, ChatMessageAttributes {}

// ===================================
// PASSWORD RESET TOKEN MODEL INTERFACES
// ===================================

export interface PasswordResetTokenAttributes {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PasswordResetTokenCreationAttributes extends Optional<PasswordResetTokenAttributes, 'id' | 'created_at' | 'updated_at' | 'used'> {}

export interface PasswordResetTokenInstance extends Model, PasswordResetTokenAttributes {}

// ===================================
// LESSON MATERIAL MODEL INTERFACES
// ===================================

export interface LessonMaterialAttributes {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number;
  file_extension?: string | null;
  description?: string | null;
  download_count: number;
  is_downloadable: boolean;
  uploaded_by?: string | null;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface LessonMaterialCreationAttributes extends Optional<
  LessonMaterialAttributes,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'file_type'
  | 'file_size'
  | 'file_extension'
  | 'description'
  | 'download_count'
  | 'is_downloadable'
  | 'uploaded_by'
  | 'order_index'
  | 'file_url'
> {}

export interface LessonMaterialInstance extends Model, LessonMaterialAttributes {}

// ===================================
// LESSON PROGRESS MODEL INTERFACES
// ===================================

export interface LessonProgressAttributes {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_position: number;
  completion_percentage: number;
  time_spent_seconds: number;
  started_at?: Date;
  completed_at?: Date;
  last_accessed_at?: Date;
  notes?: string;
  bookmarked: boolean;
  quiz_score?: number;
  created_at: Date;
  updated_at: Date;
}

export interface LessonProgressCreationAttributes extends Optional<
  LessonProgressAttributes, 
  'id' | 'created_at' | 'updated_at' | 'completed' | 'last_position' | 'completion_percentage' | 'time_spent_seconds' | 'bookmarked'
> {}

export interface LessonProgressInstance extends Model, LessonProgressAttributes {
  markAsCompleted(): Promise<LessonProgressInstance>;
  updateProgress(data: {
    last_position?: number;
    completion_percentage?: number;
    time_spent_seconds?: number;
  }): Promise<LessonProgressInstance>;
}

// ===================================
// NOTIFICATION RECIPIENT MODEL INTERFACES
// ===================================

export interface NotificationRecipientAttributes {
  id: string;
  notification_id: string;
  recipient_id: string;
  is_read: boolean;
  read_at?: Date | null;
  is_archived: boolean;
  archived_at?: Date | null;
  is_dismissed: boolean;
  dismissed_at?: Date | null;
  clicked_at?: Date | null;
  interaction_data?: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationRecipientCreationAttributes extends Optional<
  NotificationRecipientAttributes,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'is_read'
  | 'read_at'
  | 'is_archived'
  | 'archived_at'
  | 'is_dismissed'
  | 'dismissed_at'
  | 'clicked_at'
  | 'interaction_data'
> {}

export interface NotificationRecipientInstance extends Model, NotificationRecipientAttributes {}

// ===================================
// GRADE COMPONENT MODEL INTERFACES
// ===================================

export interface GradeComponentAttributes {
  id: string;
  course_id: string;
  component_type: 'quiz' | 'assignment' | 'attendance' | 'participation' | 'manual';
  component_id?: string | null;
  name: string;
  weight: number;
  max_score: number;
  description?: string;
  is_active: boolean;
  is_required?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface GradeComponentCreationAttributes extends Optional<GradeComponentAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active'> {}

export interface GradeComponentInstance extends Model, GradeComponentAttributes {}

// ===================================
// FINAL GRADE MODEL INTERFACES
// ===================================

export interface FinalGradeAttributes {
  id: string;
  user_id: string;
  course_id: string;
  final_score?: number;
  letter_grade?: string;
  is_complete?: boolean;
  calculated_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FinalGradeCreationAttributes extends Optional<FinalGradeAttributes, 'id' | 'created_at' | 'updated_at' | 'calculated_at' | 'is_complete'> {}

export interface FinalGradeInstance extends Model, FinalGradeAttributes {}

// ===================================
// LIVE SESSION ATTENDANCE MODEL INTERFACES
// ===================================

export interface LiveSessionAttendanceAttributes {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: Date;
  left_at?: Date;
  duration_minutes?: number;
  created_at: Date;
  updated_at: Date;
}

export interface LiveSessionAttendanceCreationAttributes extends Optional<LiveSessionAttendanceAttributes, 'id' | 'created_at' | 'updated_at'> {}

export interface LiveSessionAttendanceInstance extends Model, LiveSessionAttendanceAttributes {}

// ===================================
// USER ACTIVITY LOG MODEL INTERFACES
// ===================================

export interface UserActivityLogAttributes {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserActivityLogCreationAttributes extends Optional<UserActivityLogAttributes, 'id' | 'created_at' | 'updated_at'> {}

export interface UserActivityLogInstance extends Model, UserActivityLogAttributes {}

// ===================================
// COURSE STATISTICS MODEL INTERFACES
// ===================================

export interface CourseStatisticsAttributes {
  id: string;
  course_id: string;
  total_enrollments: number;
  active_enrollments: number;
  completion_rate?: number;
  average_score?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CourseStatisticsCreationAttributes extends Optional<
  CourseStatisticsAttributes, 
  'id' | 'created_at' | 'updated_at' | 'total_enrollments' | 'active_enrollments'
> {}

export interface CourseStatisticsInstance extends Model, CourseStatisticsAttributes {}

// ===================================
// CONVERSATION MODEL INTERFACES (DM)
// ===================================

export interface ConversationAttributes {
  id: string;
  course_id: string | null; // Nullable for direct messages without course context
  user1_id: string;
  user2_id: string;
  last_message_at?: Date;
  user1_last_read_at?: Date;
  user2_last_read_at?: Date;
  is_archived_by_user1: boolean;
  is_archived_by_user2: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationCreationAttributes extends Optional<
  ConversationAttributes,
  'id' | 'created_at' | 'updated_at' | 'last_message_at' | 'user1_last_read_at' | 'user2_last_read_at' | 'is_archived_by_user1' | 'is_archived_by_user2' | 'course_id'
> {}

export interface ConversationInstance extends Model, ConversationAttributes {
  // Associations (virtual fields from includes)
  user1?: UserInstance;
  user2?: UserInstance;
  course?: CourseInstance;
  messages?: DirectMessageInstance[];
}

// ===================================
// DIRECT MESSAGE MODEL INTERFACES (DM)
// ===================================

export type DirectMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type DMAttachmentType = 'image' | 'file';

export interface DirectMessageAttributes {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  status: DirectMessageStatus;
  attachment_type?: DMAttachmentType;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  is_edited: boolean;
  edited_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DirectMessageCreationAttributes extends Optional<
  DirectMessageAttributes,
  'id' | 'created_at' | 'updated_at' | 'status' | 'is_edited' | 'is_deleted'
> {}

export interface DirectMessageInstance extends Model, DirectMessageAttributes {
  // Associations
  sender?: UserInstance;
  conversation?: ConversationInstance;
}

// ===================================
// CERTIFICATE MODEL INTERFACES
// ===================================

export type CertificateStatus = 'active' | 'revoked' | 'expired';

export interface CertificateAttributes {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id?: string;
  ipfs_hash: string;
  certificate_hash: string;
  metadata: {
    student: {
      id: string;
      name: string;
      email: string;
    };
    course: {
      id: string;
      title: string;
      description?: string;
      instructor: {
        id: string;
        name: string;
      };
      level: string;
      duration?: number;
    };
    completion: {
      date: string;
      grade?: number;
      progress: number;
    };
    certificate: {
      id: string;
      issuedAt: string;
      hash: string;
    };
  };
  certificate_number: string;
  issued_at: Date;
  status: CertificateStatus;
  revoked_at?: Date;
  revoked_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CertificateCreationAttributes extends Optional<
  CertificateAttributes,
  'id' | 'created_at' | 'updated_at' | 'status' | 'enrollment_id' | 'revoked_at' | 'revoked_reason'
> {}

export interface CertificateInstance extends Model, CertificateAttributes {
  // Associations
  user?: UserInstance;
  course?: CourseInstance;
  enrollment?: EnrollmentInstance;
}

// ===================================
// COURSE CHAT READ STATUS MODEL INTERFACES
// ===================================

export interface CourseChatReadStatusAttributes {
  id: string;
  course_id: string;
  user_id: string;
  last_read_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CourseChatReadStatusCreationAttributes extends Optional<
  CourseChatReadStatusAttributes,
  'id' | 'created_at' | 'updated_at'
> {}

export interface CourseChatReadStatusInstance extends Model, CourseChatReadStatusAttributes {
  // Associations
  course?: CourseInstance;
  user?: UserInstance;
}
