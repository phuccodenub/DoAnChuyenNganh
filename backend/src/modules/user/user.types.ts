// User module types - Nghiệp vụ riêng của User

// User preferences (theme, language, notifications...)
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'vi' | 'en';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    showLastSeen: boolean;
  };
}

// User session management
export interface UserSession {
  id: string;
  device: string;
  location: string;
  lastActivity: Date;
  isCurrent: boolean;
  ipAddress: string;
  userAgent: string;
}

// User analytics và insights
export interface UserAnalytics {
  totalLoginTime: number; // seconds
  averageSessionDuration: number; // seconds
  loginFrequency: number; // times per week
  lastActivity: Date;
  deviceCount: number;
  locationCount: number;
  mostUsedFeatures: string[];
  activityScore: number; // 0-100
}

// Social account linking
export interface SocialAccount {
  provider: 'google' | 'facebook' | 'github' | 'twitter';
  socialId: string;
  email: string;
  name: string;
  avatar?: string;
  linkedAt: Date;
}

// Two-factor authentication
export interface TwoFactorSettings {
  enabled: boolean;
  secret?: string;
  backupCodes: string[];
  lastUsed?: Date;
}

// User profile (dùng chung với Global)
export interface UserProfile {
  id: string;
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
