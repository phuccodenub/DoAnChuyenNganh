/**
 * Auth Store Utilities
 * Helper functions cho auth store
 */

import type { User } from './authStore.enhanced';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface StoredAuthState {
  user?: User | null;
  tokens?: Tokens | null;
  isAuthenticated?: boolean;
  isInitialized?: boolean;
}

/**
 * Get tokens from stored state
 * Chỉ support format mới (tokens object)
 */
export function getTokensFromState(state: StoredAuthState): Tokens | null {
  if (state.tokens?.accessToken && state.tokens?.refreshToken) {
    return state.tokens;
  }
  return null;
}

/**
 * Restore auth state từ localStorage
 */
export function restoreAuthFromStorage(): StoredAuthState | null {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed?.state || null;
  } catch (error) {
    console.error('[Auth Utils] Error parsing localStorage:', error);
    return null;
  }
}

/**
 * Extract error message từ error object
 * Hỗ trợ nhiều format error từ backend
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string
): string {
  if (error && typeof error === 'object') {
    const err = error as { 
      response?: { 
        data?: { 
          message?: string;
          error?: string;
          errors?: Array<{ field?: string; message?: string }> | Record<string, string[]>;
        }; 
        status?: number;
      }; 
      message?: string;
    };
    
    // Xử lý validation errors (422)
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      if (Array.isArray(errors)) {
        return errors.map(e => e.message || '').filter(Boolean).join(', ') || defaultMessage;
      } else if (typeof errors === 'object') {
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => Array.isArray(messages) ? messages.join(', ') : String(messages))
          .filter(Boolean);
        return errorMessages.join(', ') || defaultMessage;
      }
    }
    
    // Xử lý error message thông thường
    return err.response?.data?.message || 
           err.response?.data?.error || 
           err.message || 
           defaultMessage;
  }
  return defaultMessage;
}

/**
 * Get detailed error message for authentication failures
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as { response?: { status?: number; data?: { message?: string } } };
    
    switch (err.response?.status) {
      case 401:
        return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      case 403:
        return 'Tài khoản của bạn không có quyền truy cập.';
      case 404:
        return 'Không tìm thấy tài khoản. Vui lòng kiểm tra lại email.';
      case 422:
        return getErrorMessage(error, 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      case 429:
        return 'Quá nhiều lần thử. Vui lòng thử lại sau vài phút.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      default:
        if (!err.response) {
          return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
        }
        return getErrorMessage(error, 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  }
  return 'Đăng nhập thất bại. Vui lòng thử lại.';
}

/**
 * Check if error is 401 Unauthorized
 */
export function isUnauthorizedError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as { response?: { status?: number } };
    return err.response?.status === 401;
  }
  return false;
}

