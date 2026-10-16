/**
 * GreenCampus Password Validation Utility
 * Encapsulates regex patterns and verification logic for password complexity requirements.
 */

// Regex patterns for individual character classes
export const PASSWORD_REGEX = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBER: /[0-9]/,
  SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
} as const;

export const MIN_PASSWORD_LENGTH = 8;

export interface PasswordValidationRules {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  rules: PasswordValidationRules;
  errorMessage: string | null;
}

/**
 * Checks if the password has the required minimum length (default 8).
 */
export function hasMinimumLength(password: string, min = MIN_PASSWORD_LENGTH): boolean {
  return password.length >= min;
}

/**
 * Checks if the password contains at least one uppercase letter.
 */
export function hasUppercase(password: string): boolean {
  return PASSWORD_REGEX.UPPERCASE.test(password);
}

/**
 * Checks if the password contains at least one lowercase letter.
 */
export function hasLowercase(password: string): boolean {
  return PASSWORD_REGEX.LOWERCASE.test(password);
}

/**
 * Checks if the password contains at least one number.
 */
export function hasNumber(password: string): boolean {
  return PASSWORD_REGEX.NUMBER.test(password);
}

/**
 * Checks if the password contains at least one special character.
 */
export function hasSpecialCharacter(password: string): boolean {
  return PASSWORD_REGEX.SPECIAL_CHAR.test(password);
}

/**
 * Evaluates all password complexity rules and returns an itemized validation result.
 */
export function validatePasswordRequirements(password: string): PasswordValidationResult {
  const rules: PasswordValidationRules = {
    minLength: hasMinimumLength(password),
    hasUppercase: hasUppercase(password),
    hasLowercase: hasLowercase(password),
    hasNumber: hasNumber(password),
    hasSpecialChar: hasSpecialCharacter(password),
  };

  const isValid =
    rules.minLength &&
    rules.hasUppercase &&
    rules.hasLowercase &&
    rules.hasNumber &&
    rules.hasSpecialChar;

  let errorMessage: string | null = null;
  if (!password) {
    errorMessage = 'Password is required';
  } else if (!isValid) {
    errorMessage =
      'Password must contain at least 8 characters, uppercase, lowercase, number and special character.';
  }

  return {
    isValid,
    rules,
    errorMessage,
  };
}

/**
 * Simple boolean check for whether all password requirements are satisfied.
 */
export function isPasswordValid(password: string): boolean {
  return validatePasswordRequirements(password).isValid;
}

/**
 * Validates whether the password and confirm-password fields match.
 */
export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password.length > 0 && password === confirmPassword;
}
