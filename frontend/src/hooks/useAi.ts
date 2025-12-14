import { useMutation } from '@tanstack/react-query';
import { aiApi, type AiChatRequest, type AiChatResponse } from '@/services/api/ai.api';

export function useAiChat() {
  return useMutation<AiChatResponse, any, AiChatRequest>({
    mutationFn: (payload) => aiApi.chat(payload),
  });
}

export function useLessonAiChat(lessonId: string | undefined) {
  return useMutation<AiChatResponse, any, Omit<AiChatRequest, 'context'>>({
    mutationFn: (payload) => aiApi.lessonChat(lessonId!, payload),
    meta: { requiresLessonId: true },
  });
}

export function useLessonSummary(lessonId: string | undefined) {
  return useMutation<AiChatResponse, any, void>({
    mutationFn: () => aiApi.lessonSummary(lessonId!),
    meta: { requiresLessonId: true },
  });
}

// ==================== INSTRUCTOR AI HOOKS ====================

/**
 * Generate course outline
 */
export function useGenerateCourseOutline() {
  return useMutation<any, any, {
    topic: string;
    description?: string;
    duration?: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    numberOfSections?: number;
  }>({
    mutationFn: (payload) => aiApi.generateCourseOutline(payload),
  });
}

/**
 * Suggest course improvements
 */
export function useSuggestCourseImprovements() {
  return useMutation<any, any, {
    courseId: string;
    courseData: any;
  }>({
    mutationFn: (payload) => aiApi.suggestCourseImprovements(payload),
  });
}

/**
 * Analyze students
 */
export function useAnalyzeStudents() {
  return useMutation<any, any, {
    courseId: string;
    studentIds?: string[];
  }>({
    mutationFn: (payload) => aiApi.analyzeStudents(payload),
  });
}

/**
 * Generate feedback
 */
export function useGenerateFeedback() {
  return useMutation<any, any, {
    assignmentId: string;
    submissionId: string;
    submissionContent: string;
    assignmentInstructions: string;
    rubric?: any;
    maxScore?: number;
  }>({
    mutationFn: (payload) => aiApi.generateFeedback(payload),
  });
}

/**
 * Auto-grade assignment
 */
export function useAutoGrade() {
  return useMutation<any, any, {
    assignmentId: string;
    submissionId: string;
    submissionAnswers: Record<string, any>;
    assignmentQuestions: any[];
  }>({
    mutationFn: (payload) => aiApi.autoGrade(payload),
  });
}

/**
 * Generate detailed content for a lesson
 */
export function useGenerateLessonContent() {
  return useMutation<{ content: string }, any, {
    lessonTitle: string;
    lessonDescription: string;
    courseTitle: string;
    courseDescription?: string;
    sectionTitle?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }>({
    mutationFn: (payload) => aiApi.generateLessonContent(payload),
  });
}

