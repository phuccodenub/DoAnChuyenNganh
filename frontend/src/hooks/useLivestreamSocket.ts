/**
 * useLivestreamSocket Hook
 * 
 * Hook để quản lý Socket.IO connection cho livestream:
 * - Auto join/leave session
 * - Real-time chat messages
 * - Viewer count tracking
 * - Reactions
 * 
 * ⚠️ PERFORMANCE OPTIMIZATION:
 * - Chỉ subscribe vào các fields cần thiết từ user (id, first_name, last_name, email, avatar_url)
 * - Sử dụng useRef để giữ callbacks stable
 * - Tránh re-render và reconnect không cần thiết
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Socket } from 'socket.io-client';
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
  COMMENT_BLOCKED = 'livestream:comment_blocked',
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

export interface CommentBlockedData {
  sessionId: string;
  userId: string;
  userName: string;
  message: string;
  reason?: string;
  riskScore?: number;
  riskCategories?: string[];
  timestamp: string;
}

export interface UseLivestreamSocketOptions {
  sessionId: string | undefined;
  enabled?: boolean;
  sessionStatus?: 'scheduled' | 'live' | 'ended' | 'cancelled'; // Session status để check trước khi join
  onViewerCountUpdate?: (data: ViewerCountData) => void;
  onNewMessage?: (message: ChatMessage) => void;
  onReaction?: (data: { emoji: string; userId: string; userName: string }) => void;
  onSessionEnded?: (data: { sessionId: string }) => void;
  onError?: (error: { code: string; message: string }) => void;
  onCommentBlocked?: (data: CommentBlockedData) => void; // Callback khi có comment bị chặn (chỉ cho host)
}

export function useLivestreamSocket(options: UseLivestreamSocketOptions) {
  const {
    sessionId,
    enabled = true,
    sessionStatus,
    onViewerCountUpdate,
    onNewMessage,
    onReaction,
    onSessionEnded,
    onError,
    onCommentBlocked,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [viewers, setViewers] = useState<ViewerInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const handlersRef = useRef<Map<string, (...args: any[]) => void>>(new Map());
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingMessagesRef = useRef<Map<string, ChatMessage>>(new Map()); // tempId -> optimistic message
  
  // ✅ CHỈ subscribe vào các fields cần thiết từ user
  // Điều này ngăn re-render khi các fields khác thay đổi
  const userId = useAuthStore((state) => state.user?.id);
  const userFirstName = useAuthStore((state) => state.user?.first_name);
  const userLastName = useAuthStore((state) => state.user?.last_name);
  const userEmail = useAuthStore((state) => state.user?.email);
  const userAvatarUrl = useAuthStore((state) => state.user?.avatar_url);
  
  // Memoize user info để tránh tạo object mới mỗi render
  const userInfo = useMemo(() => {
    if (!userId) return null;
    return {
      id: userId,
      first_name: userFirstName,
      last_name: userLastName,
      email: userEmail,
      avatar_url: userAvatarUrl,
    };
  }, [userId, userFirstName, userLastName, userEmail, userAvatarUrl]);
  
  // Sử dụng ref để giữ callbacks stable và tránh re-register handlers
  const callbacksRef = useRef({
    onViewerCountUpdate,
    onNewMessage,
    onReaction,
    onSessionEnded,
    onError,
    onCommentBlocked,
  });
  
  // Update refs khi callbacks thay đổi (không trigger re-render)
  useEffect(() => {
    callbacksRef.current = {
      onViewerCountUpdate,
      onNewMessage,
      onReaction,
      onSessionEnded,
      onError,
      onCommentBlocked,
    };
  });

  // Setup event handlers - CHỈ phụ thuộc vào enabled và sessionId
  // NON-BLOCKING: Không đợi socket connect
  useEffect(() => {
    if (!enabled || !sessionId) return;

    let isMounted = true;
    let cleanupFn: (() => void) | undefined;
    
    const setupHandlers = (socket: Socket) => {
      if (!isMounted) return;
      
      setIsConnected(socket.connected);
      console.log('[useLivestreamSocket] Setting up handlers on socket:', socket.id);

      // Connection handlers
      const onConnect = () => {
        if (!isMounted) return;
        setIsConnected(true);
        console.log('[useLivestreamSocket] Connected');
      };

      const onDisconnect = () => {
        if (!isMounted) return;
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

      // Viewer count handlers - sử dụng ref để gọi callback
      const onViewerCountUpdated = (data: ViewerCountData) => {
        setViewerCount(data.count);
        setViewers(data.viewers);
        callbacksRef.current.onViewerCountUpdate?.(data);
      };

      const onViewerJoined = (data: { sessionId: string; viewer: ViewerInfo; viewerCount: number }) => {
        setViewerCount(data.viewerCount);
        callbacksRef.current.onViewerCountUpdate?.({ sessionId: data.sessionId, count: data.viewerCount, viewers: [] });
      };

      const onViewerLeft = (data: { sessionId: string; viewer: ViewerInfo; viewerCount: number }) => {
        setViewerCount(data.viewerCount);
        callbacksRef.current.onViewerCountUpdate?.({ sessionId: data.sessionId, count: data.viewerCount, viewers: [] });
      };

      // Chat handlers
      const onNewMessageHandler = (message: ChatMessage) => {
        setMessages((prev) => {
          // First, check for duplicates by ID (fast check)
          const existingMessage = prev.find((m) => m.id === message.id);
          if (existingMessage) {
            // Message already exists, ignore duplicate
            // Only log if it's not from our own optimistic update (to reduce noise)
            const isFromOptimistic = pendingMessagesRef.current.has(message.id) || 
              prev.some((m) => m.id.startsWith('temp-') && m.sender_id === message.sender_id && m.message.trim() === message.message.trim());
            if (!isFromOptimistic) {
            console.debug('[useLivestreamSocket] Duplicate message ignored:', message.id);
            }
            return prev;
          }

          // Check if this message matches a pending optimistic message
          // Match by sender_id, message content, and timestamp (within 5 seconds)
          const messageTime = new Date(message.timestamp).getTime();
          
          for (const [tempId, pendingMsg] of pendingMessagesRef.current.entries()) {
            const timeDiff = Math.abs(messageTime - new Date(pendingMsg.timestamp).getTime());
            const isSameSender = pendingMsg.sender_id === message.sender_id;
            const isSameContent = pendingMsg.message.trim() === message.message.trim();
            
            if (isSameSender && isSameContent && timeDiff < 5000) {
              // Replace optimistic message with real one
              pendingMessagesRef.current.delete(tempId);
              console.debug('[useLivestreamSocket] Replacing optimistic message with server message:', tempId, '->', message.id);
              
              // Replace the optimistic message in the array
              return prev.map((m) => (m.id === tempId ? message : m));
            }
          }

          // If no optimistic message match found, add as new message
          return [...prev, message];
        });
        callbacksRef.current.onNewMessage?.(message);
      };

      const onMessageSent = (data: { messageId: string }) => {
        console.log('[useLivestreamSocket] Message sent ACK received:', data);
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
        callbacksRef.current.onReaction?.(data);
      };

      // Session ended handler
      const onSessionEndedHandler = (data: { sessionId: string }) => {
        console.log('[useLivestreamSocket] Session ended:', data);
        callbacksRef.current.onSessionEnded?.(data);
      };

      // Error handler
      const onErrorHandler = (error: { code: string; message: string }) => {
        console.error('[useLivestreamSocket] Error:', error);
        callbacksRef.current.onError?.(error);
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
      socket.on(LiveStreamSocketEvents.MESSAGE_SENT, onMessageSent);
      socket.on(LiveStreamSocketEvents.USER_TYPING, onUserTyping);
      socket.on(LiveStreamSocketEvents.REACTION_RECEIVED, onReactionReceived);
      socket.on(LiveStreamSocketEvents.SESSION_ENDED, onSessionEndedHandler);
      socket.on(LiveStreamSocketEvents.ERROR, onErrorHandler);
      
      // Comment blocked handler (only for host)
      const onCommentBlockedHandler = (data: CommentBlockedData) => {
        console.log('[useLivestreamSocket] Comment blocked:', data);
        callbacksRef.current.onCommentBlocked?.(data);
      };
      socket.on(LiveStreamSocketEvents.COMMENT_BLOCKED, onCommentBlockedHandler);
      handlersRef.current.set(LiveStreamSocketEvents.COMMENT_BLOCKED, onCommentBlockedHandler);

      // Store handlers for cleanup
      handlersRef.current.set('connect', onConnect);
      handlersRef.current.set('disconnect', onDisconnect);
      handlersRef.current.set(LiveStreamSocketEvents.SESSION_JOINED, onSessionJoined);
      handlersRef.current.set(LiveStreamSocketEvents.SESSION_LEFT, onSessionLeft);
      handlersRef.current.set(LiveStreamSocketEvents.VIEWER_COUNT_UPDATED, onViewerCountUpdated);
      handlersRef.current.set(LiveStreamSocketEvents.VIEWER_JOINED, onViewerJoined);
      handlersRef.current.set(LiveStreamSocketEvents.VIEWER_LEFT, onViewerLeft);
      handlersRef.current.set(LiveStreamSocketEvents.NEW_MESSAGE, onNewMessageHandler);
      handlersRef.current.set(LiveStreamSocketEvents.MESSAGE_SENT, onMessageSent);
      handlersRef.current.set(LiveStreamSocketEvents.USER_TYPING, onUserTyping);
      handlersRef.current.set(LiveStreamSocketEvents.REACTION_RECEIVED, onReactionReceived);
      handlersRef.current.set(LiveStreamSocketEvents.SESSION_ENDED, onSessionEndedHandler);
      handlersRef.current.set(LiveStreamSocketEvents.ERROR, onErrorHandler);
      
      // Return cleanup function
      return () => {
        handlersRef.current.forEach((handler, event) => {
          socket.off(event, handler);
        });
        handlersRef.current.clear();
      };
    };

    // ============================================
    // PASSIVE: Try existing socket first
    // ============================================
    const existingSocket = socketService.getSocketIfConnected();
    if (existingSocket) {
      console.log('[useLivestreamSocket] Using existing connected socket');
      cleanupFn = setupHandlers(existingSocket);
    }
    
    // ============================================
    // PASSIVE: Subscribe to future connections
    // AppProviders manages connection lifecycle
    // ============================================
    const onSocketConnect = () => {
      const socket = socketService.getSocket();
      if (socket && isMounted && !cleanupFn) {
        cleanupFn = setupHandlers(socket);
      }
    };
    
    socketService.onConnect(onSocketConnect);
    
    // ⚠️ REMOVED: socketService.connectNonBlocking();
    // Connection is managed by AppProviders ONLY
    // Livestream pages will get socket when AppProviders connects it

    // Cleanup
    return () => {
      isMounted = false;
      socketService.offConnect(onSocketConnect);
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [enabled, sessionId]); // ✅ Chỉ phụ thuộc vào enabled và sessionId

  // Auto join session with retry logic - CHỈ phụ thuộc vào userId thay vì toàn bộ user
  useEffect(() => {
    if (!enabled || !sessionId || !isConnected || isJoined || !userId) return;

    // Chỉ join nếu session status là "live" hoặc "scheduled" (backend requirement)
    if (sessionStatus && sessionStatus !== 'live' && sessionStatus !== 'scheduled') {
      console.log(`[useLivestreamSocket] Skipping join: session status is "${sessionStatus}"`);
      return;
    }

    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds
    let isCancelled = false;

    const joinSession = () => {
      if (isCancelled) return;
      
      // Use getSocketIfConnected since we're in the isConnected=true branch
      const socket = socketService.getSocketIfConnected();
      if (!socket || isCancelled) {
        console.warn('[useLivestreamSocket] Socket not connected when trying to join');
        return;
      }

      try {
        console.log(`[useLivestreamSocket] Attempting to join session ${sessionId} (attempt ${retryCount + 1}/${maxRetries})...`);
        socketService.emit(LiveStreamSocketEvents.JOIN_SESSION, {
          sessionId,
          userId: userId,
        });
      } catch (error) {
        console.error('[useLivestreamSocket] Error emitting join:', error);
      }
    };

    // Initial join attempt
    joinSession();

    // Retry logic: Nếu sau retryDelay chưa join được, retry
    const retryInterval = setInterval(() => {
      if (isCancelled) {
        clearInterval(retryInterval);
        return;
      }
      if (!isJoined && retryCount < maxRetries - 1) {
        retryCount++;
        console.log(`[useLivestreamSocket] Retrying join (attempt ${retryCount + 1}/${maxRetries})...`);
        joinSession();
      } else {
        clearInterval(retryInterval);
      }
    }, retryDelay);

    return () => {
      isCancelled = true;
      clearInterval(retryInterval);
    };
  }, [enabled, sessionId, isConnected, isJoined, userId, sessionStatus]); // ✅ Sử dụng userId thay vì user

  // Auto leave on unmount - sử dụng ref để lấy giá trị mới nhất
  const sessionIdRef = useRef(sessionId);
  const isJoinedRef = useRef(isJoined);
  const userIdRef = useRef(userId);
  
  useEffect(() => {
    sessionIdRef.current = sessionId;
    isJoinedRef.current = isJoined;
    userIdRef.current = userId;
  });
  
  useEffect(() => {
    return () => {
      if (sessionIdRef.current && isJoinedRef.current && userIdRef.current) {
        socketService.emit(LiveStreamSocketEvents.LEAVE_SESSION, {
          sessionId: sessionIdRef.current,
          userId: userIdRef.current,
        });
      }
    };
  }, []); // ✅ Empty deps - chỉ chạy khi unmount

  // Send message - sử dụng userInfo memoized
  const sendMessage = useCallback(
    (message: string, messageType: 'text' | 'emoji' | 'system' = 'text', replyTo?: string) => {
      if (!sessionId || !userInfo || !message.trim()) return;

      const trimmedMessage = message.trim();
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Create optimistic message
      const optimisticMessage: ChatMessage = {
        id: tempId,
        session_id: sessionId,
        sender_id: userInfo.id,
        sender_name: userInfo.first_name && userInfo.last_name 
          ? `${userInfo.first_name} ${userInfo.last_name}`.trim()
          : userInfo.email || 'Bạn',
        sender_avatar: userInfo.avatar_url,
        message: trimmedMessage,
        message_type: messageType,
        reply_to: replyTo || null,
        timestamp: now,
      };

      // Add optimistic message immediately
      setMessages((prev) => {
        // Check for duplicates
        if (prev.some((m) => m.id === tempId)) {
          return prev;
        }
        return [...prev, optimisticMessage];
      });
      pendingMessagesRef.current.set(tempId, optimisticMessage);

      // Trigger onNewMessage callback for optimistic message
      callbacksRef.current.onNewMessage?.(optimisticMessage);

      console.log('[useLivestreamSocket] Sending message (optimistic):', {
        sessionId,
        senderId: userInfo.id,
        type: messageType,
        replyTo,
        message: trimmedMessage,
        tempId,
      });

      // Get socket instance directly to use ACK callback
      const socket = socketService.getSocket();
      if (!socket || !socket.connected) {
        console.warn('[useLivestreamSocket] Socket not connected, removing optimistic message');
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        pendingMessagesRef.current.delete(tempId);
        return;
      }

      socket.emit(
        LiveStreamSocketEvents.SEND_MESSAGE,
        {
          session_id: sessionId,
          sender_id: userInfo.id,
          message: trimmedMessage,
          message_type: messageType,
          reply_to: replyTo,
        },
        (ack?: { success: boolean; error?: string; messageId?: string }) => {
          if (!ack) {
            console.warn('[useLivestreamSocket] SEND_MESSAGE ack missing');
            // Remove optimistic message on failure
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            pendingMessagesRef.current.delete(tempId);
            return;
          }
          if (!ack.success) {
            console.error('[useLivestreamSocket] SEND_MESSAGE failed:', ack.error);
            // Remove optimistic message on failure
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            pendingMessagesRef.current.delete(tempId);
          } else {
            console.log('[useLivestreamSocket] SEND_MESSAGE ack success, waiting for NEW_MESSAGE to replace optimistic message');
            // Keep optimistic message, it will be replaced by onNewMessageHandler when NEW_MESSAGE arrives
          }
        }
      );
    },
    [sessionId, userInfo]
  );

  // Send reaction
  const sendReaction = useCallback(
    (emoji: string) => {
      if (!sessionId || !userId || !isJoined) {
        console.warn('[useLivestreamSocket] Cannot send reaction: not joined');
        return;
      }

      console.log('[useLivestreamSocket] Sending reaction:', emoji);
      socketService.emit(LiveStreamSocketEvents.SEND_REACTION, {
        sessionId,
        userId: userId,
        emoji,
      });
    },
    [sessionId, userId, isJoined]
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

