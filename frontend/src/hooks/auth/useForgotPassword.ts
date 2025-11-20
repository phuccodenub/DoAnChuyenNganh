import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api/auth.api';

interface ForgotPasswordData {
  email: string;
}

interface UseForgotPasswordResult {
  mutate: (data: ForgotPasswordData) => void;
  mutateAsync: (data: ForgotPasswordData) => Promise<void>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook for requesting password reset
 * Sends reset email to the user
 */
export function useForgotPassword(): UseForgotPasswordResult {
  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      return await authApi.forgotPassword(data.email);
    },
    onSuccess: () => {
      // No additional handling needed - success message shown in component
    },
    onError: (error: Error) => {
      console.error('Forgot password error:', error);
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
