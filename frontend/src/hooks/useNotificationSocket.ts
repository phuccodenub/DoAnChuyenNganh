import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore.enhanced';
import { QUERY_KEYS } from '@/constants/queryKeys';

/**
 * Real-time Notifications via WebSocket (Socket.IO)
 * Handles: incoming messages, online status, typing indicators, notifications
 */

/**
 * Notification payload from server
 */
export interface NotificationPayload {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  link_url?: string;
  priority?: string;
  category?: string;
  related_resource_type?: string;
  related_resource_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  } | null;
}

/**
 * Socket events matching backend NotificationSocketEvents
 */
export const NotificationSocketEvents = {
  // Server -> Client
  NEW_NOTIFICATION: 'notification:new',
  UNREAD_COUNT_UPDATE: 'notification:count',
  NOTIFICATION_READ: 'notification:read',
  
  // Client -> Server
  SUBSCRIBE: 'notification:subscribe',
  UNSUBSCRIBE: 'notification:unsubscribe',
  MARK_READ: 'notification:mark-read',
  MARK_ALL_READ: 'notification:mark-all-read'
} as const;

export interface WebSocketEvents {
  'notification:new': (data: NotificationPayload) => void;
  'notification:count': (data: { count: number }) => void;
  'notification:read': (data: { notificationId: string; read_at: string }) => void;
  'user:online': (data: any) => void;
  'user:offline': (data: any) => void;
  'chat:message': (data: any) => void;
  'chat:typing': (data: any) => void;
  'chat:typing-stop': (data: any) => void;
  'status:online-users': (data: any) => void;
}

let socketInstance: Socket | null = null;

/**
 * Initialize WebSocket connection (singleton pattern)
 */
function initializeSocket(token: string): Socket {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // Use VITE_WS_URL for WebSocket, fallback to localhost
  // Note: VITE_API_URL includes /api path which is NOT suitable for Socket.IO
  const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

  socketInstance = io(wsUrl, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    path: '/socket.io',
  });

  socketInstance.on('connect', () => {
    console.log('[WebSocket] Connected:', socketInstance?.id);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('[WebSocket] Disconnected:', reason);
  });

  socketInstance.on('connect_error', (error) => {
    console.error('[WebSocket] Connection error:', error);
  });

  return socketInstance;
}

/**
 * Hook to manage real-time WebSocket connection
 */
export function useNotificationSocket(enabled = true) {
  const { tokens } = useAuthStore();
  const token = tokens?.accessToken;
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !token) return;

    try {
      socketRef.current = initializeSocket(token);
      const socket = socketRef.current;

      // New notification received
      socket.on(NotificationSocketEvents.NEW_NOTIFICATION, (notification: NotificationPayload) => {
        console.log('[Socket] New notification:', notification);
        
        // Invalidate notifications query to refetch
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.notifications.all,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.notifications.unreadCount,
        });
        
        // Show toast notification
        const toastIcon = getNotificationIcon(notification.notification_type);
        toast(notification.title, {
          duration: 5000,
          icon: toastIcon,
          style: {
            borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
          },
        });
      });

      // Unread count updated
      socket.on(NotificationSocketEvents.UNREAD_COUNT_UPDATE, (data: { count: number }) => {
        console.log('[Socket] Unread count update:', data.count);
        queryClient.setQueryData(QUERY_KEYS.notifications.unreadCount, data.count);
      });

      // Notification marked as read
      socket.on(NotificationSocketEvents.NOTIFICATION_READ, (data: { notificationId: string; read_at: string }) => {
        console.log('[Socket] Notification read:', data);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.notifications.all,
        });
      });

      // Chat events
      socket.on('chat:message', (message) => {
        console.log('[Socket] New message:', message);
        queryClient.invalidateQueries({
          queryKey: ['chatMessages', message.courseId],
        });
      });

      socket.on('chat:typing', (data) => {
        console.log('[Socket] User typing:', data);
        queryClient.setQueryData(
          ['typingUsers', data.courseId],
          (old: any) => ({
            ...old,
            [data.userId]: data.userName,
          })
        );
      });

      socket.on('chat:typing-stop', (data) => {
        queryClient.setQueryData(
          ['typingUsers', data.courseId],
          (old: any) => {
            const updated = { ...old };
            delete updated[data.userId];
            return updated;
          }
        );
      });

      // User status events
      socket.on('user:online', (userData) => {
        console.log('[Socket] User online:', userData);
        queryClient.invalidateQueries({
          queryKey: ['onlineUsers'],
        });
      });

      socket.on('user:offline', (userData) => {
        console.log('[Socket] User offline:', userData);
        queryClient.invalidateQueries({
          queryKey: ['onlineUsers'],
        });
      });

      // Online users list update
      socket.on('status:online-users', (users) => {
        queryClient.setQueryData(['onlineUsers'], users);
      });

      return () => {
        if (socket) {
          socket.off(NotificationSocketEvents.NEW_NOTIFICATION);
          socket.off(NotificationSocketEvents.UNREAD_COUNT_UPDATE);
          socket.off(NotificationSocketEvents.NOTIFICATION_READ);
          socket.off('chat:message');
          socket.off('chat:typing');
          socket.off('chat:typing-stop');
          socket.off('user:online');
          socket.off('user:offline');
          socket.off('status:online-users');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Error initializing socket:', error);
    }
  }, [token, enabled, queryClient]);

  const emit = useCallback(
    (event: string, data: any) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, data);
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  /**
   * Mark notification as read via socket
   */
  const markAsRead = useCallback((notificationId: string) => {
    emit(NotificationSocketEvents.MARK_READ, { notificationId });
  }, [emit]);

  /**
   * Mark all notifications as read via socket
   */
  const markAllAsRead = useCallback(() => {
    emit(NotificationSocketEvents.MARK_ALL_READ, {});
  }, [emit]);

  return {
    socket: socketRef.current,
    emit,
    disconnect,
    isConnected: socketRef.current?.connected || false,
    markAsRead,
    markAllAsRead,
  };
}

/**
 * Get icon emoji based on notification type
 */
function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    course: '📚',
    assignment: '📝',
    quiz: '❓',
    grade: '🎯',
    announcement: '📢',
    achievement: '🏆',
    certificate: '🎓',
    message: '💬',
    system: 'ℹ️',
    reminder: '⏰',
  };
  return icons[type] || '🔔';
}

/**
 * Get color based on priority
 */
function getPriorityColor(priority?: string): string {
  const colors: Record<string, string> = {
    urgent: '#ef4444', // red
    high: '#f97316', // orange
    normal: '#3b82f6', // blue
    low: '#6b7280', // gray
  };
  return colors[priority || 'normal'] || colors.normal;
}

/**
 * Hook for sending typing indicators
 */
export function useTypingIndicator(courseId: string) {
  const { socket, emit } = useNotificationSocket(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const sendTyping = useCallback(() => {
    emit('chat:typing', { courseId });

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emit('chat:typing-stop', { courseId });
    }, 3000);
  }, [courseId, emit]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emit('chat:typing-stop', { courseId });
  }, [courseId, emit]);

  return { sendTyping, stopTyping };
}

/**
 * Hook for online status management
 */
export function useOnlineStatus() {
  const { socket, emit } = useNotificationSocket(true);

  const setStatus = useCallback(
    (status: 'online' | 'away' | 'offline') => {
      emit('user:status', { status });
    },
    [emit]
  );

  const goAway = useCallback(() => {
    setStatus('away');
  }, [setStatus]);

  const comeOnline = useCallback(() => {
    setStatus('online');
  }, [setStatus]);

  const goOffline = useCallback(() => {
    setStatus('offline');
  }, [setStatus]);

  return {
    socket,
    setStatus,
    goAway,
    comeOnline,
    goOffline,
  };
}

/**
 * Hook for listening to specific notifications
 */
export function useNotificationListener(type?: string) {
  const { socket } = useNotificationSocket(true);
  const callbackRef = useRef<((notification: any) => void) | null>(null);

  const subscribe = useCallback((callback: (notification: any) => void) => {
    callbackRef.current = callback;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: any) => {
      if (!type || notification.type === type) {
        callbackRef.current?.(notification);
      }
    };

    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('notification:new', handleNotification);
    };
  }, [socket, type]);

  return { subscribe };
}

export default useNotificationSocket;
