// User module types - Nghiệp vụ riêng của User

// User preferences (theme, language, notifications...)
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'vi' | 'en';
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
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
  login_count: number;
  last_login: Date | null;
  session_duration: number;
  courses_enrolled: number;
  courses_completed: number;
  assignments_submitted: number;
  forum_posts: number;
  profile_views: number;
  time_spent_learning: number;
  achievements_earned: number;
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

export interface NotificationSettings {
  email?: {
    course_updates?: boolean;
    announcements?: boolean;
    reminders?: boolean;
  };
  push?: {
    course_updates?: boolean;
    announcements?: boolean;
    reminders?: boolean;
  };
  sms?: {
    urgent_updates?: boolean;
    security_alerts?: boolean;
  };
}

export interface PrivacySettings {
  profile_visibility?: 'public' | 'private' | 'friends_only';
  email_visibility?: 'public' | 'private' | 'friends_only';
  phone_visibility?: 'public' | 'private' | 'friends_only';
  show_online_status?: boolean;
  allow_friend_requests?: boolean;
  show_last_seen?: boolean;
  data_sharing?: {
    analytics?: boolean;
    marketing?: boolean;
    research?: boolean;
  };
}

export interface UserStats {
  login_count: number;
  last_login: Date | null;
  session_count: number;
  courses_enrolled: number;
  courses_completed: number;
  assignments_submitted: number;
  forum_posts: number;
  profile_views: number;
  account_age_days: number;
  profile_completion: number;
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

