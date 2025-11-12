import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import i18n from '@/i18n';

export interface User {
  id: number;
  email: string;
  full_name: string;
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

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  loginWith2FA: (email: string, password: string, code: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role?: 'student' | 'instructor';
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setToken: (token: string, refreshToken?: string) => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
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
              token: response.data.token,
              refreshToken: response.data.refresh_token,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success(i18n.t('auth.messages.loginSuccess') || 'Đăng nhập thành công');
            return true;
          } else {
            toast.error(response.message || i18n.t('auth.messages.loginFailed') || 'Đăng nhập thất bại');
            set({ isLoading: false });
            return false;
          }
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
            || i18n.t('auth.messages.loginFailed') 
            || 'Đăng nhập thất bại';
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
              token: response.data.token,
              refreshToken: response.data.refresh_token,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success('Đăng nhập thành công');
            return true;
          } else {
            toast.error(response.message || 'Xác thực 2FA thất bại');
            set({ isLoading: false });
            return false;
          }
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
            || 'Xác thực 2FA thất bại';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          
          const response = await authService.register(data);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              refreshToken: response.data.refresh_token,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success(i18n.t('auth.messages.registerSuccess') || 'Đăng ký thành công');
            return true;
          } else {
            toast.error(response.message || i18n.t('auth.messages.registerFailed') || 'Đăng ký thất bại');
            set({ isLoading: false });
            return false;
          }
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
            || i18n.t('auth.messages.registerFailed') 
            || 'Đăng ký thất bại';
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
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          
          toast.success(i18n.t('auth.messages.logoutSuccess') || 'Đăng xuất thành công');
        }
      },

      updateProfile: async (data) => {
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
          } else {
            toast.error(response.message || 'Cập nhật thông tin thất bại');
            set({ isLoading: false });
            return false;
          }
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
            || 'Cập nhật thông tin thất bại';
          toast.error(message);
          set({ isLoading: false });
          return false;
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
          } else {
            toast.error(response.message || 'Đổi mật khẩu thất bại');
            set({ isLoading: false });
            return false;
          }
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
            || 'Đổi mật khẩu thất bại';
          toast.error(message);
          set({ isLoading: false });
          return false;
        }
      },

      initializeAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isInitialized: true });
          return;
        }

        try {
          // Verify token
          const verifyResponse = await authService.verifyToken();
          
          if (!verifyResponse.success) {
            throw new Error('Token invalid');
          }

          // Get user profile
          const profileResponse = await authService.getProfile();
          
          if (profileResponse.success && profileResponse.data) {
            set({
              user: profileResponse.data.user,
              isAuthenticated: true,
              isInitialized: true,
            });
          } else {
            throw new Error('Profile fetch failed');
          }
        } catch (error) {
          // Token invalid hoặc expired, clear auth state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isInitialized: true,
          });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setToken: (token: string, refreshToken?: string) => {
        set({ 
          token,
          ...(refreshToken && { refreshToken }),
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
