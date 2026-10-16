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
  reporter_name?: string;
}

export default function ResourceCareFeedScreen() {
  const router = useRouter();

  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      setError(null);
      const statusParam = selectedFilter === 'all' ? undefined : selectedFilter;
      const typeParam = selectedType === 'all' ? undefined : selectedType;
      const data = await ApiService.getAllIssues(statusParam, typeParam);
      setIssues(data || []);
    } catch {
      setError('Unable to load issues feed. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedFilter, selectedType]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchIssues();
  };

  const getIssueEmoji = (type: string) => {
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
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>ResourceCare</Text>
          <Text style={styles.headerSubtitle}>Campus Wastage Reporter</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/resourcecare/my-reports')}
          style={styles.myReportsBtn}>
          <Text style={styles.myReportsBtnText}>Mine</Text>
        </Pressable>
      </View>

      {/* Primary Action Button */}
      <View style={styles.actionHeader}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/resourcecare/create')}
          style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
          <Text style={styles.createButtonIcon}>＋</Text>
          <Text style={styles.createButtonText}>Report New Wastage (+10 PTS)</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['all', 'reported', 'in_progress', 'resolved'].map((filterKey) => (
            <Pressable
              key={filterKey}
              onPress={() => setSelectedFilter(filterKey)}
              style={[
                styles.filterPill,
                selectedFilter === filterKey && styles.filterPillActive,
              ]}>
              <Text
                style={[
                  styles.filterPillText,
                  selectedFilter === filterKey && styles.filterPillTextActive,
                ]}>
                {filterKey.replace('_', ' ').toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Category Sub-Filters */}
      <View style={styles.typeFilterBar}>
        {['all', 'water', 'electricity', 'waste'].map((tKey) => (
          <Pressable
            key={tKey}
            onPress={() => setSelectedType(tKey)}
            style={[
              styles.typePill,
              selectedType === tKey && styles.typePillActive,
            ]}>
            <Text
              style={[
                styles.typePillText,
                selectedType === tKey && styles.typePillTextActive,
              ]}>
              {tKey === 'all' ? 'All Types' : `${getIssueEmoji(tKey)} ${tKey[0].toUpperCase() + tKey.slice(1)}`}
            </Text>
          </Pressable>
        ))}
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
        ) : issues.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>💧</Text>
            <Text style={styles.emptyTitle}>No Issues Found</Text>
            <Text style={styles.emptySub}>
              Everything looks clean and efficient! Spot a leak, open faucet, or running AC? Submit a report above.
            </Text>
          </View>
        ) : (
          <View style={styles.feedList}>
            {issues.map((item) => {
              const statusBadge = getStatusBadge(item.status);

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/resourcecare/${item.id}`)}
                  style={({ pressed }) => [styles.issueCard, pressed && styles.pressed]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.typeWrap}>
                      <Text style={styles.cardEmoji}>{getIssueEmoji(item.issue_type)}</Text>
                      <Text style={styles.typeText}>
                        {item.issue_type.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
                        {statusBadge.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.locationWrap}>
                      <Text style={styles.pinIcon}>📍</Text>
                      <Text style={styles.locationText} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
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
  myReportsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E0F2F1',
  },
  myReportsBtnText: { color: '#00695C', fontSize: 12, fontWeight: '700' },
  actionHeader: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  createButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  createButtonIcon: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  createButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    marginTop: Spacing.two,
  },
  filterScroll: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  filterPillActive: { backgroundColor: '#2E7D32' },
  filterPillText: { fontSize: 11, fontWeight: '700', color: '#546E7A' },
  filterPillTextActive: { color: '#FFFFFF' },
  typeFilterBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    gap: 6,
  },
  typePill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  typePillActive: {
    borderColor: '#00897B',
    backgroundColor: '#E0F2F1',
  },
  typePillText: { fontSize: 11, fontWeight: '600', color: '#546E7A' },
  typePillTextActive: { color: '#00695C', fontWeight: '800' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
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
  locationWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, marginRight: 8 },
  pinIcon: { fontSize: 12 },
  locationText: { fontSize: 12, color: '#78909C', flex: 1 },
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
