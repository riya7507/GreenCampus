import { useState } from 'react';
import {
  evaluatePasswordStrength,
  generateStrongPassword,
} from '@/utils/password';
import {
  doPasswordsMatch,
  validatePasswordRequirements,
} from '@/utils/passwordValidation';

interface RegisterScreenProps {
  onBack: () => void;
  onNavigateLogin: () => void;
}

export function RegisterScreen({ onBack, onNavigateLogin }: RegisterScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(password);
  const reqs = strength.requirements;

  const handleSuggestPassword = () => {
    const generated = generateStrongPassword(14);
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setErrors((prev) => ({ ...prev, password: undefined, confirmPassword: undefined }));
  };

  const validateForm = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Campus email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordValidation = validatePasswordRequirements(password);
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      newErrors.password =
        passwordValidation.errorMessage ??
        'Password must contain at least 8 characters, uppercase, lowercase, number and special character.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (!doPasswordsMatch(password, confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedMessage(null);

    if (validateForm()) {
      setSubmittedMessage(
        `Account validation passed for ${fullName.trim()} (${email.trim()})! User creation in MySQL via FastAPI will be connected in Phase 3.`
      );
    }
  };

  const hasConfirmText = confirmPassword.length > 0;
  const isMatch = doPasswordsMatch(password, confirmPassword);

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 bg-[#F8FAF8] min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-[420px] flex flex-col gap-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#ECEFF1] text-[#263238] text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold">
            <span>🌱</span>
            <span>GreenCampus</span>
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-[#263238] tracking-tight">
            Create Account
          </h1>
          <p className="text-sm font-medium text-[#546E7A] leading-relaxed">
            Join the student sustainability network, earn eco-points, and log impact.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {submittedMessage && (
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#81C784] text-[#2E7D32] text-xs font-semibold leading-relaxed">
              ✓ {submittedMessage}
            </div>
          )}

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#263238]">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              placeholder="e.g. Maya Patel"
              className={`h-[50px] px-3.5 rounded-xl bg-white border ${
                errors.fullName ? 'border-[#D32F2F]' : 'border-[#CFD8DC]'
              } text-[15px] text-[#263238] outline-none focus:border-[#2E7D32] transition-colors`}
            />
            {errors.fullName && (
              <span className="text-xs text-[#D32F2F] font-medium">{errors.fullName}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#263238]">Campus Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="student@university.edu"
              className={`h-[50px] px-3.5 rounded-xl bg-white border ${
                errors.email ? 'border-[#D32F2F]' : 'border-[#CFD8DC]'
              } text-[15px] text-[#263238] outline-none focus:border-[#2E7D32] transition-colors`}
            />
            {errors.email && (
              <span className="text-xs text-[#D32F2F] font-medium">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#263238]">Password</label>
              <button
                type="button"
                onClick={handleSuggestPassword}
                className="text-xs font-bold text-[#00897B] hover:opacity-80 cursor-pointer"
              >
                ✨ Suggest Strong Password
              </button>
            </div>

            <div
              className={`h-[50px] px-3.5 rounded-xl bg-white border ${
                errors.password ? 'border-[#D32F2F]' : 'border-[#CFD8DC]'
              } flex items-center transition-colors focus-within:border-[#2E7D32]`}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Min. 8 characters"
                className="flex-1 h-full bg-transparent text-[15px] text-[#263238] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs font-bold text-[#00897B] hover:opacity-80 cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-[#D32F2F] font-medium">{errors.password}</span>
            )}

            {/* Password Strength Meter & Checklist */}
            <div className="bg-white rounded-xl p-3 border border-[#ECEFF1] flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#263238] uppercase tracking-wider">
                  Password Strength
                </span>
                {password.length > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{
                      color: strength.color,
                      backgroundColor: strength.color + '1A',
                    }}
                  >
                    {strength.label}
                  </span>
                )}
              </div>

              {/* Segmented meter */}
              <div className="flex gap-1 h-1.5 w-full">
                <div
                  className="flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor: strength.score >= 1 ? strength.color : '#ECEFF1',
                  }}
                />
                <div
                  className="flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor: strength.score >= 2 ? strength.color : '#ECEFF1',
                  }}
                />
                <div
                  className="flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor: strength.score >= 3 ? strength.color : '#ECEFF1',
                  }}
                />
                <div
                  className="flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor: strength.score >= 4 ? strength.color : '#ECEFF1',
                  }}
                />
              </div>

              {/* Requirements */}
              <div className="flex flex-col gap-1 pt-1 text-xs">
                <span className="text-[10px] font-semibold text-[#546E7A]">
                  Password requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={reqs.minLength ? 'text-[#2E7D32] font-bold' : 'text-[#B0BEC5]'}>
                      {reqs.minLength ? '✓' : '○'}
                    </span>
                    <span className={reqs.minLength ? 'text-[#263238] font-medium' : 'text-[#78909C]'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={reqs.hasUppercase ? 'text-[#2E7D32] font-bold' : 'text-[#B0BEC5]'}>
                      {reqs.hasUppercase ? '✓' : '○'}
                    </span>
                    <span className={reqs.hasUppercase ? 'text-[#263238] font-medium' : 'text-[#78909C]'}>
                      Uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={reqs.hasLowercase ? 'text-[#2E7D32] font-bold' : 'text-[#B0BEC5]'}>
                      {reqs.hasLowercase ? '✓' : '○'}
                    </span>
                    <span className={reqs.hasLowercase ? 'text-[#263238] font-medium' : 'text-[#78909C]'}>
                      Lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={reqs.hasNumber ? 'text-[#2E7D32] font-bold' : 'text-[#B0BEC5]'}>
                      {reqs.hasNumber ? '✓' : '○'}
                    </span>
                    <span className={reqs.hasNumber ? 'text-[#263238] font-medium' : 'text-[#78909C]'}>
                      Number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={reqs.hasSpecialChar ? 'text-[#2E7D32] font-bold' : 'text-[#B0BEC5]'}>
                      {reqs.hasSpecialChar ? '✓' : '○'}
                    </span>
                    <span className={reqs.hasSpecialChar ? 'text-[#263238] font-medium' : 'text-[#78909C]'}>
                      Special character (!@#$)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#263238]">Confirm Password</label>
            <div
              className={`h-[50px] px-3.5 rounded-xl bg-white border ${
                errors.confirmPassword ? 'border-[#D32F2F]' : 'border-[#CFD8DC]'
              } flex items-center transition-colors focus-within:border-[#2E7D32]`}
            >
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                placeholder="Re-enter password"
                className="flex-1 h-full bg-transparent text-[15px] text-[#263238] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-xs font-bold text-[#00897B] hover:opacity-80 cursor-pointer"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Live Match / Mismatch Feedback */}
            {hasConfirmText && (
              <span
                className={`text-xs font-semibold ${
                  isMatch ? 'text-[#2E7D32]' : 'text-[#D32F2F]'
                }`}
              >
                {isMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}

            {errors.confirmPassword && (
              <span className="text-xs text-[#D32F2F] font-medium">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="h-[52px] mt-2 rounded-[16px] bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white font-bold text-[16px] tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center"
          >
            Create Account
          </button>

          {/* Switch link */}
          <div className="flex items-center justify-center gap-1 mt-2 text-sm">
            <span className="text-[#546E7A] font-medium">Already have an account?</span>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-[#00897B] font-bold hover:underline cursor-pointer"
            >
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
