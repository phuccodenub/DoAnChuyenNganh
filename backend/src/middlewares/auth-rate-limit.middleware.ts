import rateLimit from 'express-rate-limit';

// Rate limiting cho auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần thử trong 15 phút
  message: {
    error: 'Too many login attempts, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Chỉ đếm failed attempts
  keyGenerator: (req) => {
    const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown').toString();
    const userAgent = req.get('User-Agent') || 'unknown';
    return `${ip}-${userAgent}`;
  }
});

// Rate limiting cho password reset
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Tối đa 3 lần reset password trong 1 giờ
  message: {
    error: 'Too many password reset attempts, please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting cho registration
export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Tối đa 3 lần đăng ký trong 1 giờ
  message: {
    error: 'Too many registration attempts, please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});


