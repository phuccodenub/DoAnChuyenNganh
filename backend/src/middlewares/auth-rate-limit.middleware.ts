import rateLimit from 'express-rate-limit';

const disabled = process.env.DISABLE_RATE_LIMIT === 'true' || process.env.NODE_ENV === 'test';
const passthrough = (_req: any, _res: any, next: any) => next();

// Rate limiting cho auth endpoints
export const authRateLimit = disabled ? passthrough : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần thử trong 15 phút
  message: {
    error: 'Too many login attempts, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Chỉ đếm failed attempts
});

// Rate limiting cho password reset
export const passwordResetRateLimit = disabled ? passthrough : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Tối đa 3 lần reset password trong 1 giờ
  message: {
    error: 'Too many password reset attempts, please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting cho registration
export const registrationRateLimit = disabled ? passthrough : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Tối đa 3 lần đăng ký trong 1 giờ
  message: {
    error: 'Too many registration attempts, please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});


