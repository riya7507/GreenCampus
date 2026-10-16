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

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const data = await ApiService.getNotifications();
      setNotifications(data || []);
    } catch {
      setError('Unable to load notifications. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await ApiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
    } catch {
      // Ignore transient errors
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch {
      // Ignore transient errors
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'points':
        return '🌱';
      case 'issue':
        return '💧';
      case 'borrow':
        return '📦';
      case 'badge':
        return '🎖️';
      default:
        return '🔔';
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </Text>
        </View>
        {unreadCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleMarkAllAsRead}
            style={styles.readAllBtn}>
            <Text style={styles.readAllBtnText}>Read All</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
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
        ) : notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>
              You will receive updates here when you earn points, unlock badges, or when items and reports are updated.
            </Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {notifications.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => !item.is_read && handleMarkAsRead(item.id)}
                style={({ pressed }) => [
                  styles.notifCard,
                  !item.is_read && styles.notifCardUnread,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>{getTypeIcon(item.notification_type)}</Text>
                </View>

                <View style={styles.notifBody}>
                  <View style={styles.notifTopRow}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMessage}>{item.message}</Text>
                  <Text style={styles.notifTime}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              </Pressable>
            ))}
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
  readAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  readAllBtnText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  listWrap: { gap: 10 },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 12,
    alignItems: 'flex-start',
  },
  notifCardUnread: {
    backgroundColor: '#F1F8E9',
    borderColor: '#C8E6C9',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  iconEmoji: { fontSize: 20 },
  notifBody: { flex: 1 },
  notifTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#263238', flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginLeft: 6,
  },
  notifMessage: { fontSize: 13, color: '#546E7A', marginTop: 3, lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#90A4AE', marginTop: 6, fontWeight: '500' },
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
