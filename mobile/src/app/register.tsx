import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PasswordStrengthIndicator } from '@/components/password-strength-indicator';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { generateStrongPassword } from '@/utils/password';
import {
  doPasswordsMatch,
  validatePasswordRequirements,
} from '@/utils/passwordValidation';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Suggest Strong Password Action
  const handleSuggestPassword = () => {
    const generated = generateStrongPassword(14);
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirmPassword(true);

    setErrors((prev) => ({
      ...prev,
      password: undefined,
      confirmPassword: undefined,
    }));
  };

  // Client-side Form Validation
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

  const handleRegister = async () => {
    clearError();
    setSuccessMessage(null);

    if (!validateForm()) return;

    const success = await register(fullName.trim(), email.trim(), password);
    if (success) {
      setSuccessMessage(
        'Account created successfully! You can now log in to GreenCampus.'
      );
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  };

  const hasConfirmText = confirmPassword.length > 0;
  const isMatch = doPasswordsMatch(password, confirmPassword);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>

            <View style={styles.brandPill}>
              <Text style={styles.brandPillIcon}>🌱</Text>
              <Text style={styles.brandPillText}>GreenCampus</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.titleText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              Join the student sustainability network, earn eco-points, and log impact.
            </Text>
          </View>

          {/* Error / Success Banners */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {error}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ {successMessage}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.fullName ? styles.inputError : null]}
                placeholder="e.g. Maya Patel"
                placeholderTextColor="#90A4AE"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus Email</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="student@university.edu"
                placeholderTextColor="#90A4AE"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleSuggestPassword}
                  style={({ pressed }) => [styles.suggestButton, pressed && styles.pressed]}>
                  <Text style={styles.suggestButtonText}>✨ Suggest Strong Password</Text>
                </Pressable>
              </View>

              <View style={[styles.passwordWrapper, errors.password ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#90A4AE"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeButton}>
                  <Text style={styles.eyeButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              <PasswordStrengthIndicator password={password} />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.passwordWrapper, errors.confirmPassword ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#90A4AE"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeButton}>
                  <Text style={styles.eyeButtonText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>

              {hasConfirmText && (
                <Text
                  style={[
                    styles.matchFeedbackText,
                    isMatch ? styles.matchSuccess : styles.matchError,
                  ]}>
                  {isMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </Text>
              )}

              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Create Account Button */}
            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={handleRegister}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.pressed,
                isLoading && styles.buttonDisabled,
              ]}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </Pressable>

            {/* Switch to Login */}
            <View style={styles.switchWrapper}>
              <Text style={styles.switchPrompt}>Already have an account? </Text>
              <Pressable onPress={() => router.push('/login')}>
                <Text style={styles.switchLink}>Log In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAF8' },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  backButtonText: { color: '#263238', fontSize: 14, fontWeight: '600' },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  brandPillIcon: { fontSize: 14 },
  brandPillText: { fontSize: 13, fontWeight: '700', color: '#2E7D32' },
  headingContainer: { marginBottom: Spacing.three },
  titleText: { fontSize: 28, fontWeight: '800', color: '#263238', letterSpacing: -0.5 },
  subtitleText: { fontSize: 14, fontWeight: '500', color: '#546E7A', marginTop: 6, lineHeight: 20 },
  formContainer: { gap: Spacing.three },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF9A9A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: Spacing.two,
  },
  errorBannerText: { color: '#C62828', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: Spacing.two,
  },
  successText: { color: '#2E7D32', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  inputGroup: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: '#263238' },
  suggestButton: { paddingVertical: 2, paddingHorizontal: 6 },
  suggestButtonText: { fontSize: 12, fontWeight: '700', color: '#00897B' },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CFD8DC',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#263238',
  },
  passwordWrapper: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CFD8DC',
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: { flex: 1, height: '100%', fontSize: 15, color: '#263238' },
  eyeButton: { paddingVertical: 6, paddingHorizontal: 8 },
  eyeButtonText: { fontSize: 13, fontWeight: '700', color: '#00897B' },
  inputError: { borderColor: '#D32F2F' },
  errorText: { color: '#D32F2F', fontSize: 12, fontWeight: '500', marginTop: 2 },
  matchFeedbackText: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  matchSuccess: { color: '#2E7D32' },
  matchError: { color: '#D32F2F' },
  submitButton: {
    height: 52,
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  switchWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  switchPrompt: { fontSize: 14, color: '#546E7A', fontWeight: '500' },
  switchLink: { fontSize: 14, color: '#00897B', fontWeight: '700' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
