import { Model, Optional } from 'sequelize';

// ===================================
// USER MODEL INTERFACES
// ===================================

export interface UserAttributes {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  is_email_verified: boolean;
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

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'token_version' | 'is_email_verified'> {}

// Model definition attributes (without timestamps as Sequelize adds them automatically)
export interface UserModelAttributes extends Omit<UserAttributes, 'created_at' | 'updated_at'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

// ===================================
// COURSE MODEL INTERFACES
// ===================================

export interface CourseAttributes {
  id: string;
  title: string;
  description?: string;
  instructor_id: string;
  category_id?: string;
  status: 'draft' | 'published' | 'archived';
  start_date?: Date;
  end_date?: Date;
  max_students: number;
  thumbnail_url?: string;
  tags?: string[];
  settings?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface CourseCreationAttributes extends Optional<CourseAttributes, 'id' | 'created_at' | 'updated_at' | 'max_students' | 'status'> {}

export interface CourseInstance extends Model<CourseAttributes, CourseCreationAttributes>, CourseAttributes {}

// ===================================
// QUIZ MODEL INTERFACES
// ===================================

export interface QuizAttributes {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  instructions?: string;
  time_limit?: number;
  max_attempts?: number;
  passing_score?: number;
  is_published: boolean;
  show_results: boolean;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QuizCreationAttributes extends Optional<QuizAttributes, 'id' | 'created_at' | 'updated_at' | 'is_published' | 'show_results' | 'shuffle_questions' | 'shuffle_options'> {}

export interface QuizInstance extends Model<QuizAttributes, QuizCreationAttributes>, QuizAttributes {}

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

export interface QuizQuestionInstance extends Model<QuizQuestionAttributes, QuizQuestionCreationAttributes>, QuizQuestionAttributes {}

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

export interface QuizOptionInstance extends Model<QuizOptionAttributes, QuizOptionCreationAttributes>, QuizOptionAttributes {}

// ===================================
// QUIZ ATTEMPT MODEL INTERFACES
// ===================================

export interface QuizAttemptAttributes {
  id: string;
  quiz_id: string;
  user_id: string;
  attempt_number: number;
  started_at: Date;
  submitted_at?: Date;
  score?: number;
  total_points?: number;
  is_completed: boolean;
  time_spent?: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuizAttemptCreationAttributes extends Optional<QuizAttemptAttributes, 'id' | 'created_at' | 'updated_at' | 'is_completed'> {}

export interface QuizAttemptInstance extends Model<QuizAttemptAttributes, QuizAttemptCreationAttributes>, QuizAttemptAttributes {}

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

export interface QuizAnswerInstance extends Model<QuizAnswerAttributes, QuizAnswerCreationAttributes>, QuizAnswerAttributes {}

// ===================================
// ASSIGNMENT MODEL INTERFACES
// ===================================

export interface AssignmentAttributes {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  max_score: number;
  due_date?: Date;
  allow_late_submission: boolean;
  submission_type: 'file' | 'text' | 'both';
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AssignmentCreationAttributes extends Optional<AssignmentAttributes, 'id' | 'created_at' | 'updated_at' | 'max_score' | 'allow_late_submission' | 'is_published'> {}

export interface AssignmentInstance extends Model<AssignmentAttributes, AssignmentCreationAttributes>, AssignmentAttributes {}

// ===================================
// ASSIGNMENT SUBMISSION MODEL INTERFACES
// ===================================

export interface AssignmentSubmissionAttributes {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_text?: string;
  file_urls?: string[];
  submitted_at: Date;
  score?: number;
  feedback?: string;
  graded_at?: Date;
  graded_by?: string;
  is_late: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AssignmentSubmissionCreationAttributes extends Optional<AssignmentSubmissionAttributes, 'id' | 'created_at' | 'updated_at' | 'is_late'> {}

export interface AssignmentSubmissionInstance extends Model<AssignmentSubmissionAttributes, AssignmentSubmissionCreationAttributes>, AssignmentSubmissionAttributes {}

// ===================================
// ENROLLMENT MODEL INTERFACES
// ===================================

export interface EnrollmentAttributes {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: Date;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress: number;
  completion_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface EnrollmentCreationAttributes extends Optional<EnrollmentAttributes, 'id' | 'created_at' | 'updated_at' | 'status' | 'progress'> {}

export interface EnrollmentInstance extends Model<EnrollmentAttributes, EnrollmentCreationAttributes>, EnrollmentAttributes {}

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

export interface CategoryInstance extends Model<CategoryAttributes, CategoryCreationAttributes>, CategoryAttributes {
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

export interface SectionInstance extends Model<SectionAttributes, SectionCreationAttributes>, SectionAttributes {}

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

export interface LessonInstance extends Model<LessonAttributes, LessonCreationAttributes>, LessonAttributes {}

// ===================================
// NOTIFICATION MODEL INTERFACES
// ===================================

export interface NotificationAttributes {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender_id?: string;
  target_audience: 'all' | 'students' | 'instructors' | 'admins' | 'specific';
  course_id?: string;
  action_url?: string;
  expires_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active'> {}

export interface NotificationInstance extends Model<NotificationAttributes, NotificationCreationAttributes>, NotificationAttributes {}

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

export interface GradeInstance extends Model<GradeAttributes, GradeCreationAttributes>, GradeAttributes {}

// ===================================
// LIVE SESSION MODEL INTERFACES
// ===================================

export interface LiveSessionAttributes {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  scheduled_start: Date;
  scheduled_end: Date;
  actual_start?: Date;
  actual_end?: Date;
  meeting_url?: string;
  recording_url?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  max_participants?: number;
  created_at: Date;
  updated_at: Date;
}

export interface LiveSessionCreationAttributes extends Optional<LiveSessionAttributes, 'id' | 'created_at' | 'updated_at' | 'status'> {}

export interface LiveSessionInstance extends Model<LiveSessionAttributes, LiveSessionCreationAttributes>, LiveSessionAttributes {}

// ===================================
// CHAT MESSAGE MODEL INTERFACES
// ===================================

export interface ChatMessageAttributes {
  id: string;
  course_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'file' | 'image' | 'system' | 'announcement';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to?: string;
  is_edited: boolean;
  edited_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessageCreationAttributes extends Optional<ChatMessageAttributes, 'id' | 'created_at' | 'updated_at' | 'message_type' | 'is_edited' | 'is_deleted'> {}

export interface ChatMessageInstance extends Model<ChatMessageAttributes, ChatMessageCreationAttributes>, ChatMessageAttributes {}

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

export interface PasswordResetTokenInstance extends Model<PasswordResetTokenAttributes, PasswordResetTokenCreationAttributes>, PasswordResetTokenAttributes {}

// ===================================
// LESSON MATERIAL MODEL INTERFACES
// ===================================

export interface LessonMaterialAttributes {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  is_downloadable: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface LessonMaterialCreationAttributes extends Optional<LessonMaterialAttributes, 'id' | 'created_at' | 'updated_at' | 'is_downloadable'> {}

export interface LessonMaterialInstance extends Model<LessonMaterialAttributes, LessonMaterialCreationAttributes>, LessonMaterialAttributes {}

// ===================================
// LESSON PROGRESS MODEL INTERFACES
// ===================================

export interface LessonProgressAttributes {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent?: number;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface LessonProgressCreationAttributes extends Optional<LessonProgressAttributes, 'id' | 'created_at' | 'updated_at' | 'status' | 'progress_percentage'> {}

export interface LessonProgressInstance extends Model<LessonProgressAttributes, LessonProgressCreationAttributes>, LessonProgressAttributes {}

// ===================================
// NOTIFICATION RECIPIENT MODEL INTERFACES
// ===================================

export interface NotificationRecipientAttributes {
  id: string;
  notification_id: string;
  user_id: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationRecipientCreationAttributes extends Optional<NotificationRecipientAttributes, 'id' | 'created_at' | 'updated_at' | 'is_read'> {}

export interface NotificationRecipientInstance extends Model<NotificationRecipientAttributes, NotificationRecipientCreationAttributes>, NotificationRecipientAttributes {}

// ===================================
// GRADE COMPONENT MODEL INTERFACES
// ===================================

export interface GradeComponentAttributes {
  id: string;
  course_id: string;
  name: string;
  weight: number;
  max_score: number;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface GradeComponentCreationAttributes extends Optional<GradeComponentAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active'> {}

export interface GradeComponentInstance extends Model<GradeComponentAttributes, GradeComponentCreationAttributes>, GradeComponentAttributes {}

// ===================================
// FINAL GRADE MODEL INTERFACES
// ===================================

export interface FinalGradeAttributes {
  id: string;
  user_id: string;
  course_id: string;
  final_score: number;
  letter_grade?: string;
  gpa_points?: number;
  calculated_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FinalGradeCreationAttributes extends Optional<FinalGradeAttributes, 'id' | 'created_at' | 'updated_at'> {}

export interface FinalGradeInstance extends Model<FinalGradeAttributes, FinalGradeCreationAttributes>, FinalGradeAttributes {}

// ===================================
// LIVE SESSION ATTENDANCE MODEL INTERFACES
// ===================================

export interface LiveSessionAttendanceAttributes {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: Date;
  left_at?: Date;
  duration?: number;
  created_at: Date;
  updated_at: Date;
}

export interface LiveSessionAttendanceCreationAttributes extends Optional<LiveSessionAttendanceAttributes, 'id' | 'created_at' | 'updated_at'> {}

export interface LiveSessionAttendanceInstance extends Model<LiveSessionAttendanceAttributes, LiveSessionAttendanceCreationAttributes>, LiveSessionAttendanceAttributes {}

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

export interface UserActivityLogInstance extends Model<UserActivityLogAttributes, UserActivityLogCreationAttributes>, UserActivityLogAttributes {}

// ===================================
// COURSE STATISTICS MODEL INTERFACES
// ===================================

export interface CourseStatisticsAttributes {
  id: string;
  course_id: string;
  total_students: number;
  active_students: number;
  completion_rate: number;
  average_score?: number;
  total_lessons: number;
  total_quizzes: number;
  total_assignments: number;
  last_updated: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CourseStatisticsCreationAttributes extends Optional<CourseStatisticsAttributes, 'id' | 'created_at' | 'updated_at' | 'total_students' | 'active_students' | 'completion_rate' | 'total_lessons' | 'total_quizzes' | 'total_assignments'> {}

export interface CourseStatisticsInstance extends Model<CourseStatisticsAttributes, CourseStatisticsCreationAttributes>, CourseStatisticsAttributes {}

