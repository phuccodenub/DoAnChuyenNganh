/**
 * useChatSocket Hook
 * 
 * React hook for real-time chat functionality using Socket.IO
 * Handles both DM (Direct Messages) and Course Chat real-time events
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/services/socketService';
import { conversationKeys } from '@/hooks/useConversations';
import { DirectMessage, Conversation } from '@/services/api/conversation.api';
import { ChatMessage } from '@/services/api/chat.api';

// ============ Types ============

interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
}

interface UseDMSocketOptions {
  conversationId?: string;
  onNewMessage?: (message: DirectMessage) => void;
  onTyping?: (user: TypingUser) => void;
  onStopTyping?: (userId: string) => void;
  onRead?: (conversationId: string, userId: string) => void;
}

interface UseCourseChatSocketOptions {
  courseId?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onUserJoined?: (user: { id: string; name: string }) => void;
  onUserLeft?: (user: { id: string; name: string }) => void;
  onTyping?: (user: TypingUser) => void;
  onStopTyping?: (userId: string) => void;
}

// ============ DM Socket Hook ============

/**
 * Hook for Direct Messaging real-time features
 */
export function useDMSocket(options: UseDMSocketOptions = {}) {
  const { conversationId, onNewMessage, onTyping, onStopTyping, onRead } = options;
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track connection state
  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);

    // Check current state
    setIsConnected(socketService.isConnected());

    return () => {
      socketService.offConnect(handleConnect);
      socketService.offDisconnect(handleDisconnect);
    };
  }, []);

  // Join conversation room when conversationId changes
  useEffect(() => {
    if (!conversationId || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // Join conversation room
    socket.emit('dm:join_conversation', { conversationId });

    // Listen for new messages
    const handleNewMessage = (message: DirectMessage) => {
      // Only log if created_at is missing (critical error)
      if (!message.created_at) {
        console.error('❌ Socket message missing created_at!', {
          id: message.id?.substring(0, 8),
          message_keys: Object.keys(message),
        });
      }
      
      // Update query cache
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.unreadCount() });

      // Call callback
      onNewMessage?.(message);
    };

    // Listen for typing events
    const handleTyping = (data: { conversationId: string; user: TypingUser }) => {
      if (data.conversationId === conversationId) {
        onTyping?.(data.user);
      }
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        onStopTyping?.(data.userId);
      }
    };

    // Listen for read events
    const handleRead = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        onRead?.(data.conversationId, data.userId);
        queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      }
    };

    socket.on('dm:new_message', handleNewMessage);
    socket.on('dm:typing', handleTyping);
    socket.on('dm:stop_typing', handleStopTyping);
    socket.on('dm:read', handleRead);

    return () => {
      socket.emit('dm:leave_conversation', { conversationId });
      socket.off('dm:new_message', handleNewMessage);
      socket.off('dm:typing', handleTyping);
      socket.off('dm:stop_typing', handleStopTyping);
      socket.off('dm:read', handleRead);
    };
  }, [conversationId, isConnected, onNewMessage, onTyping, onStopTyping, onRead, queryClient]);

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!conversationId || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('dm:typing', { conversationId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('dm:stop_typing', { conversationId });
    }, 3000);
  }, [conversationId, isConnected]);

  // Send stop typing indicator
  const sendStopTyping = useCallback(() => {
    if (!conversationId || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('dm:stop_typing', { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId, isConnected]);

  // Mark as read
  const markAsRead = useCallback(() => {
    if (!conversationId || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('dm:mark_read', { conversationId });
  }, [conversationId, isConnected]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    sendTyping,
    sendStopTyping,
    markAsRead,
  };
}

// ============ Course Chat Socket Hook ============

/**
 * Hook for Course Chat real-time features
 */
// Online user type from backend
interface OnlineUserInfo {
  userId: string;
  userName: string;
  avatar?: string;
  isOnline: boolean;
}

export function useCourseChatSocket(options: UseCourseChatSocketOptions = {}) {
  const { courseId, onNewMessage, onUserJoined, onUserLeft, onTyping, onStopTyping } = options;
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserInfo[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs for callbacks to avoid re-registering socket listeners
  const callbacksRef = useRef({ onNewMessage, onUserJoined, onUserLeft, onTyping, onStopTyping });
  callbacksRef.current = { onNewMessage, onUserJoined, onUserLeft, onTyping, onStopTyping };

  // Track connection state
  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);

    setIsConnected(socketService.isConnected());

    return () => {
      socketService.offConnect(handleConnect);
      socketService.offDisconnect(handleDisconnect);
    };
  }, []);

  // Join course chat room when courseId changes
  useEffect(() => {
    if (!courseId || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // Join course room
    socket.emit('chat:join_room', { courseId });

    // Listen for new messages
    const handleNewMessage = (message: ChatMessage) => {
      // Invalidate query cache
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'messages', courseId] 
      });

      callbacksRef.current.onNewMessage?.(message);
    };

    // Listen for user join/leave events
    const handleUserJoined = (data: { userId: string; userName: string; timestamp: Date }) => {
      // Backend emits to room, not specific courseId in payload
      setOnlineUsers(prev => {
        const existing = prev.find(u => u.userId === data.userId);
        if (existing) return prev;
        return [...prev, { userId: data.userId, userName: data.userName, isOnline: true }];
      });
      callbacksRef.current.onUserJoined?.({ id: data.userId, name: data.userName });
    };

    const handleUserLeft = (data: { userId: string; userName: string; timestamp: Date }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      callbacksRef.current.onUserLeft?.({ id: data.userId, name: data.userName });
    };

    // Listen for typing events
    const handleTyping = (data: { courseId: string; user: TypingUser }) => {
      if (data.courseId === courseId) {
        callbacksRef.current.onTyping?.(data.user);
      }
    };

    const handleStopTyping = (data: { courseId: string; userId: string }) => {
      if (data.courseId === courseId) {
        callbacksRef.current.onStopTyping?.(data.userId);
      }
    };

    // Listen for online users list
    const handleOnlineUsers = (data: { courseId: string; users: OnlineUserInfo[] }) => {
      if (data.courseId === courseId) {
        setOnlineUsers(data.users || []);
      }
    };

    socket.on('chat:new_message', handleNewMessage);
    socket.on('chat:user_joined', handleUserJoined);
    socket.on('chat:user_left', handleUserLeft);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop_typing', handleStopTyping);
    socket.on('chat:online_users', handleOnlineUsers);

    return () => {
      socket.emit('chat:leave_room', { courseId });
      socket.off('chat:new_message', handleNewMessage);
      socket.off('chat:user_joined', handleUserJoined);
      socket.off('chat:user_left', handleUserLeft);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop_typing', handleStopTyping);
      socket.off('chat:online_users', handleOnlineUsers);
    };
    // Only re-register when courseId or connection changes - NOT callbacks
  }, [courseId, isConnected, queryClient]);

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!courseId || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('chat:typing', { courseId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:stop_typing', { courseId });
    }, 3000);
  }, [courseId, isConnected]);

  // Send stop typing indicator
  const sendStopTyping = useCallback(() => {
    if (!courseId || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('chat:stop_typing', { courseId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [courseId, isConnected]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    onlineUsers,
    sendTyping,
    sendStopTyping,
  };
}

// ============ Global Chat Notifications Hook ============

/**
 * Hook for global chat notifications (unread counts, new message alerts)
 */
export function useChatNotifications() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.onConnect(handleConnect);
    socketService.onDisconnect(handleDisconnect);

    setIsConnected(socketService.isConnected());

    return () => {
      socketService.offConnect(handleConnect);
      socketService.offDisconnect(handleDisconnect);
    };
  }, []);

  // Listen for any new message to update unread count
  useEffect(() => {
    if (!isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    const handleAnyNewMessage = () => {
      // Refresh unread count
      queryClient.invalidateQueries({ queryKey: conversationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    };

    socket.on('dm:new_message', handleAnyNewMessage);
    socket.on('chat:new_message', handleAnyNewMessage);

    return () => {
      socket.off('dm:new_message', handleAnyNewMessage);
      socket.off('chat:new_message', handleAnyNewMessage);
    };
  }, [isConnected, queryClient]);

  return {
    isConnected,
  };
}

export default {
  useDMSocket,
  useCourseChatSocket,
  useChatNotifications,
};
