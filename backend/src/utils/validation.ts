// src/utils/validation.ts
/**
 * Email validation utility
 * Validates an email address format
 * 
 * @param email The email address to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateEmail = (
  email: string
): { isValid: boolean; message?: string } => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      message: 'Email is required'
    };
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Invalid email format'
    };
  }

  return { isValid: true };
};

/**
 * Name validation utility
 * Validates that a name field is not empty
 * 
 * @param name The name to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateName = (
  name: string
): { isValid: boolean; message?: string } => {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      message: 'Name is required'
    };
  }

  if (name.length < 2) {
    return {
      isValid: false,
      message: 'Name must be at least 2 characters long'
    };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      message: 'Name must be less than 50 characters long'
    };
  }

  return { isValid: true };
};
