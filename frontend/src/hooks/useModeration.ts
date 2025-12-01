import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moderationApi, type LivestreamPolicy, type CommentModeration, type UpdatePolicyPayload, type ModerateCommentPayload } from '@/services/api/moderation.api';
import toast from 'react-hot-toast';

// ============================================================================
// Query Keys
// ============================================================================

export const moderationQueryKeys = {
  all: ['moderation'] as const,
  policy: (sessionId: string | undefined) => [...moderationQueryKeys.all, 'policy', sessionId] as const,
  history: (sessionId: string | undefined, params?: { page?: number; limit?: number; status?: string }) =>
    [...moderationQueryKeys.all, 'history', sessionId, params] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get moderation policy for a session
 */
export function useModerationPolicy(sessionId: string | undefined, enabled: boolean = true) {
  return useQuery<LivestreamPolicy>({
    queryKey: moderationQueryKeys.policy(sessionId),
    queryFn: () => moderationApi.getPolicy(sessionId as string),
    enabled: enabled && !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get moderation history for a session
 */
export function useModerationHistory(
  sessionId: string | undefined,
  params?: { page?: number; limit?: number; status?: string },
  enabled: boolean = true
) {
  return useQuery<{ data: CommentModeration[]; total?: number }>({
    queryKey: moderationQueryKeys.history(sessionId, params),
    queryFn: () => moderationApi.getModerationHistory(sessionId as string, params),
    enabled: enabled && !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Update moderation policy
 */
export function useUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: UpdatePolicyPayload }) =>
      moderationApi.updatePolicy(sessionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: moderationQueryKeys.policy(variables.sessionId) });
      toast.success('Cập nhật cài đặt kiểm duyệt thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Cập nhật cài đặt kiểm duyệt thất bại');
    },
  });
}

/**
 * Manually moderate a comment
 */
export function useModerateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, data }: { messageId: string; data: ModerateCommentPayload }) =>
      moderationApi.moderateComment(messageId, data),
    onSuccess: (data) => {
      // Invalidate moderation history for the session
      if (data.session_id) {
        queryClient.invalidateQueries({ queryKey: moderationQueryKeys.history(data.session_id) });
      }
      toast.success('Đã xử lý bình luận thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xử lý bình luận thất bại');
    },
  });
}

/**
 * Unban a user (reset violation count)
 */
export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, userId }: { sessionId: string; userId: string }) =>
      moderationApi.unbanUser(sessionId, userId),
    onSuccess: (data, variables) => {
      // Invalidate moderation history to refresh violation counts
      queryClient.invalidateQueries({ queryKey: moderationQueryKeys.history(variables.sessionId) });
      toast.success('Đã unban user thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Unban user thất bại');
    },
  });
}

