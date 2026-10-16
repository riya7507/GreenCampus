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
import { ApiService } from '@/services/api';

interface BadgeItem {
  id: number;
  name: string;
  description: string;
  icon?: string;
  criteria_type?: string;
  criteria_value?: number;
  is_unlocked?: boolean;
  unlocked_at?: string;
}

export default function BadgesScreen() {
  const router = useRouter();

  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async () => {
    try {
      setError(null);
      const data = await ApiService.getBadges();
      setBadges(data || []);
    } catch {
      setError('Unable to load badges. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchBadges();
  };

  const unlockedCount = badges.filter((b) => b.is_unlocked).length;

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
          <Text style={styles.headerTitle}>Sustainability Badges</Text>
          <Text style={styles.headerSubtitle}>
            {unlockedCount} of {badges.length} Unlocked
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }>
        {/* Progress summary banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryTextWrap}>
            <Text style={styles.summaryTitle}>Eco Achievements</Text>
            <Text style={styles.summarySub}>
              Earn badges by completing sustainability milestones across campus.
            </Text>
          </View>
          <View style={styles.badgeRatioPill}>
            <Text style={styles.badgeRatioText}>
              {unlockedCount}/{badges.length}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : badges.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🎖️</Text>
            <Text style={styles.emptyTitle}>Badges Initializing</Text>
            <Text style={styles.emptySub}>
              Campus milestones will appear here shortly.
            </Text>
          </View>
        ) : (
          <View style={styles.badgesGrid}>
            {badges.map((badge) => {
              const unlocked = !!badge.is_unlocked;

              return (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    unlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked,
                  ]}>
                  {/* Badge Icon & State */}
                  <View
                    style={[
                      styles.iconCircle,
                      unlocked ? styles.iconCircleUnlocked : styles.iconCircleLocked,
                    ]}>
                    <Text style={styles.badgeIcon}>
                      {unlocked ? badge.icon || '🎖️' : '🔒'}
                    </Text>
                  </View>

                  <View style={styles.badgeInfo}>
                    <View style={styles.badgeNameRow}>
                      <Text
                        style={[
                          styles.badgeName,
                          !unlocked && styles.textLocked,
                        ]}>
                        {badge.name}
                      </Text>
                      {unlocked && (
                        <View style={styles.earnedTag}>
                          <Text style={styles.earnedTagText}>EARNED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                    {unlocked && badge.unlocked_at && (
                      <Text style={styles.unlockedDate}>
                        Unlocked on {new Date(badge.unlocked_at).toLocaleDateString()}
                      </Text>
                    )}
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
  summaryBanner: {
    backgroundColor: '#E0F2F1',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  summaryTextWrap: { flex: 1, paddingRight: 10 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#00695C' },
  summarySub: { fontSize: 12, color: '#00897B', marginTop: 2, lineHeight: 16 },
  badgeRatioPill: {
    backgroundColor: '#00897B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeRatioText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  badgesGrid: { gap: 12 },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  badgeCardUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C8E6C9',
  },
  badgeCardLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.85,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnlocked: { backgroundColor: '#E8F5E9' },
  iconCircleLocked: { backgroundColor: '#EEEEEE' },
  badgeIcon: { fontSize: 24 },
  badgeInfo: { flex: 1 },
  badgeNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgeName: { fontSize: 15, fontWeight: '800', color: '#263238' },
  textLocked: { color: '#757575' },
  earnedTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  earnedTagText: { color: '#2E7D32', fontSize: 10, fontWeight: '800' },
  badgeDescription: { fontSize: 12, color: '#546E7A', marginTop: 2, lineHeight: 16 },
  unlockedDate: { fontSize: 10, color: '#81C784', marginTop: 4, fontWeight: '600' },
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
