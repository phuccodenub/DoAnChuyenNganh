import { stringUtils } from '../string';

describe('String Utils', () => {
  describe('formatUtils', () => {
    test('toCamelCase should convert string to camelCase', () => {
      expect(stringUtils.toCamelCase('hello world')).toBe('helloWorld');
      expect(stringUtils.toCamelCase('hello-world')).toBe('helloWorld');
      expect(stringUtils.toCamelCase('hello_world')).toBe('helloWorld');
    });

    test('toSnakeCase should convert string to snake_case', () => {
      expect(stringUtils.toSnakeCase('helloWorld')).toBe('hello_world');
      expect(stringUtils.toSnakeCase('HelloWorld')).toBe('hello_world');
    });

    test('toKebabCase should convert string to kebab-case', () => {
      expect(stringUtils.toKebabCase('helloWorld')).toBe('hello-world');
      expect(stringUtils.toKebabCase('HelloWorld')).toBe('hello-world');
    });

    test('toPascalCase should convert string to PascalCase', () => {
      expect(stringUtils.toPascalCase('hello world')).toBe('HelloWorld');
      expect(stringUtils.toPascalCase('hello-world')).toBe('HelloWorld');
    });

    test('toTitleCase should convert string to Title Case', () => {
      expect(stringUtils.toTitleCase('hello world')).toBe('Hello World');
      expect(stringUtils.toTitleCase('HELLO WORLD')).toBe('Hello World');
    });

    test('generateSlug should generate URL-friendly slug', () => {
      expect(stringUtils.generateSlug('Hello World!')).toBe('hello-world');
      expect(stringUtils.generateSlug('Hello---World')).toBe('hello-world');
    });
  });

  describe('maskUtils', () => {
    test('maskEmail should mask email address', () => {
      expect(stringUtils.maskEmail('test@example.com')).toBe('te**@ex**le.com');
      expect(stringUtils.maskEmail('user@domain.org', 1)).toBe('u***@d****n.org');
    });

    test('maskPhone should mask phone number', () => {
      expect(stringUtils.maskPhone('1234567890')).toBe('123****890');
      expect(stringUtils.maskPhone('1234567890', 2)).toBe('12******90');
    });

    test('maskString should mask string with asterisks', () => {
      expect(stringUtils.maskString('hello', 2, 2)).toBe('he***lo');
      expect(stringUtils.maskString('hello', 1, 1, '#')).toBe('h###o');
    });

    test('maskCreditCard should mask credit card number', () => {
      expect(stringUtils.maskCreditCard('1234567890123456')).toBe('************3456');
      expect(stringUtils.maskCreditCard('1234 5678 9012 3456')).toBe('************3456');
    });
  });

  describe('extractUtils', () => {
    test('extractNumbers should extract numbers from string', () => {
      expect(stringUtils.extractNumbers('abc123def456')).toEqual([123, 456]);
      expect(stringUtils.extractNumbers('no numbers')).toEqual([]);
    });

    test('extractWords should extract words from string', () => {
      expect(stringUtils.extractWords('hello world test')).toEqual(['hello', 'world', 'test']);
      expect(stringUtils.extractWords('')).toEqual([]);
    });

    test('extractEmails should extract email addresses', () => {
      expect(stringUtils.extractEmails('Contact us at test@example.com or admin@site.org')).toEqual([
        'test@example.com',
        'admin@site.org'
      ]);
    });

    test('extractPhones should extract phone numbers', () => {
      expect(stringUtils.extractPhones('Call 123-456-7890 or 987.654.3210')).toEqual([
        '123-456-7890',
        '987.654.3210'
      ]);
    });

    test('extractURLs should extract URLs', () => {
      expect(stringUtils.extractURLs('Visit https://example.com and http://test.org')).toEqual([
        'https://example.com',
        'http://test.org'
      ]);
    });
  });

  describe('cryptoUtils', () => {
    test('hashSHA256 should hash string with SHA256', () => {
  const hash = stringUtils.hashSHA256('hello');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
  // Known SHA256 of 'hello'
  expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    test('hashSHA512 should hash string with SHA512', () => {
      const hash = stringUtils.hashSHA512('hello');
      expect(hash).toMatch(/^[a-f0-9]{128}$/);
    });

    test('encodeBase64 should encode string to Base64', () => {
      expect(stringUtils.encodeBase64('hello')).toBe('aGVsbG8=');
      expect(stringUtils.encodeBase64('')).toBe('');
    });

    test('decodeBase64 should decode Base64 string', () => {
      expect(stringUtils.decodeBase64('aGVsbG8=')).toBe('hello');
      expect(stringUtils.decodeBase64('')).toBe('');
    });

    test('generateRandomString should generate random string', () => {
      const str1 = stringUtils.generateRandomString(10);
      const str2 = stringUtils.generateRandomString(10);
      expect(str1).toHaveLength(10);
      expect(str2).toHaveLength(10);
      expect(str1).not.toBe(str2);
    });

    test('generateUUID should generate UUID v4', () => {
      const uuid = stringUtils.generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  describe('normalizeUtils', () => {
    test('normalize should normalize string with options', () => {
      expect(stringUtils.normalize('  Hello World!  ', { trim: true, case: 'lower' })).toBe('hello world!');
      expect(stringUtils.normalize('Hello World!', { removeSpecialChars: true })).toBe('Hello World');
    });

    test('removeAccents should remove accents from string', () => {
      expect(stringUtils.removeAccents('café')).toBe('cafe');
      expect(stringUtils.removeAccents('naïve')).toBe('naive');
    });

    test('removeExtraSpaces should remove extra spaces', () => {
      expect(stringUtils.removeExtraSpaces('hello    world')).toBe('hello world');
      expect(stringUtils.removeExtraSpaces('  hello  world  ')).toBe('hello world');
    });

    test('removeHTMLTags should remove HTML tags', () => {
      expect(stringUtils.removeHTMLTags('<p>Hello <b>world</b></p>')).toBe('Hello world');
      expect(stringUtils.removeHTMLTags('No tags')).toBe('No tags');
    });

    test('removeMarkdownFormatting should remove markdown formatting', () => {
      expect(stringUtils.removeMarkdownFormatting('**bold** and *italic*')).toBe('bold and italic');
      expect(stringUtils.removeMarkdownFormatting('[link](url)')).toBe('link');
    });

    test('removeURLs should remove URLs from string', () => {
      expect(stringUtils.removeURLs('Visit https://example.com for more info')).toBe('Visit  for more info');
    });

    test('removeEmails should remove email addresses', () => {
      expect(stringUtils.removeEmails('Contact test@example.com for help')).toBe('Contact  for help');
    });

    test('removePhones should remove phone numbers', () => {
      expect(stringUtils.removePhones('Call 123-456-7890 for support')).toBe('Call  for support');
    });

    test('removeNumbers should remove numbers', () => {
      expect(stringUtils.removeNumbers('abc123def456')).toBe('abcdef');
    });

    test('removePunctuation should remove punctuation', () => {
      expect(stringUtils.removePunctuation('Hello, world!')).toBe('Hello world');
    });

    test('removeSpecialCharacters should remove special characters', () => {
      expect(stringUtils.removeSpecialCharacters('Hello@world#123')).toBe('Helloworld123');
    });

    test('removeDuplicateCharacters should remove duplicate characters', () => {
      expect(stringUtils.removeDuplicateCharacters('hello    world', ' ')).toBe('hello world');
      expect(stringUtils.removeDuplicateCharacters('hello---world', '-')).toBe('hello-world');
    });

    test('removeDuplicateWords should remove duplicate words', () => {
      expect(stringUtils.removeDuplicateWords('hello world hello test')).toBe('hello world test');
    });

    test('removeEmptyLines should remove empty lines', () => {
      expect(stringUtils.removeEmptyLines('line1\n\nline2\n\nline3')).toBe('line1\nline2\nline3');
    });

    test('cleanVietnameseText should clean Vietnamese text', () => {
      expect(stringUtils.cleanVietnameseText('  Xin chào   thế giới  ')).toBe('Xin chào thế giới');
    });

    test('normalizeUnicode should normalize Unicode string', () => {
      expect(stringUtils.normalizeUnicode('café', 'NFC')).toBe('café');
    });

    test('cleanForDatabase should clean string for database storage', () => {
      expect(stringUtils.cleanForDatabase('hello\x00world')).toBe('helloworld');
    });

    test('cleanForDisplay should clean string for display', () => {
      expect(stringUtils.cleanForDisplay('  hello    world  ')).toBe('hello world');
    });
  });

  describe('Legacy exports', () => {
    test('Legacy exports should work', () => {
      expect(stringUtils.generateRandomString).toBeDefined();
      expect(stringUtils.generateUUID).toBeDefined();
      expect(stringUtils.generateSlug).toBeDefined();
      expect(stringUtils.toCamelCase).toBeDefined();
      expect(stringUtils.toSnakeCase).toBeDefined();
      expect(stringUtils.toKebabCase).toBeDefined();
      expect(stringUtils.toPascalCase).toBeDefined();
      expect(stringUtils.toTitleCase).toBeDefined();
      expect(stringUtils.maskEmail).toBeDefined();
      expect(stringUtils.maskPhone).toBeDefined();
      expect(stringUtils.maskString).toBeDefined();
      expect(stringUtils.extractNumbers).toBeDefined();
      expect(stringUtils.extractWords).toBeDefined();
      expect(stringUtils.extractEmails).toBeDefined();
      expect(stringUtils.extractPhones).toBeDefined();
      expect(stringUtils.extractURLs).toBeDefined();
      expect(stringUtils.hashSHA256).toBeDefined();
      expect(stringUtils.hashSHA512).toBeDefined();
      expect(stringUtils.hashMD5).toBeDefined();
      expect(stringUtils.encodeBase64).toBeDefined();
      expect(stringUtils.decodeBase64).toBeDefined();
      expect(stringUtils.normalize).toBeDefined();
      expect(stringUtils.removeAccents).toBeDefined();
      expect(stringUtils.removeExtraSpaces).toBeDefined();
      expect(stringUtils.removeHTMLTags).toBeDefined();
      expect(stringUtils.removeMarkdownFormatting).toBeDefined();
      expect(stringUtils.removeURLs).toBeDefined();
      expect(stringUtils.removeEmails).toBeDefined();
      expect(stringUtils.removePhones).toBeDefined();
      expect(stringUtils.removeNumbers).toBeDefined();
      expect(stringUtils.removePunctuation).toBeDefined();
      expect(stringUtils.removeSpecialCharacters).toBeDefined();
      expect(stringUtils.removeDuplicateCharacters).toBeDefined();
      expect(stringUtils.removeDuplicateWords).toBeDefined();
      expect(stringUtils.removeEmptyLines).toBeDefined();
      expect(stringUtils.cleanVietnameseText).toBeDefined();
      expect(stringUtils.normalizeUnicode).toBeDefined();
      expect(stringUtils.cleanForDatabase).toBeDefined();
      expect(stringUtils.cleanForDisplay).toBeDefined();
    });
  });
});

