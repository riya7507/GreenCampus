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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiService } from '@/services/api';

interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  green_points: number;
  reported_issues_count: number;
  items_listed_count: number;
}

export default function UsersAdminScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [search, setSearch] = useState<string>('');
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

  const fetchUsers = async () => {
    try {
      setError(null);
      const data = await ApiService.getAdminUsers(roleFilter, search);
      setUsers(data || []);
    } catch {
      setError('Unable to load user directory.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleToggleRole = (targetUser: AdminUser) => {
    const isCurrentlyAdmin = targetUser.role === 'admin';
    const targetRole = isCurrentlyAdmin ? 'student' : 'admin';

    Alert.alert(
      isCurrentlyAdmin ? 'Demote to Student?' : 'Promote to Administrator?',
      `Are you sure you want to change ${targetUser.full_name}'s role to ${targetRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isCurrentlyAdmin ? 'Demote' : 'Promote',
          style: isCurrentlyAdmin ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await ApiService.updateUserRole(targetUser.id, targetRole);
              Alert.alert('Role Updated', `${targetUser.full_name} is now a ${targetRole}.`);
              fetchUsers();
            } catch (err: any) {
              Alert.alert('Operation Failed', err.message || 'Could not update user role.');
            }
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Campus Directory & Privileges</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by student name or email..."
          placeholderTextColor="#90A4AE"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchUsers}
          returnKeyType="search"
        />
        {search ? (
          <Pressable
            onPress={() => {
              setSearch('');
              fetchUsers();
            }}
            style={styles.searchClearBtn}>
            <Text style={styles.searchClearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'student', 'admin'] as const).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRoleFilter(r)}
            style={[styles.filterBtn, roleFilter === r && styles.filterBtnActive]}>
            <Text style={[styles.filterBtnText, roleFilter === r && styles.filterBtnTextActive]}>
              {r === 'all' ? 'All Accounts' : r === 'student' ? 'Students' : 'Administrators'}
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
        ) : users.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No Users Found</Text>
            <Text style={styles.emptySub}>No campus accounts matched your search criteria.</Text>
          </View>
        ) : (
          <View style={styles.userList}>
            {users.map((u) => {
              const isAdmin = u.role === 'admin';
              const isCurrentUser = user && user.id === u.id;

              return (
                <View key={u.id} style={styles.userCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.avatarWrap}>
                      <View style={[styles.avatarCircle, isAdmin ? styles.avatarAdmin : styles.avatarStudent]}>
                        <Text style={styles.avatarLetter}>
                          {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                        </Text>
                      </View>
                      <View style={styles.nameWrap}>
                        <View style={styles.userNameRow}>
                          <Text style={styles.userName}>{u.full_name}</Text>
                          {isCurrentUser && (
                            <View style={styles.youBadge}>
                              <Text style={styles.youBadgeText}>YOU</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.userEmail}>{u.email}</Text>
                      </View>
                    </View>

                    <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeStudent]}>
                      <Text style={[styles.roleBadgeText, isAdmin ? styles.roleTextAdmin : styles.roleTextStudent]}>
                        {u.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Activity Stats */}
                  <View style={styles.statsStrip}>
                    <View style={styles.statCol}>
                      <Text style={styles.statVal}>{u.green_points}</Text>
                      <Text style={styles.statLbl}>Points</Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={styles.statVal}>{u.reported_issues_count}</Text>
                      <Text style={styles.statLbl}>Reports</Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={styles.statVal}>{u.items_listed_count}</Text>
                      <Text style={styles.statLbl}>Items Shared</Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={styles.statVal}>{new Date(u.created_at).toLocaleDateString()}</Text>
                      <Text style={styles.statLbl}>Joined</Text>
                    </View>
                  </View>

                  {/* Role Change Action Button */}
                  <View style={styles.actionRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleToggleRole(u)}
                      style={styles.roleActionBtn}>
                      <Text style={styles.roleActionText}>
                        {isAdmin ? 'Change to Student Role' : 'Promote to Admin Role'}
                      </Text>
                    </Pressable>
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
  searchWrap: { paddingHorizontal: Spacing.four, paddingTop: 10, position: 'relative' },
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
  searchClearBtn: { position: 'absolute', right: 28, top: 20, padding: 4 },
  searchClearText: { color: '#90A4AE', fontSize: 12, fontWeight: 'bold' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  filterBtnActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  filterBtnText: { fontSize: 11, fontWeight: '700', color: '#546E7A' },
  filterBtnTextActive: { color: '#FFFFFF' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  userList: { gap: 12 },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAdmin: { backgroundColor: '#2E7D32' },
  avatarStudent: { backgroundColor: '#00897B' },
  avatarLetter: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  nameWrap: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 14, fontWeight: '800', color: '#263238' },
  youBadge: { backgroundColor: '#2E7D32', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  youBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800' },
  userEmail: { fontSize: 11, color: '#78909C', marginTop: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  roleBadgeAdmin: { backgroundColor: '#E8F5E9' },
  roleBadgeStudent: { backgroundColor: '#E0F2F1' },
  roleTextAdmin: { color: '#2E7D32', fontSize: 10, fontWeight: '800' },
  roleTextStudent: { color: '#00695C', fontSize: 10, fontWeight: '800' },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-around',
  },
  statCol: { alignItems: 'center', gap: 2 },
  statVal: { fontSize: 12, fontWeight: '800', color: '#263238' },
  statLbl: { fontSize: 9, color: '#78909C', fontWeight: '600' },
  actionRow: { borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 8, alignItems: 'flex-end' },
  roleActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F8E9',
  },
  roleActionText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },
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
