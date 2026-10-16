/**
 * GreenCampus Password Validation Utility (Web Container)
 */

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

export function hasMinimumLength(password: string, min = MIN_PASSWORD_LENGTH): boolean {
  return password.length >= min;
}

export function hasUppercase(password: string): boolean {
  return PASSWORD_REGEX.UPPERCASE.test(password);
}

export function hasLowercase(password: string): boolean {
  return PASSWORD_REGEX.LOWERCASE.test(password);
}

export function hasNumber(password: string): boolean {
  return PASSWORD_REGEX.NUMBER.test(password);
}

export function hasSpecialCharacter(password: string): boolean {
  return PASSWORD_REGEX.SPECIAL_CHAR.test(password);
}

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

export function isPasswordValid(password: string): boolean {
  return validatePasswordRequirements(password).isValid;
}

export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password.length > 0 && password === confirmPassword;
}
