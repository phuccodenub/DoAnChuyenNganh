/**
 * Course Content Module Types
 * Type definitions for course content management (Sections, Lessons, Materials, Progress)
 */

// ===== SECTION TYPES =====
export interface SectionInput {
  title: string;
  description?: string;
  order_index: number;
  is_published?: boolean;
  duration_minutes?: number;
  objectives?: string[];
}

export interface SectionWithLessons {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_published: boolean;
  duration_minutes?: number;
  objectives?: string[];
  lessons?: LessonWithMaterials[];
  created_at: Date;
  updated_at: Date;
}

// ===== LESSON TYPES =====
export interface LessonInput {
  title: string;
  description?: string;
  content_type: 'video' | 'document' | 'text' | 'link' | 'quiz' | 'assignment';
  content?: string;
  video_url?: string;
  video_duration?: number;
  order_index: number;
  duration_minutes?: number;
  is_published?: boolean;
  is_free_preview?: boolean;
  completion_criteria?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface LessonWithMaterials {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  content_type: string;
  content?: string;
  video_url?: string;
  video_duration?: number;
  order_index: number;
  duration_minutes?: number;
  is_published: boolean;
  is_free_preview: boolean;
  completion_criteria?: Record<string, any>;
  metadata?: Record<string, any>;
  materials?: LessonMaterialInfo[];
  created_at: Date;
  updated_at: Date;
}

// ===== LESSON MATERIAL TYPES =====
export interface LessonMaterialInput {
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  file_extension?: string;
  description?: string;
  is_downloadable?: boolean;
  order_index?: number;
}

export interface LessonMaterialInfo {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  file_extension?: string;
  description?: string;
  download_count: number;
  is_downloadable: boolean;
  uploaded_by?: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

// ===== LESSON PROGRESS TYPES =====
export interface LessonProgressInput {
  last_position?: number;
  completion_percentage?: number;
  time_spent_seconds?: number;
  notes?: string;
  bookmarked?: boolean;
}

export interface LessonProgressInfo {
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

export interface CourseProgressSummary {
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  total_time_spent_seconds: number;
  last_accessed_at?: Date;
  sections: SectionProgressInfo[];
}

export interface SectionProgressInfo {
  section_id: string;
  section_title: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
}

// ===== COURSE CONTENT OVERVIEW =====
export interface CourseContentOverview {
  course_id: string;
  total_sections: number;
  total_lessons: number;
  total_duration_minutes: number;
  total_materials: number;
  sections: SectionWithLessons[];
}

// ===== REORDER TYPES =====
export interface ReorderItem {
  id: string;
  order_index: number;
}







