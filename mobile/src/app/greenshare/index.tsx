import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  owner_name?: string;
  created_at: string;
}

export default function GreenShareCatalogScreen() {
  const router = useRouter();

  const [items, setItems] = useState<ItemEntry[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const CATEGORIES = ['All', 'Books', 'Electronics', 'Lab Gear', 'Sports', 'Misc'];

  const fetchItems = async () => {
    try {
      setError(null);
      const catParam = category === 'All' ? undefined : category.toLowerCase().replace(' ', '_');
      const data = await ApiService.getCatalogItems(catParam, search.trim() || undefined);
      setItems(data || []);
    } catch {
      setError('Unable to load circular economy catalog.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchItems();
  };

  const handleSearchSubmit = () => {
    fetchItems();
  };

  const getCategoryEmoji = (cat?: string) => {
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
        return { bg: '#FFF8E1', text: '#F57F17', label: 'PENDING' };
      case 'unavailable':
        return { bg: '#ECEFF1', text: '#546E7A', label: 'UNAVAILABLE' };
      default:
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'AVAILABLE' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>GreenShare</Text>
          <Text style={styles.headerSubtitle}>Peer-to-Peer Sharing</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/greenshare/requests')}
            style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Requests</Text>
          </Pressable>
        </View>
      </View>

      {/* Action Strip: Add Item + My Items */}
      <View style={styles.topActionsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/greenshare/create')}
          style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}>
          <Text style={styles.createBtnIcon}>＋</Text>
          <Text style={styles.createBtnText}>Share Item (+15 PTS)</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/greenshare/my-items')}
          style={styles.myItemsBtn}>
          <Text style={styles.myItemsBtnText}>My Items</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items by keyword..."
          placeholderTextColor="#90A4AE"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {search ? (
          <Pressable
            onPress={() => {
              setSearch('');
              fetchItems();
            }}
            style={styles.searchClearBtn}>
            <Text style={styles.searchClearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Category Horizontal Filter Bar */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryPill,
                category === cat && styles.categoryPillActive,
              ]}>
              <Text
                style={[
                  styles.categoryPillText,
                  category === cat && styles.categoryPillTextActive,
                ]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
        ) : items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🤝</Text>
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptySub}>
              Be the first to list a textbook, calculator, lab coat, or tools for your campus peers!
            </Text>
          </View>
        ) : (
          <View style={styles.itemsGrid}>
            {items.map((item) => {
              const badge = getStatusBadge(item.status || item.availability_status);

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/greenshare/${item.id}`)}
                  style={({ pressed }) => [styles.itemCard, pressed && styles.pressed]}>
                  <View style={styles.cardTop}>
                    <Text style={styles.categoryIcon}>{getCategoryEmoji(item.category)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {item.description ? (
                    <Text style={styles.itemDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.cardBottom}>
                    <Text style={styles.conditionText}>
                      Condition: {item.condition?.replace('_', ' ') || 'Good'}
                    </Text>
                    <Text style={styles.ownerText} numberOfLines={1}>
                      Owner: {item.owner_name || 'Student'}
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
  headerActions: { flexDirection: 'row', gap: 6 },
  headerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  headerBtnText: { color: '#1976D2', fontSize: 11, fontWeight: '700' },
  topActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: 10,
  },
  createBtn: {
    flex: 1,
    backgroundColor: '#1976D2',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  createBtnIcon: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  createBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  myItemsBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  myItemsBtnText: { color: '#37474F', fontSize: 12, fontWeight: '700' },
  searchBarWrap: {
    paddingHorizontal: Spacing.four,
    paddingTop: 10,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#263238',
  },
  searchClearBtn: {
    position: 'absolute',
    right: 28,
    top: 20,
    padding: 4,
  },
  searchClearText: { color: '#90A4AE', fontSize: 12, fontWeight: 'bold' },
  categoryBar: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  categoryScroll: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  categoryPillActive: { backgroundColor: '#1976D2' },
  categoryPillText: { fontSize: 12, fontWeight: '700', color: '#546E7A' },
  categoryPillTextActive: { color: '#FFFFFF' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  itemsGrid: { gap: 12 },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryIcon: { fontSize: 24 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  itemName: { fontSize: 15, fontWeight: '800', color: '#263238' },
  itemDesc: { fontSize: 12, color: '#546E7A', lineHeight: 17 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 8,
    marginTop: 2,
  },
  conditionText: { fontSize: 11, color: '#78909C', textTransform: 'capitalize' },
  ownerText: { fontSize: 11, color: '#1976D2', fontWeight: '600', maxWidth: '50%' },
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
