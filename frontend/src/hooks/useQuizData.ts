import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizApi, QuizAttempt } from '@/services/api/quiz.api';

/**
 * Hook to fetch quiz by ID
 */
export function useQuiz(quizId: string) {
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
export function useQuizQuestions(quizId: string) {
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
    mutationFn: (quizId: string) => quizApi.startQuiz(quizId),
    onSuccess: (data, quizId) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', quizId, 'attempts'] });
      queryClient.setQueryData(['quiz-attempts', data.id], data);
    },
  });
}

/**
 * Hook to submit quiz (finish attempt)
 * FE gửi toàn bộ answers 1 lần khi nộp bài, không auto-save theo câu hỏi nữa.
 */
export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: {
      attemptId: string;
      answers: {
        question_id: string;
        selected_option_id?: string;
        selected_options?: string[];
      }[];
    }) => quizApi.submitQuiz(payload.attemptId, payload.answers),
    onSuccess: (result, { attemptId }) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', attemptId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.setQueryData(['quiz-attempts', attemptId], result);
    },
  });
}

/**
 * Hook to get quiz attempt by ID
 */
export function useQuizAttempt(attemptId: string) {
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
export function useQuizAttempts(quizId: string) {
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
export function useCurrentAttempt(quizId: string) {
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
  useSubmitQuiz,
  useQuizAttempt,
  useQuizAttempts,
  useCurrentAttempt,
};
