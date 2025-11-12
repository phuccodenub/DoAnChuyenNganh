import { apiClient } from '../http/client';

/**
 * Lesson Types
 */
export interface Section {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  section_id: number;
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
  course_id: number;
  course_title: string;
  sections: Section[];
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
}

export interface LessonDetail extends Lesson {
  section: {
    id: number;
    title: string;
  };
  course: {
    id: number;
    title: string;
  };
  next_lesson?: {
    id: number;
    title: string;
    section_id: number;
  };
  prev_lesson?: {
    id: number;
    title: string;
    section_id: number;
  };
}

export interface LessonProgress {
  lesson_id: number;
  user_id: number;
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
  getCourseContent: async (courseId: number): Promise<CourseContent> => {
    const response = await apiClient.get<CourseContent>(
      `/courses/${courseId}/content`
    );
    return response.data;
  },

  /**
   * Get lesson detail by ID
   */
  getLesson: async (lessonId: number): Promise<LessonDetail> => {
    const response = await apiClient.get<LessonDetail>(`/lessons/${lessonId}`);
    return response.data;
  },

  /**
   * Get lesson progress for current user
   */
  getLessonProgress: async (lessonId: number): Promise<LessonProgress> => {
    const response = await apiClient.get<LessonProgress>(
      `/lessons/${lessonId}/progress`
    );
    return response.data;
  },

  /**
   * Update lesson progress
   */
  updateProgress: async (
    lessonId: number,
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
  markComplete: async (lessonId: number): Promise<LessonProgress> => {
    const response = await apiClient.post<LessonProgress>(
      `/lessons/${lessonId}/complete`
    );
    return response.data;
  },

  /**
   * Get all sections for a course
   */
  getCourseSections: async (courseId: number): Promise<Section[]> => {
    const response = await apiClient.get<Section[]>(
      `/courses/${courseId}/sections`
    );
    return response.data;
  },

  /**
   * Get section with lessons
   */
  getSection: async (sectionId: number): Promise<Section> => {
    const response = await apiClient.get<Section>(`/sections/${sectionId}`);
    return response.data;
  },
};

export default lessonApi;
