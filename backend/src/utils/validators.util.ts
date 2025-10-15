import { REGEX_PATTERNS, COMMON_VALUES } from './constants.util';

/**
 * Validation utility functions
 * Extracted from string.util.ts for better organization
 * Uses constants from constants.util.ts for better performance
 */

/**
 * Validation utility functions
 */
export const validatorsUtils = {
  // ===== EMAIL VALIDATION =====
  
  /**
   * Validate email address
   * @param email - Email to validate
   * @returns True if valid email format
   */
  isEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    return REGEX_PATTERNS.EMAIL.test(email.trim());
  },

  /**
   * Validate email domain
   * @param email - Email to validate
   * @param allowedDomains - Array of allowed domains
   * @returns True if email domain is allowed
   */
  isEmailDomainAllowed(email: string, allowedDomains: string[]): boolean {
    if (!this.isEmail(email)) return false;
    const domain = email.split('@')[1].toLowerCase();
    return allowedDomains.some(allowed => domain === allowed.toLowerCase());
  },

  // ===== PHONE VALIDATION =====
  
  /**
   * Validate Vietnamese phone number
   * @param phone - Phone number to validate
   * @returns True if valid Vietnamese phone format
   */
  isPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;
    return REGEX_PATTERNS.PHONE.test(phone.trim());
  },

  /**
   * Normalize Vietnamese phone number
   * @param phone - Phone number to normalize
   * @returns Normalized phone number
   */
  normalizePhone(phone: string): string {
    if (!phone) return '';
    return phone.replace(/^(\+84|84)/, '0');
  },

  // ===== URL VALIDATION =====
  
  /**
   * Validate URL
   * @param url - URL to validate
   * @returns True if valid URL format
   */
  isURL(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    return REGEX_PATTERNS.URL.test(url.trim());
  },

  /**
   * Validate if URL is HTTPS
   * @param url - URL to validate
   * @returns True if URL is HTTPS
   */
  isHTTPS(url: string): boolean {
    return this.isURL(url) && url.toLowerCase().startsWith('https://');
  },

  // ===== ID VALIDATION =====
  
  /**
   * Validate UUID
   * @param uuid - UUID to validate
   * @returns True if valid UUID format
   */
  isUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') return false;
    return REGEX_PATTERNS.UUID.test(uuid.trim());
  },

  /**
   * Validate student ID format
   * @param studentId - Student ID to validate
   * @returns True if valid student ID format
   */
  isStudentId(studentId: string): boolean {
    if (!studentId || typeof studentId !== 'string') return false;
    return REGEX_PATTERNS.STUDENT_ID.test(studentId.trim().toUpperCase());
  },

  /**
   * Validate instructor ID format
   * @param instructorId - Instructor ID to validate
   * @returns True if valid instructor ID format
   */
  isInstructorId(instructorId: string): boolean {
    if (!instructorId || typeof instructorId !== 'string') return false;
    return REGEX_PATTERNS.INSTRUCTOR_ID.test(instructorId.trim().toUpperCase());
  },

  // ===== PASSWORD VALIDATION =====
  
  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns True if password meets strength requirements
   */
  isStrongPassword(password: string): boolean {
    if (!password || typeof password !== 'string') return false;
    return REGEX_PATTERNS.PASSWORD.test(password);
  },

  /**
   * Get password strength feedback
   * @param password - Password to analyze
   * @returns Object with strength score and feedback
   */
  getPasswordStrength(password: string): { score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    if (!password) return { score: 0, feedback: ['Password is required'] };

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Password must be at least 8 characters long');

    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Password must contain lowercase letters');

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Password must contain uppercase letters');

    // Number check
    if (/\d/.test(password)) score += 1;
    else feedback.push('Password must contain numbers');

    // Special character check
    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('Password must contain special characters');

    return { score, feedback };
  },

  // ===== NAME VALIDATION =====
  
  /**
   * Validate Vietnamese name
   * @param name - Name to validate
   * @returns True if valid Vietnamese name format
   */
  isVietnameseName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    return REGEX_PATTERNS.VIETNAMESE_NAME.test(name.trim());
  },

  /**
   * Validate name length
   * @param name - Name to validate
   * @param minLength - Minimum length
   * @param maxLength - Maximum length
   * @returns True if name length is valid
   */
  isNameLengthValid(name: string, minLength: number = 2, maxLength: number = 50): boolean {
    if (!name || typeof name !== 'string') return false;
    const trimmedName = name.trim();
    return trimmedName.length >= minLength && trimmedName.length <= maxLength;
  },

  // ===== FORMAT VALIDATION =====
  
  /**
   * Validate slug format
   * @param slug - Slug to validate
   * @returns True if valid slug format
   */
  isSlug(slug: string): boolean {
    if (!slug || typeof slug !== 'string') return false;
    return REGEX_PATTERNS.SLUG.test(slug.trim());
  },

  /**
   * Validate hex color
   * @param color - Color to validate
   * @returns True if valid hex color format
   */
  isHexColor(color: string): boolean {
    if (!color || typeof color !== 'string') return false;
    return REGEX_PATTERNS.HEX_COLOR.test(color.trim());
  },

  /**
   * Validate IP address
   * @param ip - IP address to validate
   * @returns True if valid IP address format
   */
  isIPAddress(ip: string): boolean {
    if (!ip || typeof ip !== 'string') return false;
    return REGEX_PATTERNS.IP_ADDRESS.test(ip.trim());
  },

  /**
   * Validate MAC address
   * @param mac - MAC address to validate
   * @returns True if valid MAC address format
   */
  isMACAddress(mac: string): boolean {
    if (!mac || typeof mac !== 'string') return false;
    return REGEX_PATTERNS.MAC_ADDRESS.test(mac.trim());
  },

  // ===== FINANCIAL VALIDATION =====
  
  /**
   * Validate credit card number
   * @param cardNumber - Credit card number to validate
   * @returns True if valid credit card format
   */
  isCreditCard(cardNumber: string): boolean {
    if (!cardNumber || typeof cardNumber !== 'string') return false;
    return REGEX_PATTERNS.CREDIT_CARD.test(cardNumber.replace(/\s/g, ''));
  },

  // ===== DATE & TIME VALIDATION =====
  
  /**
   * Validate 24-hour time format
   * @param time - Time to validate
   * @returns True if valid 24-hour time format
   */
  isTime24H(time: string): boolean {
    if (!time || typeof time !== 'string') return false;
    return REGEX_PATTERNS.TIME_24H.test(time.trim());
  },

  /**
   * Validate ISO date format
   * @param date - Date to validate
   * @returns True if valid ISO date format
   */
  isISODate(date: string): boolean {
    if (!date || typeof date !== 'string') return false;
    return REGEX_PATTERNS.DATE_ISO.test(date.trim());
  },

  /**
   * Validate ISO datetime format
   * @param datetime - Datetime to validate
   * @returns True if valid ISO datetime format
   */
  isISODatetime(datetime: string): boolean {
    if (!datetime || typeof datetime !== 'string') return false;
    return REGEX_PATTERNS.DATETIME_ISO.test(datetime.trim());
  },

  // ===== POSTAL VALIDATION =====
  
  /**
   * Validate postal code
   * @param postalCode - Postal code to validate
   * @returns True if valid postal code format
   */
  isPostalCode(postalCode: string): boolean {
    if (!postalCode || typeof postalCode !== 'string') return false;
    return REGEX_PATTERNS.POSTAL_CODE.test(postalCode.trim());
  },

  // ===== GENERAL VALIDATION =====
  
  /**
   * Check if string is not empty
   * @param str - String to check
   * @returns True if string is not empty
   */
  isNotEmpty(str: string): boolean {
    return str !== null && str !== undefined && str.trim().length > 0;
  },

  /**
   * Check if string is empty
   * @param str - String to check
   * @returns True if string is empty
   */
  isEmpty(str: string): boolean {
    return !this.isNotEmpty(str);
  },

  /**
   * Check if value is null or undefined
   * @param value - Value to check
   * @returns True if value is null or undefined
   */
  isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
  },

  /**
   * Check if value is a valid number
   * @param value - Value to check
   * @returns True if value is a valid number
   */
  isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  },

  /**
   * Check if value is a valid integer
   * @param value - Value to check
   * @returns True if value is a valid integer
   */
  isInteger(value: any): boolean {
    return this.isNumber(value) && Number.isInteger(value);
  },

  /**
   * Check if value is a valid positive number
   * @param value - Value to check
   * @returns True if value is a valid positive number
   */
  isPositiveNumber(value: any): boolean {
    return this.isNumber(value) && value > 0;
  },

  /**
   * Check if value is within range
   * @param value - Value to check
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns True if value is within range
   */
  isInRange(value: any, min: number, max: number): boolean {
    return this.isNumber(value) && value >= min && value <= max;
  }
};

