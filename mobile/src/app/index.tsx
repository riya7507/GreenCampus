import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SustainabilityTips } from '@/components/sustainability-tips';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Center Hero & Branding */}
        <View style={styles.heroSection}>
          {/* Main Visual: Multi-color Layered Emblem */}
          <View style={styles.emblemContainer}>
            {/* Outer soft light-green ring */}
            <View style={styles.outerRing}>
              {/* Inner deep green circle */}
              <View style={styles.innerCircle}>
                <Text style={styles.leafIcon}>🌱</Text>
              </View>
            </View>

            {/* Small Teal accent badge on the bottom-right */}
            <View style={styles.tealAccentBadge}>
              <Text style={styles.tealAccentIcon}>✓</Text>
            </View>
          </View>

          {/* Title: Deep Green + Charcoal */}
          <View style={styles.titleContainer}>
            <View style={styles.brandRow}>
              <Text style={styles.brandGreen}>Green</Text>
              <Text style={styles.brandCampus}>Campus</Text>
            </View>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.subtitle}>
              Smarter Campus. Greener Future.
            </ThemedText>
          </View>

          {/* 3 Balanced Feature Cards (Teal, Blue, Amber) */}
          <View style={styles.featureGrid}>
            {/* Card 1: Teal Accent (Eco Tracking) */}
            <View style={styles.featureCard}>
              <View style={styles.tealIconBox}>
                <Text style={styles.featureEmoji}>🌿</Text>
              </View>
              <Text style={styles.featureTitle}>Eco Audit</Text>
              <Text style={styles.featureSub}>Track Impact</Text>
            </View>

            {/* Card 2: Blue Accent (Clean Energy) */}
            <View style={styles.featureCard}>
              <View style={styles.blueIconBox}>
                <Text style={styles.featureEmoji}>⚡</Text>
              </View>
              <Text style={styles.featureTitle}>Clean Power</Text>
              <Text style={styles.featureSub}>Save Energy</Text>
            </View>

            {/* Card 3: Amber Accent (Green Rewards & Recycling) */}
            <View style={styles.featureCard}>
              <View style={styles.amberIconBox}>
                <Text style={styles.featureEmoji}>♻️</Text>
              </View>
              <Text style={styles.featureTitle}>Smart Waste</Text>
              <Text style={styles.featureSub}>Earn Points</Text>
            </View>
          </View>

          {/* Daily Eco-friendly Sustainability Tips */}
          <SustainabilityTips />
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionSection}>
          {/* Primary Button: Deep Green */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Login to GreenCampus"
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </Pressable>

          {/* Secondary Button: Clean White with Teal border */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a GreenCampus Account"
            onPress={handleCreateAccount}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </Pressable>

          {/* Clean Subtext */}
          <Text style={styles.footerNote}>
            Campus Environmental & Resource Stewardship
          </Text>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  emblemContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#81C784',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  leafIcon: {
    fontSize: 44,
  },
  tealAccentBadge: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00897B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  tealAccentIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
    gap: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandGreen: {
    fontSize: 38,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: -0.5,
  },
  brandCampus: {
    fontSize: 38,
    fontWeight: '800',
    color: '#263238',
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: '#546E7A',
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    width: '100%',
    maxWidth: 380,
    marginTop: Spacing.two,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tealIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  blueIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  amberIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#263238',
    textAlign: 'center',
  },
  featureSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#78909C',
    textAlign: 'center',
    marginTop: 2,
  },
  actionSection: {
    width: '100%',
    maxWidth: 380,
    gap: Spacing.two + 4,
    alignItems: 'stretch',
    marginBottom: Spacing.two,
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#00897B',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#00897B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 2,
    fontWeight: '500',
  },
});
