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

const unwrapData = <T>(payload: any): T => {
  if (payload && typeof payload === 'object') {
    if ('data' in payload) {
      return payload.data as T;
    }
    if ('success' in payload && 'data' in payload) {
      return payload.data as T;
    }
  }
  return payload as T;
};

export const aiApi = {

  chat: async (payload: AiChatRequest): Promise<AiChatResponse> => {
    const res = await apiClient.post<{ data: AiChatResponse }>('/ai/chat', payload);
    return unwrapData(res.data);
  },

  lessonChat: async (lessonId: string, payload: Omit<AiChatRequest, 'context'>): Promise<AiChatResponse> => {
    const res = await apiClient.post<{ data: AiChatResponse }>('/ai/lesson-chat', {
      lessonId,
      ...payload,
    });
    return unwrapData(res.data);
  },

  lessonSummary: async (lessonId: string): Promise<AiChatResponse> => {
    const res = await apiClient.post<{ data: AiChatResponse }>('/ai/lesson-summary', { lessonId });
    return unwrapData(res.data);
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
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    questionType?: 'single_choice' | 'multiple_choice' | 'true_false' | 'mixed';
    questionTypes?: Array<'single_choice' | 'multiple_choice' | 'true_false'>;
    topicFocus?: string[];
    bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'mixed';
    difficultyDistribution?: { easy: number; medium: number; hard: number };
    questionTypeDistribution?: { single_choice: number; multiple_choice: number; true_false: number };
    bloomDistribution?: { remember: number; understand: number; apply: number; analyze: number };
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
    return unwrapData(res.data);
  },

  /**
   * Generate quiz questions from uploaded file
   */
  generateQuizFromFile: async (payload: {
    courseId: string;
    file: File;
    numberOfQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    questionType?: 'single_choice' | 'multiple_choice' | 'true_false' | 'mixed';
    questionTypes?: Array<'single_choice' | 'multiple_choice' | 'true_false'>;
    topicFocus?: string[];
    bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'mixed';
    difficultyDistribution?: { easy: number; medium: number; hard: number };
    questionTypeDistribution?: { single_choice: number; multiple_choice: number; true_false: number };
    bloomDistribution?: { remember: number; understand: number; apply: number; analyze: number };
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
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('courseId', payload.courseId);
    if (payload.numberOfQuestions != null) {
      formData.append('numberOfQuestions', String(payload.numberOfQuestions));
    }
    if (payload.difficulty) {
      formData.append('difficulty', payload.difficulty);
    }
    if (payload.questionType) {
      formData.append('questionType', payload.questionType);
    }
    if (payload.questionTypes?.length) {
      formData.append('questionTypes', JSON.stringify(payload.questionTypes));
    }
    if (payload.topicFocus?.length) {
      formData.append('topicFocus', JSON.stringify(payload.topicFocus));
    }
    if (payload.bloomLevel) {
      formData.append('bloomLevel', payload.bloomLevel);
    }
    if (payload.difficultyDistribution) {
      formData.append('difficultyDistribution', JSON.stringify(payload.difficultyDistribution));
    }
    if (payload.questionTypeDistribution) {
      formData.append('questionTypeDistribution', JSON.stringify(payload.questionTypeDistribution));
    }
    if (payload.bloomDistribution) {
      formData.append('bloomDistribution', JSON.stringify(payload.bloomDistribution));
    }
    if (payload.isPremium != null) {
      formData.append('isPremium', String(payload.isPremium));
    }

    const res = await apiClient.post<{ data: any }>('/ai/generate-quiz-file', formData, {
      timeout: 90000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrapData(res.data);
  },

  /**
   * Generate assignment draft from course content
   */
  generateAssignment: async (payload: {
    courseId: string;
    content: string;
    maxScore?: number;
    submissionType?: 'text' | 'file' | 'both';
    additionalNotes?: string;
  }): Promise<{
    title: string;
    description: string;
    instructions: string;
    max_score: number;
    submission_type: 'text' | 'file' | 'both';
  }> => {
    const res = await apiClient.post<{ data: any }>('/ai/instructor/generate-assignment', payload, {
      timeout: 90000,
    });
    return unwrapData(res.data);
  },

  /**
   * Generate assignment draft from uploaded file
   */
  generateAssignmentFromFile: async (payload: {
    courseId: string;
    file: File;
    maxScore?: number;
    submissionType?: 'text' | 'file' | 'both';
    additionalNotes?: string;
  }): Promise<{
    title: string;
    description: string;
    instructions: string;
    max_score: number;
    submission_type: 'text' | 'file' | 'both';
  }> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('courseId', payload.courseId);
    if (payload.maxScore != null) {
      formData.append('maxScore', String(payload.maxScore));
    }
    if (payload.submissionType) {
      formData.append('submissionType', payload.submissionType);
    }
    if (payload.additionalNotes) {
      formData.append('additionalNotes', payload.additionalNotes);
    }

    const res = await apiClient.post<{ data: any }>('/ai/instructor/generate-assignment-file', formData, {
      timeout: 90000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrapData(res.data);
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
    return unwrapData(res.data);
  },

  /**
   * Suggest course improvements
   */
  suggestCourseImprovements: async (payload: {
    courseId: string;
    courseData: any;
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/instructor/suggest-improvements', payload);
    return unwrapData(res.data);
  },

  /**
   * Analyze student performance
   */
  analyzeStudents: async (payload: {
    courseId: string;
    studentIds?: string[];
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/instructor/analyze-students', payload);
    return unwrapData(res.data);
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
    return unwrapData(res.data);
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
    return unwrapData(res.data);
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
    return unwrapData(res.data);
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
    return unwrapData(res.data);
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
    return unwrapData(res.data);
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
    return unwrapData(res.data);
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
    return unwrapData(res.data);
  },

  /**
   * AI Grader - generate rubric from text
   */
  generateRubric: async (payload: {
    content: string;
    maxScore: number;
    rubricItems?: number;
  }): Promise<Array<{ name: string; description?: string; points: number }>> => {
    const res = await apiClient.post<{ data: any }>('/ai/grader/rubric', payload, {
      timeout: 120000,
    });
    return unwrapData(res.data);
  },

  /**
   * AI Grader - generate rubric from file
   */
  generateRubricFromFile: async (payload: {
    file: File;
    maxScore: number;
    rubricItems?: number;
  }): Promise<Array<{ name: string; description?: string; points: number }>> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('maxScore', String(payload.maxScore));
    if (payload.rubricItems != null) {
      formData.append('rubricItems', String(payload.rubricItems));
    }

    const res = await apiClient.post<{ data: any }>('/ai/grader/rubric-file', formData, {
      timeout: 120000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrapData(res.data);
  },

  // ==================== DEBATE WORKFLOW ====================

  startDebate: async (payload: {
    topic: string;
    context: string;
    debateType: 'project_design' | 'curriculum' | 'content_review' | 'decision';
    maxRounds?: number;
    courseId?: string;
  }): Promise<any> => {
    const res = await apiClient.post<{ data: any }>('/ai/debate/start', payload, {
      timeout: 120000,
    });
    return unwrapData(res.data);
  },

  getDebateResult: async (debateId: string): Promise<any> => {
    const res = await apiClient.get<{ data: any }>(`/ai/debate/${debateId}`);
    return unwrapData(res.data);
  },

  getDebateHistory: async (debateId: string): Promise<any> => {
    const res = await apiClient.get<{ data: any }>(`/ai/debate/${debateId}/history`);
    return unwrapData(res.data);
  },

  arbitrateDebate: async (debateId: string): Promise<any> => {
    const res = await apiClient.post<{ data: any }>(`/ai/debate/${debateId}/arbitrate`, {}, {
      timeout: 120000,
    });
    return unwrapData(res.data);
  },

  // ==================== LEARNING SUPPORT ====================

  /**
   * Get remediation cards for a quiz attempt
   */
  getRemediation: async (attemptId: string, maxCards?: number): Promise<RemediationResult> => {
    const params = new URLSearchParams({ attemptId });
    if (maxCards) params.append('maxCards', String(maxCards));
    const res = await apiClient.get<{ data: RemediationResult }>(`/learning-support/remediation?${params}`, {
      timeout: 60000,
    });
    return unwrapData(res.data);
  },

  /**
   * Get study plan for a course
   */
  getStudyPlan: async (courseId: string): Promise<StudentStudyPlan> => {
    const res = await apiClient.get<{ data: StudentStudyPlan }>(`/learning-support/plan?courseId=${courseId}`, {
      timeout: 30000,
    });
    return unwrapData(res.data);
  },

  /**
   * Clear study plan cache
   */
  clearStudyPlanCache: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/learning-support/plan/cache?courseId=${courseId}`);
  },

  /**
   * Get instructor insights for a course
   */
  getInstructorInsights: async (courseId: string): Promise<InstructorInsights> => {
    const res = await apiClient.get<{ data: InstructorInsights }>(`/learning-support/instructor/insights?courseId=${courseId}`, {
      timeout: 30000,
    });
    return unwrapData(res.data);
  },
};

// ==================== LEARNING SUPPORT TYPES ====================

export interface PracticeQuestion {
  id: string;
  question: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  options: string[];
  correctAnswer: number | number[];
  explanation: string;
}

export interface RemediationCard {
  questionId: string;
  originalQuestion: string;
  studentAnswer: string;
  correctAnswer: string;
  misconception: string;
  conceptExplanation: string;
  practiceQuestions: PracticeQuestion[];
}

export interface RemediationResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  incorrectCount: number;
  score: number;
  maxScore: number;
  cards: RemediationCard[];
  generatedAt: string;
  metadata: {
    model: string;
    processingTimeMs: number;
    cached: boolean;
  };
}

export interface WeakArea {
  id: string;
  type: 'quiz' | 'section' | 'lesson';
  title: string;
  weaknessScore: number;
  performance: number;
  attemptCount: number;
  lastAttemptAt: string | null;
  trend: 'improving' | 'declining' | 'stable';
  sectionId?: string;
  sectionTitle?: string;
}

export interface StudyAction {
  priority: number;
  actionType: 'review_lesson' | 'retake_quiz' | 'practice';
  targetId: string;
  targetType: 'lesson' | 'quiz';
  targetTitle: string;
  suggestedTimeMinutes: number;
  reason: string;
}

export interface Checkpoint {
  scheduledDate: string;
  type: 'mini_quiz' | 'review';
  targetId: string;
  targetTitle: string;
  description: string;
}

export interface StudentStudyPlan {
  userId: string;
  courseId: string;
  courseTitle: string;
  generatedAt: string;
  weakAreas: WeakArea[];
  nextActions: StudyAction[];
  checkpoints: Checkpoint[];
  summary: {
    totalQuizzesTaken: number;
    averageScore: number;
    weakestArea: string;
    estimatedStudyTimeMinutes: number;
  };
  metadata: {
    calculationMethod: string;
    cached: boolean;
    cacheExpiresAt?: string;
  };
}

export interface InstructorInsights {
  courseId: string;
  courseTitle: string;
  generatedAt: string;
  totalStudents: number;
  activeStudents: number;
  overallAverageScore: number;
  weakAreasAggregate: Array<{
    quizId: string;
    quizTitle: string;
    sectionId?: string;
    sectionTitle?: string;
    averageScore: number;
    attemptCount: number;
    studentCount: number;
    mostMissedQuestions: Array<{
      questionId: string;
      questionText: string;
      incorrectRate: number;
    }>;
  }>;
  recommendations: string[];
}



