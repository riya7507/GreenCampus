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

interface LeaderboardUser {
  rank: number;
  user_id: number;
  full_name: string;
  green_points: number;
  badges_count: number;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const data = await ApiService.getLeaderboard();
      setLeaderboard(data || []);
    } catch {
      setError('Could not load leaderboard. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchLeaderboard();
  };

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return styles.rankDefault;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
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
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Campus Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top Sustainability Champions</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }>
        {/* Podium Highlight Banner */}
        <View style={styles.podiumBanner}>
          <Text style={styles.podiumIcon}>🏆</Text>
          <Text style={styles.podiumTitle}>Green Campus Honor Roll</Text>
          <Text style={styles.podiumSub}>
            Earn points by reporting wastage on ResourceCare and sharing items on GreenShare.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>No Champions Yet</Text>
            <Text style={styles.emptySub}>
              Be the first student to log an eco-action and claim Rank #1!
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {leaderboard.map((item) => {
              const isCurrentUser = user && user.id === item.user_id;

              return (
                <View
                  key={item.user_id}
                  style={[
                    styles.rankRow,
                    isCurrentUser && styles.currentUserRow,
                  ]}>
                  {/* Rank Badge */}
                  <View style={[styles.rankBadge, getRankBadgeStyle(item.rank)]}>
                    <Text style={styles.rankBadgeText}>{getRankEmoji(item.rank)}</Text>
                  </View>

                  {/* Student Info */}
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>
                        {item.full_name}
                      </Text>
                      {isCurrentUser && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>YOU</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.badgesCount}>
                      🎖️ {item.badges_count} {item.badges_count === 1 ? 'badge' : 'badges'}
                    </Text>
                  </View>

                  {/* Points Counter */}
                  <View style={styles.pointsWrap}>
                    <Text style={styles.pointsText}>{item.green_points}</Text>
                    <Text style={styles.pointsLabel}>PTS</Text>
                  </View>
                </View>
              );
            })}
          </View>
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
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#263238' },
  headerSubtitle: { fontSize: 11, color: '#78909C', fontWeight: '500' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.three,
  },
  podiumBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  podiumIcon: { fontSize: 32, marginBottom: 4 },
  podiumTitle: { fontSize: 16, fontWeight: '800', color: '#1B5E20' },
  podiumSub: {
    fontSize: 12,
    color: '#388E3C',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    overflow: 'hidden',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  currentUserRow: {
    backgroundColor: '#F1F8E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankGold: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082' },
  rankSilver: { backgroundColor: '#ECEFF1', borderWidth: 1, borderColor: '#CFD8DC' },
  rankBronze: { backgroundColor: '#FBE9E7', borderWidth: 1, borderColor: '#FFCCBC' },
  rankDefault: { backgroundColor: '#F5F5F5' },
  rankBadgeText: { fontSize: 16, fontWeight: '800', color: '#37474F' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 14, fontWeight: '700', color: '#263238' },
  youBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  badgesCount: { fontSize: 11, color: '#78909C', marginTop: 2 },
  pointsWrap: { alignItems: 'flex-end' },
  pointsText: { fontSize: 16, fontWeight: '800', color: '#2E7D32' },
  pointsLabel: { fontSize: 9, fontWeight: '700', color: '#81C784' },
  centerBox: { padding: 40, alignItems: 'center' },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 14,
    borderRadius: 12,
  },
  errorText: { color: '#C62828', textAlign: 'center', fontSize: 13, fontWeight: '600' },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#263238' },
  emptySub: { fontSize: 12, color: '#78909C', textAlign: 'center', lineHeight: 18 },
});
