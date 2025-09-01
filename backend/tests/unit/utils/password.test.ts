/**
 * Tests for password utilities
 */

import { hashPassword, verifyPassword, validatePasswordStrength } from '../../../src/utils/password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const plainPassword = 'Password123!';
      const hashedPassword = await hashPassword(plainPassword);
      
      // Verify it's a bcrypt hash (starts with $2a$ or $2b$)
      expect(hashedPassword).toMatch(/^\$2[ab]\$\d+\$/);
      
      // Verify the hash is different from the plain password
      expect(hashedPassword).not.toBe(plainPassword);
    });
    
    it('should generate different hashes for the same password', async () => {
      const plainPassword = 'Password123!';
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      
      // Each hash should be unique due to random salt
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password against its hash', async () => {
      const plainPassword = 'Password123!';
      const hashedPassword = await hashPassword(plainPassword);
      
      const result = await verifyPassword(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });
    
    it('should reject an incorrect password', async () => {
      const correctPassword = 'Password123!';
      const incorrectPassword = 'WrongPassword123!';
      
      const hashedPassword = await hashPassword(correctPassword);
      const result = await verifyPassword(incorrectPassword, hashedPassword);
      
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept a strong password', () => {
      const strongPassword = 'Password123!';
      const result = validatePasswordStrength(strongPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });
    
    it('should reject a password that is too short', () => {
      const shortPassword = 'Pass1!';
      const result = validatePasswordStrength(shortPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must be at least 8 characters long');
    });
    
    it('should reject a password with no uppercase letters', () => {
      const noUppercasePassword = 'password123!';
      const result = validatePasswordStrength(noUppercasePassword);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain at least one uppercase letter');
    });
    
    it('should reject a password with no lowercase letters', () => {
      const noLowercasePassword = 'PASSWORD123!';
      const result = validatePasswordStrength(noLowercasePassword);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain at least one lowercase letter');
    });
    
    it('should reject a password with no numbers', () => {
      const noNumbersPassword = 'Password!';
      const result = validatePasswordStrength(noNumbersPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain at least one number');
    });
    
    it('should reject a password with no special characters', () => {
      const noSpecialCharsPassword = 'Password123';
      const result = validatePasswordStrength(noSpecialCharsPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must contain at least one special character');
    });
    
    it('should validate a complex password with multiple special characters', () => {
      const complexPassword = 'P@ssw0rd!$%^123';
      const result = validatePasswordStrength(complexPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });
    
    it('should validate a password at the minimum length', () => {
      const minLengthPassword = 'Pass1!Aa';
      const result = validatePasswordStrength(minLengthPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });
  });
});
