/**
 * COURSE DTOs - Data Transfer Objects for Course Entity
 */

import { CourseStatus, CourseDifficulty, CourseType } from '../../constants/roles.enum';

// ===================================
// CREATE COURSE DTOs
// ===================================

export interface CreateCourseDTO {
  code: string;
  title: string;
  description: string;
  instructor_id: string;
  category_id?: string;
  difficulty: CourseDifficulty;
  type: CourseType;
  price?: number;
  thumbnail?: string;
  duration_hours?: number;
  prerequisites?: string;
  learning_outcomes?: string;
  max_students?: number;
}

// ===================================
// UPDATE COURSE DTOs
// ===================================

export interface UpdateCourseDTO {
  code?: string;
  title?: string;
  description?: string;
  category_id?: string;
  difficulty?: CourseDifficulty;
  type?: CourseType;
  price?: number;
  thumbnail?: string;
  duration_hours?: number;
  prerequisites?: string;
  learning_outcomes?: string;
  max_students?: number;
  status?: CourseStatus;
}

// ===================================
// RESPONSE DTOs
// ===================================

export interface CourseResponseDTO {
  id: string;
  code: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  category_id?: string;
  difficulty: CourseDifficulty;
  type: CourseType;
  price?: number;
  thumbnail?: string;
  duration_hours?: number;
  prerequisites?: string;
  learning_outcomes?: string;
  max_students?: number;
  status: CourseStatus;
  enrolled_count?: number;
  rating?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CourseListItemDTO {
  id: string;
  code: string;
  title: string;
  thumbnail?: string;
  instructor_id: string;
  difficulty: CourseDifficulty;
  type: CourseType;
  price?: number;
  status: CourseStatus;
  enrolled_count?: number;
  rating?: number;
}

// ===================================
// QUERY/FILTER DTOs
// ===================================

export interface CourseFilterDTO {
  status?: CourseStatus | CourseStatus[];
  difficulty?: CourseDifficulty | CourseDifficulty[];
  type?: CourseType | CourseType[];
  instructor_id?: string;
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
}

// ===================================
// COURSE CONTENT DTOs (Section, Lesson, Material)
// ===================================

export interface CreateSectionDTO {
  title: string;
  description?: string;
  order_index: number;
  is_published?: boolean;
}

export interface UpdateSectionDTO {
  title?: string;
  description?: string;
  order_index?: number;
  is_published?: boolean;
}

export interface CreateLessonDTO {
  title: string;
  description?: string;
  content?: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session';
  video_url?: string;
  duration?: number;
  order_index: number;
  is_published?: boolean;
  is_free?: boolean;
}

export interface UpdateLessonDTO {
  title?: string;
  description?: string;
  content?: string;
  lesson_type?: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session';
  video_url?: string;
  duration?: number;
  order_index?: number;
  is_published?: boolean;
  is_free?: boolean;
}

export interface CreateLessonMaterialDTO {
  file_name: string;          // Required field
  file_url: string;
  file_type?: string;
  file_size?: number;
  description?: string;
  order_index?: number;
}

export interface UpdateLessonMaterialDTO {
  file_name?: string;
  file_type?: string;
  file_url?: string;
  file_size?: number;
  description?: string;
  order_index?: number;
}

export interface UpdateLessonProgressDTO {
  last_position?: number;
  completion_percentage?: number;
  time_spent_seconds?: number;
  notes?: string;
  bookmarked?: boolean;
}

export interface ReorderItemDTO {
  id: string;
  order_index: number;
}
