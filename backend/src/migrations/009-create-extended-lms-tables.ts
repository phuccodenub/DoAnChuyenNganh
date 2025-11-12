/**
 * Migration 009: Create extended LMS tables and alter existing ones
 */

import { QueryInterface, DataTypes } from 'sequelize';

// Helper to add index safely (ignore if already exists or column doesn't exist)
async function addIndexSafe(
  queryInterface: QueryInterface,
  table: string,
  columns: string[],
  options?: { name?: string; unique?: boolean }
): Promise<void> {
  try {
    await queryInterface.addIndex(table, columns, options);
  } catch (error: any) {
    // Ignore if index already exists (code 42P07) or column doesn't exist (code 42703)
    if (error?.parent?.code !== '42P07' && error?.parent?.code !== '42703') {
      throw error;
    }
  }
}

export async function createExtendedLmsTables(queryInterface: QueryInterface): Promise<void> {
  // 1) Categories
  try {
    await queryInterface.createTable('categories', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      parent_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'categories', key: 'id' }, onDelete: 'CASCADE' },
      icon: { type: DataTypes.STRING(100), allowNull: true },
      color: { type: DataTypes.STRING(20), allowNull: true },
      order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      course_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      metadata: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });
  } catch (error: any) {
    // Table may already exist
    if (error?.parent?.code !== '42P07') {
      throw error;
    }
  }
  await addIndexSafe(queryInterface, 'categories', ['slug']);
  await addIndexSafe(queryInterface, 'categories', ['parent_id']);
  await addIndexSafe(queryInterface, 'categories', ['is_active']);
  await addIndexSafe(queryInterface, 'categories', ['order_index']);

  // 2) Alter courses: add category_id
  try {
    await queryInterface.addColumn('courses', 'category_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'categories', key: 'id' },
      onDelete: 'SET NULL',
      comment: 'Danh mục của khóa học'
    } as any);
    await addIndexSafe(queryInterface, 'courses', ['category_id']);
  } catch (_) {
    // Column may already exist in some environments
  }

  // 3) Sections
  await queryInterface.createTable('sections', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    course_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
    objectives: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'sections', ['course_id']);
  await addIndexSafe(queryInterface,'sections', ['course_id', 'order_index'], { unique: true, name: 'unique_section_order_per_course' });

  // 4) Lessons
  await queryInterface.createTable('lessons', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    section_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'sections', key: 'id' }, onDelete: 'CASCADE' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    content_type: { type: DataTypes.ENUM('video', 'document', 'text', 'link', 'quiz', 'assignment'), allowNull: false, defaultValue: 'text' },
    content: { type: DataTypes.TEXT, allowNull: true },
    video_url: { type: DataTypes.TEXT, allowNull: true },
    video_duration: { type: DataTypes.INTEGER, allowNull: true },
    order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_free_preview: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    completion_criteria: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    metadata: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'lessons', ['section_id']);
  await addIndexSafe(queryInterface,'lessons', ['section_id', 'order_index'], { unique: true, name: 'unique_lesson_order_per_section' });
  await addIndexSafe(queryInterface,'lessons', ['content_type']);

  // 5) Lesson Materials
  await queryInterface.createTable('lesson_materials', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    lesson_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'lessons', key: 'id' }, onDelete: 'CASCADE' },
    file_name: { type: DataTypes.STRING(255), allowNull: false },
    file_url: { type: DataTypes.TEXT, allowNull: false },
    file_type: { type: DataTypes.STRING(50), allowNull: true },
    file_size: { type: DataTypes.BIGINT, allowNull: true },
    file_extension: { type: DataTypes.STRING(10), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    download_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_downloadable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    uploaded_by: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
    order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'lesson_materials', ['lesson_id']);
  await addIndexSafe(queryInterface,'lesson_materials', ['uploaded_by']);
  await addIndexSafe(queryInterface,'lesson_materials', ['file_type']);

  // 6) Lesson Progress
  await queryInterface.createTable('lesson_progress', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    lesson_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'lessons', key: 'id' }, onDelete: 'CASCADE' },
    completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    last_position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    completion_percentage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    time_spent_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    started_at: { type: DataTypes.DATE, allowNull: true },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    last_accessed_at: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    bookmarked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    quiz_score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'lesson_progress', ['user_id']);
  await addIndexSafe(queryInterface,'lesson_progress', ['lesson_id']);
  await addIndexSafe(queryInterface,'lesson_progress', ['user_id', 'lesson_id'], { unique: true, name: 'unique_user_lesson_progress' });
  await addIndexSafe(queryInterface,'lesson_progress', ['completed']);
  await addIndexSafe(queryInterface,'lesson_progress', ['last_accessed_at']);

  // 7) Notifications
  await queryInterface.createTable('notifications', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    sender_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
    notification_type: { type: DataTypes.STRING(50), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    link_url: { type: DataTypes.TEXT, allowNull: true },
    priority: { type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'), allowNull: false, defaultValue: 'normal' },
    category: { type: DataTypes.ENUM('course', 'assignment', 'quiz', 'grade', 'message', 'system', 'announcement'), allowNull: false, defaultValue: 'system' },
    related_resource_type: { type: DataTypes.STRING(50), allowNull: true },
    related_resource_id: { type: DataTypes.UUID, allowNull: true },
    scheduled_at: { type: DataTypes.DATE, allowNull: true },
    sent_at: { type: DataTypes.DATE, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    is_broadcast: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    total_recipients: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    read_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'notifications', ['sender_id']);
  await addIndexSafe(queryInterface,'notifications', ['notification_type']);
  await addIndexSafe(queryInterface,'notifications', ['category']);
  await addIndexSafe(queryInterface,'notifications', ['priority']);
  await addIndexSafe(queryInterface,'notifications', ['scheduled_at']);
  await addIndexSafe(queryInterface,'notifications', ['sent_at']);
  await addIndexSafe(queryInterface,'notifications', ['related_resource_type', 'related_resource_id']);
  await addIndexSafe(queryInterface,'notifications', ['created_at']);

  // 8) Notification Recipients
  await queryInterface.createTable('notification_recipients', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    notification_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'notifications', key: 'id' }, onDelete: 'CASCADE' },
    recipient_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    read_at: { type: DataTypes.DATE, allowNull: true },
    is_archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    archived_at: { type: DataTypes.DATE, allowNull: true },
    is_dismissed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    dismissed_at: { type: DataTypes.DATE, allowNull: true },
    clicked_at: { type: DataTypes.DATE, allowNull: true },
    interaction_data: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'notification_recipients', ['notification_id', 'recipient_id'], { unique: true, name: 'unique_notification_recipient' });
  await addIndexSafe(queryInterface,'notification_recipients', ['recipient_id']);
  await addIndexSafe(queryInterface,'notification_recipients', ['notification_id']);
  await addIndexSafe(queryInterface,'notification_recipients', ['is_read']);
  await addIndexSafe(queryInterface,'notification_recipients', ['recipient_id', 'is_read'], { name: 'recipient_read_status' });
  await addIndexSafe(queryInterface,'notification_recipients', ['recipient_id', 'is_read', 'is_archived'], { name: 'recipient_active_unread' });
  await addIndexSafe(queryInterface,'notification_recipients', ['created_at']);

  // 9) Quizzes
  await queryInterface.createTable('quizzes', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    course_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
    passing_score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    max_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    shuffle_questions: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    show_correct_answers: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    available_from: { type: DataTypes.DATE, allowNull: true },
    available_until: { type: DataTypes.DATE, allowNull: true },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'quizzes', ['course_id']);
  await addIndexSafe(queryInterface,'quizzes', ['available_from']);
  await addIndexSafe(queryInterface,'quizzes', ['available_until']);

  // 10) Quiz Questions
  await queryInterface.createTable('quiz_questions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    quiz_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'quizzes', key: 'id' }, onDelete: 'CASCADE' },
    question_text: { type: DataTypes.TEXT, allowNull: false },
    question_type: { type: DataTypes.ENUM('single_choice', 'multiple_choice', 'true_false'), allowNull: false },
    points: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 1.0 },
    order_index: { type: DataTypes.INTEGER, allowNull: false },
    explanation: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'quiz_questions', ['quiz_id']);
  await addIndexSafe(queryInterface,'quiz_questions', ['quiz_id', 'order_index'], { unique: true });

  // 11) Quiz Options
  await queryInterface.createTable('quiz_options', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    question_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
    option_text: { type: DataTypes.TEXT, allowNull: false },
    is_correct: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    order_index: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'quiz_options', ['question_id']);

  // 12) Quiz Attempts
  await queryInterface.createTable('quiz_attempts', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    quiz_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'quizzes', key: 'id' }, onDelete: 'CASCADE' },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    attempt_number: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    max_score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    submitted_at: { type: DataTypes.DATE, allowNull: true },
    time_spent_minutes: { type: DataTypes.INTEGER, allowNull: true },
    is_passed: { type: DataTypes.BOOLEAN, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'quiz_attempts', ['quiz_id']);
  await addIndexSafe(queryInterface,'quiz_attempts', ['user_id']);
  await addIndexSafe(queryInterface,'quiz_attempts', ['quiz_id', 'user_id', 'attempt_number'], { unique: true });

  // 13) Quiz Answers
  await queryInterface.createTable('quiz_answers', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    attempt_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'quiz_attempts', key: 'id' }, onDelete: 'CASCADE' },
    question_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
    selected_option_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'quiz_options', key: 'id' } },
    selected_options: { type: DataTypes.JSON, allowNull: true },
    is_correct: { type: DataTypes.BOOLEAN, allowNull: true },
    points_earned: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'quiz_answers', ['attempt_id']);
  await addIndexSafe(queryInterface,'quiz_answers', ['attempt_id', 'question_id'], { unique: true });

  // 14) Assignments
  await queryInterface.createTable('assignments', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    course_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    max_score: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 100.0 },
    due_date: { type: DataTypes.DATE, allowNull: true },
    allow_late_submission: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    submission_type: { type: DataTypes.ENUM('file', 'text', 'both'), allowNull: false },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'assignments', ['course_id']);
  await addIndexSafe(queryInterface,'assignments', ['due_date']);

  // 15) Assignment Submissions
  await queryInterface.createTable('assignment_submissions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    assignment_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'assignments', key: 'id' }, onDelete: 'CASCADE' },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    submission_text: { type: DataTypes.TEXT, allowNull: true },
    file_url: { type: DataTypes.TEXT, allowNull: true },
    file_name: { type: DataTypes.STRING(255), allowNull: true },
    submitted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    graded_by: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
    graded_at: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.ENUM('submitted', 'graded', 'returned'), allowNull: false, defaultValue: 'submitted' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'assignment_submissions', ['assignment_id']);
  await addIndexSafe(queryInterface,'assignment_submissions', ['user_id']);
  await addIndexSafe(queryInterface,'assignment_submissions', ['assignment_id', 'user_id'], { unique: true });

  // 16) Grade Components
  await queryInterface.createTable('grade_components', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    course_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
    component_type: { type: DataTypes.ENUM('quiz', 'assignment', 'attendance', 'participation', 'manual'), allowNull: false },
    component_id: { type: DataTypes.UUID, allowNull: true },
    weight: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'grade_components', ['course_id']);
  await addIndexSafe(queryInterface,'grade_components', ['component_type']);

  // 17) Grades
  await queryInterface.createTable('grades', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    course_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
    component_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'grade_components', key: 'id' }, onDelete: 'CASCADE' },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    max_score: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    graded_by: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
    graded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'grades', ['user_id']);
  await addIndexSafe(queryInterface,'grades', ['course_id']);
  await addIndexSafe(queryInterface,'grades', ['component_id']);

  // 18) Final Grades
  await queryInterface.createTable('final_grades', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    course_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
    total_score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    letter_grade: { type: DataTypes.STRING(2), allowNull: true },
    calculated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'final_grades', ['user_id']);
  await addIndexSafe(queryInterface,'final_grades', ['course_id']);
  await addIndexSafe(queryInterface,'final_grades', ['user_id', 'course_id'], { unique: true });

  // 19) Live Sessions
  await queryInterface.createTable('live_sessions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    course_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
    instructor_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    scheduled_at: { type: DataTypes.DATE, allowNull: false },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
    meeting_url: { type: DataTypes.TEXT, allowNull: true },
    meeting_id: { type: DataTypes.STRING(100), allowNull: true },
    meeting_password: { type: DataTypes.STRING(100), allowNull: true },
    status: { type: DataTypes.ENUM('scheduled', 'live', 'ended', 'cancelled'), allowNull: false, defaultValue: 'scheduled' },
    recording_url: { type: DataTypes.TEXT, allowNull: true },
    started_at: { type: DataTypes.DATE, allowNull: true },
    ended_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'live_sessions', ['course_id']);
  await addIndexSafe(queryInterface,'live_sessions', ['instructor_id']);
  await addIndexSafe(queryInterface,'live_sessions', ['scheduled_at']);
  await addIndexSafe(queryInterface,'live_sessions', ['status']);

  // 20) Live Session Attendance
  await queryInterface.createTable('live_session_attendance', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    session_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'live_sessions', key: 'id' }, onDelete: 'CASCADE' },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    joined_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    left_at: { type: DataTypes.DATE, allowNull: true },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'live_session_attendance', ['session_id']);
  await addIndexSafe(queryInterface,'live_session_attendance', ['user_id']);
  await addIndexSafe(queryInterface,'live_session_attendance', ['session_id', 'user_id'], { unique: true });

  // 21) User Activity Logs
  await queryInterface.createTable('user_activity_logs', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
    activity_type: { type: DataTypes.STRING(50), allowNull: false },
    activity_description: { type: DataTypes.TEXT, allowNull: true },
    ip_address: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.TEXT, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'user_activity_logs', ['user_id']);
  await addIndexSafe(queryInterface,'user_activity_logs', ['activity_type']);
  await addIndexSafe(queryInterface,'user_activity_logs', ['created_at']);

  // 22) Course Statistics (1-1 with courses)
  await queryInterface.createTable('course_statistics', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    course_id: { type: DataTypes.UUID, allowNull: false, unique: true, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE' },
    total_enrollments: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active_enrollments: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    completion_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    average_score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'course_statistics', ['course_id'], { unique: true });

  // 23) Password Reset Tokens
  await queryInterface.createTable('password_reset_tokens', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    ip_address: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });
  await addIndexSafe(queryInterface,'password_reset_tokens', ['user_id']);
  await addIndexSafe(queryInterface,'password_reset_tokens', ['token']);
  await addIndexSafe(queryInterface,'password_reset_tokens', ['expires_at']);
  await addIndexSafe(queryInterface,'password_reset_tokens', ['token', 'used', 'expires_at']);
}

export async function dropExtendedLmsTables(queryInterface: QueryInterface): Promise<void> {
  // Drop in reverse dependency order
  await queryInterface.dropTable('password_reset_tokens');
  await queryInterface.dropTable('course_statistics');
  await queryInterface.dropTable('user_activity_logs');
  await queryInterface.dropTable('live_session_attendance');
  await queryInterface.dropTable('live_sessions');
  await queryInterface.dropTable('final_grades');
  await queryInterface.dropTable('grades');
  await queryInterface.dropTable('grade_components');
  await queryInterface.dropTable('assignment_submissions');
  await queryInterface.dropTable('assignments');
  await queryInterface.dropTable('quiz_answers');
  await queryInterface.dropTable('quiz_attempts');
  await queryInterface.dropTable('quiz_options');
  await queryInterface.dropTable('quiz_questions');
  await queryInterface.dropTable('quizzes');
  await queryInterface.dropTable('notification_recipients');
  await queryInterface.dropTable('notifications');
  await queryInterface.dropTable('lesson_progress');
  await queryInterface.dropTable('lesson_materials');
  await queryInterface.dropTable('lessons');
  await queryInterface.dropTable('sections');

  // Alter courses: remove category_id if exists
  try {
    await queryInterface.removeColumn('courses', 'category_id');
  } catch (_) {
    // ignore
  }

  await queryInterface.dropTable('categories');
}


























