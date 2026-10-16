import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { useAuth } from '@/contexts/auth-context';
import { ApiService } from '@/services/api';

interface ItemDetail {
  id: number;
  name: string;
  description?: string;
  category: string;
  condition?: string;
  availability_status?: string;
  status?: string;
  owner_id: number;
  owner_name?: string;
  created_at: string;
}

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Borrow Modal State
  const [showBorrowModal, setShowBorrowModal] = useState<boolean>(false);
  const [borrowMessage, setBorrowMessage] = useState<string>('');
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const itemId = Number(id);

  const fetchItem = async () => {
    if (!itemId) return;
    try {
      setError(null);
      const data = await ApiService.getItemById(itemId);
      setItem(data);
    } catch {
      setError('Unable to load item details.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchItem();
  };

  const handleSendBorrowRequest = async () => {
    setIsRequesting(true);
    try {
      await ApiService.requestBorrow(itemId, borrowMessage.trim() || undefined);
      setShowBorrowModal(false);
      setBorrowMessage('');
      Alert.alert(
        'Borrow Request Sent! 📬',
        'The owner has been notified. Check the Requests tab to track when they approve.',
        [
          {
            text: 'View Requests',
            onPress: () => router.push('/greenshare/requests'),
          },
          {
            text: 'OK',
            onPress: () => fetchItem(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Request Failed', err.message || 'Could not send borrow request.');
    } finally {
      setIsRequesting(false);
    }
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
        return { bg: '#FFEBEE', text: '#C62828', label: 'CURRENTLY BORROWED' };
      case 'requested':
        return { bg: '#FFF8E1', text: '#F57F17', label: 'BORROW PENDING' };
      default:
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'AVAILABLE TO BORROW' };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Item Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error || 'Item not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user && user.id === item.owner_id;
  const rawStatus = item.status || item.availability_status || 'available';
  const isAvailable = rawStatus.toLowerCase() === 'available';
  const badge = getStatusBadge(rawStatus);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Item Overview</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#1976D2" />
        }>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.topRow}>
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.category)}</Text>
            <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
            </View>
          </View>

          <Text style={styles.itemName}>{item.name}</Text>

          {item.description ? (
            <Text style={styles.itemDesc}>{item.description}</Text>
          ) : (
            <Text style={styles.noDesc}>No extra details provided by owner.</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>{item.category?.toUpperCase()}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Condition:</Text>
            <Text style={styles.metaValue}>
              {item.condition?.replace('_', ' ')?.toUpperCase() || 'GOOD'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Owner:</Text>
            <Text style={styles.metaValue}>
              {item.owner_name || 'Campus Student'} {isOwner ? '(You)' : ''}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Listed on:</Text>
            <Text style={styles.metaValue}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Action Button */}
        {isOwner ? (
          <View style={styles.ownerNotice}>
            <Text style={styles.ownerNoticeIcon}>ℹ️</Text>
            <Text style={styles.ownerNoticeText}>
              You listed this item. Manage incoming borrow requests from the Requests tab.
            </Text>
          </View>
        ) : isAvailable ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowBorrowModal(true)}
            style={({ pressed }) => [styles.borrowButton, pressed && styles.pressed]}>
            <Text style={styles.borrowButtonText}>Request to Borrow</Text>
          </Pressable>
        ) : (
          <View style={styles.unavailableNotice}>
            <Text style={styles.unavailableText}>
              This item is currently {item.status}. Check back later or browse other catalog items.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Borrow Request Modal */}
      <Modal visible={showBorrowModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Borrow Request</Text>
            <Text style={styles.modalSubtitle}>
              Requesting <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            </Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Message to Owner (Optional):</Text>
              <TextInput
                style={styles.modalTextArea}
                placeholder="e.g., Hi! Can I borrow this until Friday for midterms? I can pick it up at the library."
                placeholderTextColor="#90A4AE"
                value={borrowMessage}
                onChangeText={setBorrowMessage}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowBorrowModal(false)}
                style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSendBorrowRequest}
                disabled={isRequesting}
                style={styles.modalSubmitBtn}>
                {isRequesting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Send Request</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.three,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 12,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryEmoji: { fontSize: 28 },
  badgePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  itemName: { fontSize: 18, fontWeight: '800', color: '#263238' },
  itemDesc: { fontSize: 14, color: '#455A64', lineHeight: 20 },
  noDesc: { fontSize: 13, color: '#90A4AE', fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#ECEFF1' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 12, fontWeight: '700', color: '#78909C' },
  metaValue: { fontSize: 12, fontWeight: '700', color: '#263238' },
  borrowButton: {
    backgroundColor: '#1976D2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borrowButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  ownerNotice: {
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ownerNoticeIcon: { fontSize: 20 },
  ownerNoticeText: { color: '#1565C0', fontSize: 12, flex: 1, fontWeight: '600' },
  unavailableNotice: {
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 14,
  },
  unavailableText: { color: '#F57F17', fontSize: 12, textAlign: 'center', fontWeight: '600' },
  centerBox: { padding: 40, alignItems: 'center' },
  errorBox: { margin: 20, padding: 14, backgroundColor: '#FFEBEE', borderRadius: 12 },
  errorText: { color: '#C62828', textAlign: 'center', fontSize: 13 },
  pressed: { opacity: 0.8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#263238' },
  modalSubtitle: { fontSize: 13, color: '#546E7A' },
  modalField: { gap: 6 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: '#37474F' },
  modalTextArea: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ECEFF1',
  },
  modalCancelText: { color: '#546E7A', fontWeight: '700' },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#1976D2',
  },
  modalSubmitText: { color: '#FFFFFF', fontWeight: '700' },
});
