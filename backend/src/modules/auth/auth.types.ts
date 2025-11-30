// Auth module types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'student' | 'instructor' | 'admin' | 'super_admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified: boolean;
  email_verified_at?: Date;
  token_version: number;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

