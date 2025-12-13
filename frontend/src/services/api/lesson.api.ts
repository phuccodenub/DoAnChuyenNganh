import { apiClient } from '../http/client';

/**
 * Course Content API prefix
 * Backend mounts course-content routes under /course-content
 */
const COURSE_CONTENT_PREFIX = '/course-content';

/**
 * API Response wrapper from backend
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Lesson Material Types (matches backend LessonMaterialInfo)
 */
export interface LessonMaterial {
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
  created_at: string;
  updated_at: string;
}

/**
 * Lesson Types (matches backend LessonWithMaterials)
 */
export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description?: string | null;
  content_type: 'video' | 'document' | 'text' | 'link' | 'quiz' | 'assignment';
  content?: string | null;
  video_url?: string | null;
  video_duration?: number | null;
  order_index: number;
  duration_minutes?: number | null;
  is_published: boolean;
  is_free_preview: boolean;
  completion_criteria?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  materials?: LessonMaterial[];
  is_practice?: boolean; // true for practice quiz/assignment, false for graded
  // Liên kết tới quiz/assignment tương ứng (nếu có)
  quiz_id?: string;
  assignment_id?: string;
  created_at: string;
  updated_at: string;
  // Progress fields (added when fetching with progress)
  is_completed?: boolean;
  progress_percentage?: number;
}

/**
 * Section Types (matches backend SectionWithLessons)
 */
export interface Section {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  is_published: boolean;
  duration_minutes?: number;
  objectives?: string[];
  lessons?: Lesson[];
  // Quiz và Assignment độc lập trong section (không phải lesson)
  quizzes?: any[]; // Quiz cấp section
  assignments?: any[]; // Assignment cấp section
  created_at: string;
  updated_at: string;
}

/**
 * Course Content Overview (matches backend CourseContentOverview)
 */
export interface CourseContent {
  course_id: string;
  total_sections: number;
  total_lessons: number;
  total_duration_minutes: number;
  total_materials: number;
  sections: Section[];
  // Quiz và Assignment độc lập (không phải lesson)
  course_level_quizzes?: any[]; // Quiz cấp course
  course_level_assignments?: any[]; // Assignment cấp course
  // Progress fields (added when user is enrolled)
  completed_lessons?: number;
  progress_percentage?: number;
}

/**
 * Lesson Detail with navigation
 */
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

/**
 * Lesson Progress (matches backend LessonProgressInfo)
 */
export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_position: number;
  completion_percentage: number;
  time_spent_seconds: number;
  started_at?: string | null;
  completed_at?: string | null;
  last_accessed_at?: string | null;
  notes?: string;
  bookmarked: boolean;
  quiz_score?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Update Progress Payload (matches backend LessonProgressInput)
 */
export interface UpdateProgressPayload {
  last_position?: number;
  completion_percentage?: number;
  time_spent_seconds?: number;
  notes?: string;
  bookmarked?: boolean;
}

/**
 * Course Progress Summary (matches backend CourseProgressSummary)
 */
export interface CourseProgressSummary {
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  total_time_spent_seconds: number;
  last_accessed_at?: string;
  sections: SectionProgressInfo[];
}

/**
 * Lesson Progress Info
 */
export interface LessonProgressInfo {
  lesson_id: string;
  lesson_title: string;
  completion_percentage: number;
  is_completed: boolean;
}

export interface LessonBookmark {
  lesson_id: string;
  lesson_title: string;
  lesson_order: number;
  content_type: string;
  section_id: string;
  section_title: string;
  section_order: number;
  bookmarked_at?: string;
}

/**
 * Section Progress Info
 */
export interface SectionProgressInfo {
  section_id: string;
  section_title: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  lessons: LessonProgressInfo[];
}

/**
 * Lesson API Service
 * All course-content related endpoints use /course-content prefix
 * Backend returns { success, message, data } - we unwrap to get data directly
 */
export const lessonApi = {
  /**
   * Get course content (all sections and lessons)
   * GET /course-content/courses/:courseId/content
   */
  getCourseContent: async (courseId: string): Promise<CourseContent> => {
    const response = await apiClient.get<ApiResponse<CourseContent>>(
      `${COURSE_CONTENT_PREFIX}/courses/${courseId}/content`
    );
    return response.data.data;
  },

  /**
   * Get lesson detail by ID
   * GET /course-content/lessons/:lessonId
   */
  getLesson: async (lessonId: string): Promise<LessonDetail> => {
    const response = await apiClient.get<ApiResponse<LessonDetail>>(
      // Thêm query param để tránh cache 304 trong quá trình phát triển
      `${COURSE_CONTENT_PREFIX}/lessons/${lessonId}?ts=${Date.now()}`
    );
    return response.data.data;
  },

  /**
   * Get lesson progress for current user
   * GET /course-content/lessons/:lessonId/progress
   */
  getLessonProgress: async (lessonId: string): Promise<LessonProgress> => {
    const response = await apiClient.get<ApiResponse<LessonProgress>>(
      `${COURSE_CONTENT_PREFIX}/lessons/${lessonId}/progress`
    );
    return response.data.data;
  },

  /**
   * Update lesson progress
   * PUT /course-content/lessons/:lessonId/progress
   */
  updateProgress: async (
    lessonId: string,
    data: UpdateProgressPayload
  ): Promise<LessonProgress> => {
    const response = await apiClient.put<ApiResponse<LessonProgress>>(
      `${COURSE_CONTENT_PREFIX}/lessons/${lessonId}/progress`,
      data
    );
    return response.data.data;
  },

  /**
   * Get bookmarked lessons in a course (current user)
   */
  getCourseBookmarks: async (courseId: string): Promise<LessonBookmark[]> => {
    const response = await apiClient.get<ApiResponse<LessonBookmark[]>>(
      `${COURSE_CONTENT_PREFIX}/courses/${courseId}/bookmarks`
    );
    return response.data.data;
  },

  /**
   * Mark lesson as complete
   * POST /course-content/lessons/:lessonId/complete
   */
  markComplete: async (lessonId: string): Promise<LessonProgress> => {
    const response = await apiClient.post<ApiResponse<LessonProgress>>(
      `${COURSE_CONTENT_PREFIX}/lessons/${lessonId}/complete`
    );
    return response.data.data;
  },

  /**
   * Get all sections for a course
   * GET /course-content/courses/:courseId/sections
   */
  getCourseSections: async (courseId: string): Promise<Section[]> => {
    const response = await apiClient.get<ApiResponse<Section[]>>(
      `${COURSE_CONTENT_PREFIX}/courses/${courseId}/sections`
    );
    return response.data.data;
  },

  /**
   * Get section with lessons
   * GET /course-content/sections/:sectionId
   */
  getSection: async (sectionId: string): Promise<Section> => {
    const response = await apiClient.get<ApiResponse<Section>>(
      `${COURSE_CONTENT_PREFIX}/sections/${sectionId}`
    );
    return response.data.data;
  },

  /**
   * Get course progress summary (for current user)
   * GET /course-content/courses/:courseId/progress
   */
  getCourseProgress: async (courseId: string): Promise<CourseProgressSummary> => {
    const response = await apiClient.get<ApiResponse<CourseProgressSummary>>(
      `${COURSE_CONTENT_PREFIX}/courses/${courseId}/progress`
    );
    return response.data.data;
  },

  /**
   * Get student progress (for instructor)
   * GET /course-content/courses/:courseId/students/:studentId/progress
   */
  getStudentProgress: async (courseId: string, studentId: string): Promise<CourseProgressSummary> => {
    const response = await apiClient.get<ApiResponse<CourseProgressSummary>>(
      `${COURSE_CONTENT_PREFIX}/courses/${courseId}/students/${studentId}/progress`
    );
    return response.data.data;
  },

  /**
   * Track material download
   * POST /course-content/materials/:materialId/download
   */
  trackMaterialDownload: async (materialId: string): Promise<void> => {
    await apiClient.post(
      `${COURSE_CONTENT_PREFIX}/materials/${materialId}/download`
    );
  },

  /**
   * Upload material file (PDF, DOCX, etc.) for a lesson
   * POST /course-content/lessons/:lessonId/materials/upload
   */
  uploadMaterial: async (
    lessonId: string,
    file: File,
    description?: string,
    onProgress?: (progress: number) => void
  ): Promise<LessonMaterial> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post<ApiResponse<LessonMaterial>>(
      `${COURSE_CONTENT_PREFIX}/lessons/${lessonId}/materials/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    return response.data.data;
  },

  /**
   * Delete material
   * DELETE /course-content/materials/:materialId
   */
  deleteMaterial: async (materialId: string): Promise<void> => {
    await apiClient.delete(`${COURSE_CONTENT_PREFIX}/materials/${materialId}`);
  },
};

export default lessonApi;
