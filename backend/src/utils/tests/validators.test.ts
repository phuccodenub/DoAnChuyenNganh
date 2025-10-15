import { validatorsUtils } from '../validators.util';

describe('Validators Utils', () => {
  describe('Email validation', () => {
    test('isEmail should validate email addresses', () => {
      expect(validatorsUtils.isEmail('test@example.com')).toBe(true);
      expect(validatorsUtils.isEmail('user.name@domain.co.uk')).toBe(true);
      expect(validatorsUtils.isEmail('invalid-email')).toBe(false);
      expect(validatorsUtils.isEmail('@example.com')).toBe(false);
      expect(validatorsUtils.isEmail('test@')).toBe(false);
      expect(validatorsUtils.isEmail('')).toBe(false);
    });

    test('isEmailDomainAllowed should check email domain', () => {
      expect(validatorsUtils.isEmailDomainAllowed('test@example.com', ['example.com'])).toBe(true);
      expect(validatorsUtils.isEmailDomainAllowed('test@other.com', ['example.com'])).toBe(false);
      expect(validatorsUtils.isEmailDomainAllowed('invalid-email', ['example.com'])).toBe(false);
    });
  });

  describe('Phone validation', () => {
    test('isPhone should validate Vietnamese phone numbers', () => {
      expect(validatorsUtils.isPhone('0123456789')).toBe(true);
      expect(validatorsUtils.isPhone('+84123456789')).toBe(true);
      expect(validatorsUtils.isPhone('84123456789')).toBe(true);
      expect(validatorsUtils.isPhone('1234567890')).toBe(false);
      expect(validatorsUtils.isPhone('012345678')).toBe(false);
      expect(validatorsUtils.isPhone('')).toBe(false);
    });

    test('normalizePhone should normalize Vietnamese phone numbers', () => {
      expect(validatorsUtils.normalizePhone('+84123456789')).toBe('0123456789');
      expect(validatorsUtils.normalizePhone('84123456789')).toBe('0123456789');
      expect(validatorsUtils.normalizePhone('0123456789')).toBe('0123456789');
    });
  });

  describe('URL validation', () => {
    test('isURL should validate URLs', () => {
      expect(validatorsUtils.isURL('https://example.com')).toBe(true);
      expect(validatorsUtils.isURL('http://example.com')).toBe(true);
      expect(validatorsUtils.isURL('https://www.example.com/path')).toBe(true);
      expect(validatorsUtils.isURL('invalid-url')).toBe(false);
      expect(validatorsUtils.isURL('ftp://example.com')).toBe(false);
      expect(validatorsUtils.isURL('')).toBe(false);
    });

    test('isHTTPS should check if URL is HTTPS', () => {
      expect(validatorsUtils.isHTTPS('https://example.com')).toBe(true);
      expect(validatorsUtils.isHTTPS('http://example.com')).toBe(false);
      expect(validatorsUtils.isHTTPS('invalid-url')).toBe(false);
    });
  });

  describe('ID validation', () => {
    test('isUUID should validate UUIDs', () => {
      expect(validatorsUtils.isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(validatorsUtils.isUUID('550e8400-e29b-41d4-a716-44665544000')).toBe(false);
      expect(validatorsUtils.isUUID('invalid-uuid')).toBe(false);
      expect(validatorsUtils.isUUID('')).toBe(false);
    });

    test('isStudentId should validate student IDs', () => {
      expect(validatorsUtils.isStudentId('SV12345678')).toBe(true);
      expect(validatorsUtils.isStudentId('sv12345678')).toBe(true);
      expect(validatorsUtils.isStudentId('SV123456')).toBe(false);
      expect(validatorsUtils.isStudentId('12345678')).toBe(false);
      expect(validatorsUtils.isStudentId('')).toBe(false);
    });

    test('isInstructorId should validate instructor IDs', () => {
      expect(validatorsUtils.isInstructorId('GV123456')).toBe(true);
      expect(validatorsUtils.isInstructorId('gv123456')).toBe(true);
      expect(validatorsUtils.isInstructorId('GV12345')).toBe(false);
      expect(validatorsUtils.isInstructorId('123456')).toBe(false);
      expect(validatorsUtils.isInstructorId('')).toBe(false);
    });
  });

  describe('Password validation', () => {
    test('isStrongPassword should validate password strength', () => {
      expect(validatorsUtils.isStrongPassword('Password123!')).toBe(true);
      expect(validatorsUtils.isStrongPassword('password123!')).toBe(false); // No uppercase
      expect(validatorsUtils.isStrongPassword('PASSWORD123!')).toBe(false); // No lowercase
      expect(validatorsUtils.isStrongPassword('Password!')).toBe(false); // No numbers
      expect(validatorsUtils.isStrongPassword('Password123')).toBe(false); // No special chars
      expect(validatorsUtils.isStrongPassword('Pass1!')).toBe(false); // Too short
      expect(validatorsUtils.isStrongPassword('')).toBe(false);
    });

    test('getPasswordStrength should return strength score and feedback', () => {
      const result = validatorsUtils.getPasswordStrength('Password123!');
      expect(result.score).toBeGreaterThan(0);
      expect(result.feedback).toBeInstanceOf(Array);
      
      const weakResult = validatorsUtils.getPasswordStrength('123');
      expect(weakResult.score).toBeLessThan(5);
      expect(weakResult.feedback.length).toBeGreaterThan(0);
    });
  });

  describe('Name validation', () => {
    test('isVietnameseName should validate Vietnamese names', () => {
      expect(validatorsUtils.isVietnameseName('Nguyễn Văn A')).toBe(true);
      expect(validatorsUtils.isVietnameseName('Trần Thị B')).toBe(true);
      expect(validatorsUtils.isVietnameseName('John123')).toBe(false);
      expect(validatorsUtils.isVietnameseName('John@Doe')).toBe(false);
      expect(validatorsUtils.isVietnameseName('')).toBe(false);
    });

    test('isNameLengthValid should validate name length', () => {
      expect(validatorsUtils.isNameLengthValid('John', 2, 10)).toBe(true);
      expect(validatorsUtils.isNameLengthValid('A', 2, 10)).toBe(false);
      expect(validatorsUtils.isNameLengthValid('VeryLongName', 2, 10)).toBe(false);
      expect(validatorsUtils.isNameLengthValid('', 2, 10)).toBe(false);
    });
  });

  describe('Format validation', () => {
    test('isSlug should validate slug format', () => {
      expect(validatorsUtils.isSlug('hello-world')).toBe(true);
      expect(validatorsUtils.isSlug('hello_world')).toBe(false);
      expect(validatorsUtils.isSlug('Hello-World')).toBe(false);
      expect(validatorsUtils.isSlug('hello world')).toBe(false);
      expect(validatorsUtils.isSlug('')).toBe(false);
    });

    test('isHexColor should validate hex colors', () => {
      expect(validatorsUtils.isHexColor('#ffffff')).toBe(true);
      expect(validatorsUtils.isHexColor('#000')).toBe(true);
      expect(validatorsUtils.isHexColor('#gggggg')).toBe(false);
      expect(validatorsUtils.isHexColor('ffffff')).toBe(false);
      expect(validatorsUtils.isHexColor('')).toBe(false);
    });

    test('isIPAddress should validate IP addresses', () => {
      expect(validatorsUtils.isIPAddress('192.168.1.1')).toBe(true);
      expect(validatorsUtils.isIPAddress('255.255.255.255')).toBe(true);
      expect(validatorsUtils.isIPAddress('256.256.256.256')).toBe(false);
      expect(validatorsUtils.isIPAddress('192.168.1')).toBe(false);
      expect(validatorsUtils.isIPAddress('')).toBe(false);
    });

    test('isMACAddress should validate MAC addresses', () => {
      expect(validatorsUtils.isMACAddress('00:11:22:33:44:55')).toBe(true);
      expect(validatorsUtils.isMACAddress('00-11-22-33-44-55')).toBe(true);
      expect(validatorsUtils.isMACAddress('00:11:22:33:44')).toBe(false);
      expect(validatorsUtils.isMACAddress('00:11:22:33:44:GG')).toBe(false);
      expect(validatorsUtils.isMACAddress('')).toBe(false);
    });
  });

  describe('Financial validation', () => {
    test('isCreditCard should validate credit card numbers', () => {
      expect(validatorsUtils.isCreditCard('4111111111111111')).toBe(true);
      expect(validatorsUtils.isCreditCard('5555555555554444')).toBe(true);
      expect(validatorsUtils.isCreditCard('1234567890123456')).toBe(false);
      expect(validatorsUtils.isCreditCard('411111111111111')).toBe(false);
      expect(validatorsUtils.isCreditCard('')).toBe(false);
    });
  });

  describe('Date and time validation', () => {
    test('isTime24H should validate 24-hour time format', () => {
      expect(validatorsUtils.isTime24H('12:30')).toBe(true);
      expect(validatorsUtils.isTime24H('00:00')).toBe(true);
      expect(validatorsUtils.isTime24H('23:59')).toBe(true);
      expect(validatorsUtils.isTime24H('24:00')).toBe(false);
      expect(validatorsUtils.isTime24H('12:60')).toBe(false);
      expect(validatorsUtils.isTime24H('')).toBe(false);
    });

    test('isISODate should validate ISO date format', () => {
      expect(validatorsUtils.isISODate('2023-12-25')).toBe(true);
      expect(validatorsUtils.isISODate('2023-13-25')).toBe(false);
      expect(validatorsUtils.isISODate('2023-12-32')).toBe(false);
      expect(validatorsUtils.isISODate('23-12-25')).toBe(false);
      expect(validatorsUtils.isISODate('')).toBe(false);
    });

    test('isISODatetime should validate ISO datetime format', () => {
      expect(validatorsUtils.isISODatetime('2023-12-25T12:30:00Z')).toBe(true);
      expect(validatorsUtils.isISODatetime('2023-12-25T12:30:00.000Z')).toBe(true);
      expect(validatorsUtils.isISODatetime('2023-12-25T12:30:00')).toBe(true);
      expect(validatorsUtils.isISODatetime('2023-12-25')).toBe(false);
      expect(validatorsUtils.isISODatetime('')).toBe(false);
    });
  });

  describe('Postal validation', () => {
    test('isPostalCode should validate postal codes', () => {
      expect(validatorsUtils.isPostalCode('12345')).toBe(true);
      expect(validatorsUtils.isPostalCode('12345-6789')).toBe(true);
      expect(validatorsUtils.isPostalCode('1234')).toBe(false);
      expect(validatorsUtils.isPostalCode('123456')).toBe(false);
      expect(validatorsUtils.isPostalCode('')).toBe(false);
    });
  });

  describe('General validation', () => {
    test('isNotEmpty should check if string is not empty', () => {
      expect(validatorsUtils.isNotEmpty('hello')).toBe(true);
      expect(validatorsUtils.isNotEmpty('  hello  ')).toBe(true);
      expect(validatorsUtils.isNotEmpty('')).toBe(false);
      expect(validatorsUtils.isNotEmpty('   ')).toBe(false);
    });

    test('isEmpty should check if string is empty', () => {
      expect(validatorsUtils.isEmpty('')).toBe(true);
      expect(validatorsUtils.isEmpty('   ')).toBe(true);
      expect(validatorsUtils.isEmpty('hello')).toBe(false);
    });

    test('isNullOrUndefined should check if value is null or undefined', () => {
      expect(validatorsUtils.isNullOrUndefined(null)).toBe(true);
      expect(validatorsUtils.isNullOrUndefined(undefined)).toBe(true);
      expect(validatorsUtils.isNullOrUndefined('')).toBe(false);
      expect(validatorsUtils.isNullOrUndefined(0)).toBe(false);
    });

    test('isNumber should check if value is a valid number', () => {
      expect(validatorsUtils.isNumber(123)).toBe(true);
      expect(validatorsUtils.isNumber(0)).toBe(true);
      expect(validatorsUtils.isNumber(-123)).toBe(true);
      expect(validatorsUtils.isNumber('123')).toBe(false);
      expect(validatorsUtils.isNumber(NaN)).toBe(false);
      expect(validatorsUtils.isNumber(Infinity)).toBe(false);
    });

    test('isInteger should check if value is a valid integer', () => {
      expect(validatorsUtils.isInteger(123)).toBe(true);
      expect(validatorsUtils.isInteger(0)).toBe(true);
      expect(validatorsUtils.isInteger(-123)).toBe(true);
      expect(validatorsUtils.isInteger(123.45)).toBe(false);
      expect(validatorsUtils.isInteger('123')).toBe(false);
    });

    test('isPositiveNumber should check if value is a positive number', () => {
      expect(validatorsUtils.isPositiveNumber(123)).toBe(true);
      expect(validatorsUtils.isPositiveNumber(0.5)).toBe(true);
      expect(validatorsUtils.isPositiveNumber(0)).toBe(false);
      expect(validatorsUtils.isPositiveNumber(-123)).toBe(false);
      expect(validatorsUtils.isPositiveNumber('123')).toBe(false);
    });

    test('isInRange should check if value is within range', () => {
      expect(validatorsUtils.isInRange(5, 1, 10)).toBe(true);
      expect(validatorsUtils.isInRange(1, 1, 10)).toBe(true);
      expect(validatorsUtils.isInRange(10, 1, 10)).toBe(true);
      expect(validatorsUtils.isInRange(0, 1, 10)).toBe(false);
      expect(validatorsUtils.isInRange(11, 1, 10)).toBe(false);
      expect(validatorsUtils.isInRange('5', 1, 10)).toBe(false);
    });
  });
});

