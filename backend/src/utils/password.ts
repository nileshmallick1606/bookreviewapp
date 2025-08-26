// src/utils/password.ts
import bcrypt from 'bcrypt';

/**
 * Generates a hashed password using bcrypt
 * @param plainPassword The plain text password to hash
 * @returns A promise resolving to the hashed password
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  // Use 10 rounds of salting as specified in the technical requirements
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
};

/**
 * Validates a password against its hash
 * @param plainPassword The plain text password to check
 * @param hashedPassword The hashed password to compare against
 * @returns A promise resolving to boolean indicating if the password matches
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Validates password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 * @param password The password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validatePasswordStrength = (
  password: string
): { isValid: boolean; message?: string } => {
  // Minimum length check
  if (password.length < 8) {
    return { 
      isValid: false, 
      message: 'Password must be at least 8 characters long' 
    };
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter' 
    };
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one lowercase letter' 
    };
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one number' 
    };
  }
  
  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one special character' 
    };
  }
  
  return { isValid: true };
};
