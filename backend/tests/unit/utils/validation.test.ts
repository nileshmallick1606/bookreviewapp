/**
 * Tests for validation utilities
 */

import { validateEmail, validateName } from '../../../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate a correct email format', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject an empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Email is required');
    });

    it('should reject a null email', () => {
      const result = validateEmail(null as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Email is required');
    });

    it('should reject an invalid email format', () => {
      const invalidEmails = [
        'test@',
        '@example.com',
        'test@example',
        'test.example.com',
        'test@.com',
        'test@example..com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Invalid email format');
      });
    });

    it('should validate complex but valid email formats', () => {
      const validEmails = [
        'test.user+tag@example.com',
        'test.user@sub.example.co.uk',
        'test-user@example.org',
        '123@example.com',
        'test_user@example.com',
        'TestUser@Example.COM'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });
  });

  describe('validateName', () => {
    it('should validate a correct name', () => {
      const result = validateName('John Doe');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject an empty name', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Name is required');
    });

    it('should reject a null name', () => {
      const result = validateName(null as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Name is required');
    });

    it('should reject a name that is too short', () => {
      const result = validateName('J');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Name must be at least 2 characters long');
    });

    it('should reject a name that is too long', () => {
      // Create a string that is 51 characters long
      const longName = 'A'.repeat(51);
      const result = validateName(longName);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Name must be less than 50 characters long');
    });

    it('should validate a name at the minimum length', () => {
      const result = validateName('Jo');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should validate a name at the maximum length', () => {
      // Create a string that is exactly 50 characters long
      const maxLengthName = 'A'.repeat(50);
      const result = validateName(maxLengthName);
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });
  });
});
