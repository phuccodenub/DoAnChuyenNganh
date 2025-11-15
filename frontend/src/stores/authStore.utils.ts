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
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string
): string {
  if (error && typeof error === 'object') {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return err.response?.data?.message || err.message || defaultMessage;
  }
  return defaultMessage;
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

