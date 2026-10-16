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

interface IssueItem {
  id: number;
  issue_type: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
}

export default function MyReportsScreen() {
  const router = useRouter();

  const [reports, setReports] = useState<IssueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyReports = async () => {
    try {
      setError(null);
      const data = await ApiService.getMyIssues();
      setReports(data || []);
    } catch {
      setError('Could not load your reports.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMyReports();
  };

  const getEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'water':
        return '💧';
      case 'electricity':
        return '⚡';
      case 'waste':
        return '♻️';
      default:
        return '⚠️';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'RESOLVED' };
      case 'in_progress':
        return { bg: '#E3F2FD', text: '#1976D2', label: 'IN PROGRESS' };
      default:
        return { bg: '#FFF8E1', text: '#F57F17', label: 'REPORTED' };
    }
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
          <Text style={styles.headerTitle}>My Reported Issues</Text>
          <Text style={styles.headerSubtitle}>{reports.length} Total Submissions</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/resourcecare/create')}
          style={styles.newReportBtn}>
          <Text style={styles.newReportBtnText}>＋ New</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }>
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No Submissions Yet</Text>
            <Text style={styles.emptySub}>
              You have not submitted any campus wastage reports yet. Spot a leak or issue? Tap "+ New" above to report it.
            </Text>
          </View>
        ) : (
          <View style={styles.feedList}>
            {reports.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/resourcecare/${item.id}`)}
                  style={({ pressed }) => [styles.issueCard, pressed && styles.pressed]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.typeWrap}>
                      <Text style={styles.cardEmoji}>{getEmoji(item.issue_type)}</Text>
                      <Text style={styles.typeText}>{item.issue_type.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.locationText} numberOfLines={1}>
                      📍 {item.location}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </Pressable>
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
  newReportBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newReportBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  feedList: { gap: 12 },
  issueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardEmoji: { fontSize: 18 },
  typeText: { fontSize: 12, fontWeight: '800', color: '#263238' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  cardDesc: { fontSize: 14, color: '#37474F', lineHeight: 20 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 8,
  },
  locationText: { fontSize: 12, color: '#78909C', flex: 1, marginRight: 8 },
  dateText: { fontSize: 11, color: '#90A4AE' },
  pressed: { opacity: 0.8 },
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
