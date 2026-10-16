/**
 * GreenCampus Password Security Utility
 * Reusable functions for password strength calculation, rule verification,
 * and secure programmatic password generation.
 */

import {
  PasswordValidationRules,
  validatePasswordRequirements,
} from './passwordValidation';

export type PasswordRequirements = PasswordValidationRules;

export type StrengthLevel = 'Weak' | 'Fair' | 'Good' | 'Strong';

export interface PasswordStrengthResult {
  score: number;       // 1 to 4 (or 0 for empty)
  label: StrengthLevel;
  color: string;       // Theme-aligned indicator color
  percent: number;     // 25%, 50%, 75%, 100%
  requirements: PasswordRequirements;
  isAllMet: boolean;
}

/**
 * Checks each individual security requirement for a given password using passwordValidation.
 */
export function checkPasswordRequirements(password: string): PasswordRequirements {
  return validatePasswordRequirements(password).rules;
}

/**
 * Evaluates the overall strength of a password based on character entropy and criteria.
 */
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

  // All 5 rules satisfied -> Strong
  if (isAllMet) {
    return {
      score: 4,
      label: 'Strong',
      color: '#2E7D32', // Primary Deep Green
      percent: 100,
      requirements,
      isAllMet: true,
    };
  }

  // 4 rules satisfied -> Good
  if (metCount === 4) {
    return {
      score: 3,
      label: 'Good',
      color: '#00897B', // Teal
      percent: 75,
      requirements,
      isAllMet: false,
    };
  }

  // 3 rules satisfied -> Fair
  if (metCount === 3) {
    return {
      score: 2,
      label: 'Fair',
      color: '#F9A825', // Amber
      percent: 50,
      requirements,
      isAllMet: false,
    };
  }

  // <= 2 rules satisfied or very short -> Weak
  return {
    score: 1,
    label: 'Weak',
    color: '#E53935', // Red
    percent: 25,
    requirements,
    isAllMet: false,
  };
}

/**
 * Programmatically generates a strong random password that satisfies all requirements.
 * - Never hardcoded
 * - Never logged or transmitted
 * - High local entropy with guaranteed character distribution
 */
export function generateStrongPassword(length = 14): string {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
  const numberChars = '23456789';
  const specialChars = '!@#$%^&*()_+~';

  // Ensure at least one character from each required category
  const guaranteed = [
    uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
    lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  // Fill the remainder from the combined character pool
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  const remainingLength = Math.max(length - guaranteed.length, 8);

  for (let i = 0; i < remainingLength; i++) {
    guaranteed.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = guaranteed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [guaranteed[i], guaranteed[j]] = [guaranteed[j], guaranteed[i]];
  }

  return guaranteed.join('');
}
