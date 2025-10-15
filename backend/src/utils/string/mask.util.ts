/**
 * String masking utilities
 * Contains functions for masking sensitive data
 */
export const maskUtils = {
  /**
   * Mask email address
   * @param email - Email to mask
   * @param visibleChars - Number of characters to show at start and end
   * @returns Masked email
   */
  maskEmail(email: string, visibleChars: number = 2): string {
    if (!email || !email.includes('@')) return email;
    
    const [localPart, domain] = email.split('@');
    const maskedLocal = this.maskString(localPart, visibleChars);
    const maskedDomain = this.maskString(domain, visibleChars);
    
    return `${maskedLocal}@${maskedDomain}`;
  },

  /**
   * Mask phone number
   * @param phone - Phone number to mask
   * @param visibleChars - Number of characters to show at start and end
   * @returns Masked phone number
   */
  maskPhone(phone: string, visibleChars: number = 3): string {
    if (!phone) return phone;
    return this.maskString(phone, visibleChars);
  },

  /**
   * Mask credit card number
   * @param cardNumber - Credit card number to mask
   * @param visibleChars - Number of characters to show at end
   * @returns Masked credit card number
   */
  maskCreditCard(cardNumber: string, visibleChars: number = 4): string {
    if (!cardNumber) return cardNumber;
    const cleaned = cardNumber.replace(/\s/g, '');
    return this.maskString(cleaned, 0, visibleChars);
  },

  /**
   * Mask string with asterisks
   * @param str - String to mask
   * @param startVisible - Number of characters to show at start
   * @param endVisible - Number of characters to show at end
   * @param maskChar - Character to use for masking
   * @returns Masked string
   */
  maskString(str: string, startVisible: number = 2, endVisible: number = 2, maskChar: string = '*'): string {
    if (!str || str.length <= startVisible + endVisible) {
      return maskChar.repeat(str.length);
    }

    const start = str.substring(0, startVisible);
    const end = str.substring(str.length - endVisible);
    const middle = maskChar.repeat(str.length - startVisible - endVisible);

    return `${start}${middle}${end}`;
  },

  /**
   * Mask middle part of string
   * @param str - String to mask
   * @param maskChar - Character to use for masking
   * @returns Masked string
   */
  maskMiddle(str: string, maskChar: string = '*'): string {
    if (!str || str.length <= 2) return str;
    
    const start = str.charAt(0);
    const end = str.charAt(str.length - 1);
    const middle = maskChar.repeat(str.length - 2);
    
    return `${start}${middle}${end}`;
  },

  /**
   * Mask all characters except first and last
   * @param str - String to mask
   * @param maskChar - Character to use for masking
   * @returns Masked string
   */
  maskAllButFirstAndLast(str: string, maskChar: string = '*'): string {
    if (!str || str.length <= 2) return str;
    
    const first = str.charAt(0);
    const last = str.charAt(str.length - 1);
    const middle = maskChar.repeat(str.length - 2);
    
    return `${first}${middle}${last}`;
  },

  /**
   * Mask all characters
   * @param str - String to mask
   * @param maskChar - Character to use for masking
   * @returns Masked string
   */
  maskAll(str: string, maskChar: string = '*'): string {
    if (!str) return str;
    return maskChar.repeat(str.length);
  },

  /**
   * Mask with custom pattern
   * @param str - String to mask
   * @param pattern - Pattern to apply (e.g., 'XXX-XX-XXXX')
   * @param maskChar - Character to use for masking
   * @returns Masked string following pattern
   */
  maskWithPattern(str: string, pattern: string, maskChar: string = '*'): string {
    if (!str || !pattern) return str;
    
    let result = '';
    let strIndex = 0;
    
    for (let i = 0; i < pattern.length && strIndex < str.length; i++) {
      if (pattern[i] === 'X') {
        result += maskChar;
        strIndex++;
      } else {
        result += pattern[i];
      }
    }
    
    return result;
  },

  /**
   * Mask sensitive data in text
   * @param text - Text containing sensitive data
   * @param sensitivePatterns - Array of regex patterns to match sensitive data
   * @param maskChar - Character to use for masking
   * @returns Text with sensitive data masked
   */
  maskSensitiveData(text: string, sensitivePatterns: RegExp[] = [], maskChar: string = '*'): string {
    if (!text) return text;
    
    let maskedText = text;
    
    // Default sensitive patterns
    const defaultPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card
      /\b\d{3}-\d{2}-\d{4}\b/g // SSN
    ];
    
    const allPatterns = [...defaultPatterns, ...sensitivePatterns];
    
    allPatterns.forEach(pattern => {
      maskedText = maskedText.replace(pattern, (match) => {
        return this.maskString(match, 2, 2, maskChar);
      });
    });
    
    return maskedText;
  },

  /**
   * Mask password
   * @param password - Password to mask
   * @param maskChar - Character to use for masking
   * @returns Masked password
   */
  maskPassword(password: string, maskChar: string = '*'): string {
    if (!password) return password;
    return maskChar.repeat(password.length);
  },

  /**
   * Mask token
   * @param token - Token to mask
   * @param visibleChars - Number of characters to show at start and end
   * @param maskChar - Character to use for masking
   * @returns Masked token
   */
  maskToken(token: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (!token) return token;
    return this.maskString(token, visibleChars, visibleChars, maskChar);
  },

  /**
   * Mask URL
   * @param url - URL to mask
   * @param visibleChars - Number of characters to show at start and end
   * @param maskChar - Character to use for masking
   * @returns Masked URL
   */
  maskURL(url: string, visibleChars: number = 10, maskChar: string = '*'): string {
    if (!url) return url;
    return this.maskString(url, visibleChars, visibleChars, maskChar);
  },

  /**
   * Mask IP address
   * @param ip - IP address to mask
   * @param maskChar - Character to use for masking
   * @returns Masked IP address
   */
  maskIPAddress(ip: string, maskChar: string = '*'): string {
    if (!ip) return ip;
    
    const parts = ip.split('.');
    if (parts.length !== 4) return ip;
    
    return parts.map((part, index) => {
      if (index === 0 || index === 3) return part; // Show first and last octet
      return maskChar.repeat(part.length);
    }).join('.');
  },

  /**
   * Mask MAC address
   * @param mac - MAC address to mask
   * @param maskChar - Character to use for masking
   * @returns Masked MAC address
   */
  maskMACAddress(mac: string, maskChar: string = '*'): string {
    if (!mac) return mac;
    
    const parts = mac.split(/[:-]/);
    if (parts.length !== 6) return mac;
    
    return parts.map((part, index) => {
      if (index === 0 || index === 5) return part; // Show first and last part
      return maskChar.repeat(part.length);
    }).join(':');
  },

  /**
   * Mask name (first and last name)
   * @param name - Name to mask
   * @param maskChar - Character to use for masking
   * @returns Masked name
   */
  maskName(name: string, maskChar: string = '*'): string {
    if (!name) return name;
    
    const parts = name.split(' ');
    return parts.map(part => {
      if (part.length <= 2) return part;
      return part.charAt(0) + maskChar.repeat(part.length - 2) + part.charAt(part.length - 1);
    }).join(' ');
  },

  /**
   * Mask address
   * @param address - Address to mask
   * @param visibleChars - Number of characters to show at start and end
   * @param maskChar - Character to use for masking
   * @returns Masked address
   */
  maskAddress(address: string, visibleChars: number = 5, maskChar: string = '*'): string {
    if (!address) return address;
    return this.maskString(address, visibleChars, visibleChars, maskChar);
  }
};

