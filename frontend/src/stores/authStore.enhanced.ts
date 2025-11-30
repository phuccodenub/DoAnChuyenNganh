import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import i18n from '@/i18n';
import { getTokensFromState, restoreAuthFromStorage, getErrorMessage, getAuthErrorMessage, isUnauthorizedError } from './authStore.utils';
import { partializeAuthState, setupLocalStorageWatcher } from './authStore.config';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string; // Optional for backward compatibility
  role: 'student' | 'instructor' | 'admin' | 'super_admin';
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  email_verified: boolean;
  two_factor_enabled?: boolean; // Make optional for backward compatibility
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at?: string; // Make optional for backward compatibility
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  loginWith2FA: (email: string, password: string, code: string) => Promise<boolean>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: 'student' | 'instructor';
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  updateUserData: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setToken: (tokens: Tokens) => void;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

// Setup localStorage watcher (chỉ trong development)
setupLocalStorageWatcher();

export const useAuthStore = create<AuthStore>()(
  persist<AuthStore>(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await authService.login(email, password);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              tokens: response.data.tokens,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success(i18n.t('auth.messages.loginSuccess') || 'Đăng nhập thành công');
            return true;
          }
          
          // Xử lý lỗi từ response
          const errorMessage = response.message || i18n.t('auth.messages.loginFailed') || 'Đăng nhập thất bại';
          toast.error(errorMessage);
          set({ isLoading: false });
          return false;
        } catch (error: unknown) {
          // Xử lý lỗi chi tiết từ API
          const message = getAuthErrorMessage(error);
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      loginWith2FA: async (email: string, password: string, code: string) => {
        try {
          set({ isLoading: true });
          const response = await authService.loginWith2FA(email, password, code);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              tokens: response.data.tokens,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success('Đăng nhập thành công');
            return true;
          }
          
          toast.error(response.message || 'Xác thực 2FA thất bại');
          set({ isLoading: false });
          return false;
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, 'Xác thực 2FA thất bại'));
          set({ isLoading: false });
          return false;
        }
      },

      register: async (data: {
        username: string;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        phone?: string;
        role?: 'student' | 'instructor';
      }) => {
        try {
          set({ isLoading: true });
          const response = await authService.register({
            username: data.username,
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            role: data.role,
          });
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              tokens: response.data.tokens,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success(i18n.t('auth.messages.registerSuccess') || 'Đăng ký thành công');
            return true;
          }
          
          toast.error(response.message || i18n.t('auth.messages.registerFailed') || 'Đăng ký thất bại');
          set({ isLoading: false });
          return false;
        } catch (error: unknown) {
          // Xử lý lỗi chi tiết từ API
          const message = getErrorMessage(error, i18n.t('auth.messages.registerFailed') || 'Đăng ký thất bại');
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          // Call logout API (không quan trọng nếu fail)
          await authService.logout().catch(() => {
            // Silent fail
          });
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          
          // Note: Không xóa remember me email ở đây vì user có thể muốn giữ lại
          // Chỉ xóa khi user tự bỏ check remember me
          
          toast.success(i18n.t('auth.messages.logoutSuccess') || 'Đăng xuất thành công');
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true });
          const response = await authService.updateProfile(data);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isLoading: false,
            });
            toast.success('Cập nhật thông tin thành công');
            return true;
          }
          
          toast.error(response.message || 'Cập nhật thông tin thất bại');
          set({ isLoading: false });
          return false;
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, 'Cập nhật thông tin thất bại'));
          set({ isLoading: false });
          return false;
        }
      },

      updateUserData: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...data },
          });
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          set({ isLoading: true });
          const response = await authService.changePassword(currentPassword, newPassword);
          
          if (response.success) {
            set({ isLoading: false });
            toast.success('Đổi mật khẩu thành công');
            return true;
          }
          
          toast.error(response.message || 'Đổi mật khẩu thất bại');
          set({ isLoading: false });
          return false;
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, 'Đổi mật khẩu thất bại'));
          set({ isLoading: false });
          return false;
        }
      },

      initializeAuth: async () => {
        const { tokens, isInitialized } = get();
        
        if (isInitialized) return;
        
        // Nếu không có tokens, thử restore từ localStorage
        if (!tokens) {
          const storedState = restoreAuthFromStorage();
          const restoredTokens = storedState ? getTokensFromState(storedState) : null;
          
          if (restoredTokens) {
            set({
              tokens: restoredTokens,
              user: storedState?.user || null,
              isAuthenticated: storedState?.isAuthenticated || false,
              isInitialized: true,
            });
            return;
          }
          
          // Không có tokens, chỉ set initialized
          set((prevState: AuthState) => ({ ...prevState, isInitialized: true }));
          return;
        }

        // Verify token và fetch profile
        try {
          const verifyResponse = await authService.verifyToken();
          if (!verifyResponse.success) throw new Error('Token invalid');

          const profileResponse = await authService.getProfile();
          if (profileResponse.success && profileResponse.data) {
            set({
              user: profileResponse.data.user,
              isAuthenticated: true,
              isInitialized: true,
            });
            return;
          }
          
          throw new Error('Profile fetch failed');
        } catch (error: unknown) {
          // Chỉ clear nếu là 401, giữ nguyên state nếu là lỗi khác
          if (isUnauthorizedError(error)) {
            set({
              user: null,
              tokens: null,
              isAuthenticated: false,
              isInitialized: true,
            });
          } else {
            set({ isInitialized: true });
          }
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setToken: (tokens: Tokens) => {
        set({ 
          tokens,
        });
      },

      clearAuth: () => {
        // Clear auth state - Zustand persist sẽ tự động sync vào localStorage
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          // Giữ isInitialized để tránh re-initialize
        });
      },
    }),
    {
      name: 'auth-storage',
      // @ts-expect-error - Zustand persist partialize type is complex, but this works correctly
      partialize: partializeAuthState,
      onRehydrateStorage: () => {
        return (state) => {
          if (!state) return;
          
          // Nếu state empty, thử restore từ localStorage
          if (!state.tokens && !state.user) {
            const storedState = restoreAuthFromStorage();
            if (storedState) {
              const tokens = getTokensFromState(storedState);
              if (tokens) {
                state.tokens = tokens;
                if (storedState.user) state.user = storedState.user;
                if (storedState.isAuthenticated !== undefined) {
                  state.isAuthenticated = storedState.isAuthenticated;
                }
                if (storedState.isInitialized !== undefined) {
                  state.isInitialized = storedState.isInitialized;
                }
              }
            }
          }
        };
      },
    }
  )
);

export default useAuthStore;
