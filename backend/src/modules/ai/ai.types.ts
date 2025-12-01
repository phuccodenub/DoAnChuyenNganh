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
  };
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
  questionType?: 'multiple_choice' | 'true_false' | 'short_answer';
}

export interface QuizQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
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



