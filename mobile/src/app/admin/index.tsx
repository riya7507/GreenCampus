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

interface AdminAnalytics {
  total_users: number;
  total_students: number;
  total_admins: number;
  total_issues: number;
  pending_reports: number;
  in_progress_reports: number;
  resolved_reports: number;
  total_items_listed: number;
  available_items: number;
  borrowed_items: number;
  pending_borrow_requests: number;
  total_borrow_cycles: number;
  purchases_avoided_count: number;
  total_green_points_awarded: number;
  estimated_water_saved_litres: number;
  estimated_energy_saved_kwh: number;
  estimated_waste_reduced_kg: number;
}

export default function AdminHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Security authorization check on screen mount
  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') {
      Alert.alert(
        'Access Denied',
        'Administrator privileges are required to view the Admin Dashboard.',
        [{ text: 'Return to Student Hub', onPress: () => router.replace('/dashboard') }]
      );
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const data = await ApiService.getAdminAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      if (err?.statusCode === 403) {
        Alert.alert(
          'Access Denied',
          'Your account is not authorized as an administrator.',
          [{ text: 'OK', onPress: () => router.replace('/dashboard') }]
        );
      } else {
        setError('Unable to load admin metrics. Pull down to retry.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [user]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics();
  };

  if (user && user.role !== 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.deniedBox}>
          <Text style={styles.deniedIcon}>🛡️</Text>
          <Text style={styles.deniedTitle}>Admin Access Required</Text>
          <Text style={styles.deniedSub}>
            This portal is restricted to authorized campus sustainability staff and administrators.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/dashboard')}
            style={styles.deniedButton}>
            <Text style={styles.deniedButtonText}>Go to Student Dashboard</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.adminBadgeRow}>
            <Text style={styles.greetingTitle}>Admin Portal</Text>
            <View style={styles.adminRolePill}>
              <Text style={styles.adminRoleText}>ADMIN</Text>
            </View>
          </View>
          <Text style={styles.greetingSub}>Campus Sustainability Operations</Text>
        </View>

        <View style={styles.headerRightActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/dashboard')}
            style={styles.switchButton}>
            <Text style={styles.switchButtonText}>📱 Student Hub</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/admin/profile')}
            style={styles.profileBtn}>
            <Text style={styles.profileAvatar}>
              {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }>
        {/* Core Administrative Navigation Grid */}
        <View style={styles.navGrid}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/admin/resourcecare')}
            style={({ pressed }) => [styles.navCard, styles.navTeal, pressed && styles.pressed]}>
            <View style={styles.navCardTop}>
              <Text style={styles.navIcon}>💧</Text>
              {analytics && analytics.pending_reports > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{analytics.pending_reports} new</Text>
                </View>
              )}
            </View>
            <Text style={styles.navTitle}>ResourceCare</Text>
            <Text style={styles.navSub}>Wastage reports & status workflow</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/admin/greenshare')}
            style={({ pressed }) => [styles.navCard, styles.navBlue, pressed && styles.pressed]}>
            <View style={styles.navCardTop}>
              <Text style={styles.navIcon}>🤝</Text>
              {analytics && analytics.pending_borrow_requests > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{analytics.pending_borrow_requests} pending</Text>
                </View>
              )}
            </View>
            <Text style={styles.navTitle}>GreenShare</Text>
            <Text style={styles.navSub}>Reuse catalog & borrow cycles</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/admin/users')}
            style={({ pressed }) => [styles.navCard, styles.navGreen, pressed && styles.pressed]}>
            <View style={styles.navCardTop}>
              <Text style={styles.navIcon}>👥</Text>
            </View>
            <Text style={styles.navTitle}>User Directory</Text>
            <Text style={styles.navSub}>Students, staff & roles</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/admin/impact')}
            style={({ pressed }) => [styles.navCard, styles.navAmber, pressed && styles.pressed]}>
            <View style={styles.navCardTop}>
              <Text style={styles.navIcon}>📊</Text>
            </View>
            <Text style={styles.navTitle}>Impact Audit</Text>
            <Text style={styles.navSub}>Estimated resource savings</Text>
          </Pressable>
        </View>

        {/* Operational Overview Statistics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>System Metrics Overview</Text>
          <Text style={styles.sectionSub}>Live aggregates directly from campus database</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics?.total_users ?? 0}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
                <Text style={styles.statHint}>
                  {analytics?.total_students ?? 0} students · {analytics?.total_admins ?? 0} admins
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics?.total_issues ?? 0}</Text>
                <Text style={styles.statLabel}>Total Reports</Text>
                <Text style={styles.statHint}>
                  {analytics?.resolved_reports ?? 0} resolved
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#F57F17' }]}>
                  {analytics?.pending_reports ?? 0}
                </Text>
                <Text style={styles.statLabel}>Pending Reports</Text>
                <Text style={styles.statHint}>Awaiting review</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#1976D2' }]}>
                  {analytics?.in_progress_reports ?? 0}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
                <Text style={styles.statHint}>Work dispatched</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics?.total_items_listed ?? 0}</Text>
                <Text style={styles.statLabel}>GreenShare Items</Text>
                <Text style={styles.statHint}>
                  {analytics?.available_items ?? 0} available · {analytics?.borrowed_items ?? 0} borrowed
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics?.total_borrow_cycles ?? 0}</Text>
                <Text style={styles.statLabel}>Borrow Cycles</Text>
                <Text style={styles.statHint}>
                  {analytics?.purchases_avoided_count ?? 0} purchases saved
                </Text>
              </View>
            </View>

            {/* Environmental Savings Summary */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Campus Sustainability Impact</Text>
              <Text style={styles.sectionSub}>Calculated estimates from verified resolutions</Text>
            </View>

            <View style={styles.impactRow}>
              <View style={[styles.impactBox, styles.impactTeal]}>
                <Text style={styles.impactEmoji}>💧</Text>
                <Text style={styles.impactVal}>
                  {analytics?.estimated_water_saved_litres ?? 0} L
                </Text>
                <Text style={styles.impactLbl}>Estimated Water Saved</Text>
              </View>

              <View style={[styles.impactBox, styles.impactBlue]}>
                <Text style={styles.impactEmoji}>⚡</Text>
                <Text style={styles.impactVal}>
                  {analytics?.estimated_energy_saved_kwh ?? 0} kWh
                </Text>
                <Text style={styles.impactLbl}>Estimated Energy Saved</Text>
              </View>

              <View style={[styles.impactBox, styles.impactGreen]}>
                <Text style={styles.impactEmoji}>♻️</Text>
                <Text style={styles.impactVal}>
                  {analytics?.estimated_waste_reduced_kg ?? 0} kg
                </Text>
                <Text style={styles.impactLbl}>Estimated Waste Diverted</Text>
              </View>
            </View>

            {/* Green Points Total Card */}
            <View style={styles.pointsBanner}>
              <View>
                <Text style={styles.pointsLabel}>Total Green Points Distributed</Text>
                <Text style={styles.pointsValue}>
                  {analytics?.total_green_points_awarded ?? 0} <Text style={styles.pointsUnit}>PTS</Text>
                </Text>
              </View>
              <Text style={styles.pointsEmoji}>🌱</Text>
            </View>
          </>
        )}
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
    paddingVertical: Spacing.two + 4,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  adminBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greetingTitle: { fontSize: 20, fontWeight: '800', color: '#263238' },
  adminRolePill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  adminRoleText: { color: '#2E7D32', fontSize: 10, fontWeight: '800' },
  greetingSub: { fontSize: 12, color: '#78909C', fontWeight: '500', marginTop: 2 },
  headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchButton: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  switchButtonText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.three,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  navCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  navTeal: { backgroundColor: '#E0F2F1', borderColor: '#B2DFDB' },
  navBlue: { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' },
  navGreen: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  navAmber: { backgroundColor: '#FFF8E1', borderColor: '#FFE082' },
  navCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navIcon: { fontSize: 24 },
  pendingBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  navTitle: { fontSize: 14, fontWeight: '800', color: '#263238' },
  navSub: { fontSize: 11, color: '#546E7A', fontWeight: '500', lineHeight: 15 },
  sectionHeader: { marginTop: Spacing.one },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#263238' },
  sectionSub: { fontSize: 11, color: '#78909C', fontWeight: '500' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#263238' },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#546E7A' },
  statHint: { fontSize: 10, color: '#90A4AE', marginTop: 2 },
  impactRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  impactBox: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  impactTeal: { backgroundColor: '#E0F2F1', borderColor: '#B2DFDB' },
  impactBlue: { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' },
  impactGreen: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  impactEmoji: { fontSize: 20 },
  impactVal: { fontSize: 14, fontWeight: '800', color: '#263238', textAlign: 'center' },
  impactLbl: { fontSize: 9, color: '#546E7A', textAlign: 'center', fontWeight: '600' },
  pointsBanner: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsLabel: { color: '#C8E6C9', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  pointsValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  pointsUnit: { fontSize: 14, fontWeight: '600' },
  pointsEmoji: { fontSize: 32 },
  centerBox: { padding: 40, alignItems: 'center' },
  errorBox: { backgroundColor: '#FFEBEE', padding: 14, borderRadius: 12 },
  errorText: { color: '#C62828', textAlign: 'center', fontSize: 13, fontWeight: '600' },
  deniedBox: {
    margin: 30,
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 12,
  },
  deniedIcon: { fontSize: 48 },
  deniedTitle: { fontSize: 18, fontWeight: '800', color: '#C62828' },
  deniedSub: { fontSize: 13, color: '#546E7A', textAlign: 'center', lineHeight: 18 },
  deniedButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  deniedButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
