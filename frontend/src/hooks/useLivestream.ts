import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  livestreamApi, 
  LivestreamSession, 
  CreateSessionData, 
  UpdateSessionData,
  PaginationParams 
} from '@/services/api/livestream.api';

// ============================================================================
// Query Keys
// ============================================================================

export const livestreamQueryKeys = {
  all: ['livestream'] as const,
  mySessions: (params?: PaginationParams) => [...livestreamQueryKeys.all, 'my-sessions', params] as const,
  session: (id: number) => [...livestreamQueryKeys.all, 'session', id] as const,
  viewers: (id: number) => [...livestreamQueryKeys.all, 'viewers', id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get instructor's livestream sessions with pagination
 */
export function useMySessions(params?: PaginationParams) {
  return useQuery({
    queryKey: livestreamQueryKeys.mySessions(params),
    queryFn: () => livestreamApi.getMySessions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get single session by ID
 */
export function useSession(id: number, enabled: boolean = true) {
  return useQuery<LivestreamSession>({
    queryKey: livestreamQueryKeys.session(id),
    queryFn: () => livestreamApi.getSession(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get session viewers
 */
export function useSessionViewers(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: livestreamQueryKeys.viewers(id),
    queryFn: () => livestreamApi.getSessionViewers(id),
    enabled: enabled && !!id,
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for live viewer count
    staleTime: 5 * 1000, // 5 seconds
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new livestream session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionData) => livestreamApi.createSession(data),
    onSuccess: () => {
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: livestreamQueryKeys.all });
      toast.success('Tạo phiên phát trực tiếp thành công!');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Tạo phiên phát trực tiếp thất bại';
      toast.error(message);
    },
  });
}

/**
 * Update livestream session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSessionData }) =>
      livestreamApi.updateSession(id, data),
    onSuccess: (updatedSession) => {
      // Update session in cache
      queryClient.setQueryData(livestreamQueryKeys.session(updatedSession.id), updatedSession);
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: [...livestreamQueryKeys.all, 'my-sessions'] });
      toast.success('Cập nhật phiên phát trực tiếp thành công!');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Cập nhật phiên phát trực tiếp thất bại';
      toast.error(message);
    },
  });
}

/**
 * Delete livestream session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => livestreamApi.deleteSession(id),
    onSuccess: () => {
      // Invalidate all sessions queries
      queryClient.invalidateQueries({ queryKey: livestreamQueryKeys.all });
      toast.success('Xóa phiên phát trực tiếp thành công!');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Xóa phiên phát trực tiếp thất bại';
      toast.error(message);
    },
  });
}

/**
 * Start livestream session (change status to live)
 */
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => livestreamApi.startSession(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: livestreamQueryKeys.session(id) });

      // Snapshot previous value
      const previousSession = queryClient.getQueryData<LivestreamSession>(
        livestreamQueryKeys.session(id)
      );

      // Optimistically update
      if (previousSession) {
        queryClient.setQueryData<LivestreamSession>(livestreamQueryKeys.session(id), {
          ...previousSession,
          status: 'live',
        });
      }

      return { previousSession };
    },
    onSuccess: (updatedSession) => {
      // Update with server response
      queryClient.setQueryData(livestreamQueryKeys.session(updatedSession.id), updatedSession);
      queryClient.invalidateQueries({ queryKey: [...livestreamQueryKeys.all, 'my-sessions'] });
      toast.success('Đã bắt đầu phát trực tiếp!');
    },
    onError: (error: { response?: { data?: { message?: string } } }, _variables, context) => {
      // Rollback on error
      if (context?.previousSession) {
        queryClient.setQueryData(
          livestreamQueryKeys.session(context.previousSession.id),
          context.previousSession
        );
      }
      const message = error?.response?.data?.message || 'Bắt đầu phát trực tiếp thất bại';
      toast.error(message);
    },
  });
}

/**
 * End livestream session (change status to ended)
 */
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => livestreamApi.endSession(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: livestreamQueryKeys.session(id) });

      // Snapshot previous value
      const previousSession = queryClient.getQueryData<LivestreamSession>(
        livestreamQueryKeys.session(id)
      );

      // Optimistically update
      if (previousSession) {
        queryClient.setQueryData<LivestreamSession>(livestreamQueryKeys.session(id), {
          ...previousSession,
          status: 'ended',
        });
      }

      return { previousSession };
    },
    onSuccess: (updatedSession) => {
      // Update with server response
      queryClient.setQueryData(livestreamQueryKeys.session(updatedSession.id), updatedSession);
      queryClient.invalidateQueries({ queryKey: [...livestreamQueryKeys.all, 'my-sessions'] });
      toast.success('Đã kết thúc phát trực tiếp!');
    },
    onError: (error: { response?: { data?: { message?: string } } }, _variables, context) => {
      // Rollback on error
      if (context?.previousSession) {
        queryClient.setQueryData(
          livestreamQueryKeys.session(context.previousSession.id),
          context.previousSession
        );
      }
      const message = error?.response?.data?.message || 'Kết thúc phát trực tiếp thất bại';
      toast.error(message);
    },
  });
}

/**
 * Join livestream session as viewer
 */
export function useJoinSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => livestreamApi.joinSession(id),
    onSuccess: (_, id) => {
      // Invalidate viewers to update count
      queryClient.invalidateQueries({ queryKey: livestreamQueryKeys.viewers(id) });
      toast.success('Đã tham gia phiên phát trực tiếp!');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Tham gia phát trực tiếp thất bại';
      toast.error(message);
    },
  });
}

/**
 * Leave livestream session
 */
export function useLeaveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => livestreamApi.leaveSession(id),
    onSuccess: (_, id) => {
      // Invalidate viewers to update count
      queryClient.invalidateQueries({ queryKey: livestreamQueryKeys.viewers(id) });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Rời khỏi phát trực tiếp thất bại';
      toast.error(message);
    },
  });
}
