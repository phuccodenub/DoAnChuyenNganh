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
 * Hook to send a chat message
 */
export function useSendMessage(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, replyToId }: { content: string; replyToId?: string }) => {
      return await chatApi.sendMessage(courseId, content, replyToId);
    },
    onSuccess: () => {
      // Invalidate messages query to refetch
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
