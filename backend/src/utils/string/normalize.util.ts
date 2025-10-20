import { CHARSETS } from '../constants.util';

/**
 * String normalization utilities
 * Contains functions for normalizing and cleaning strings
 */
export const normalizeUtils = {
  /**
   * Normalize string with options
   * @param str - String to normalize
   * @param options - Normalization options
   * @returns Normalized string
   */
  normalize(str: string, options: {
    case?: 'lower' | 'upper' | 'title' | 'camel' | 'snake' | 'kebab';
    trim?: boolean;
    removeSpaces?: boolean;
    removeSpecialChars?: boolean;
    removeAccents?: boolean;
    removeNumbers?: boolean;
    removePunctuation?: boolean;
  } = {}): string {
    if (!str) return str;

    let normalized = str;

    // Remove accents
    if (options.removeAccents) {
      normalized = this.removeAccents(normalized);
    }

    // Remove numbers
    if (options.removeNumbers) {
      normalized = normalized.replace(/\d/g, '');
    }

    // Remove punctuation
    if (options.removePunctuation) {
      normalized = normalized.replace(/[^\w\s]/g, '');
    }

    // Remove special characters
    if (options.removeSpecialChars) {
      normalized = normalized.replace(/[^\w\s]/g, '');
    }

    // Remove spaces
    if (options.removeSpaces) {
      normalized = normalized.replace(/\s/g, '');
    }

    // Trim
    if (options.trim !== false) {
      normalized = normalized.trim();
    }

    // Case conversion
    if (options.case) {
      switch (options.case) {
        case 'lower':
          normalized = normalized.toLowerCase();
          break;
        case 'upper':
          normalized = normalized.toUpperCase();
          break;
        case 'title':
          normalized = this.toTitleCase(normalized);
          break;
        case 'camel':
          normalized = this.toCamelCase(normalized);
          break;
        case 'snake':
          normalized = this.toSnakeCase(normalized);
          break;
        case 'kebab':
          normalized = this.toKebabCase(normalized);
          break;
      }
    }

    return normalized;
  },

  /**
   * Remove accents from string
   * @param str - String to remove accents from
   * @returns String without accents
   */
  removeAccents(str: string): string {
    if (!str) return str;
    
    const accents = 'ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ';
    const withoutAccents = 'AAAAEEEIIOOOOUUADIUOaaaaeeeiioooouuadiuouaaeooouaaeoo';
    
    return str.split('').map(char => {
      const index = accents.indexOf(char);
      return index !== -1 ? withoutAccents[index] : char;
    }).join('');
  },

  /**
   * Remove extra spaces from string
   * @param str - String to clean
   * @returns String with normalized spaces
   */
  removeExtraSpaces(str: string): string {
    if (!str) return str;
    return str.replace(/\s+/g, ' ').trim();
  },

  /**
   * Remove line breaks from string
   * @param str - String to clean
   * @returns String without line breaks
   */
  removeLineBreaks(str: string): string {
    if (!str) return str;
    return str.replace(/[\r\n]+/g, ' ');
  },

  /**
   * Remove tabs from string
   * @param str - String to clean
   * @returns String without tabs
   */
  removeTabs(str: string): string {
    if (!str) return str;
    return str.replace(/\t/g, ' ');
  },

  /**
   * Remove all whitespace from string
   * @param str - String to clean
   * @returns String without whitespace
   */
  removeWhitespace(str: string): string {
    if (!str) return str;
    return str.replace(/\s/g, '');
  },

  /**
   * Remove leading whitespace from string
   * @param str - String to clean
   * @returns String without leading whitespace
   */
  removeLeadingWhitespace(str: string): string {
    if (!str) return str;
    return str.replace(/^\s+/, '');
  },

  /**
   * Remove trailing whitespace from string
   * @param str - String to clean
   * @returns String without trailing whitespace
   */
  removeTrailingWhitespace(str: string): string {
    if (!str) return str;
    return str.replace(/\s+$/, '');
  },

  /**
   * Remove control characters from string
   * @param str - String to clean
   * @returns String without control characters
   */
  removeControlCharacters(str: string): string {
    if (!str) return str;
    return str.replace(/[\x00-\x1F\x7F]/g, '');
  },

  /**
   * Remove non-printable characters from string
   * @param str - String to clean
   * @returns String without non-printable characters
   */
  removeNonPrintableCharacters(str: string): string {
    if (!str) return str;
    return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  },

  /**
   * Remove HTML tags from string
   * @param str - String to clean
   * @returns String without HTML tags
   */
  removeHTMLTags(str: string): string {
    if (!str) return str;
    return str.replace(/<[^>]*>/g, '');
  },

  /**
   * Remove markdown formatting from string
   * @param str - String to clean
   * @returns String without markdown formatting
   */
  removeMarkdownFormatting(str: string): string {
    if (!str) return str;
    return str
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/__(.*?)__/g, '$1') // Bold
      .replace(/_(.*?)_/g, '$1') // Italic
      .replace(/~~(.*?)~~/g, '$1') // Strikethrough
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/^\s*[-*+]\s/gm, '') // List items
      .replace(/^\s*\d+\.\s/gm, ''); // Numbered lists
  },

  /**
   * Remove URLs from string
   * @param str - String to clean
   * @returns String without URLs
   */
  removeURLs(str: string): string {
    if (!str) return str;
    return str.replace(/https?:\/\/[^\s]+/g, '');
  },

  /**
   * Remove email addresses from string
   * @param str - String to clean
   * @returns String without email addresses
   */
  removeEmails(str: string): string {
    if (!str) return str;
    return str.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '');
  },

  /**
   * Remove phone numbers from string
   * @param str - String to clean
   * @returns String without phone numbers
   */
  removePhones(str: string): string {
    if (!str) return str;
    return str.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '');
  },

  /**
   * Remove numbers from string
   * @param str - String to clean
   * @returns String without numbers
   */
  removeNumbers(str: string): string {
    if (!str) return str;
    return str.replace(/\d/g, '');
  },

  /**
   * Remove punctuation from string
   * @param str - String to clean
   * @returns String without punctuation
   */
  removePunctuation(str: string): string {
    if (!str) return str;
    return str.replace(/[^\w\s]/g, '');
  },

  /**
   * Remove special characters from string
   * @param str - String to clean
   * @returns String without special characters
   */
  removeSpecialCharacters(str: string): string {
    if (!str) return str;
    return str.replace(/[^a-zA-Z0-9\s]/g, '');
  },

  /**
   * Remove duplicate characters from string
   * @param str - String to clean
   * @param char - Character to remove duplicates of
   * @returns String without duplicate characters
   */
  removeDuplicateCharacters(str: string, char: string = ' '): string {
    if (!str) return str;
    const regex = new RegExp(`${char}+`, 'g');
    return str.replace(regex, char);
  },

  /**
   * Remove duplicate words from string
   * @param str - String to clean
   * @returns String without duplicate words
   */
  removeDuplicateWords(str: string): string {
    if (!str) return str;
    const words = str.split(/\s+/);
    const uniqueWords = [...new Set(words)];
    return uniqueWords.join(' ');
  },

  /**
   * Remove empty lines from string
   * @param str - String to clean
   * @returns String without empty lines
   */
  removeEmptyLines(str: string): string {
    if (!str) return str;
    return str.split('\n').filter(line => line.trim() !== '').join('\n');
  },

  /**
   * Convert to camelCase
   * @param str - String to convert
   * @returns camelCase string
   */
  toCamelCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  },

  /**
   * Convert to snake_case
   * @param str - String to convert
   * @returns snake_case string
   */
  toSnakeCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  },

  /**
   * Convert to kebab-case
   * @param str - String to convert
   * @returns kebab-case string
   */
  toKebabCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  },

  /**
   * Convert to Title Case
   * @param str - String to convert
   * @returns Title Case string
   */
  toTitleCase(str: string): string {
    if (!str) return str;
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  /**
   * Clean and normalize Vietnamese text
   * @param str - Vietnamese text to clean
   * @returns Cleaned Vietnamese text
   */
  cleanVietnameseText(str: string): string {
    if (!str) return str;
    
    return str
      .normalize('NFC') // Normalize Unicode
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim(); // Remove leading/trailing spaces
  },

  /**
   * Normalize Unicode string
   * @param str - String to normalize
   * @param form - Unicode normalization form
   * @returns Normalized string
   */
  normalizeUnicode(str: string, form: 'NFC' | 'NFD' | 'NFKC' | 'NFKD' = 'NFC'): string {
    if (!str) return str;
    return str.normalize(form);
  },

  /**
   * Clean string for database storage
   * @param str - String to clean
   * @returns Cleaned string
   */
  cleanForDatabase(str: string): string {
    if (!str) return str;
    
    return str
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim(); // Remove leading/trailing whitespace
  },

  /**
   * Clean string for display
   * @param str - String to clean
   * @returns Cleaned string
   */
  cleanForDisplay(str: string): string {
    if (!str) return str;
    
    return str
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim(); // Remove leading/trailing whitespace
  }
};

