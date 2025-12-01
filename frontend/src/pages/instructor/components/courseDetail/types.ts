/**
 * Types for InstructorCourseDetail components
 */

import { Video } from 'lucide-react';

// ================== TYPES ==================
export type TabType = 'overview' | 'curriculum' | 'students' | 'submissions' | 'settings';
export type ContentType = 'video' | 'document' | 'quiz' | 'assignment' | 'text' | 'link';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Lesson {
  id: string;
  title: string;
  content_type: ContentType;
  duration_minutes: number;
  is_preview: boolean;
  order_index: number;
  video_url: string; // URL for video content
  video_file?: File | null; // File video để upload (chỉ dùng trong form)
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  order_index: number;
  isExpanded?: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  enrolled_at: string;
  progress_percent: number;
  last_activity_at: string;
}

export interface Review {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  reply?: string;
  replied_at?: string;
}

/**
 * Submission interface for student assignments/quizzes
 */
export interface Submission {
  id: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  student_mssv?: string; // Mã số sinh viên
  assignment_title: string;
  assignment_type: 'assignment' | 'quiz';
  submitted_at: string; // ISO date string
  is_late: boolean;
  late_duration?: string; // e.g., "2 ngày 3 giờ"
  status: 'pending' | 'graded' | 'missing';
  score?: number;
  max_points: number;
  submission_text?: string;
  file_urls?: string[];
  feedback?: string;
  graded_at?: string;
}

/**
 * Assignment interface for course assignments
 */
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  type: 'assignment' | 'quiz';
  due_date: string; // ISO date string
  max_points: number;
  is_active: boolean;
  created_at: string;
  lesson_id?: string; // Associated lesson if any
  lesson_title?: string;
  section_title?: string;
}

export interface CourseStats {
  total_students: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  completion_rate: number;
  // New fields for enhanced overview
  avg_progress: number; // Average progress percentage
  avg_score: number; // Average score (0-10 scale)
  pending_grading: number; // Number of submissions waiting for grading
  max_students: number; // Maximum capacity
  new_students_this_week: number; // New enrollments this week
}

/**
 * AssignmentStats interface for overview metrics
 */
export interface AssignmentStats {
  total_students: number;
  submitted_count: number;
  pending_grading_count: number;
  average_score: number;
  due_date: string; // ISO date string
  is_overdue: boolean;
  time_remaining?: string; // e.g., "2 ngày còn lại"
}

// ================== NEW TYPES FOR ENHANCED OVERVIEW ==================

/**
 * Activity data point for Student Activity Timeline chart
 */
export interface ActivityDataPoint {
  date: string; // ISO date string
  hours_studied: number; // Total study hours for that day
  sessions_count: number; // Number of learning sessions
}

/**
 * Lesson completion data for drop-off analysis
 */
export interface LessonCompletionData {
  lesson_id: string;
  lesson_title: string;
  section_title: string;
  completion_percentage: number; // 0-100
  total_students: number;
  completed_students: number;
}

/**
 * Recent submission for grading
 */
export interface RecentSubmission {
  id: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  assignment_title: string;
  lesson_title: string;
  submitted_at: string; // ISO date string
  time_ago: string; // Human readable (e.g., "2 hours ago")
}

/**
 * Academic alert for students needing attention
 */
export interface AcademicAlert {
  id: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  alert_type: 'low_progress' | 'missing_deadline' | 'low_score' | 'inactive';
  message: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string; // ISO date string
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  status: CourseStatus;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_free: boolean;
  price?: number;
  created_at: string;
  updated_at: string;
}

// ================== CONSTANTS ==================
export const contentTypeLabels: Record<ContentType, string> = {
  video: 'Video',
  document: 'Tài liệu',
  quiz: 'Bài kiểm tra',
  assignment: 'Bài tập',
  text: 'Văn bản',
  link: 'Liên kết',
};

export const statusLabels: Record<CourseStatus, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  published: { label: 'Đã xuất bản', variant: 'success' },
  draft: { label: 'Bản nháp', variant: 'warning' },
  archived: { label: 'Đã lưu trữ', variant: 'default' },
};
