import { apiClient } from '../http/client';
import { User } from '@/stores/authStore.enhanced';

/**
 * Backend API response format
 */
interface BackendApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Profile update payload - aligned with backend user model
 */
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone?: string;
  avatar?: string; // URL to avatar (backend field name)
  avatar_url?: string; // Alias for avatar
  
  // Role-specific fields
  class?: string;
  major?: string;
  year?: number;
  gpa?: number;
  
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor';
  research_interests?: string;
  
  // Additional fields
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
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
    const response = await apiClient.get<BackendApiResponse<{ user: User }>>('/users/profile');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Lấy thông tin profile thất bại');
    }
    return response.data.data.user;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.put<BackendApiResponse<{ user: User }>>('/users/profile', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Cập nhật profile thất bại');
    }
    return response.data.data.user;
  },

  /**
   * Upload avatar (via backend -> Cloudinary)
   */
  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<BackendApiResponse<{ avatar: string }>>(
      '/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Tải ảnh đại diện thất bại');
    }
    
    return response.data.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordPayload): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<BackendApiResponse<{ success: boolean }>>(
      '/users/change-password',
      data
    );
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },

  /**
   * Get user by ID (for viewing other users)
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<BackendApiResponse<User>>(`/users/${userId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Lấy thông tin người dùng thất bại');
    }
    return response.data.data;
  },
};

export default userApi;
