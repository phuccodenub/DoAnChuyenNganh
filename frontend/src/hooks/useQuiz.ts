/**
 * useQuiz Hook
 * React hook for managing quizzes with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quizService, type Quiz, type QuizAttempt, type CreateQuizData, type CreateQuestionData, type SubmitAttemptData } from '@/services/quizService'
import { toast } from 'react-hot-toast'

// Quiz queries
export const useQuizzes = (courseId: string) => {
  return useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => quizService.getQuizzes(courseId),
    enabled: !!courseId,
    staleTime: 60000, // 1 minute
  })
}

export const useQuiz = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizService.getQuiz(quizId),
    enabled: !!quizId,
    staleTime: 30000, // 30 seconds
  })
}

export const useMyQuizzes = () => {
  return useQuery({
    queryKey: ['quizzes', 'my'],
    queryFn: () => quizService.getMyQuizzes(),
    staleTime: 60000,
  })
}

export const useQuizAttempts = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'attempts'],
    queryFn: () => quizService.getQuizAttempts(quizId),
    enabled: !!quizId,
    staleTime: 30000,
  })
}

export const useMyAttempts = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'my-attempts'],
    queryFn: () => quizService.getMyAttempts(quizId),
    enabled: !!quizId,
    staleTime: 30000,
  })
}

export const useQuizStatistics = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId, 'statistics'],
    queryFn: () => quizService.getQuizStatistics(quizId),
    enabled: !!quizId,
    staleTime: 60000,
  })
}

// Quiz mutations
export const useCreateQuiz = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string, data: CreateQuizData }) => 
      quizService.createQuiz(courseId, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] })
      queryClient.invalidateQueries({ queryKey: ['quizzes', 'my'] })
      toast.success('Đã tạo bài kiểm tra mới')
    },
    onError: (error) => {
      console.error('Error creating quiz:', error)
      toast.error('Không thể tạo bài kiểm tra')
    }
  })
}

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string, data: Partial<CreateQuizData> }) => 
      quizService.updateQuiz(quizId, data),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast.success('Đã cập nhật bài kiểm tra')
    },
    onError: (error) => {
      console.error('Error updating quiz:', error)
      toast.error('Không thể cập nhật bài kiểm tra')
    }
  })
}

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (quizId: string) => quizService.deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      toast.success('Đã xóa bài kiểm tra')
    },
    onError: (error) => {
      console.error('Error deleting quiz:', error)
      toast.error('Không thể xóa bài kiểm tra')
    }
  })
}

export const useAddQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string, data: CreateQuestionData }) => 
      quizService.addQuestion(quizId, data),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
      toast.success('Đã thêm câu hỏi mới')
    },
    onError: (error) => {
      console.error('Error adding question:', error)
      toast.error('Không thể thêm câu hỏi')
    }
  })
}

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string, data: Partial<CreateQuestionData> }) => 
      quizService.updateQuestion(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] })
      toast.success('Đã cập nhật câu hỏi')
    },
    onError: (error) => {
      console.error('Error updating question:', error)
      toast.error('Không thể cập nhật câu hỏi')
    }
  })
}

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questionId: string) => quizService.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] })
      toast.success('Đã xóa câu hỏi')
    },
    onError: (error) => {
      console.error('Error deleting question:', error)
      toast.error('Không thể xóa câu hỏi')
    }
  })
}

// Quiz attempt mutations
export const useStartAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (quizId: string) => quizService.startAttempt(quizId),
    onSuccess: (_, quizId) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId, 'my-attempts'] })
      toast.success('Đã bắt đầu bài kiểm tra')
    },
    onError: (error) => {
      console.error('Error starting attempt:', error)
      toast.error('Không thể bắt đầu bài kiểm tra')
    }
  })
}

export const useSubmitAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: string, data: SubmitAttemptData }) => 
      quizService.submitAttempt(attemptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] })
      toast.success('Đã nộp bài kiểm tra')
    },
    onError: (error) => {
      console.error('Error submitting attempt:', error)
      toast.error('Không thể nộp bài kiểm tra')
    }
  })
}

export const useGradeAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attemptId, score, feedback }: { attemptId: string, score: number, feedback?: string }) => 
      quizService.gradeAttempt(attemptId, score, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] })
      toast.success('Đã chấm điểm bài kiểm tra')
    },
    onError: (error) => {
      console.error('Error grading attempt:', error)
      toast.error('Không thể chấm điểm bài kiểm tra')
    }
  })
}

// Utility hooks
export const useQuizUtils = () => {
  return {
    formatDuration: quizService.formatDuration,
    getStatusText: quizService.getStatusText,
    getStatusColor: quizService.getStatusColor,
    calculateScore: quizService.calculateScore,
    isQuizActive: quizService.isQuizActive,
    canTakeQuiz: quizService.canTakeQuiz,
  }
}
