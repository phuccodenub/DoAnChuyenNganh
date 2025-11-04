/**
 * useLivestream Hook
 * React hook for managing livestream sessions with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { livestreamService, type LivestreamSession, type CreateSessionData, type PaginationParams } from '@/services/livestreamService'
import { toast } from 'react-hot-toast'

// Livestream queries
export const useCourseSessions = (courseId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['livestreams', 'course', courseId, params],
    queryFn: () => livestreamService.getCourseSessions(courseId, params),
    enabled: !!courseId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for live status
  })
}

export const useSession = (sessionId: string) => {
  return useQuery({
    queryKey: ['livestream', sessionId],
    queryFn: () => livestreamService.getSession(sessionId),
    enabled: !!sessionId,
    staleTime: 10000, // 10 seconds for live data
    refetchInterval: 30000, // Frequent updates for live sessions
  })
}

export const useMySessions = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['livestreams', 'my-sessions', params],
    queryFn: () => livestreamService.getMySessions(params),
    staleTime: 60000, // 1 minute
  })
}

export const useSessionViewers = (sessionId: string) => {
  return useQuery({
    queryKey: ['livestream', sessionId, 'viewers'],
    queryFn: () => livestreamService.getSessionViewers(sessionId),
    enabled: !!sessionId,
    staleTime: 5000, // 5 seconds
    refetchInterval: 15000, // Update viewer list frequently
  })
}

export const useSessionChat = (sessionId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['livestream', sessionId, 'chat', params],
    queryFn: () => livestreamService.getChatMessages(sessionId, params),
    enabled: !!sessionId,
    staleTime: 5000,
    refetchInterval: 10000, // Frequent chat updates
  })
}

export const useSessionStats = (sessionId: string) => {
  return useQuery({
    queryKey: ['livestream', sessionId, 'stats'],
    queryFn: () => livestreamService.getSessionStats(sessionId),
    enabled: !!sessionId,
    staleTime: 30000,
  })
}

export const useSignalingData = (sessionId: string) => {
  return useQuery({
    queryKey: ['livestream', sessionId, 'signaling'],
    queryFn: () => livestreamService.getSignalingData(sessionId),
    enabled: !!sessionId,
    staleTime: 300000, // 5 minutes - signaling data doesn't change often
  })
}

// Livestream mutations
export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSessionData) => livestreamService.createSession(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['livestreams', 'course', data.course_id] })
      queryClient.invalidateQueries({ queryKey: ['livestreams', 'my-sessions'] })
      toast.success('Đã tạo phiên phát sóng mới')
    },
    onError: (error) => {
      console.error('Error creating session:', error)
      toast.error('Không thể tạo phiên phát sóng')
    }
  })
}

export const useUpdateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string, data: Partial<CreateSessionData> }) => 
      livestreamService.updateSession(sessionId, data),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['livestream', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['livestreams'] })
      toast.success('Đã cập nhật phiên phát sóng')
    },
    onError: (error) => {
      console.error('Error updating session:', error)
      toast.error('Không thể cập nhật phiên phát sóng')
    }
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => livestreamService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestreams'] })
      toast.success('Đã xóa phiên phát sóng')
    },
    onError: (error) => {
      console.error('Error deleting session:', error)
      toast.error('Không thể xóa phiên phát sóng')
    }
  })
}

export const useStartSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => livestreamService.startSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['livestream', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['livestreams'] })
      toast.success('Đã bắt đầu phát sóng trực tiếp')
    },
    onError: (error) => {
      console.error('Error starting session:', error)
      toast.error('Không thể bắt đầu phát sóng')
    }
  })
}

export const useEndSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => livestreamService.endSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['livestream', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['livestreams'] })
      toast.success('Đã kết thúc phát sóng')
    },
    onError: (error) => {
      console.error('Error ending session:', error)
      toast.error('Không thể kết thúc phát sóng')
    }
  })
}

export const useJoinSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => livestreamService.joinSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['livestream', sessionId, 'viewers'] })
      toast.success('Đã tham gia phiên phát sóng')
    },
    onError: (error) => {
      console.error('Error joining session:', error)
      toast.error('Không thể tham gia phiên phát sóng')
    }
  })
}

export const useLeaveSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => livestreamService.leaveSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['livestream', sessionId, 'viewers'] })
      toast.success('Đã rời khỏi phiên phát sóng')
    },
    onError: (error) => {
      console.error('Error leaving session:', error)
      toast.error('Không thể rời khỏi phiên phát sóng')
    }
  })
}

export const useSendChatMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string, message: string }) => 
      livestreamService.sendChatMessage(sessionId, message),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['livestream', sessionId, 'chat'] })
    },
    onError: (error) => {
      console.error('Error sending chat message:', error)
      toast.error('Không thể gửi tin nhắn')
    }
  })
}

export const useSendSignal = () => {
  return useMutation({
    mutationFn: ({ sessionId, signalData }: { sessionId: string, signalData: { type: 'offer' | 'answer' | 'ice-candidate', data: any } }) => 
      livestreamService.sendSignal(sessionId, signalData),
    onError: (error) => {
      console.error('Error sending WebRTC signal:', error)
    }
  })
}

// Utility hooks
export const useLivestreamUtils = () => {
  return {
    getStatusText: livestreamService.getStatusText,
    getStatusColor: livestreamService.getStatusColor,
    isSessionLive: livestreamService.isSessionLive,
    canJoinSession: livestreamService.canJoinSession,
    formatViewerCount: livestreamService.formatViewerCount,
    getSessionDuration: livestreamService.getSessionDuration,
  }
}
