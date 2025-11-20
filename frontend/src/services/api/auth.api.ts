import { apiClient } from '../http/client';

/**
 * Forgot password request payload
 */
export interface ForgotPasswordPayload {
  email: string;
}

/**
 * Reset password request payload
 */
export interface ResetPasswordPayload {
  token: string;
  password: string;
}

/**
 * Auth API Service
 * Handles authentication-related API calls
 */
export const authApi = {
  /**
   * Request password reset email
   * @param email User's email address
   */
  forgotPassword: async (email: string): Promise<void> => {
    const payload: ForgotPasswordPayload = { email };
    await apiClient.post('/auth/forgot-password', payload);
  },

  /**
   * Reset password with reset token
   * @param token Password reset token from email link
   * @param password New password
   */
  resetPassword: async (token: string, password: string): Promise<void> => {
    const payload: ResetPasswordPayload = { token, password };
    await apiClient.post('/auth/reset-password', payload);
  },
};
