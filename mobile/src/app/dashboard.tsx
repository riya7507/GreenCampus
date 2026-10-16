/**
 * Sustainability Impact Dashboard
 * Displays real database-aggregated environmental savings, circular economy counts,
 * and user gamification rank.
 */

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [metrics, setMetrics] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [dashData, unreadData] = await Promise.all([
        ApiService.getDashboardMetrics().catch(() => null),
        ApiService.getUnreadCount().catch(() => ({ unread_count: 0 })),
      ]);
      setMetrics(dashData);
      setUnreadCount(unreadData?.unread_count || 0);
    } catch {
      setError('Unable to load latest dashboard metrics. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }>
        {/* Top App Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>Hello, {user?.full_name || 'Student'} 👋</Text>
            <Text style={styles.subGreeting}>Campus Sustainability Hub</Text>
          </View>

          <View style={styles.headerActions}>
            {user?.role === 'admin' && (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/admin')}
                style={styles.adminSwitchButton}>
                <Text style={styles.adminSwitchText}>⚙️ Admin</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/notifications')}
              style={styles.notifButton}>
              <Text style={styles.notifIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/profile')}
              style={styles.profileButton}>
              <Text style={styles.profileAvatar}>
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* User Green Points Pill */}
        <View style={styles.pointsBanner}>
          <View style={styles.pointsLeft}>
            <Text style={styles.pointsLabel}>My Green Points</Text>
            <Text style={styles.pointsValue}>
              {metrics ? metrics.user_total_points : 0} <Text style={styles.ptsUnit}>PTS</Text>
            </Text>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>
              Rank #{metrics ? metrics.user_rank : '-'}
            </Text>
          </View>
        </View>

        {/* Quick Nav Action Cards */}
        <View style={styles.quickActionsGrid}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/resourcecare')}
            style={({ pressed }) => [styles.actionCard, styles.cardTeal, pressed && styles.pressed]}>
            <Text style={styles.actionIcon}>💧</Text>
            <Text style={styles.actionTitle}>ResourceCare</Text>
            <Text style={styles.actionSub}>Report wastage</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/greenshare')}
            style={({ pressed }) => [styles.actionCard, styles.cardBlue, pressed && styles.pressed]}>
            <Text style={styles.actionIcon}>🤝</Text>
            <Text style={styles.actionTitle}>GreenShare</Text>
            <Text style={styles.actionSub}>Borrow & lend</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/leaderboard')}
            style={({ pressed }) => [styles.actionCard, styles.cardAmber, pressed && styles.pressed]}>
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionTitle}>Leaderboard</Text>
            <Text style={styles.actionSub}>Campus rankings</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/badges')}
            style={({ pressed }) => [styles.actionCard, styles.cardGreen, pressed && styles.pressed]}>
            <Text style={styles.actionIcon}>🎖️</Text>
            <Text style={styles.actionTitle}>Badges</Text>
            <Text style={styles.actionSub}>{metrics ? `${metrics.user_badges_count} earned` : 'Milestones'}</Text>
          </Pressable>
        </View>

        {/* Environmental Impact Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Campus Estimated Impact</Text>
          <Text style={styles.sectionSub}>Aggregated from verified community reports</Text>
        </View>

        {isLoading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.impactGrid}>
            <View style={styles.impactCard}>
              <Text style={styles.impactEmoji}>💧</Text>
              <Text style={styles.impactNumber}>
                {metrics?.estimated_water_saved_litres || 0} L
              </Text>
              <Text style={styles.impactLabel}>Water Saved</Text>
            </View>

            <View style={styles.impactCard}>
              <Text style={styles.impactEmoji}>⚡</Text>
              <Text style={styles.impactNumber}>
                {metrics?.estimated_energy_saved_kwh || 0} kWh
              </Text>
              <Text style={styles.impactLabel}>Clean Power</Text>
            </View>

            <View style={styles.impactCard}>
              <Text style={styles.impactEmoji}>♻️</Text>
              <Text style={styles.impactNumber}>
                {metrics?.estimated_waste_reduced_kg || 0} kg
              </Text>
              <Text style={styles.impactLabel}>Waste Diverted</Text>
            </View>

            <View style={styles.impactCard}>
              <Text style={styles.impactEmoji}>📦</Text>
              <Text style={styles.impactNumber}>
                {metrics?.items_shared_count || 0}
              </Text>
              <Text style={styles.impactLabel}>Items Shared</Text>
            </View>

            <View style={styles.impactCard}>
              <Text style={styles.impactEmoji}>🛡️</Text>
              <Text style={styles.impactNumber}>
                {metrics?.purchases_avoided_count || 0}
              </Text>
              <Text style={styles.impactLabel}>Purchases Avoided</Text>
            </View>

            <View style={styles.impactCard}>
              <Text style={styles.impactEmoji}>✅</Text>
              <Text style={styles.impactNumber}>
                {metrics?.issues_resolved_count || 0}
              </Text>
              <Text style={styles.impactLabel}>Issues Fixed</Text>
            </View>
          </View>
        )}

        {/* Recent Sustainability Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Eco Activity</Text>
        </View>

        {metrics?.recent_activity && metrics.recent_activity.length > 0 ? (
          <View style={styles.activityList}>
            {metrics.recent_activity.map((act: any) => (
              <View key={act.id} style={styles.activityItem}>
                <View style={styles.activityBullet}>
                  <Text style={styles.activityBulletText}>✓</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityDesc}>{act.description}</Text>
                  <Text style={styles.activityPoints}>+{act.points} Green Points</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBoxIcon}>🌱</Text>
            <Text style={styles.emptyBoxTitle}>No activity logged yet</Text>
            <Text style={styles.emptyBoxSub}>
              Submit a ResourceCare report or share an item on GreenShare to start earning points!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAF8' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: { fontSize: 22, fontWeight: '800', color: '#263238' },
  subGreeting: { fontSize: 13, color: '#546E7A', fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adminSwitchButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#E0F2F1',
    borderWidth: 1,
    borderColor: '#80CBC4',
  },
  adminSwitchText: { color: '#00695C', fontSize: 11, fontWeight: '800' },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifIcon: { fontSize: 18 },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  unreadBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pointsBanner: {
    backgroundColor: '#2E7D32',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  pointsLeft: { gap: 2 },
  pointsLabel: { color: '#C8E6C9', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  pointsValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  ptsUnit: { fontSize: 14, fontWeight: '600' },
  rankBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankBadgeText: { color: '#2E7D32', fontWeight: '800', fontSize: 13 },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1,
  },
  cardTeal: { backgroundColor: '#E0F2F1', borderColor: '#B2DFDB' },
  cardBlue: { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' },
  cardAmber: { backgroundColor: '#FFF8E1', borderColor: '#FFE082' },
  cardGreen: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  actionIcon: { fontSize: 24, marginBottom: 2 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#263238' },
  actionSub: { fontSize: 11, color: '#546E7A', fontWeight: '500' },
  sectionHeader: { marginTop: Spacing.two },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#263238' },
  sectionSub: { fontSize: 11, color: '#78909C', fontWeight: '500' },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  impactCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 4,
  },
  impactEmoji: { fontSize: 20 },
  impactNumber: { fontSize: 13, fontWeight: '800', color: '#263238', textAlign: 'center' },
  impactLabel: { fontSize: 10, color: '#78909C', fontWeight: '600', textAlign: 'center' },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBulletText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
  activityContent: { flex: 1 },
  activityDesc: { fontSize: 12, color: '#263238', fontWeight: '600' },
  activityPoints: { fontSize: 11, color: '#2E7D32', fontWeight: '700' },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 6,
  },
  emptyBoxIcon: { fontSize: 32 },
  emptyBoxTitle: { fontSize: 14, fontWeight: '700', color: '#263238' },
  emptyBoxSub: { fontSize: 12, color: '#78909C', textAlign: 'center', lineHeight: 18 },
  loaderBox: { padding: 30, alignItems: 'center' },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 12,
  },
  errorBoxText: { color: '#C62828', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
