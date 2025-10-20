/**
 * Global services exports
 * These services are shared across all modules and provide core functionality
 */

// ===== AUTHENTICATION & SECURITY SERVICES =====
export { GlobalAuthService } from './auth.service';
export { GlobalUserService } from './user.service';
export { PasswordSecurityService } from './password-security.service';
export { TwoFactorService } from './two-factor.service';
export { AccountLockoutService } from './account-lockout.service';
export { SessionManagementService } from './session-management.service';

// ===== CACHE & STORAGE SERVICES =====
export { CacheService } from './cache.service';
export { FileService } from './file.service';
export { EmailService } from './email.service';

// ===== SERVICE INSTANCES =====
import { GlobalAuthService } from './auth.service';
import { GlobalUserService } from './user.service';
import { PasswordSecurityService } from './password-security.service';
import { TwoFactorService } from './two-factor.service';
import { AccountLockoutService } from './account-lockout.service';
import { SessionManagementService } from './session-management.service';
import { CacheService } from './cache.service';
import { FileService } from './file.service';
import { EmailService } from './email.service';

/**
 * Global service instances
 * Pre-instantiated objects for easy use across modules
 */
export const globalServices = {
  auth: new GlobalAuthService(),
  user: new GlobalUserService(),
  passwordSecurity: new PasswordSecurityService(),
  twoFactor: new TwoFactorService(),
  accountLockout: new AccountLockoutService(),
  sessionManagement: new SessionManagementService(),
  cache: new CacheService(),
  file: new FileService(),
  email: new EmailService()
};

/**
 * Global service factory
 * Creates new instances of global services
 */
export const createGlobalServices = () => ({
  auth: new GlobalAuthService(),
  user: new GlobalUserService(),
  passwordSecurity: new PasswordSecurityService(),
  twoFactor: new TwoFactorService(),
  accountLockout: new AccountLockoutService(),
  sessionManagement: new SessionManagementService(),
  cache: new CacheService(),
  file: new FileService(),
  email: new EmailService()
});

// ===== DEFAULT EXPORT =====
export default globalServices;

