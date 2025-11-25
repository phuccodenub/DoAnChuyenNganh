import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

/**
 * Real-time Notifications via WebSocket (Socket.IO)
 * Handles: incoming messages, online status, typing indicators, notifications
 */

export interface WebSocketEvents {
  'notification:new': (data: any) => void;
  'notification:read': (data: any) => void;
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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  socketInstance = io(apiUrl, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
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
  const { user, token } = { user: null, token: '' }; // Placeholder - integrate with actual auth store
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !token) return;

    try {
      socketRef.current = initializeSocket(token);
      const socket = socketRef.current;

      // Notification events
      socket.on('notification:new', (notification) => {
        console.log('[Socket] New notification:', notification);
        // Invalidate notifications query
        queryClient.invalidateQueries({
          queryKey: ['notifications'],
        });
        // Show toast
        toast.success(notification.title, {
          duration: 5000,
        });
      });

      socket.on('notification:read', (data) => {
        queryClient.invalidateQueries({
          queryKey: ['notifications'],
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
          socket.off('notification:new');
          socket.off('notification:read');
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

  return {
    socket: socketRef.current,
    emit,
    disconnect,
    isConnected: socketRef.current?.connected || false,
  };
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
