import { apiClient } from '../http/client';
import { User } from '@/stores/authStore.enhanced';

/**
 * Profile update payload
 */
export interface UpdateProfilePayload {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

/**
 * Change password payload
 */
export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

/**
 * User API Service
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.put<User>('/users/profile', data);
    return response.data;
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<{ url: string }>(
      '/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordPayload): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/users/change-password',
      data
    );
    return response.data;
  },

  /**
   * Get user by ID (for viewing other users)
   */
  getUserById: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },
};

export default userApi;
