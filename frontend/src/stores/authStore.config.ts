/**
 * Auth Store Configuration
 * Config cho Zustand persist middleware
 */

import type { AuthStore, AuthState } from './authStore.enhanced';

/**
 * Partialize function - chỉ lưu các field cần thiết vào localStorage
 */
export function partializeAuthState(state: AuthStore): Pick<AuthState, 'user' | 'tokens' | 'isAuthenticated' | 'isInitialized'> {
  const partialized = {
    user: state.user,
    tokens: state.tokens,
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
  };

  // Warning nếu persist state không hợp lệ
  if (state.isAuthenticated && !partialized.tokens) {
    console.warn('[Auth Store] Persisting authenticated state without tokens!', {
      hasUser: !!partialized.user,
      hasTokens: !!partialized.tokens,
      isAuthenticated: partialized.isAuthenticated,
    });
  }

  return partialized;
}

/**
 * Setup localStorage watcher để debug
 * Chỉ chạy trong development
 */
export function setupLocalStorageWatcher() {
  // Check if we're in browser and not in production
  const isProduction = typeof import.meta !== 'undefined' && import.meta.env.PROD;
  if (typeof window === 'undefined' || isProduction) {
    return;
  }

  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;

  localStorage.setItem = function (key: string, value: string) {
    if (key === 'auth-storage') {
      try {
        const parsed = JSON.parse(value);
        const state = parsed?.state;
        const hasTokens = !!state?.tokens;
        const hasUser = !!state?.user;

        // Chỉ log nếu có vấn đề
        if (!hasTokens && hasUser) {
          console.warn('[LocalStorage] setItem called with user but NO tokens!', {
            timestamp: new Date().toISOString(),
            hasUser,
            hasTokens,
            stack: new Error().stack,
          });
        } else if (!hasTokens && !hasUser) {
          console.log('[LocalStorage] setItem called with empty state', {
            timestamp: new Date().toISOString(),
            isInitialized: state?.isInitialized,
          });
        }
      } catch (error) {
        // Ignore parse errors
      }
    }
    return originalSetItem.call(this, key, value);
  };

  localStorage.removeItem = function (key: string) {
    if (key === 'auth-storage') {
      console.warn('[LocalStorage] removeItem called for auth-storage - THIS WILL CLEAR AUTH DATA!', {
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
      });
    }
    return originalRemoveItem.call(this, key);
  };
}

