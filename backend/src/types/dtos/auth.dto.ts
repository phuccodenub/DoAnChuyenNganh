/**
 * AUTH DTOs - Authentication & Authorization Data Transfer Objects
 */

// ===================================
// TWO-FACTOR AUTHENTICATION DTOs
// ===================================

export interface TwoFactorSettingsDTO {
  is_enabled: boolean;
  secret?: string;
  backup_codes?: string[];
  method?: '2fa_totp' | '2fa_sms' | '2fa_email';
  verified_at?: Date;
}

export interface UpdateTwoFactorSettingsDTO {
  is_enabled?: boolean;
  secret?: string;
  backup_codes?: string[];
  method?: '2fa_totp' | '2fa_sms' | '2fa_email';
  verified_at?: Date;
}

export interface TwoFactorResponseDTO {
  id: string;
  user_id: string;
  is_enabled: boolean;
  method: string;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ===================================
// USER SESSION DTOs
// ===================================

export interface CreateUserSessionDTO {
  user_id: string;
  session_token: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  last_activity?: Date;
}

export interface UpdateUserSessionDTO {
  last_activity?: Date;
  expires_at?: Date;
  is_active?: boolean;
}

export interface UserSessionResponseDTO {
  id: string;
  user_id: string;
  session_token: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  last_activity: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ===================================
// LOGIN ATTEMPT DTOs
// ===================================

export interface CreateLoginAttemptDTO {
  user_id?: string;
  email: string;
  ip_address: string;
  user_agent?: string;
  is_successful: boolean;
  failure_reason?: string;
  attempted_at?: Date;
}

export interface LoginAttemptResponseDTO {
  id: string;
  user_id?: string;
  email: string;
  ip_address: string;
  user_agent?: string;
  is_successful: boolean;
  failure_reason?: string;
  attempted_at: Date;
  created_at: Date;
}

// ===================================
// AUTH RESPONSE DTOs
// ===================================

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginResponseDTO {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  tokens: AuthTokensDTO;
  requires2FA?: boolean;
}

export interface RegisterResponseDTO {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  message: string;
  requiresEmailVerification: boolean;
}
