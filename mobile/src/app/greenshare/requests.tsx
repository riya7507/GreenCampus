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
import { ApiService } from '@/services/api';

interface BorrowReq {
  id: number;
  item_id: number;
  borrower_id: number;
  status: string;
  message?: string;
  created_at: string;
  item_name?: string;
  borrower_name?: string;
}

interface BorrowTx {
  id: number;
  item_id: number;
  item_name?: string;
  borrower_id: number;
  borrower_name?: string;
  owner_id: number;
  owner_name?: string;
  status: string;
  borrowed_at: string;
  returned_at?: string;
}

export default function BorrowRequestsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'active'>('incoming');
  const [incoming, setIncoming] = useState<BorrowReq[]>([]);
  const [outgoing, setOutgoing] = useState<BorrowReq[]>([]);
  const [transactions, setTransactions] = useState<BorrowTx[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setError(null);
      const [inc, out, tx] = await Promise.all([
        ApiService.getReceivedBorrowRequests().catch(() => []),
        ApiService.getSentBorrowRequests().catch(() => []),
        ApiService.getMyTransactions().catch(() => []),
      ]);
      setIncoming(inc || []);
      setOutgoing(out || []);
      setTransactions(tx || []);
    } catch {
      setError('Unable to load borrow requests.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAll();
  };

  const handleRespond = async (requestId: number, action: 'approved' | 'rejected') => {
    try {
      await ApiService.respondBorrowRequest(requestId, action);
      Alert.alert(
        action === 'approved' ? 'Request Approved! 🤝' : 'Request Rejected',
        action === 'approved'
          ? 'You can now hand the item to the borrower. The item is locked as Borrowed.'
          : 'The request has been updated.'
      );
      fetchAll();
    } catch (err: any) {
      Alert.alert('Action Failed', err.message || 'Could not update request.');
    }
  };

  const handleReturnItem = async (transactionId: number) => {
    try {
      await ApiService.returnBorrowedItem(transactionId);
      Alert.alert('Item Returned! 🌱', 'The item is now available for other students.');
      fetchAll();
    } catch (err: any) {
      Alert.alert('Action Failed', err.message || 'Could not complete return.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'returned':
        return { bg: '#E8F5E9', text: '#2E7D32', label: status.toUpperCase() };
      case 'rejected':
        return { bg: '#FFEBEE', text: '#C62828', label: 'REJECTED' };
      default:
        return { bg: '#FFF8E1', text: '#F57F17', label: 'PENDING' };
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
        <Text style={styles.headerTitle}>Borrow Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab('incoming')}
          style={[styles.tabBtn, activeTab === 'incoming' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, activeTab === 'incoming' && styles.tabBtnTextActive]}>
            Incoming ({incoming.filter((r) => r.status === 'pending').length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('outgoing')}
          style={[styles.tabBtn, activeTab === 'outgoing' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, activeTab === 'outgoing' && styles.tabBtnTextActive]}>
            Sent ({outgoing.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('active')}
          style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, activeTab === 'active' && styles.tabBtnTextActive]}>
            Active Loans ({transactions.filter((t) => t.status === 'borrowed').length})
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
        ) : activeTab === 'incoming' ? (
          incoming.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📬</Text>
              <Text style={styles.emptyTitle}>No Incoming Requests</Text>
              <Text style={styles.emptySub}>
                When classmates want to borrow items you listed, requests will appear here for your approval.
              </Text>
            </View>
          ) : (
            <View style={styles.listWrap}>
              {incoming.map((req) => {
                const badge = getStatusBadge(req.status);
                const isPending = req.status === 'pending';

                return (
                  <View key={req.id} style={styles.requestCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.itemName}>Item: {req.item_name || `Item #${req.item_id}`}</Text>
                      <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    <Text style={styles.borrowerName}>
                      Requested by: {req.borrower_name || 'Classmate'}
                    </Text>

                    {req.message ? (
                      <View style={styles.messageBox}>
                        <Text style={styles.messageLabel}>Message:</Text>
                        <Text style={styles.messageText}>"{req.message}"</Text>
                      </View>
                    ) : null}

                    <Text style={styles.reqDate}>
                      {new Date(req.created_at).toLocaleString()}
                    </Text>

                    {isPending && (
                      <View style={styles.actionButtonsRow}>
                        <Pressable
                          onPress={() => handleRespond(req.id, 'rejected')}
                          style={styles.rejectBtn}>
                          <Text style={styles.rejectBtnText}>Decline</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => handleRespond(req.id, 'approved')}
                          style={styles.approveBtn}>
                          <Text style={styles.approveBtnText}>Approve Request</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )
        ) : activeTab === 'outgoing' ? (
          outgoing.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📤</Text>
              <Text style={styles.emptyTitle}>No Sent Requests</Text>
              <Text style={styles.emptySub}>
                Browse the GreenShare catalog and request items you need for labs, classes, or projects.
              </Text>
            </View>
          ) : (
            <View style={styles.listWrap}>
              {outgoing.map((req) => {
                const badge = getStatusBadge(req.status);

                return (
                  <View key={req.id} style={styles.requestCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.itemName}>{req.item_name || `Item #${req.item_id}`}</Text>
                      <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    {req.message ? (
                      <Text style={styles.sentMsg}>Your message: "{req.message}"</Text>
                    ) : null}

                    <Text style={styles.reqDate}>
                      Requested: {new Date(req.created_at).toLocaleString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          )
        ) : (
          /* Active Loans / Transactions */
          transactions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔄</Text>
              <Text style={styles.emptyTitle}>No Active Loans</Text>
              <Text style={styles.emptySub}>
                Approved borrow transactions in progress will show here with one-click return confirmation.
              </Text>
            </View>
          ) : (
            <View style={styles.listWrap}>
              {transactions.map((tx) => (
                <View key={tx.id} style={styles.requestCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.itemName}>{tx.item_name || `Item #${tx.item_id}`}</Text>
                    <View
                      style={[
                        styles.badgePill,
                        {
                          backgroundColor: tx.status === 'returned' ? '#E8F5E9' : '#E3F2FD',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.badgeText,
                          { color: tx.status === 'returned' ? '#2E7D32' : '#1976D2' },
                        ]}>
                        {tx.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.borrowerName}>
                    Borrower: {tx.borrower_name || 'Student'} | Owner: {tx.owner_name || 'Owner'}
                  </Text>

                  <Text style={styles.reqDate}>
                    Borrowed on: {new Date(tx.borrowed_at).toLocaleDateString()}
                  </Text>

                  {tx.status === 'borrowed' && (
                    <Pressable
                      onPress={() => handleReturnItem(tx.id)}
                      style={styles.returnBtn}>
                      <Text style={styles.returnBtnText}>Confirm Item Returned</Text>
                    </Pressable>
                  )}
                </View>
              ))}
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#263238' },
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
  tabBtnText: { fontSize: 12, fontWeight: '600', color: '#78909C' },
  tabBtnTextActive: { color: '#1976D2', fontWeight: '800' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  listWrap: { gap: 12 },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '800', color: '#263238', flex: 1, marginRight: 8 },
  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  borrowerName: { fontSize: 13, color: '#455A64', fontWeight: '600' },
  messageBox: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 10,
    gap: 2,
  },
  messageLabel: { fontSize: 11, fontWeight: '700', color: '#78909C' },
  messageText: { fontSize: 12, color: '#37474F', fontStyle: 'italic' },
  sentMsg: { fontSize: 12, color: '#546E7A', fontStyle: 'italic' },
  reqDate: { fontSize: 11, color: '#90A4AE' },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
  },
  rejectBtnText: { color: '#C62828', fontSize: 12, fontWeight: '800' },
  approveBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },
  approveBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  returnBtn: {
    backgroundColor: '#00897B',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  returnBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
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
