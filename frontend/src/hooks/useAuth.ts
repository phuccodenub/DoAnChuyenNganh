import { useAuthStore } from '@/stores/authStore.enhanced';

/**
 * useAuth Hook
 * 
 * Hook để access auth state và actions
 * Sử dụng: const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  
  const login = useAuthStore((state) => state.login);
  const loginWith2FA = useAuthStore((state) => state.loginWith2FA);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    loginWith2FA,
    register,
    logout,
    updateProfile,
    changePassword,
    initializeAuth,
  };
}

export default useAuth;
