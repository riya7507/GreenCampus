import { useState } from 'react';

interface LoginScreenProps {
  onBack: () => void;
  onNavigateRegister: () => void;
}

export function LoginScreen({ onBack, onNavigateRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Campus email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedMessage(null);

    if (validateForm()) {
      setSubmittedMessage(
        `Validation passed for ${email.trim()}! Backend API connection (FastAPI + MySQL) will be linked in the next phase.`
      );
    }
  };

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
            Welcome Back
          </h1>
          <p className="text-sm font-medium text-[#546E7A] leading-relaxed">
            Log in to access your campus sustainability dashboard and eco points.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {submittedMessage && (
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#81C784] text-[#2E7D32] text-xs font-semibold leading-relaxed">
              ✓ {submittedMessage}
            </div>
          )}

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
            <label className="text-xs font-bold text-[#263238]">Password</label>
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
                placeholder="Enter your password"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="h-[52px] mt-2 rounded-[16px] bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white font-bold text-[16px] tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center"
          >
            Log In
          </button>

          {/* Switch link */}
          <div className="flex items-center justify-center gap-1 mt-2 text-sm">
            <span className="text-[#546E7A] font-medium">Don&apos;t have an account?</span>
            <button
              type="button"
              onClick={onNavigateRegister}
              className="text-[#00897B] font-bold hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
