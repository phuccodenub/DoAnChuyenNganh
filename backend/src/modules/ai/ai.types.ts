/**
 * AI Module Types
 * Type definitions for AI features using Gemini API
 */

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  context?: {
    userId?: string;
    courseId?: string;
    courseTitle?: string;
    courseDescription?: string;
    lessonTitle?: string;
  };
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface LessonChatRequest {
  lesson: any;
  message: string;
  conversationHistory?: ChatMessage[];
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ChatResponse {
  response: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface GenerateQuizRequest {
  courseId: string;
  courseContent: string;
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  // single_choice = 1 đáp án đúng, multiple_choice = nhiều đáp án đúng, true_false = Đúng/Sai
  questionType?: 'single_choice' | 'multiple_choice' | 'true_false';
}

export interface QuizQuestion {
  question: string;
  // single_choice = 1 đáp án đúng, multiple_choice = nhiều đáp án đúng, true_false = Đúng/Sai
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface GenerateQuizResponse {
  questions: QuizQuestion[];
  totalQuestions: number;
}

export interface ContentRecommendationRequest {
  userId: string;
  limit?: number;
}

export interface ContentRecommendation {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  reason: string;
  matchScore: number;
}

export interface ContentRecommendationResponse {
  recommendations: ContentRecommendation[];
  totalRecommendations: number;
}

export interface LearningAnalyticsRequest {
  userId: string;
  courseId?: string;
}

export interface LearningAnalytics {
  progress: {
    completedCourses: number;
    inProgressCourses: number;
    averageScore: number;
  };
  insights: string[];
  recommendations: string[];
  predictedCompletionDate?: string;
  weakAreas?: string[];
}

export interface LearningAnalyticsResponse {
  analytics: LearningAnalytics;
  generatedAt: string;
}

// ==================== INSTRUCTOR AI FEATURES ====================

/**
 * Generate course outline from topic/description
 */
export interface GenerateCourseOutlineRequest {
  topic: string;
  description?: string;
  duration?: number; // in hours
  level?: 'beginner' | 'intermediate' | 'advanced';
  numberOfSections?: number;
}

export interface CourseSection {
  title: string;
  description: string;
  order: number;
  lessons: {
    title: string;
    description: string;
    content?: string; // Nội dung chi tiết đầy đủ của lesson
    order: number;
    estimatedDuration?: number; // in minutes
  }[];
}

export interface GenerateCourseOutlineResponse {
  title: string;
  description: string;
  learningOutcomes: string[];
  sections: CourseSection[];
  totalEstimatedDuration: number; // in hours
}

/**
 * Suggest course improvements
 */
export interface SuggestCourseImprovementsRequest {
  courseId: string;
  courseData: {
    title: string;
    description?: string;
    content?: string;
    lessons?: any[];
    studentFeedback?: any[];
    enrollmentStats?: any;
  };
}

export interface CourseImprovement {
  category: 'content' | 'structure' | 'engagement' | 'assessment' | 'accessibility';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
  impact: string;
}

export interface SuggestCourseImprovementsResponse {
  improvements: CourseImprovement[];
  overallScore?: number; // 0-100
  summary: string;
}

/**
 * Analyze student performance
 */
export interface AnalyzeStudentsRequest {
  courseId: string;
  studentIds?: string[]; // Optional: analyze specific students
}

export interface StudentAnalysis {
  studentId: string;
  studentName: string;
  overallProgress: number; // 0-100
  averageScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  predictedCompletionDate?: string;
}

export interface CourseStudentAnalytics {
  totalStudents: number;
  averageProgress: number;
  averageScore: number;
  completionRate: number;
  commonWeakAreas: string[];
  topPerformers: string[];
  atRiskStudents: string[];
  insights: string[];
  recommendations: string[];
}

export interface AnalyzeStudentsResponse {
  courseAnalytics: CourseStudentAnalytics;
  studentAnalyses: StudentAnalysis[];
  generatedAt: string;
}

/**
 * Generate feedback for assignment submission
 */
export interface GenerateFeedbackRequest {
  assignmentId: string;
  submissionId: string;
  submissionContent: string;
  fileUrls?: string[];
  studentName?: string; // Tên học viên để AI sử dụng trong feedback
  assignmentInstructions: string;
  rubric?: any;
  maxScore?: number;
}

export interface GeneratedFeedback {
  score?: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  detailedComments?: {
    section: string;
    comment: string;
    score?: number;
  }[];
}

export interface GenerateFeedbackResponse {
  feedback: GeneratedFeedback;
  suggestedGrade?: string;
}

/**
 * Auto-grade assignment (for objective questions)
 */
export interface AutoGradeRequest {
  assignmentId: string;
  submissionId: string;
  submissionAnswers: Record<string, any>;
  assignmentQuestions: any[];
}

export interface AutoGradeResponse {
  score: number;
  maxScore: number;
  percentage: number;
  gradedQuestions: {
    questionId: string;
    isCorrect: boolean;
    points: number;
    maxPoints: number;
    feedback?: string;
  }[];
}

/**
 * Generate course thumbnail prompt
 */
export interface GenerateThumbnailRequest {
  courseTitle: string;
  courseDescription?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface GenerateThumbnailResponse {
  prompt: string; // Prompt để tạo thumbnail
  suggestions?: string[]; // Các gợi ý prompt khác
}

/**
 * Generate lesson content (detailed content for a single lesson)
 */
export interface GenerateLessonContentRequest {
  lessonTitle: string;
  lessonDescription: string;
  courseTitle: string;
  courseDescription?: string;
  sectionTitle?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface GenerateLessonContentResponse {
  content: string; // Nội dung chi tiết đầy đủ (HTML hoặc markdown)
}
