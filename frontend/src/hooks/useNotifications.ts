/**
 * useNotifications Hook
 * React hook for managing notifications with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService, type Notification, type PaginationParams } from '@/services/notificationService'
import { toast } from 'react-hot-toast'

export const useNotifications = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export const useCourseNotifications = (courseId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['notifications', 'course', courseId, params],
    queryFn: () => notificationService.getCourseNotifications(courseId, params),
    enabled: !!courseId,
    staleTime: 30000,
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Đã đánh dấu thông báo là đã đọc')
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error)
      toast.error('Không thể đánh dấu thông báo')
    }
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error)
      toast.error('Không thể đánh dấu tất cả thông báo')
    }
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Đã xóa thông báo')
    },
    onError: (error) => {
      console.error('Error deleting notification:', error)
      toast.error('Không thể xóa thông báo')
    }
  })
}

export const useCreateNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationService.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Đã tạo thông báo mới')
    },
    onError: (error) => {
      console.error('Error creating notification:', error)
      toast.error('Không thể tạo thông báo')
    }
  })
}

// Utility hooks for notification formatting
export const useNotificationUtils = () => {
  return {
    formatTime: notificationService.formatTime,
    getIcon: notificationService.getNotificationIcon,
    getColor: notificationService.getNotificationColor,
  }
}
