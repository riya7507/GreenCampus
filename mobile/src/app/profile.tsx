import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiService } from '@/services/api';

interface PointLog {
  id: number;
  points: number;
  reason: string;
  source_type: string;
  created_at: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [pointsHistory, setPointsHistory] = useState<PointLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchProfileData = async () => {
    try {
      const data = await ApiService.getMyPointsHistory();
      setPointsHistory(data || []);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProfileData();
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of GreenCampus?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const totalPoints = pointsHistory.reduce((acc, curr) => acc + (curr.points || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'Green Champion'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'student@campus.edu'}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>
          </View>
        </View>

        {/* Total Points summary box */}
        <View style={styles.pointsSummaryCard}>
          <View style={styles.pointsSummaryLeft}>
            <Text style={styles.pointsSummaryLabel}>Lifetime Green Points</Text>
            <Text style={styles.pointsSummaryValue}>{totalPoints} PTS</Text>
          </View>
          <Text style={styles.pointsSummaryIcon}>🌱</Text>
        </View>

        {/* Ledger Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Points History</Text>
          <Text style={styles.sectionSubtitle}>Verified contributions</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : pointsHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No Points Logged Yet</Text>
            <Text style={styles.emptySub}>
              Submit a ResourceCare report or list an item to begin accumulating points!
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {pointsHistory.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logLeft}>
                  <Text style={styles.logReason}>{log.reason}</Text>
                  <Text style={styles.logDate}>
                    {new Date(log.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.logBadge}>
                  <Text style={styles.logPointsText}>+{log.points} PTS</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Logout Button */}
        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  roleTagText: { color: '#2E7D32', fontSize: 10, fontWeight: '800' },
  pointsSummaryCard: {
    backgroundColor: '#2E7D32',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsSummaryLeft: { gap: 2 },
  pointsSummaryLabel: { color: '#C8E6C9', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  pointsSummaryValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  pointsSummaryIcon: { fontSize: 32 },
  sectionHeader: { marginTop: Spacing.two },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#263238' },
  sectionSubtitle: { fontSize: 11, color: '#78909C' },
  centerBox: { padding: 40, alignItems: 'center' },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#263238' },
  emptySub: { fontSize: 12, color: '#78909C', textAlign: 'center', lineHeight: 18 },
  historyList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    overflow: 'hidden',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  logLeft: { flex: 1, paddingRight: 10 },
  logReason: { fontSize: 13, fontWeight: '700', color: '#263238' },
  logDate: { fontSize: 11, color: '#90A4AE', marginTop: 2 },
  logBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logPointsText: { color: '#2E7D32', fontSize: 12, fontWeight: '800' },
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
