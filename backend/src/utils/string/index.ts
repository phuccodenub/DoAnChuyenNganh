/**
 * String utilities module
 * Contains all string-related utility functions organized by functionality
 */

// ===== FORMAT UTILITIES =====
export * as formatUtils from './format.util';

// ===== MASK UTILITIES =====
export * as maskUtils from './mask.util';

// ===== EXTRACT UTILITIES =====
export * as extractUtils from './extract.util';

// ===== CRYPTO UTILITIES =====
export * as cryptoUtils from './crypto.util';

// ===== NORMALIZE UTILITIES =====
export * as normalizeUtils from './normalize.util';

// ===== RE-EXPORT ALL UTILITIES =====
import { formatUtils } from './format.util';
import { maskUtils } from './mask.util';
import { extractUtils } from './extract.util';
import { cryptoUtils } from './crypto.util';
import { normalizeUtils } from './normalize.util';

/**
 * Combined string utilities object
 * Provides access to all string utility functions
 */
export const stringUtils = {
  // Normalize utilities first (to avoid overriding format utils)
  ...normalizeUtils,

  // Format utilities (should take precedence for case conversions)
  ...formatUtils,

  // Mask utilities
  ...maskUtils,

  // Extract utilities
  ...extractUtils,

  // Crypto utilities
  ...cryptoUtils
};

// ===== LEGACY EXPORTS (for backward compatibility) =====
export const generateRandomString = cryptoUtils.generateRandomString;
export const generateUUID = cryptoUtils.generateUUID;
export const generateSlug = formatUtils.generateSlug;
export const toCamelCase = formatUtils.toCamelCase;
export const toSnakeCase = formatUtils.toSnakeCase;
export const toKebabCase = formatUtils.toKebabCase;
export const toPascalCase = formatUtils.toPascalCase;
export const toTitleCase = formatUtils.toTitleCase;
export const maskEmail = maskUtils.maskEmail;
export const maskPhone = maskUtils.maskPhone;
export const maskString = maskUtils.maskString;
export const extractNumbers = extractUtils.extractNumbers;
export const extractWords = extractUtils.extractWords;
export const extractEmails = extractUtils.extractEmails;
export const extractPhones = extractUtils.extractPhones;
export const extractURLs = extractUtils.extractURLs;
export const hashSHA256 = cryptoUtils.hashSHA256;
export const hashSHA512 = cryptoUtils.hashSHA512;
export const hashMD5 = cryptoUtils.hashMD5;
export const encodeBase64 = cryptoUtils.encodeBase64;
export const decodeBase64 = cryptoUtils.decodeBase64;
export const normalize = normalizeUtils.normalize;
export const removeAccents = normalizeUtils.removeAccents;
export const removeExtraSpaces = normalizeUtils.removeExtraSpaces;
export const removeHTMLTags = normalizeUtils.removeHTMLTags;
export const removeMarkdownFormatting = normalizeUtils.removeMarkdownFormatting;
export const removeURLs = normalizeUtils.removeURLs;
export const removeEmails = normalizeUtils.removeEmails;
export const removePhones = normalizeUtils.removePhones;
export const removeNumbers = normalizeUtils.removeNumbers;
export const removePunctuation = normalizeUtils.removePunctuation;
export const removeSpecialCharacters = normalizeUtils.removeSpecialCharacters;
export const removeDuplicateCharacters = normalizeUtils.removeDuplicateCharacters;
export const removeDuplicateWords = normalizeUtils.removeDuplicateWords;
export const removeEmptyLines = normalizeUtils.removeEmptyLines;
export const cleanVietnameseText = normalizeUtils.cleanVietnameseText;
export const normalizeUnicode = normalizeUtils.normalizeUnicode;
export const cleanForDatabase = normalizeUtils.cleanForDatabase;
export const cleanForDisplay = normalizeUtils.cleanForDisplay;

