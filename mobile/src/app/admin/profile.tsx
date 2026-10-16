import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of the Admin Portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Admin Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Administrator Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'Campus Administrator'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'admin@campus.edu'}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>CAMPUS ADMINISTRATOR</Text>
          </View>
        </View>

        {/* Switch Experience Option */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/dashboard')}
          style={({ pressed }) => [styles.switchCard, pressed && styles.pressed]}>
          <View style={styles.switchLeft}>
            <Text style={styles.switchIcon}>📱</Text>
            <View>
              <Text style={styles.switchTitle}>Open Student Experience</Text>
              <Text style={styles.switchSub}>View GreenCampus as students see it</Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </Pressable>

        {/* System & Architecture Info */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>System Architecture</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>React Native · Expo SDK 57</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Backend API</Text>
            <Text style={styles.infoValue}>FastAPI · Python 3.10</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Database Engine</Text>
            <Text style={styles.infoValue}>MySQL Relational Schema</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Authorization</Text>
            <Text style={styles.infoValue}>Role-Based Access Control (RBAC)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Security Policy</Text>
            <Text style={styles.infoValue}>JWT Bearer Tokens · Bcrypt Passwords</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <Text style={styles.logoutButtonText}>Sign Out of Admin Portal</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAF8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F8E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { fontSize: 20, color: '#2E7D32', fontWeight: 'bold' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#263238' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.three,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 6,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarLetter: { fontSize: 28, color: '#FFFFFF', fontWeight: '800' },
  userName: { fontSize: 18, fontWeight: '800', color: '#263238' },
  userEmail: { fontSize: 13, color: '#546E7A' },
  roleTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  roleTagText: { color: '#2E7D32', fontSize: 10, fontWeight: '800' },
  switchCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchIcon: { fontSize: 24 },
  switchTitle: { fontSize: 14, fontWeight: '800', color: '#00695C' },
  switchSub: { fontSize: 11, color: '#00897B', marginTop: 1 },
  arrowIcon: { fontSize: 18, color: '#00897B', fontWeight: 'bold' },
  sectionHeader: { marginTop: Spacing.one },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#263238' },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 10,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#78909C', fontWeight: '600' },
  infoValue: { fontSize: 12, color: '#263238', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F5F5F5' },
  logoutButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.two,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutButtonText: { color: '#C62828', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
