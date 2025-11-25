/**
 * useLivestreamSocket Hook
 * 
 * Hook để quản lý Socket.IO connection cho livestream:
 * - Auto join/leave session
 * - Real-time chat messages
 * - Viewer count tracking
 * - Reactions
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { socketService } from '@/services/socketService';
import { useAuthStore } from '@/stores/authStore.enhanced';

// Socket Events (matching backend)
export enum LiveStreamSocketEvents {
  // Client → Server
  JOIN_SESSION = 'livestream:join_session',
  LEAVE_SESSION = 'livestream:leave_session',
  SEND_MESSAGE = 'livestream:send_message',
  SEND_REACTION = 'livestream:send_reaction',
  TYPING_START = 'livestream:typing_start',
  TYPING_STOP = 'livestream:typing_stop',
  
  // Server → Client
  SESSION_JOINED = 'livestream:session_joined',
  SESSION_LEFT = 'livestream:session_left',
  VIEWER_JOINED = 'livestream:viewer_joined',
  VIEWER_LEFT = 'livestream:viewer_left',
  VIEWER_COUNT_UPDATED = 'livestream:viewer_count_updated',
  NEW_MESSAGE = 'livestream:new_message',
  MESSAGE_SENT = 'livestream:message_sent',
  REACTION_RECEIVED = 'livestream:reaction_received',
  USER_TYPING = 'livestream:user_typing',
  SESSION_STARTED = 'livestream:session_started',
  SESSION_ENDED = 'livestream:session_ended',
  ERROR = 'livestream:error',
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  message_type: 'text' | 'emoji' | 'system';
  reply_to?: string | null;
  timestamp: string;
}

export interface ViewerInfo {
  userId: string;
  userName: string;
  avatar?: string;
  joinedAt: Date | string;
}

export interface ViewerCountData {
  sessionId: string;
  count: number;
  viewers: ViewerInfo[];
}

export interface UseLivestreamSocketOptions {
  sessionId: string | undefined;
  enabled?: boolean;
  sessionStatus?: 'scheduled' | 'live' | 'ended' | 'cancelled'; // Session status để check trước khi join
  onViewerCountUpdate?: (data: ViewerCountData) => void;
  onNewMessage?: (message: ChatMessage) => void;
  onReaction?: (data: { emoji: string; userId: string; userName: string }) => void;
  onError?: (error: { code: string; message: string }) => void;
}

export function useLivestreamSocket(options: UseLivestreamSocketOptions) {
  const {
    sessionId,
    enabled = true,
    sessionStatus,
    onViewerCountUpdate,
    onNewMessage,
    onReaction,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [viewers, setViewers] = useState<ViewerInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const handlersRef = useRef<Map<string, (...args: any[]) => void>>(new Map());
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const user = useAuthStore((state) => state.user);

  // Setup event handlers
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const setupHandlers = async () => {
      const socket = await socketService.connect();
      if (!socket) {
        console.warn('[useLivestreamSocket] Socket not connected');
        return;
      }

      setIsConnected(socket.connected);

      // Connection handlers
      const onConnect = () => {
        setIsConnected(true);
        console.log('[useLivestreamSocket] Connected');
      };

      const onDisconnect = () => {
        setIsConnected(false);
        setIsJoined(false);
        console.log('[useLivestreamSocket] Disconnected');
      };

      // Session handlers
      const onSessionJoined = (data: { sessionId: string; viewerCount: number; messages?: ChatMessage[] }) => {
        setIsJoined(true);
        
        // Load message history if provided
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          // Remove duplicates by ID before setting
          const uniqueMessages = data.messages.filter((msg, index, self) => 
            index === self.findIndex((m) => m.id === msg.id)
          );
          setMessages(uniqueMessages);
          console.log(`[useLivestreamSocket] Loaded ${uniqueMessages.length} messages from history`);
        }
        
        console.log('[useLivestreamSocket] Joined session:', data);
      };

      const onSessionLeft = () => {
        setIsJoined(false);
        console.log('[useLivestreamSocket] Left session');
      };

      // Viewer count handlers
      const onViewerCountUpdated = (data: ViewerCountData) => {
        setViewerCount(data.count);
        setViewers(data.viewers);
        onViewerCountUpdate?.(data);
      };

      const onViewerJoined = (data: { sessionId: string; viewer: ViewerInfo; viewerCount: number }) => {
        setViewerCount(data.viewerCount);
        onViewerCountUpdate?.({ sessionId: data.sessionId, count: data.viewerCount, viewers: [] });
      };

      const onViewerLeft = (data: { sessionId: string; viewer: ViewerInfo; viewerCount: number }) => {
        setViewerCount(data.viewerCount);
        onViewerCountUpdate?.({ sessionId: data.sessionId, count: data.viewerCount, viewers: [] });
      };

      // Chat handlers
      const onNewMessageHandler = (message: ChatMessage) => {
        setMessages((prev) => {
          // Check for duplicates by ID
          if (prev.some((m) => m.id === message.id)) {
            console.debug('[useLivestreamSocket] Duplicate message ignored:', message.id);
            return prev;
          }
          return [...prev, message];
        });
        onNewMessage?.(message);
      };

      const onUserTyping = (data: { userId: string; userName: string; isTyping: boolean }) => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (data.isTyping) {
            next.add(data.userName);
          } else {
            next.delete(data.userName);
          }
          return next;
        });
      };

      // Reaction handlers
      const onReactionReceived = (data: { emoji: string; userId: string; userName: string }) => {
        onReaction?.(data);
      };

      // Error handler
      const onErrorHandler = (error: { code: string; message: string }) => {
        console.error('[useLivestreamSocket] Error:', error);
        onError?.(error);
      };

      // Register handlers
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on(LiveStreamSocketEvents.SESSION_JOINED, onSessionJoined);
      socket.on(LiveStreamSocketEvents.SESSION_LEFT, onSessionLeft);
      socket.on(LiveStreamSocketEvents.VIEWER_COUNT_UPDATED, onViewerCountUpdated);
      socket.on(LiveStreamSocketEvents.VIEWER_JOINED, onViewerJoined);
      socket.on(LiveStreamSocketEvents.VIEWER_LEFT, onViewerLeft);
      socket.on(LiveStreamSocketEvents.NEW_MESSAGE, onNewMessageHandler);
      socket.on(LiveStreamSocketEvents.USER_TYPING, onUserTyping);
      socket.on(LiveStreamSocketEvents.REACTION_RECEIVED, onReactionReceived);
      socket.on(LiveStreamSocketEvents.ERROR, onErrorHandler);

      // Store handlers for cleanup
      handlersRef.current.set('connect', onConnect);
      handlersRef.current.set('disconnect', onDisconnect);
      handlersRef.current.set(LiveStreamSocketEvents.SESSION_JOINED, onSessionJoined);
      handlersRef.current.set(LiveStreamSocketEvents.SESSION_LEFT, onSessionLeft);
      handlersRef.current.set(LiveStreamSocketEvents.VIEWER_COUNT_UPDATED, onViewerCountUpdated);
      handlersRef.current.set(LiveStreamSocketEvents.VIEWER_JOINED, onViewerJoined);
      handlersRef.current.set(LiveStreamSocketEvents.VIEWER_LEFT, onViewerLeft);
      handlersRef.current.set(LiveStreamSocketEvents.NEW_MESSAGE, onNewMessageHandler);
      handlersRef.current.set(LiveStreamSocketEvents.USER_TYPING, onUserTyping);
      handlersRef.current.set(LiveStreamSocketEvents.REACTION_RECEIVED, onReactionReceived);
      handlersRef.current.set(LiveStreamSocketEvents.ERROR, onErrorHandler);
    };

    setupHandlers();

    // Cleanup
    return () => {
      const socket = socketService.getSocket();
      if (socket) {
        handlersRef.current.forEach((handler, event) => {
          socket.off(event, handler);
        });
        handlersRef.current.clear();
      }
    };
  }, [enabled, sessionId, onViewerCountUpdate, onNewMessage, onReaction, onError]);

  // Auto join session with retry logic
  useEffect(() => {
    if (!enabled || !sessionId || !isConnected || isJoined || !user) return;

    // Chỉ join nếu session status là "live" hoặc "scheduled" (backend requirement)
    if (sessionStatus && sessionStatus !== 'live' && sessionStatus !== 'scheduled') {
      console.log(`[useLivestreamSocket] Skipping join: session status is "${sessionStatus}"`);
      return;
    }

    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds

    const joinSession = async () => {
      const socket = await socketService.connect();
      if (!socket) return;

      try {
        console.log(`[useLivestreamSocket] Attempting to join session ${sessionId} (attempt ${retryCount + 1}/${maxRetries})...`);
        socketService.emit(LiveStreamSocketEvents.JOIN_SESSION, {
          sessionId,
          userId: user.id,
        });
      } catch (error) {
        console.error('[useLivestreamSocket] Error emitting join:', error);
      }
    };

    // Initial join attempt
    joinSession();

    // Retry logic: Nếu sau retryDelay chưa join được, retry
    const retryInterval = setInterval(() => {
      if (!isJoined && retryCount < maxRetries - 1) {
        retryCount++;
        console.log(`[useLivestreamSocket] Retrying join (attempt ${retryCount + 1}/${maxRetries})...`);
        joinSession();
      } else {
        clearInterval(retryInterval);
      }
    }, retryDelay);

    return () => {
      clearInterval(retryInterval);
    };
  }, [enabled, sessionId, isConnected, isJoined, user, sessionStatus]);

  // Auto leave on unmount
  useEffect(() => {
    return () => {
      if (sessionId && isJoined && user) {
        socketService.emit(LiveStreamSocketEvents.LEAVE_SESSION, {
          sessionId,
          userId: user.id,
        });
      }
    };
  }, [sessionId, isJoined, user]);

  // Send message
  const sendMessage = useCallback(
    (message: string, messageType: 'text' | 'emoji' | 'system' = 'text', replyTo?: string) => {
      if (!sessionId || !user || !message.trim()) return;

      socketService.emit(LiveStreamSocketEvents.SEND_MESSAGE, {
        session_id: sessionId,
        sender_id: user.id,
        message: message.trim(),
        message_type: messageType,
        reply_to: replyTo,
      });
    },
    [sessionId, user]
  );

  // Send reaction
  const sendReaction = useCallback(
    (emoji: string) => {
      if (!sessionId || !user || !isJoined) {
        console.warn('[useLivestreamSocket] Cannot send reaction: not joined');
        return;
      }

      console.log('[useLivestreamSocket] Sending reaction:', emoji);
      socketService.emit(LiveStreamSocketEvents.SEND_REACTION, {
        sessionId,
        userId: user.id,
        emoji,
      });
    },
    [sessionId, user, isJoined]
  );

  // Typing indicator
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!sessionId || !isJoined) return;

      // Clear existing timeout
      const existingTimeout = typingTimeoutRef.current.get(sessionId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        typingTimeoutRef.current.delete(sessionId);
      }

      if (isTyping) {
        socketService.emit(LiveStreamSocketEvents.TYPING_START, { sessionId });
      } else {
        socketService.emit(LiveStreamSocketEvents.TYPING_STOP, { sessionId });
      }
    },
    [sessionId, isJoined]
  );

  return {
    isConnected,
    isJoined,
    viewerCount,
    viewers,
    messages,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    sendReaction,
    setTyping,
  };
}

