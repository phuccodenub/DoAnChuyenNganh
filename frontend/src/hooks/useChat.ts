import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, ChatMessage, ChatMessagesResponse, OnlineUser, ChatStatistics } from '@/services/api/chat.api';

const QUERY_KEYS = {
  messages: (courseId: string, page: number) => ['chat', 'messages', courseId, page],
  onlineUsers: (courseId: string) => ['chat', 'onlineUsers', courseId],
  statistics: (courseId: string) => ['chat', 'statistics', courseId],
  search: (courseId: string, term: string) => ['chat', 'search', courseId, term],
};

/**
 * Hook to fetch chat messages for a course
 */
export function useChatMessages(courseId: string, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: QUERY_KEYS.messages(courseId, page),
    queryFn: () => chatApi.getMessages(courseId, page, limit),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!courseId, // Only fetch when courseId is provided
  });
}

/**
 * Hook to fetch chat messages with infinite scroll support
 */
export function useInfiniteChatMessages(courseId: string) {
  return useQuery({
    queryKey: ['chat', 'messages', courseId, 'infinite'],
    queryFn: () => chatApi.getMessagesInfinite(courseId, { limit: 50 }),
    staleTime: 1000 * 10, // 10 seconds - messages update frequently
    enabled: !!courseId,
  });
}

/**
 * Hook to load older chat messages (for infinite scroll)
 */
export function useLoadOlderChatMessages(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (oldestMessageId: string) => {
      return await chatApi.getMessagesInfinite(courseId, {
        limit: 50,
        beforeMessageId: oldestMessageId,
      });
    },
    onSuccess: (newData) => {
      if (!courseId || !newData.data.length) return;

      // Get current messages
      const currentData = queryClient.getQueryData<ChatMessagesResponse>([
        'chat',
        'messages',
        courseId,
        'infinite',
      ]);

      if (currentData && newData.data.length > 0) {
        // Prepend older messages to the beginning
        queryClient.setQueryData<ChatMessagesResponse>(
          ['chat', 'messages', courseId, 'infinite'],
          {
            data: [...newData.data, ...currentData.data],
            pagination: currentData.pagination,
          }
        );
      }
    },
  });
}

/**
 * Hook to send a chat message
 */
export function useSendMessage(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, replyToId }: { content: string; replyToId?: string }) => {
      return await chatApi.sendMessage(courseId, content, replyToId);
    },
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches for both query patterns
      await queryClient.cancelQueries({ queryKey: ['chat', 'messages', courseId] });

      // Snapshot previous values
      const previousInfiniteMessages = queryClient.getQueryData<ChatMessagesResponse>([
        'chat',
        'messages',
        courseId,
        'infinite',
      ]);

      // Optimistically update infinite messages if they exist
      if (previousInfiniteMessages) {
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          course_id: courseId,
          user_id: 'current-user', // Will be replaced
          content: newMessage.content,
          message_type: 'text',
          reply_to_message_id: newMessage.replyToId,
          is_edited: false,
          is_deleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<ChatMessagesResponse>(
          ['chat', 'messages', courseId, 'infinite'],
          {
            ...previousInfiniteMessages,
            data: [...previousInfiniteMessages.data, optimisticMessage],
          }
        );
      }

      return { previousInfiniteMessages };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousInfiniteMessages) {
        queryClient.setQueryData(
          ['chat', 'messages', courseId, 'infinite'],
          context.previousInfiniteMessages
        );
      }
    },
    onSuccess: () => {
      // Invalidate all message queries to refetch
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', courseId],
      });
    },
  });
}

/**
 * Hook to update a chat message
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      return await chatApi.updateMessage(messageId, content);
    },
    onSuccess: (_, { messageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages'],
      });
    },
  });
}

/**
 * Hook to delete a chat message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      return await chatApi.deleteMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages'],
      });
    },
  });
}

/**
 * Hook to search messages in a course
 */
export function useSearchMessages(courseId: string, searchTerm: string, enabled: boolean = false) {
  return useQuery({
    queryKey: QUERY_KEYS.search(courseId, searchTerm),
    queryFn: () => chatApi.searchMessages(courseId, searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get online users in a course
 */
export function useOnlineUsers(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.onlineUsers(courseId),
    queryFn: () => chatApi.getOnlineUsers(courseId),
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    staleTime: 1000 * 10, // 10 seconds
  });
}

/**
 * Hook to get chat statistics
 */
export function useChatStatistics(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.statistics(courseId),
    queryFn: () => chatApi.getStatistics(courseId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get total count of courses with unread messages
 */
export function useCourseUnreadCount() {
  return useQuery({
    queryKey: ['course-chat-unread-count'],
    queryFn: () => chatApi.getUnreadCount(),
    staleTime: 1000 * 5, // 5 seconds - balance between freshness and load
    refetchInterval: 1000 * 15, // 15 seconds backup (reduced frequency)
    refetchOnWindowFocus: false, // Disable to reduce requests
    refetchOnMount: 'always', // Always refetch on mount for accuracy
  });
}

/**
 * Hook to get unread count for each enrolled course
 */
export function useUnreadCountPerCourse() {
  return useQuery({
    queryKey: ['course-chat-unread-per-course'],
    queryFn: () => chatApi.getUnreadCountPerCourse(),
    staleTime: 1000 * 5, // 5 seconds - balance between freshness and load
    refetchInterval: 1000 * 15, // 15 seconds backup (reduced frequency)
    refetchOnWindowFocus: false, // Disable to reduce requests
    refetchOnMount: 'always', // Always refetch on mount for accuracy
  });
}

/**
 * Hook to mark all messages in a course as read
 */
export function useMarkCourseAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      console.log('📝 [MARK_AS_READ] Marking course as read:', courseId);
      return await chatApi.markAsRead(courseId);
    },
    onSuccess: (_, courseId) => {
      console.log('✅ [MARK_AS_READ] Success! Invalidating queries for:', courseId);
      
      // Invalidate unread count queries (active only to reduce load)
      queryClient.invalidateQueries({
        queryKey: ['course-chat-unread-count'],
        refetchType: 'active', // Only refetch active queries
      }).then(() => {
        console.log('✅ [MARK_AS_READ] Total unread count refetched');
      }).catch((err) => {
        console.warn('⚠️ [MARK_AS_READ] Failed to refetch total count:', err.message);
      });
      
      queryClient.invalidateQueries({
        queryKey: ['course-chat-unread-per-course'],
        refetchType: 'active', // Only refetch active queries
      }).then(() => {
        console.log('✅ [MARK_AS_READ] Per-course unread counts refetched');
      }).catch((err) => {
        console.warn('⚠️ [MARK_AS_READ] Failed to refetch per-course counts:', err.message);
      });
    },
    onError: (error) => {
      console.error('❌ [MARK_AS_READ] Failed:', error);
    },
  });
}
