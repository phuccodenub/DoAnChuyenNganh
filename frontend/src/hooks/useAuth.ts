import { useAuthStore } from '@/stores/authStore.enhanced';

/**
 * useAuth Hook
 * 
 * Hook để access auth state và actions
 * Sử dụng: const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const tokens = useAuthStore((state) => state.tokens);
  const token = tokens?.accessToken || null; // Support cả format mới
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  
  const login = useAuthStore((state) => state.login);
  const loginWith2FA = useAuthStore((state) => state.loginWith2FA);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const updateUserData = useAuthStore((state) => state.updateUserData);
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
    updateUserData,
    changePassword,
    initializeAuth,
  };
}

export default useAuth;
