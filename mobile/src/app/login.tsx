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

import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const errs: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errs.email = 'Campus email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validateForm()) return;

    const loggedInUser = await login(email.trim(), password);
    if (loggedInUser) {
      if (loggedInUser.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Top Header */}
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
            <Text style={styles.titleText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>
              Log in to access your campus sustainability dashboard, Green Points, and sharing hub.
            </Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus Email</Text>
              <TextInput
                style={[styles.input, clientErrors.email ? styles.inputError : null]}
                placeholder="student@university.edu"
                placeholderTextColor="#90A4AE"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (clientErrors.email) setClientErrors((prev) => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {clientErrors.email && <Text style={styles.errorText}>{clientErrors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordWrapper, clientErrors.password ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#90A4AE"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (clientErrors.password) setClientErrors((prev) => ({ ...prev, password: undefined }));
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
              {clientErrors.password && <Text style={styles.errorText}>{clientErrors.password}</Text>}
            </View>

            {/* Submit Button */}
            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.pressed,
                isLoading && styles.buttonDisabled,
              ]}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Log In</Text>
              )}
            </Pressable>

            {/* Switch to Register */}
            <View style={styles.switchWrapper}>
              <Text style={styles.switchPrompt}>Don&apos;t have an account? </Text>
              <Pressable onPress={() => router.push('/register')}>
                <Text style={styles.switchLink}>Create Account</Text>
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
    marginBottom: Spacing.four,
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
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF9A9A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: Spacing.two,
  },
  errorBannerText: { color: '#C62828', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  formContainer: { gap: Spacing.three },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#263238' },
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
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
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
