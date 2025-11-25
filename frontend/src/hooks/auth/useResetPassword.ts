import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api/auth.api';

interface ResetPasswordData {
  token: string;
  password: string;
}

interface UseResetPasswordResult {
  mutate: (data: ResetPasswordData) => void;
  mutateAsync: (data: ResetPasswordData) => Promise<void>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook for resetting password with reset token
 * Used on /reset-password/:token page
 */
export function useResetPassword(): UseResetPasswordResult {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      return await authApi.resetPassword(data.token, data.password);
    },
    onSuccess: () => {
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    },
    onError: (error: Error) => {
      console.error('Reset password error:', error);
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
