/**
 * Instructor Quiz Hooks
 * 
 * React Query hooks for quiz management (create, update, delete)
 * Used by QuizBuilderPage and other instructor interfaces
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  quizApi, 
  Quiz, 
  Question,
  CreateQuizData, 
  UpdateQuizData, 
  CreateQuestionData, 
  UpdateQuestionData 
} from '@/services/api/quiz.api';
import toast from 'react-hot-toast';

// ==================== QUIZ QUERIES ====================

/**
 * Hook to fetch quizzes for instructor
 */
export function useInstructorQuizzes(params?: {
  page?: number;
  limit?: number;
  course_id?: string;
  status?: 'draft' | 'published' | 'archived';
}) {
  return useQuery({
    queryKey: ['instructor-quizzes', params],
    queryFn: () => quizApi.getQuizzes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single quiz for editing
 */
export function useInstructorQuiz(quizId: string) {
  return useQuery({
    queryKey: ['instructor-quiz', quizId],
    queryFn: () => quizApi.getQuiz(quizId),
    enabled: !!quizId && quizId !== 'new',
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch quiz questions for editing
 */
export function useInstructorQuizQuestions(quizId: string) {
  return useQuery({
    queryKey: ['instructor-quiz-questions', quizId],
    queryFn: () => quizApi.getQuizQuestions(quizId),
    enabled: !!quizId && quizId !== 'new',
    staleTime: 1 * 60 * 1000,
  });
}

// ==================== QUIZ MUTATIONS ====================

/**
 * Hook to create a new quiz
 */
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizData) => quizApi.createQuiz(data),
    onSuccess: (newQuiz) => {
      // Invalidate instructor quizzes list
      queryClient.invalidateQueries({ queryKey: ['instructor-quizzes'] });
      // Pre-populate the cache for this quiz
      queryClient.setQueryData(['instructor-quiz', newQuiz.id], newQuiz);
      toast.success('Tạo quiz thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể tạo quiz';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a quiz
 */
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: UpdateQuizData }) =>
      quizApi.updateQuiz(quizId, data),
    onSuccess: (updatedQuiz, { quizId }) => {
      // Update cache
      queryClient.setQueryData(['instructor-quiz', quizId], updatedQuiz);
      queryClient.invalidateQueries({ queryKey: ['instructor-quizzes'] });
      toast.success('Cập nhật quiz thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể cập nhật quiz';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a quiz
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizApi.deleteQuiz(quizId),
    onSuccess: (_, quizId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['instructor-quiz', quizId] });
      queryClient.invalidateQueries({ queryKey: ['instructor-quizzes'] });
      toast.success('Xóa quiz thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể xóa quiz';
      toast.error(message);
    },
  });
}

/**
 * Hook to publish/unpublish a quiz
 */
export function usePublishQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, isPublished }: { quizId: string; isPublished: boolean }) =>
      quizApi.publishQuiz(quizId, isPublished),
    onSuccess: (updatedQuiz, { quizId, isPublished }) => {
      queryClient.setQueryData(['instructor-quiz', quizId], updatedQuiz);
      queryClient.invalidateQueries({ queryKey: ['instructor-quizzes'] });
      toast.success(isPublished ? 'Quiz đã được xuất bản!' : 'Quiz đã được gỡ xuất bản');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể thay đổi trạng thái quiz';
      toast.error(message);
    },
  });
}

// ==================== QUESTION MUTATIONS ====================

/**
 * Hook to add a question to a quiz
 */
export function useAddQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: CreateQuestionData }) =>
      quizApi.addQuestion(quizId, data),
    onSuccess: (newQuestion, { quizId }) => {
      // Optimistically update questions list
      queryClient.setQueryData<Question[]>(
        ['instructor-quiz-questions', quizId],
        (old) => old ? [...old, newQuestion] : [newQuestion]
      );
      queryClient.invalidateQueries({ queryKey: ['instructor-quiz', quizId] });
      toast.success('Thêm câu hỏi thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể thêm câu hỏi';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a question
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      quizId, 
      questionId, 
      data 
    }: { 
      quizId: string; 
      questionId: string; 
      data: UpdateQuestionData 
    }) => quizApi.updateQuestion(quizId, questionId, data),
    onSuccess: (updatedQuestion, { quizId, questionId }) => {
      // Update question in cache
      queryClient.setQueryData<Question[]>(
        ['instructor-quiz-questions', quizId],
        (old) => old?.map(q => q.id === questionId ? updatedQuestion : q)
      );
      toast.success('Cập nhật câu hỏi thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể cập nhật câu hỏi';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a question
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) =>
      quizApi.deleteQuestion(quizId, questionId),
    onSuccess: (_, { quizId, questionId }) => {
      // Remove question from cache
      queryClient.setQueryData<Question[]>(
        ['instructor-quiz-questions', quizId],
        (old) => old?.filter(q => q.id !== questionId)
      );
      queryClient.invalidateQueries({ queryKey: ['instructor-quiz', quizId] });
      toast.success('Xóa câu hỏi thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể xóa câu hỏi';
      toast.error(message);
    },
  });
}

/**
 * Hook to bulk add questions
 */
export function useBulkAddQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questions }: { quizId: string; questions: CreateQuestionData[] }) =>
      quizApi.bulkAddQuestions(quizId, questions),
    onSuccess: (newQuestions, { quizId }) => {
      queryClient.setQueryData<Question[]>(
        ['instructor-quiz-questions', quizId],
        (old) => old ? [...old, ...newQuestions] : newQuestions
      );
      queryClient.invalidateQueries({ queryKey: ['instructor-quiz', quizId] });
      toast.success(`Thêm ${newQuestions.length} câu hỏi thành công!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể thêm câu hỏi';
      toast.error(message);
    },
  });
}

// ==================== HELPER HOOKS ====================

/**
 * Combined hook for quiz builder with all data and mutations
 */
export function useQuizBuilder(quizId?: string) {
  const isEditMode = !!quizId && quizId !== 'new';

  // Queries
  const quizQuery = useInstructorQuiz(isEditMode ? quizId : '');
  const questionsQuery = useInstructorQuizQuestions(isEditMode ? quizId : '');

  // Mutations
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();
  const publishQuiz = usePublishQuiz();
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const bulkAddQuestions = useBulkAddQuestions();

  return {
    // State
    isEditMode,
    quiz: quizQuery.data,
    questions: questionsQuery.data || [],
    isLoading: quizQuery.isLoading || questionsQuery.isLoading,
    isError: quizQuery.isError || questionsQuery.isError,
    error: quizQuery.error || questionsQuery.error,

    // Quiz mutations
    createQuiz: createQuiz.mutateAsync,
    updateQuiz: (data: UpdateQuizData) => updateQuiz.mutateAsync({ quizId: quizId!, data }),
    deleteQuiz: () => deleteQuiz.mutateAsync(quizId!),
    publishQuiz: (isPublished: boolean) => publishQuiz.mutateAsync({ quizId: quizId!, isPublished }),

    // Question mutations
    addQuestion: (data: CreateQuestionData) => addQuestion.mutateAsync({ quizId: quizId!, data }),
    updateQuestion: (questionId: string, data: UpdateQuestionData) => 
      updateQuestion.mutateAsync({ quizId: quizId!, questionId, data }),
    deleteQuestion: (questionId: string) => deleteQuestion.mutateAsync({ quizId: quizId!, questionId }),
    bulkAddQuestions: (questions: CreateQuestionData[]) => 
      bulkAddQuestions.mutateAsync({ quizId: quizId!, questions }),

    // Mutation states
    isSaving: createQuiz.isPending || updateQuiz.isPending,
    isDeleting: deleteQuiz.isPending,
    isAddingQuestion: addQuestion.isPending,
    isUpdatingQuestion: updateQuestion.isPending,
    isDeletingQuestion: deleteQuestion.isPending,
  };
}

export default {
  useInstructorQuizzes,
  useInstructorQuiz,
  useInstructorQuizQuestions,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  usePublishQuiz,
  useAddQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useBulkAddQuestions,
  useQuizBuilder,
};
