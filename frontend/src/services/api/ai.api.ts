import { apiClient } from '../http/client';

export interface AiChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: Record<string, unknown>;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AiChatResponse {
  response: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export const aiApi = {
  chat: async (payload: AiChatRequest): Promise<AiChatResponse> => {
    const res = await apiClient.post<{ data: AiChatResponse }>('/ai/chat', payload);
    return res.data.data;
  },

  lessonChat: async (lessonId: string, payload: Omit<AiChatRequest, 'context'>): Promise<AiChatResponse> => {
    const res = await apiClient.post<{ data: AiChatResponse }>('/ai/lesson-chat', {
      lessonId,
      ...payload,
    });
    return res.data.data;
  },

  lessonSummary: async (lessonId: string): Promise<AiChatResponse> => {
    const res = await apiClient.post<{ data: AiChatResponse }>('/ai/lesson-summary', { lessonId });
    return res.data.data;
  },

  /**
   * Generate quiz questions với support cho nhiều tính năng mới
   */
  generateQuiz: async (payload: {
    courseId: string;
    courseContent?: string; // Backward compatibility
    content?: string; // New field
    contentType?: 'text' | 'video' | 'pdf';
    numberOfQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    questionType?: 'single_choice' | 'multiple_choice' | 'true_false';
    questionTypes?: Array<'single_choice' | 'multiple_choice' | 'true_false'>;
    topicFocus?: string[];
    bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze';
    isPremium?: boolean;
  }): Promise<{
    quizId: string;
    questions: any[];
    totalQuestions: number;
    metadata?: {
      generatedAt: Date;
      model: string;
      processingTime: number;
      tokenUsage?: {
        input: number;
        output: number;
        total: number;
      };
      cost: number;
      stages: string[];
    };
    fromCache?: boolean;
  }> => {
    const res = await apiClient.post<{ data: any }>('/ai/generate-quiz', payload, {
      timeout: 90000, // 90 giây cho large content
    });
    return res.data.data;
  },

  // ==================== INSTRUCTOR AI FEATURES ====================

  /**
   * Generate course outline (basic outline only, no detailed content)
   */
  generateCourseOutline: async (payload: {
    topic: string;
    description?: string;
    duration?: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    numberOfSections?: number;
  }): Promise<any> => {
    // Tăng timeout lên 120 giây cho AI generation
    const res = await apiClient.post<{ data: any }>('/ai/instructor/generate-outline', payload, {
      timeout: 120000, // 120 giây
    });
    return res.data.data;
  },

  /**
   * Suggest course improvements
   */
  suggestCourseImprovements: async (payload: {
    courseId: string;
    courseData: any;
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/instructor/suggest-improvements', payload);
    return res.data.data;
  },

  /**
   * Analyze student performance
   */
  analyzeStudents: async (payload: {
    courseId: string;
    studentIds?: string[];
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/instructor/analyze-students', payload);
    return res.data.data;
  },

  /**
   * Generate feedback for assignment
   */
  generateFeedback: async (payload: {
    assignmentId: string;
    submissionId: string;
    submissionContent: string;
    fileUrls?: string[];
    studentName?: string;
    assignmentInstructions: string;
    rubric?: any;
    maxScore?: number;
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/instructor/generate-feedback', payload, {
      timeout: 120000, // 120 seconds (2 minutes) for file reading and AI processing
    });
    return res.data.data;
  },

  /**
   * Auto-grade assignment
   */
  autoGrade: async (payload: {
    assignmentId: string;
    submissionId: string;
    submissionAnswers: Record<string, any>;
    assignmentQuestions: any[];
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/instructor/auto-grade', payload);
    return res.data.data;
  },

  /**
   * Generate detailed content for a lesson
   */
  generateLessonContent: async (payload: {
    lessonTitle: string;
    lessonDescription: string;
    courseTitle: string;
    courseDescription?: string;
    sectionTitle?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<{ content: string }> => {
    const res = await apiClient.post<{ data: { content: string } }>(
      '/ai/instructor/generate-lesson-content',
      payload,
      {
        timeout: 60000, // 60s cho mỗi lesson
      }
    );
    return res.data.data;
  },

  /**
   * Generate thumbnail prompt for course
   */
  generateThumbnail: async (payload: {
    courseTitle: string;
    courseDescription?: string;
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<{ prompt: string; suggestions?: string[] }> => {
    const res = await apiClient.post<{ data: { prompt: string; suggestions?: string[] } }>('/ai/instructor/generate-thumbnail', payload);
    return res.data.data;
  },

  /**
   * AI Grader - code submission
   */
  gradeCode: async (payload: {
    submissionId: string;
    assignmentId: string;
    courseId: string;
    code: string;
    language: string;
    rubric: Array<{ name: string; description: string; points: number }>;
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/grader/code', payload, {
      timeout: 120000,
    });
    return res.data.data;
  },

  /**
   * AI Grader - essay submission
   */
  gradeEssay: async (payload: {
    submissionId: string;
    assignmentId: string;
    courseId: string;
    essay: string;
    topic: string;
    rubric: Array<{ name: string; description: string; points: number }>;
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/grader/essay', payload, {
      timeout: 120000,
    });
    return res.data.data;
  },

  /**
   * AI Grader - assignment submission (text/file/both)
   */
  gradeAssignment: async (payload: {
    submissionId: string;
    assignmentId: string;
    courseId: string;
    rubric: Array<{ name: string; description: string; points: number }>;
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/grader/assignment', payload, {
      timeout: 120000,
    });
    return res.data.data;
  },
};



