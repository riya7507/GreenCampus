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

interface AdminItem {
  id: number;
  name: string;
  description?: string;
  category: string;
  condition?: string;
  status: string;
  owner_id: number;
  owner_name: string;
  owner_email: string;
  created_at: string;
}

interface AdminBorrowRequest {
  id: number;
  item_id: number;
  item_name: string;
  requester_id: number;
  requester_name: string;
  requester_email: string;
  owner_id: number;
  owner_name: string;
  status: string;
  message?: string;
  requested_at: string;
  responded_at?: string;
}

interface AdminTransaction {
  id: number;
  item_id: number;
  item_name: string;
  borrower_id: number;
  borrower_name: string;
  owner_id: number;
  owner_name: string;
  status: string;
  borrowed_at: string;
  due_at?: string;
  returned_at?: string;
}

export default function GreenShareAdminScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'items' | 'requests' | 'transactions'>('items');
  const [items, setItems] = useState<AdminItem[]>([]);
  const [requests, setRequests] = useState<AdminBorrowRequest[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user]);

  const fetchGreenShareAdminData = async () => {
    try {
      setError(null);
      const [itData, reqData, txData] = await Promise.all([
        ApiService.getAdminGreenShareItems().catch(() => []),
        ApiService.getAdminGreenShareRequests().catch(() => []),
        ApiService.getAdminGreenShareTransactions().catch(() => []),
      ]);
      setItems(itData || []);
      setRequests(reqData || []);
      setTransactions(txData || []);
    } catch {
      setError('Unable to load circular sharing data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGreenShareAdminData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchGreenShareAdminData();
  };

  const getEmoji = (cat: string) => {
    switch (cat.toLowerCase()) {
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

  const getStatusBadge = (st: string) => {
    switch (st.toLowerCase()) {
      case 'borrowed':
      case 'rejected':
        return { bg: '#FFEBEE', text: '#C62828', label: st.toUpperCase() };
      case 'approved':
      case 'available':
      case 'returned':
        return { bg: '#E8F5E9', text: '#2E7D32', label: st.toUpperCase() };
      default:
        return { bg: '#FFF8E1', text: '#F57F17', label: st.toUpperCase() };
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
          <Text style={styles.headerTitle}>GreenShare Admin</Text>
          <Text style={styles.headerSubtitle}>Circular Reuse & Borrow Ledger</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab('items')}
          style={[styles.tabBtn, activeTab === 'items' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, activeTab === 'items' && styles.tabBtnTextActive]}>
            Catalog Items ({items.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('requests')}
          style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, activeTab === 'requests' && styles.tabBtnTextActive]}>
            Borrow Requests ({requests.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('transactions')}
          style={[styles.tabBtn, activeTab === 'transactions' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, activeTab === 'transactions' && styles.tabBtnTextActive]}>
            Loans ({transactions.length})
          </Text>
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
        ) : activeTab === 'items' ? (
          items.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Listed Items</Text>
              <Text style={styles.emptySub}>No campus items are currently listed in the GreenShare catalog.</Text>
            </View>
          ) : (
            <View style={styles.listWrap}>
              {items.map((it) => {
                const badge = getStatusBadge(it.status);

                return (
                  <View key={it.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={styles.itemTitleRow}>
                        <Text style={styles.categoryEmoji}>{getEmoji(it.category)}</Text>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {it.name}
                        </Text>
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    {it.description ? <Text style={styles.descText}>{it.description}</Text> : null}

                    <View style={styles.metaBox}>
                      <Text style={styles.metaLine}>
                        Category: <Text style={styles.bold}>{it.category.toUpperCase()}</Text> · Condition:{' '}
                        <Text style={styles.bold}>{it.condition?.replace('_', ' ').toUpperCase() || 'GOOD'}</Text>
                      </Text>
                      <Text style={styles.metaLine}>
                        Owner: <Text style={styles.bold}>{it.owner_name}</Text> ({it.owner_email})
                      </Text>
                      <Text style={styles.metaDate}>
                        Listed: {new Date(it.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        ) : activeTab === 'requests' ? (
          requests.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📬</Text>
              <Text style={styles.emptyTitle}>No Borrow Requests</Text>
              <Text style={styles.emptySub}>No peer-to-peer borrow requests are currently on record.</Text>
            </View>
          ) : (
            <View style={styles.listWrap}>
              {requests.map((r) => {
                const badge = getStatusBadge(r.status);

                return (
                  <View key={r.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.itemName}>Item: {r.item_name}</Text>
                      <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    <View style={styles.metaBox}>
                      <Text style={styles.metaLine}>
                        Borrower: <Text style={styles.bold}>{r.requester_name}</Text> ({r.requester_email})
                      </Text>
                      <Text style={styles.metaLine}>
                        Owner: <Text style={styles.bold}>{r.owner_name}</Text>
                      </Text>
                      {r.message ? (
                        <Text style={styles.quoteText}>"{r.message}"</Text>
                      ) : null}
                      <Text style={styles.metaDate}>
                        Requested on {new Date(r.requested_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        ) : (
          transactions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔄</Text>
              <Text style={styles.emptyTitle}>No Transactions Logged</Text>
              <Text style={styles.emptySub}>No active or completed borrow cycles in the database yet.</Text>
            </View>
          ) : (
            <View style={styles.listWrap}>
              {transactions.map((tx) => {
                const badge = getStatusBadge(tx.status);

                return (
                  <View key={tx.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.itemName}>Item: {tx.item_name}</Text>
                      <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    <View style={styles.metaBox}>
                      <Text style={styles.metaLine}>
                        Borrower: <Text style={styles.bold}>{tx.borrower_name}</Text>
                      </Text>
                      <Text style={styles.metaLine}>
                        Owner: <Text style={styles.bold}>{tx.owner_name}</Text>
                      </Text>
                      <Text style={styles.metaLine}>
                        Borrowed on: {new Date(tx.borrowed_at).toLocaleDateString()}
                        {tx.returned_at ? ` · Returned: ${new Date(tx.returned_at).toLocaleDateString()}` : ''}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    paddingHorizontal: Spacing.four,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: '#1976D2' },
  tabBtnText: { fontSize: 11, fontWeight: '600', color: '#78909C' },
  tabBtnTextActive: { color: '#1976D2', fontWeight: '800' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  listWrap: { gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 },
  categoryEmoji: { fontSize: 20 },
  itemName: { fontSize: 15, fontWeight: '800', color: '#263238', flex: 1 },
  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  descText: { fontSize: 13, color: '#455A64', lineHeight: 18 },
  metaBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    marginTop: 2,
  },
  metaLine: { fontSize: 11, color: '#607D8B' },
  bold: { color: '#37474F', fontWeight: '700' },
  quoteText: { fontSize: 11, color: '#1976D2', fontStyle: 'italic', marginVertical: 2 },
  metaDate: { fontSize: 10, color: '#90A4AE', marginTop: 2 },
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
