import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore.enhanced';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { socketService } from '@/services/socketService';

/**
 * Real-time Notifications via WebSocket (Socket.IO)
 * Handles: incoming messages, online status, typing indicators, notifications
 * 
 * ⚠️ PERFORMANCE OPTIMIZATION (v2.0 - 2025-12-02):
 * - Sử dụng socketService singleton thay vì tạo socket riêng
 * - Chỉ subscribe vào accessToken thay vì toàn bộ tokens object
 * - Sử dụng ref để giữ queryClient stable
 * - Tránh re-connect không cần thiết khi tokens object reference thay đổi
 * - FIX: Loại bỏ multiple socket instances gây timeout error
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

/**
 * Hook to manage real-time WebSocket connection
 * 
 * FIX 2025-12-03: PASSIVE Socket Hook
 * - Hook này KHÔNG khởi tạo socket connection
 * - Chỉ lắng nghe events nếu socket đã connected (bởi AppProviders)
 * - Component vẫn hoạt động bình thường không cần socket
 * - Socket chỉ là enhancement cho real-time updates
 */
export function useNotificationSocket(enabled = true) {
  // ✅ Chỉ subscribe vào accessToken thay vì toàn bộ tokens object
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersSetupRef = useRef(false);
  
  // Sử dụng ref để giữ queryClient stable
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  useEffect(() => {
    // Nếu không enabled hoặc không có token, không làm gì
    if (!enabled || !token) {
      setIsConnected(false);
      return;
    }

    let isMounted = true;
    
    // ============================================
    // PASSIVE: Chỉ setup listeners, KHÔNG connect
    // ============================================
    const setupListeners = (socket: Socket) => {
      if (!isMounted || listenersSetupRef.current) return;
      
      listenersSetupRef.current = true;
      socketRef.current = socket;
      setIsConnected(socket.connected);
      
      const qc = queryClientRef.current;
      console.log('[useNotificationSocket] Setting up listeners on socket:', socket.id);

      // Connection status tracking
      const onConnect = () => {
        if (isMounted) {
          console.log('[useNotificationSocket] Socket connected');
          setIsConnected(true);
        }
      };
      
      const onDisconnect = () => {
        if (isMounted) {
          console.log('[useNotificationSocket] Socket disconnected');
          setIsConnected(false);
        }
      };

      // New notification received
      const onNewNotification = (notification: NotificationPayload) => {
        console.log('[Socket] New notification:', notification);
        
        // Invalidate notifications query to refetch
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.notifications.all,
        });
        qc.invalidateQueries({
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
      };

      // Unread count updated
      const onUnreadCount = (data: { count: number }) => {
        console.log('[Socket] Unread count update:', data.count);
        qc.setQueryData(QUERY_KEYS.notifications.unreadCount, data.count);
      };

      // Notification marked as read
      const onNotificationRead = (data: { notificationId: string; read_at: string }) => {
        console.log('[Socket] Notification read:', data);
        qc.invalidateQueries({
          queryKey: QUERY_KEYS.notifications.all,
        });
      };

      // Chat events
      const onChatMessage = (message: any) => {
        console.log('[Socket] New message:', message);
        qc.invalidateQueries({
          queryKey: ['chatMessages', message.courseId],
        });
      };

      const onChatTyping = (data: any) => {
        console.log('[Socket] User typing:', data);
        qc.setQueryData(
          ['typingUsers', data.courseId],
          (old: any) => ({
            ...old,
            [data.userId]: data.userName,
          })
        );
      };

      const onChatTypingStop = (data: any) => {
        qc.setQueryData(
          ['typingUsers', data.courseId],
          (old: any) => {
            const updated = { ...old };
            delete updated[data.userId];
            return updated;
          }
        );
      };

      // User status events
      const onUserOnline = (userData: any) => {
        console.log('[Socket] User online:', userData);
        qc.invalidateQueries({
          queryKey: ['onlineUsers'],
        });
      };

      const onUserOffline = (userData: any) => {
        console.log('[Socket] User offline:', userData);
        qc.invalidateQueries({
          queryKey: ['onlineUsers'],
        });
      };

      // Online users list update
      const onOnlineUsers = (users: any) => {
        qc.setQueryData(['onlineUsers'], users);
      };

      // Register all event handlers
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on(NotificationSocketEvents.NEW_NOTIFICATION, onNewNotification);
      socket.on(NotificationSocketEvents.UNREAD_COUNT_UPDATE, onUnreadCount);
      socket.on(NotificationSocketEvents.NOTIFICATION_READ, onNotificationRead);
      socket.on('chat:message', onChatMessage);
      socket.on('chat:typing', onChatTyping);
      socket.on('chat:typing-stop', onChatTypingStop);
      socket.on('user:online', onUserOnline);
      socket.on('user:offline', onUserOffline);
      socket.on('status:online-users', onOnlineUsers);

      // Return cleanup function
      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off(NotificationSocketEvents.NEW_NOTIFICATION, onNewNotification);
        socket.off(NotificationSocketEvents.UNREAD_COUNT_UPDATE, onUnreadCount);
        socket.off(NotificationSocketEvents.NOTIFICATION_READ, onNotificationRead);
        socket.off('chat:message', onChatMessage);
        socket.off('chat:typing', onChatTyping);
        socket.off('chat:typing-stop', onChatTypingStop);
        socket.off('user:online', onUserOnline);
        socket.off('user:offline', onUserOffline);
        socket.off('status:online-users', onOnlineUsers);
      };
    };
    
    let cleanupFn: (() => void) | undefined;
    
    // ============================================
    // PASSIVE: Chỉ dùng socket nếu đã connected
    // KHÔNG gọi connectNonBlocking() ở đây!
    // ============================================
    const existingSocket = socketService.getSocketIfConnected();
    if (existingSocket) {
      console.log('[useNotificationSocket] Using existing connected socket');
      cleanupFn = setupListeners(existingSocket);
    } else {
      console.log('[useNotificationSocket] No socket available - waiting passively');
    }
    
    // ============================================
    // Subscribe để setup listeners khi socket connect trong tương lai
    // (AppProviders sẽ quản lý việc connect)
    // ============================================
    const onSocketConnect = () => {
      const socket = socketService.getSocket();
      if (socket && !listenersSetupRef.current) {
        console.log('[useNotificationSocket] Socket became available, setting up listeners');
        cleanupFn = setupListeners(socket);
      }
    };
    
    socketService.onConnect(onSocketConnect);
    
    // ⚠️ KHÔNG gọi connectNonBlocking() ở đây!
    // AppProviders đã quản lý socket lifecycle

    return () => {
      isMounted = false;
      listenersSetupRef.current = false;
      socketService.offConnect(onSocketConnect);
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [token, enabled]);

  const emit = useCallback(
    (event: string, data: any) => {
      const socket = socketService.getSocket();
      if (socket?.connected) {
        socket.emit(event, data);
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    // ⚠️ Không disconnect socketService trực tiếp từ hook
    // AppProviders quản lý lifecycle của socket connection
    console.warn('[useNotificationSocket] disconnect() called - socketService manages connection lifecycle');
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
    isConnected,
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
