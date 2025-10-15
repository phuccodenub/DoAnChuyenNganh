import { REGEX_PATTERNS } from '../constants.util';

/**
 * String extraction utilities
 * Contains functions for extracting specific data from strings
 */
export const extractUtils = {
  /**
   * Extract numbers from string
   * @param str - String to extract numbers from
   * @returns Array of numbers found
   */
  extractNumbers(str: string): number[] {
    if (!str) return [];
    const matches = str.match(/\d+/g);
    return matches ? matches.map(Number) : [];
  },

  /**
   * Extract words from string
   * @param str - String to extract words from
   * @returns Array of words found
   */
  extractWords(str: string): string[] {
    if (!str) return [];
    return str.match(/\b\w+\b/g) || [];
  },

  /**
   * Extract email addresses from string
   * @param str - String to extract emails from
   * @returns Array of email addresses found
   */
  extractEmails(str: string): string[] {
    if (!str) return [];
    const matches = str.match(REGEX_PATTERNS.EMAIL);
    return matches || [];
  },

  /**
   * Extract phone numbers from string
   * @param str - String to extract phone numbers from
   * @returns Array of phone numbers found
   */
  extractPhones(str: string): string[] {
    if (!str) return [];
    const matches = str.match(REGEX_PATTERNS.PHONE);
    return matches || [];
  },

  /**
   * Extract URLs from string
   * @param str - String to extract URLs from
   * @returns Array of URLs found
   */
  extractURLs(str: string): string[] {
    if (!str) return [];
    const matches = str.match(REGEX_PATTERNS.URL);
    return matches || [];
  },

  /**
   * Extract UUIDs from string
   * @param str - String to extract UUIDs from
   * @returns Array of UUIDs found
   */
  extractUUIDs(str: string): string[] {
    if (!str) return [];
    const matches = str.match(REGEX_PATTERNS.UUID);
    return matches || [];
  },

  /**
   * Extract hashtags from string
   * @param str - String to extract hashtags from
   * @returns Array of hashtags found
   */
  extractHashtags(str: string): string[] {
    if (!str) return [];
    const matches = str.match(/#\w+/g);
    return matches || [];
  },

  /**
   * Extract mentions from string
   * @param str - String to extract mentions from
   * @returns Array of mentions found
   */
  extractMentions(str: string): string[] {
    if (!str) return [];
    const matches = str.match(/@\w+/g);
    return matches || [];
  },

  /**
   * Extract sentences from string
   * @param str - String to extract sentences from
   * @returns Array of sentences found
   */
  extractSentences(str: string): string[] {
    if (!str) return [];
    return str.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  },

  /**
   * Extract paragraphs from string
   * @param str - String to extract paragraphs from
   * @returns Array of paragraphs found
   */
  extractParagraphs(str: string): string[] {
    if (!str) return [];
    return str.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  },

  /**
   * Extract lines from string
   * @param str - String to extract lines from
   * @returns Array of lines found
   */
  extractLines(str: string): string[] {
    if (!str) return [];
    return str.split(/\n/).map(line => line.trim()).filter(line => line.length > 0);
  },

  /**
   * Extract words starting with specific character
   * @param str - String to extract words from
   * @param char - Character to match
   * @returns Array of words found
   */
  extractWordsStartingWith(str: string, char: string): string[] {
    if (!str || !char) return [];
    const regex = new RegExp(`\\b${char}\\w+\\b`, 'g');
    const matches = str.match(regex);
    return matches || [];
  },

  /**
   * Extract words ending with specific character
   * @param str - String to extract words from
   * @param char - Character to match
   * @returns Array of words found
   */
  extractWordsEndingWith(str: string, char: string): string[] {
    if (!str || !char) return [];
    const regex = new RegExp(`\\b\\w+${char}\\b`, 'g');
    const matches = str.match(regex);
    return matches || [];
  },

  /**
   * Extract words containing specific character
   * @param str - String to extract words from
   * @param char - Character to match
   * @returns Array of words found
   */
  extractWordsContaining(str: string, char: string): string[] {
    if (!str || !char) return [];
    const regex = new RegExp(`\\b\\w*${char}\\w*\\b`, 'g');
    const matches = str.match(regex);
    return matches || [];
  },

  /**
   * Extract text between delimiters
   * @param str - String to extract from
   * @param startDelimiter - Start delimiter
   * @param endDelimiter - End delimiter
   * @returns Array of text found between delimiters
   */
  extractBetween(str: string, startDelimiter: string, endDelimiter: string): string[] {
    if (!str || !startDelimiter || !endDelimiter) return [];
    
    const regex = new RegExp(`${startDelimiter}(.*?)${endDelimiter}`, 'g');
    const matches = [];
    let match;
    
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  },

  /**
   * Extract text between parentheses
   * @param str - String to extract from
   * @returns Array of text found between parentheses
   */
  extractBetweenParentheses(str: string): string[] {
    return this.extractBetween(str, '\\(', '\\)');
  },

  /**
   * Extract text between brackets
   * @param str - String to extract from
   * @returns Array of text found between brackets
   */
  extractBetweenBrackets(str: string): string[] {
    return this.extractBetween(str, '\\[', '\\]');
  },

  /**
   * Extract text between curly braces
   * @param str - String to extract from
   * @returns Array of text found between curly braces
   */
  extractBetweenCurlyBraces(str: string): string[] {
    return this.extractBetween(str, '\\{', '\\}');
  },

  /**
   * Extract text between quotes
   * @param str - String to extract from
   * @param quoteType - Type of quotes ('single', 'double', 'both')
   * @returns Array of text found between quotes
   */
  extractBetweenQuotes(str: string, quoteType: 'single' | 'double' | 'both' = 'both'): string[] {
    if (!str) return [];
    
    let quotes: string[] = [];
    switch (quoteType) {
      case 'single':
        quotes = ["'"];
        break;
      case 'double':
        quotes = ['"'];
        break;
      case 'both':
        quotes = ["'", '"'];
        break;
    }
    
    const results: string[] = [];
    quotes.forEach(quote => {
      results.push(...this.extractBetween(str, quote, quote));
    });
    
    return results;
  },

  /**
   * Extract first word from string
   * @param str - String to extract from
   * @returns First word or empty string
   */
  extractFirstWord(str: string): string {
    if (!str) return '';
    const match = str.match(/\b\w+\b/);
    return match ? match[0] : '';
  },

  /**
   * Extract last word from string
   * @param str - String to extract from
   * @returns Last word or empty string
   */
  extractLastWord(str: string): string {
    if (!str) return '';
    const match = str.match(/\b\w+\b(?=\s*$)/);
    return match ? match[0] : '';
  },

  /**
   * Extract first sentence from string
   * @param str - String to extract from
   * @returns First sentence or empty string
   */
  extractFirstSentence(str: string): string {
    if (!str) return '';
    const match = str.match(/[^.!?]*[.!?]/);
    return match ? match[0].trim() : str.trim();
  },

  /**
   * Extract last sentence from string
   * @param str - String to extract from
   * @returns Last sentence or empty string
   */
  extractLastSentence(str: string): string {
    if (!str) return '';
    const match = str.match(/[^.!?]*[.!?]?\s*$/);
    return match ? match[0].trim() : str.trim();
  },

  /**
   * Extract domain from URL
   * @param url - URL to extract domain from
   * @returns Domain or empty string
   */
  extractDomain(url: string): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  },

  /**
   * Extract path from URL
   * @param url - URL to extract path from
   * @returns Path or empty string
   */
  extractPath(url: string): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return '';
    }
  },

  /**
   * Extract query parameters from URL
   * @param url - URL to extract query parameters from
   * @returns Object with query parameters
   */
  extractQueryParams(url: string): Record<string, string> {
    if (!url) return {};
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    } catch {
      return {};
    }
  },

  /**
   * Extract file extension from filename
   * @param filename - Filename to extract extension from
   * @returns File extension or empty string
   */
  extractFileExtension(filename: string): string {
    if (!filename) return '';
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1] : '';
  },

  /**
   * Extract filename without extension
   * @param filename - Filename to extract name from
   * @returns Filename without extension
   */
  extractFilenameWithoutExtension(filename: string): string {
    if (!filename) return '';
    const match = filename.match(/^(.+)\.[^.]+$/);
    return match ? match[1] : filename;
  }
};

