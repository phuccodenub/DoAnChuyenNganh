/**
 * useConversations Hook
 * 
 * React Query hooks for direct messaging (DM) feature
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  conversationApi,
  Conversation,
  DirectMessage,
  CreateConversationInput,
  SendMessageInput,
  ConversationsResponse,
  MessagesResponse,
} from '../services/api/conversation.api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore.enhanced';

// ============ Query Keys ============

export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (params?: { includeArchived?: boolean }) =>
    [...conversationKeys.lists(), params] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: (conversationId: string) =>
    [...conversationKeys.all, 'messages', conversationId] as const,
  unreadCount: () => [...conversationKeys.all, 'unread-count'] as const,
  onlineStatus: (conversationId: string) =>
    [...conversationKeys.all, 'online-status', conversationId] as const,
};

// ============ Query Hooks ============

/**
 * Transform conversation data from API to frontend format
 */
function transformConversation(conv: Conversation, currentUserId?: string): any {
  // Determine which user is the "other" participant by checking IDs
  // If current user is user1, then participant is user2 (and vice versa)
  let otherUser;
  
  if (currentUserId === conv.user1?.id) {
    otherUser = conv.user2;
  } else if (currentUserId === conv.user2?.id) {
    otherUser = conv.user1;
  } else {
    // Fallback: if currentUserId doesn't match either, show user2 as default
    console.warn('⚠️ Current user ID does not match conversation participants:', conv.id);
    otherUser = conv.user2;
  }
  
  // Ensure name is constructed properly
  const participantName = otherUser?.first_name && otherUser?.last_name
    ? `${otherUser.first_name} ${otherUser.last_name}`.trim()
    : otherUser?.first_name || otherUser?.last_name || 'Người dùng';
  
  // Map 'active' status to 'online' for proper display
  // NOTE: Database 'status' field is account status (active/inactive), NOT online status
  // Real-time online status should come from socket gateway via useOnlineStatus hook
  const participantStatus = otherUser?.status === 'active' ? 'online' : (otherUser?.status || 'offline');
  
  return {
    ...conv,
    course_title: conv.course?.title || '',
    participant: {
      id: otherUser?.id,
      name: participantName,
      avatar_url: otherUser?.avatar,
      online_status: participantStatus,
    },
  };
}

/**
 * Get all conversations for the current user
 */
export function useConversations(
  currentUserId?: string,
  params?: { includeArchived?: boolean; limit?: number; offset?: number },
  options?: Omit<UseQueryOptions<ConversationsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: conversationKeys.list(params ? { includeArchived: params.includeArchived } : undefined),
    queryFn: async () => {
      const response = await conversationApi.getConversations({
        include_archived: params?.includeArchived,
        limit: params?.limit,
        offset: params?.offset,
      });
      
      // Use provided currentUserId or fallback to token decode
      let userId = currentUserId || '';
      
      if (!userId) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.userId;
          } catch (e) {
            console.error('Failed to decode token:', e);
          }
        }
      }
      
      // Transform conversations
      const transformedData = response.data.map(conv => {
        return transformConversation(conv, userId);
      });
      
      return {
        ...response,
        data: transformedData,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Get a single conversation
 */
export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId!),
    queryFn: () => conversationApi.getConversation(conversationId!),
    enabled: !!conversationId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Get messages for a conversation
 */
export function useMessages(
  conversationId: string | undefined,
  params?: { limit?: number; before?: string; after?: string }
) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId!),
    queryFn: () => conversationApi.getMessages(conversationId!, params),
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds - messages update frequently
  });
}

/**
 * Get messages with infinite scroll support
 * Returns latest 50 messages, with ability to load older messages
 */
export function useInfiniteMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...conversationKeys.messages(conversationId!), 'infinite'],
    queryFn: async () => {
      // Fetch latest 50 messages
      const response = await conversationApi.getMessages(conversationId!, { limit: 50 });
      return response;
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000,
  });
}

/**
 * Load older messages (for infinite scroll)
 */
export function useLoadOlderMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (oldestMessageDate: string) => {
      const response = await conversationApi.getMessages(conversationId!, {
        limit: 50,
        before: oldestMessageDate,
      });
      return response;
    },
    onSuccess: (newMessages) => {
      if (!conversationId) return;

      // Get current messages
      const currentData = queryClient.getQueryData<MessagesResponse>(
        [...conversationKeys.messages(conversationId), 'infinite']
      );

      if (currentData && newMessages.data.length > 0) {
        // Prepend older messages to the beginning
        queryClient.setQueryData<MessagesResponse>(
          [...conversationKeys.messages(conversationId), 'infinite'],
          {
            ...currentData,
            data: [...newMessages.data, ...currentData.data],
          }
        );
      }
    },
  });
}

/**
 * Get unread message count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: conversationKeys.unreadCount(),
    queryFn: () => conversationApi.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// ============ Mutation Hooks ============

/**
 * Create a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationInput) => conversationApi.createConversation(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      if (response.created) {
        toast.success('Conversation started');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create conversation');
    },
  });
}

/**
 * Send a message
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageInput) => conversationApi.sendMessage(conversationId, data),
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches for both query keys
      await queryClient.cancelQueries({ queryKey: conversationKeys.messages(conversationId) });
      await queryClient.cancelQueries({ queryKey: [...conversationKeys.messages(conversationId), 'infinite'] });

      // Snapshot the previous values
      const previousMessages = queryClient.getQueryData<MessagesResponse>(
        conversationKeys.messages(conversationId)
      );
      const previousInfiniteMessages = queryClient.getQueryData<MessagesResponse>(
        [...conversationKeys.messages(conversationId), 'infinite']
      );

      // Get current user ID from zustand auth store
      let currentUserId = 'unknown';
      try {
        // Import and use the auth store directly
        const authState = useAuthStore.getState();
        if (authState.user?.id) {
          currentUserId = authState.user.id;
        } else {
          console.error('❌ Optimistic update - No user in auth store');
        }
      } catch (e) {
        console.error('❌ Optimistic update - Failed to get user from store:', e);
      }

      // Create optimistic message
      const optimisticMessage: DirectMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: currentUserId, // Use actual current user ID
        content: newMessage.content,
        status: 'sent',
        attachment_url: newMessage.attachment_url,
        attachment_type: newMessage.attachment_type,
        is_read: false,
        is_edited: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {} as any, // Will be replaced
      };

      // Optimistically update both queries
      if (previousMessages) {
        queryClient.setQueryData<MessagesResponse>(
          conversationKeys.messages(conversationId),
          {
            ...previousMessages,
            data: [...previousMessages.data, optimisticMessage],
          }
        );
      }

      if (previousInfiniteMessages) {
        queryClient.setQueryData<MessagesResponse>(
          [...conversationKeys.messages(conversationId), 'infinite'],
          {
            ...previousInfiniteMessages,
            data: [...previousInfiniteMessages.data, optimisticMessage],
          }
        );
      }

      return { previousMessages, previousInfiniteMessages };
    },
    onError: (error, _variables, context) => {
      // Rollback on error for both queries
      if (context?.previousMessages) {
        queryClient.setQueryData(
          conversationKeys.messages(conversationId),
          context.previousMessages
        );
      }
      if (context?.previousInfiniteMessages) {
        queryClient.setQueryData(
          [...conversationKeys.messages(conversationId), 'infinite'],
          context.previousInfiniteMessages
        );
      }
      toast.error(error.message || 'Failed to send message');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

/**
 * Edit a message
 */
export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      conversationApi.editMessage(messageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      toast.success('Message updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to edit message');
    },
  });
}

/**
 * Delete a message
 */
export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => conversationApi.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      toast.success('Message deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete message');
    },
  });
}

/**
 * Mark conversation as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => conversationApi.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.unreadCount() });
    },
  });
}

/**
 * Archive/unarchive conversation
 */
export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, archive }: { conversationId: string; archive: boolean }) =>
      conversationApi.archiveConversation(conversationId, archive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      toast.success(variables.archive ? 'Conversation archived' : 'Conversation unarchived');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update conversation');
    },
  });
}

/**
 * Search messages
 */
export function useSearchMessages(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (query: string) => conversationApi.searchMessages(conversationId, query),
  });
}

/**
 * Get real-time online status of conversation participant
 */
export function useOnlineStatus(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationKeys.onlineStatus(conversationId || ''),
    queryFn: () => conversationApi.getOnlineStatus(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Consider stale after 5 seconds
  });
}

// ============ Combined Hook ============

/**
 * Combined hook for a conversation view
 * Provides all data and mutations needed for a chat interface
 */
export function useConversationChat(conversationId: string | undefined) {
  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId || '');
  const editMessage = useEditMessage(conversationId || '');
  const deleteMessage = useDeleteMessage(conversationId || '');
  const markAsRead = useMarkAsRead();

  return {
    // Data
    conversation: conversation.data?.data,
    messages: messages.data?.data || [],
    isLoading: conversation.isLoading || messages.isLoading,
    isError: conversation.isError || messages.isError,

    // Mutations
    sendMessage: sendMessage.mutate,
    editMessage: editMessage.mutate,
    deleteMessage: deleteMessage.mutate,
    markAsRead: () => conversationId && markAsRead.mutate(conversationId),

    // States
    isSending: sendMessage.isPending,
    isEditing: editMessage.isPending,
    isDeleting: deleteMessage.isPending,

    // Refetch
    refetchMessages: messages.refetch,
  };
}
