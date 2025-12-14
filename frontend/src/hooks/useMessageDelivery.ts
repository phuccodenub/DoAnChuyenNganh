import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/services/socketService';

export interface MessageDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
  deliveredTo?: string;
  readBy?: string;
}

/**
 * Hook to track message delivery status in real-time
 * Listens for delivery acknowledgments from server
 */
export function useMessageDelivery(courseId: string) {
  const queryClient = useQueryClient();
  const [deliveryStatuses, setDeliveryStatuses] = useState<Map<string, MessageDeliveryStatus>>(new Map());

  // Listen for delivery acknowledgments
  useEffect(() => {
    if (!courseId || !socketService) return;

    // Handle message delivered
    const handleMessageDelivered = (data: any) => {
      if (!data?.messageId) return;

      setDeliveryStatuses((prev) => {
        const updated = new Map(prev);
        const current = updated.get(data.messageId) || { messageId: data.messageId, status: 'sent' as const };
        updated.set(data.messageId, {
          ...current,
          status: 'delivered',
          timestamp: new Date(data.timestamp || Date.now())
        });
        return updated;
      });

      // Update React Query cache
      queryClient.setQueryData(['chat', 'messages', courseId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data?.map((msg: any) =>
            msg.id === data.messageId ? { ...msg, deliveryStatus: 'delivered' } : msg
          )
        };
      });
    };

    // Handle message read
    const handleMessageRead = (data: any) => {
      if (!data?.messageId) return;

      setDeliveryStatuses((prev) => {
        const updated = new Map(prev);
        const current = updated.get(data.messageId) || { messageId: data.messageId, status: 'sent' as const };
        updated.set(data.messageId, {
          ...current,
          status: 'read',
          readBy: data.readBy,
          timestamp: new Date(data.timestamp || Date.now())
        });
        return updated;
      });

      // Update React Query cache
      queryClient.setQueryData(['chat', 'messages', courseId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data?.map((msg: any) =>
            msg.id === data.messageId ? { ...msg, deliveryStatus: 'read', readBy: data.readBy } : msg
          )
        };
      });
    };

    // Register listeners with any type to avoid strict typing issues
    (socketService as any)?.on('message-delivered', handleMessageDelivered);
    (socketService as any)?.on('message-read', handleMessageRead);

    return () => {
      (socketService as any)?.off('message-delivered', handleMessageDelivered);
      (socketService as any)?.off('message-read', handleMessageRead);
    };
  }, [courseId, queryClient]);

  /**
   * Get delivery status for a specific message
   */
  const getStatus = useCallback((messageId: string): MessageDeliveryStatus | undefined => {
    return deliveryStatuses.get(messageId);
  }, [deliveryStatuses]);

  /**
   * Mark message as read by current user
   */
  const markAsRead = useCallback(
    (messageId: string) => {
      socketService?.emit('mark-message-read', {
        messageId,
        courseId,
        timestamp: new Date()
      });

      setDeliveryStatuses((prev) => {
        const updated = new Map(prev);
        const current = updated.get(messageId) || { messageId, status: 'sent' as const };
        updated.set(messageId, {
          ...current,
          status: 'read',
          timestamp: new Date()
        });
        return updated;
      });
    },
    [courseId]
  );

  /**
   * Get remaining message quota based on rate limiting
   */
  const getRateLimitStatus = useCallback(() => {
    // This would be set by server on connection
    // For now, return default
    return { remaining: 10, resetIn: 0 };
  }, []);

  return {
    deliveryStatuses,
    getStatus,
    markAsRead,
    getRateLimitStatus
  };
}

/**
 * Hook to send message with delivery tracking
 * Combines sending and tracking in one hook
 */
export function useSendMessageWithDelivery(courseId: string) {
  const { getStatus, markAsRead } = useMessageDelivery(courseId);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send message and track delivery
   */
  const sendMessage = useCallback(
    async (content: string, replyToId?: string) => {
      if (!content.trim()) {
        setError('Tin nhắn không được để trống');
        return null;
      }

      setIsSending(true);
      setError(null);

      try {
        // Generate temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`;

        // Emit via Socket.IO with callback
        socketService?.emit('send-message', {
          message: content,
          course_id: courseId,
          reply_to: replyToId,
          tempId
        });

        // Message sent, now tracking delivery
        // Real message ID will come in MESSAGE_SENT event
        return { tempId };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [courseId]
  );

  return {
    sendMessage,
    isSending,
    error,
    getStatus,
    markAsRead
  };
}
