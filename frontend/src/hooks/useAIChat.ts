/**
 * useAIChat Hook
 * 
 * Custom hook để quản lý AI Chat WebSocket connection
 * - Kết nối WebSocket namespace /ai/chat
 * - Xử lý authentication
 * - Quản lý conversation history
 * - Handle streaming responses
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
  latency?: number;
}

interface UseAIChatOptions {
  courseId?: string;
  lessonId?: string;
  enabled?: boolean;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (text: string) => void;
  clearHistory: () => void;
  reconnect: () => void;
}

/**
 * Get WebSocket URL
 */
function getSocketUrl(): string {
  const env: any = (import.meta as any).env || {};
  
  if (env.VITE_WS_URL) return env.VITE_WS_URL as string;
  if (env.VITE_SOCKET_URL) return env.VITE_SOCKET_URL as string;
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // In production, this should not happen if VITE_WS_URL is set
  const env: any = (import.meta as any).env || {};
  if (env.PROD) {
    console.error('[useAIChat] VITE_WS_URL not set in production!');
    return '';
  }
  return 'http://localhost:3000';
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const { courseId, lessonId, enabled = true } = options;
  const { user, token } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const streamingMessageRef = useRef<string>('');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Connect to AI Chat WebSocket
   */
  const connect = useCallback(() => {
    if (!enabled || !user) return;
    
    // Cleanup existing connection
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (!token) {
      setError('Không tìm thấy token xác thực');
      return;
    }

    const socketUrl = getSocketUrl();
    console.log('[useAIChat] Connecting to:', `${socketUrl}/ai/chat`);

    try {
      // Create socket connection to /ai/chat namespace
      const socket = io(`${socketUrl}/ai/chat`, {
        auth: { token },
        query: {
          courseId: courseId || '',
          lessonId: lessonId || '',
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log('[useAIChat] Connected, socket ID:', socket.id);
        setIsConnected(true);
        setError(null);
      });

      socket.on('connected', (data: any) => {
        console.log('[useAIChat] Connected successfully:', data.message);
      });

      socket.on('disconnect', (reason: string) => {
        console.log('[useAIChat] Disconnected:', reason);
        setIsConnected(false);
        
        // Auto reconnect after 3 seconds
        if (reason === 'io server disconnect') {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[useAIChat] Attempting to reconnect...');
            connect();
          }, 3000);
        }
      });

      socket.on('connect_error', (err: Error) => {
        console.error('[useAIChat] Connection error:', err);
        setError('Không thể kết nối đến AI Tutor');
        setIsConnected(false);
      });

      // Message events
      socket.on('history', (data: { messages: ChatMessage[] }) => {
        console.log('[useAIChat] Received history:', data.messages.length, 'messages');
        setMessages(data.messages || []);
      });

      socket.on('status', (data: { state: string }) => {
        if (data.state === 'typing') {
          setIsLoading(true);
        } else if (data.state === 'idle') {
          setIsLoading(false);
          setIsStreaming(false);
        }
      });

      socket.on('response_chunk', (data: { chunk: string }) => {
        setIsStreaming(true);
        streamingMessageRef.current += data.chunk;
        
        // Update the last assistant message with streaming content
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = streamingMessageRef.current;
          }
          
          return updated;
        });
      });

      socket.on('message_response', (data: {
        text: string;
        metadata: {
          model: string;
          provider: string;
          tier: string;
          latency: number;
        };
      }) => {
        console.log('[useAIChat] Response received:', {
          model: data.metadata.model,
          provider: data.metadata.provider,
          latency: data.metadata.latency,
        });
        
        setIsLoading(false);
        setIsStreaming(false);
        streamingMessageRef.current = '';
        
        // Update last message with final metadata
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.model = data.metadata.model;
            lastMsg.provider = data.metadata.provider;
            lastMsg.latency = data.metadata.latency;
          }
          
          return updated;
        });
      });

      socket.on('error', (data: { message: string }) => {
        console.error('[useAIChat] Error:', data.message);
        setError(data.message);
        setIsLoading(false);
        setIsStreaming(false);
        streamingMessageRef.current = '';
      });

    } catch (err: any) {
      console.error('[useAIChat] Setup error:', err);
      setError('Lỗi thiết lập kết nối');
    }
  }, [enabled, user, courseId, lessonId]);

  /**
   * Send message to AI
   */
  const sendMessage = useCallback((text: string) => {
    if (!socketRef.current || !isConnected || !text.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);

    // Create placeholder for AI response
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(true);
    streamingMessageRef.current = '';

    // Send message via WebSocket
    socketRef.current.emit('message', {
      text: text.trim(),
      courseId,
      lessonId,
    });
  }, [isConnected, courseId, lessonId]);

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(() => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('clear_history');
    setMessages([]);
  }, [isConnected]);

  /**
   * Reconnect to socket
   */
  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  // Initialize connection
  useEffect(() => {
    if (enabled && user) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        console.log('[useAIChat] Disconnecting socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, user, connect]);

  return {
    messages,
    isConnected,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearHistory,
    reconnect,
  };
}
