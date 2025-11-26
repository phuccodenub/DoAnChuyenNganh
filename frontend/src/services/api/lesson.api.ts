import { apiClient } from '../http/client';

/**
 * Lesson Types
 */
export interface Section {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'document' | 'quiz' | 'assignment';
  content_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
  is_completed?: boolean;
  progress_percentage?: number;
}

export interface CourseContent {
  course_id: string;
  course_title: string;
  sections: Section[];
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
}

export interface LessonDetail extends Lesson {
  section: {
    id: string;
    title: string;
  };
  course: {
    id: string;
    title: string;
  };
  next_lesson?: {
    id: string;
    title: string;
    section_id: string;
  };
  prev_lesson?: {
    id: string;
    title: string;
    section_id: string;
  };
}

export interface LessonProgress {
  lesson_id: string;
  user_id: string;
  is_completed: boolean;
  progress_percentage: number;
  time_spent_minutes: number;
  last_position_seconds: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProgressPayload {
  progress_percentage?: number;
  time_spent_minutes?: number;
  last_position_seconds?: number;
  is_completed?: boolean;
}

/**
 * Lesson API Service
 */
export const lessonApi = {
  /**
   * Get course content (all sections and lessons)
   */
  getCourseContent: async (courseId: string): Promise<CourseContent> => {
    const response = await apiClient.get<CourseContent>(
      `/courses/${courseId}/content`
    );
    return response.data;
  },

  /**
   * Get lesson detail by ID
   */
  getLesson: async (lessonId: string): Promise<LessonDetail> => {
    const response = await apiClient.get<LessonDetail>(`/lessons/${lessonId}`);
    return response.data;
  },

  /**
   * Get lesson progress for current user
   */
  getLessonProgress: async (lessonId: string): Promise<LessonProgress> => {
    const response = await apiClient.get<LessonProgress>(
      `/lessons/${lessonId}/progress`
    );
    return response.data;
  },

  /**
   * Update lesson progress
   */
  updateProgress: async (
    lessonId: string,
    data: UpdateProgressPayload
  ): Promise<LessonProgress> => {
    const response = await apiClient.put<LessonProgress>(
      `/lessons/${lessonId}/progress`,
      data
    );
    return response.data;
  },

  /**
   * Mark lesson as complete
   */
  markComplete: async (lessonId: string): Promise<LessonProgress> => {
    const response = await apiClient.post<LessonProgress>(
      `/lessons/${lessonId}/complete`
    );
    return response.data;
  },

  /**
   * Get all sections for a course
   */
  getCourseSections: async (courseId: string): Promise<Section[]> => {
    const response = await apiClient.get<Section[]>(
      `/courses/${courseId}/sections`
    );
    return response.data;
  },

  /**
   * Get section with lessons
   */
  getSection: async (sectionId: string): Promise<Section> => {
    const response = await apiClient.get<Section>(`/sections/${sectionId}`);
    return response.data;
  },
};

export default lessonApi;
