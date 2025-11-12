import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizApi, QuizAttempt } from '@/services/api/quiz.api';

/**
 * Hook to fetch quiz by ID
 */
export function useQuiz(quizId: number) {
  return useQuery({
    queryKey: ['quizzes', quizId],
    queryFn: () => quizApi.getQuiz(quizId),
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch quiz questions
 */
export function useQuizQuestions(quizId: number) {
  return useQuery({
    queryKey: ['quizzes', quizId, 'questions'],
    queryFn: () => quizApi.getQuizQuestions(quizId),
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to start a new quiz attempt
 */
export function useStartQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (quizId: number) => quizApi.startQuiz(quizId),
    onSuccess: (data, quizId) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', quizId, 'attempts'] });
      queryClient.setQueryData(['quiz-attempts', data.id], data);
    },
  });
}

/**
 * Hook to submit answer for a question
 */
export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({ 
      attemptId, 
      questionId, 
      answer 
    }: { 
      attemptId: number; 
      questionId: number; 
      answer: string | string[];
    }) => quizApi.submitAnswer(attemptId, questionId, answer),
  });
}

/**
 * Hook to submit quiz (finish attempt)
 */
export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (attemptId: number) => quizApi.submitQuiz(attemptId),
    onSuccess: (result, attemptId) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', attemptId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.setQueryData(['quiz-attempts', attemptId], result);
    },
  });
}

/**
 * Hook to get quiz attempt by ID
 */
export function useQuizAttempt(attemptId: number) {
  return useQuery({
    queryKey: ['quiz-attempts', attemptId],
    queryFn: () => quizApi.getAttempt(attemptId),
    enabled: !!attemptId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get all attempts for a quiz
 */
export function useQuizAttempts(quizId: number) {
  return useQuery({
    queryKey: ['quizzes', quizId, 'attempts'],
    queryFn: () => quizApi.getAttempts(quizId),
    enabled: !!quizId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get current/active attempt
 */
export function useCurrentAttempt(quizId: number) {
  return useQuery({
    queryKey: ['quizzes', quizId, 'current-attempt'],
    queryFn: () => quizApi.getCurrentAttempt(quizId),
    enabled: !!quizId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export default {
  useQuiz,
  useQuizQuestions,
  useStartQuiz,
  useSubmitAnswer,
  useSubmitQuiz,
  useQuizAttempt,
  useQuizAttempts,
  useCurrentAttempt,
};
