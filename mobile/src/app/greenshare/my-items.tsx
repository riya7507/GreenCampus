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

interface ItemEntry {
  id: number;
  name: string;
  description?: string;
  category: string;
  condition?: string;
  availability_status?: string;
  status?: string;
  created_at: string;
}

export default function MyItemsScreen() {
  const router = useRouter();

  const [items, setItems] = useState<ItemEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyItems = async () => {
    try {
      setError(null);
      const data = await ApiService.getMyItems();
      setItems(data || []);
    } catch {
      setError('Could not load your listed items.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMyItems();
  };

  const getEmoji = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'books':
        return '📚';
      case 'electronics':
        return '💻';
      case 'lab':
      case 'lab_gear':
        return '🔬';
      case 'sports':
        return '⚽';
      default:
        return '📦';
    }
  };

  const getStatusBadge = (st?: string | null) => {
    const normalized =
      typeof st === 'string' && st.trim()
        ? st.trim().toLowerCase()
        : 'available';

    switch (normalized) {
      case 'borrowed':
        return { bg: '#FFEBEE', text: '#C62828', label: 'BORROWED' };
      case 'requested':
        return { bg: '#FFF8E1', text: '#F57F17', label: 'REQUESTED' };
      case 'unavailable':
        return { bg: '#ECEFF1', text: '#546E7A', label: 'UNAVAILABLE' };
      default:
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'AVAILABLE' };
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
          <Text style={styles.headerTitle}>My Listed Items</Text>
          <Text style={styles.headerSubtitle}>{items.length} Circular Assets</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/greenshare/create')}
          style={styles.newBtn}>
          <Text style={styles.newBtnText}>＋ Share</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#1976D2" />
        }>
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#1976D2" />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Listed Items</Text>
            <Text style={styles.emptySub}>
              Share extra lab manuals, study gear, or calculators with classmates and earn green points!
            </Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {items.map((item) => {
              const badge = getStatusBadge(item.status || item.availability_status);

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/greenshare/${item.id}`)}
                  style={({ pressed }) => [styles.itemCard, pressed && styles.pressed]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.typeWrap}>
                      <Text style={styles.cardEmoji}>{getEmoji(item.category)}</Text>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {item.description ? (
                    <Text style={styles.itemDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <Text style={styles.metaText}>
                      Condition: {item.condition?.replace('_', ' ') || 'Good'}
                    </Text>
                    <Text style={styles.metaText}>
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
  newBtn: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  listWrap: { gap: 12 },
  itemCard: {
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
  typeWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  cardEmoji: { fontSize: 20 },
  itemName: { fontSize: 15, fontWeight: '800', color: '#263238', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  itemDesc: { fontSize: 13, color: '#546E7A', lineHeight: 18 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 8,
  },
  metaText: { fontSize: 11, color: '#90A4AE' },
  pressed: { opacity: 0.8 },
  centerBox: { padding: 40, alignItems: 'center' },
  errorBox: { margin: 20, padding: 14, backgroundColor: '#FFEBEE', borderRadius: 12 },
  errorText: { color: '#C62828', textAlign: 'center', fontSize: 13 },
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
