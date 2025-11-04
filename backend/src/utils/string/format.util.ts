import { CHARSETS } from '../constants.util';

/**
 * String formatting utilities
 * Contains functions for converting string formats (camelCase, snake_case, etc.)
 */
export const formatUtils = {
  /**
   * Convert to camelCase
   * @param text - Text to convert
   * @returns camelCase string
   */
  toCamelCase(text: string): string {
    if (!text) return text as unknown as string;
    return text
      .trim()
      .replace(/[-_\s]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
      .replace(/^(.)/, (m) => m.toLowerCase());
  },

  /**
   * Convert to snake_case
   * @param text - Text to convert
   * @returns snake_case string
   */
  toSnakeCase(text: string): string {
    return text
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  },

  /**
   * Convert to kebab-case
   * @param text - Text to convert
   * @returns kebab-case string
   */
  toKebabCase(text: string): string {
    return text
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  },

  /**
   * Convert to PascalCase
   * @param text - Text to convert
   * @returns PascalCase string
   */
  toPascalCase(text: string): string {
    if (!text) return text as unknown as string;
    return text
      .trim()
      .replace(/(^\w|[A-Z]|\b\w|[-_\s]+\w)/g, (match) => match.replace(/[-_\s]+/, '').toUpperCase())
      .replace(/[-_\s]/g, '');
  },

  /**
   * Convert to Title Case
   * @param text - Text to convert
   * @returns Title Case string
   */
  toTitleCase(text: string): string {
    return text.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  /**
   * Convert to lowercase
   * @param text - Text to convert
   * @returns lowercase string
   */
  toLowerCase(text: string): string {
    return text.toLowerCase();
  },

  /**
   * Convert to uppercase
   * @param text - Text to convert
   * @returns uppercase string
   */
  toUpperCase(text: string): string {
    return text.toUpperCase();
  },

  /**
   * Capitalize first letter
   * @param text - Text to capitalize
   * @returns Capitalized string
   */
  capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Uncapitalize first letter
   * @param text - Text to uncapitalize
   * @returns Uncapitalized string
   */
  uncapitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toLowerCase() + text.slice(1);
  },

  /**
   * Generate slug from string
   * @param text - Text to convert to slug
   * @returns URL-friendly slug
   */
  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  },

  /**
   * Convert string to initials
   * @param text - Text to convert
   * @param maxLength - Maximum number of initials
   * @returns Initials string
   */
  toInitials(text: string, maxLength: number = 2): string {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, maxLength);
  },

  /**
   * Convert string to acronym
   * @param text - Text to convert
   * @returns Acronym string
   */
  toAcronym(text: string): string {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  },

  /**
   * Convert string to sentence case
   * @param text - Text to convert
   * @returns Sentence case string
   */
  toSentenceCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Convert string to alternating case
   * @param text - Text to convert
   * @returns Alternating case string
   */
  toAlternatingCase(text: string): string {
    return text
      .split('')
      .map((char, index) => index % 2 === 0 ? char.toUpperCase() : char.toLowerCase())
      .join('');
  },

  /**
   * Convert string to reverse case
   * @param text - Text to convert
   * @returns Reverse case string
   */
  toReverseCase(text: string): string {
    return text
      .split('')
      .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
      .join('');
  },

  /**
   * Convert string to dot case
   * @param text - Text to convert
   * @returns dot.case string
   */
  toDotCase(text: string): string {
    return text
      .replace(/([A-Z])/g, '.$1')
      .toLowerCase()
      .replace(/^\./, '');
  },

  /**
   * Convert string to constant case
   * @param text - Text to convert
   * @returns CONSTANT_CASE string
   */
  toConstantCase(text: string): string {
    return text
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '');
  },

  /**
   * Convert string to path case
   * @param text - Text to convert
   * @returns path/case string
   */
  toPathCase(text: string): string {
    return text
      .replace(/([A-Z])/g, '/$1')
      .toLowerCase()
      .replace(/^\//, '');
  },

  /**
   * Convert string to header case
   * @param text - Text to convert
   * @returns Header-Case string
   */
  toHeaderCase(text: string): string {
    return text
      .replace(/([A-Z])/g, '-$1')
      .replace(/^-/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
  },

  /**
   * Convert string to param case
   * @param text - Text to convert
   * @returns param-case string
   */
  toParamCase(text: string): string {
    return this.toKebabCase(text);
  },

  /**
   * Convert string to swap case
   * @param text - Text to convert
   * @returns Swap case string
   */
  toSwapCase(text: string): string {
    return this.toReverseCase(text);
  }
};

