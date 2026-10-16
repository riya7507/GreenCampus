/**
 * GreenCampus Password Security Utility
 */

export interface PasswordRequirements {
  minLength: boolean;      // At least 8 characters
  hasUppercase: boolean;   // At least one uppercase letter [A-Z]
  hasLowercase: boolean;   // At least one lowercase letter [a-z]
  hasNumber: boolean;      // At least one digit [0-9]
  hasSpecialChar: boolean; // At least one special character
}

export type StrengthLevel = 'Weak' | 'Fair' | 'Good' | 'Strong';

export interface PasswordStrengthResult {
  score: number;
  label: StrengthLevel;
  color: string;
  percent: number;
  requirements: PasswordRequirements;
  isAllMet: boolean;
}

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

export function checkPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: SPECIAL_CHAR_REGEX.test(password),
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements = checkPasswordRequirements(password);

  const metCount = [
    requirements.minLength,
    requirements.hasUppercase,
    requirements.hasLowercase,
    requirements.hasNumber,
    requirements.hasSpecialChar,
  ].filter(Boolean).length;

  const isAllMet = metCount === 5;

  if (!password || password.length === 0) {
    return {
      score: 0,
      label: 'Weak',
      color: '#CFD8DC',
      percent: 0,
      requirements,
      isAllMet: false,
    };
  }

  if (isAllMet) {
    return {
      score: 4,
      label: 'Strong',
      color: '#2E7D32',
      percent: 100,
      requirements,
      isAllMet: true,
    };
  }

  if (metCount === 4) {
    return {
      score: 3,
      label: 'Good',
      color: '#00897B',
      percent: 75,
      requirements,
      isAllMet: false,
    };
  }

  if (metCount === 3) {
    return {
      score: 2,
      label: 'Fair',
      color: '#F9A825',
      percent: 50,
      requirements,
      isAllMet: false,
    };
  }

  return {
    score: 1,
    label: 'Weak',
    color: '#E53935',
    percent: 25,
    requirements,
    isAllMet: false,
  };
}

export function generateStrongPassword(length = 14): string {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
  const numberChars = '23456789';
  const specialChars = '!@#$%^&*()_+~';

  const guaranteed = [
    uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
    lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  const remainingLength = Math.max(length - guaranteed.length, 8);

  for (let i = 0; i < remainingLength; i++) {
    guaranteed.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  for (let i = guaranteed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [guaranteed[i], guaranteed[j]] = [guaranteed[j], guaranteed[i]];
  }

  return guaranteed.join('');
}
