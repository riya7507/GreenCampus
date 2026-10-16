import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

interface IssueItem {
  id: number;
  issue_type: string;
  description: string;
  location: string;
  image_url?: string;
  status: string;
  reported_by?: number;
  reporter_name?: string;
  assigned_to?: number;
  assignee_name?: string;
  estimated_water_saved?: number;
  estimated_energy_saved?: number;
  estimated_waste_reduced?: number;
  created_at: string;
  resolved_at?: string;
}

interface StaffMember {
  id: number;
  name: string;
  email: string;
}

export default function ResourceCareAdminScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Detail & Management Modal State
  const [activeIssue, setActiveIssue] = useState<IssueItem | null>(null);
  const [showManageModal, setShowManageModal] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('reported');
  const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null);
  const [resolutionComment, setResolutionComment] = useState<string>('');
  const [waterSaved, setWaterSaved] = useState<string>('0');
  const [energySaved, setEnergySaved] = useState<string>('0');
  const [wasteReduced, setWasteReduced] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user]);

  const fetchIssuesAndStaff = async () => {
    try {
      setError(null);
      const statusParam = selectedFilter === 'all' ? undefined : selectedFilter;
      const typeParam = selectedType === 'all' ? undefined : selectedType;
      const [issuesData, staffData] = await Promise.all([
        ApiService.getAllIssues(statusParam, typeParam),
        ApiService.getAdminStaff().catch(() => []),
      ]);
      setIssues(issuesData || []);
      setStaffList(staffData || []);
    } catch {
      setError('Unable to load ResourceCare reports. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssuesAndStaff();
  }, [selectedFilter, selectedType]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchIssuesAndStaff();
  };

  const openManageModal = (item: IssueItem) => {
    setActiveIssue(item);
    setNewStatus(item.status);
    setSelectedAssignee(item.assigned_to || null);
    setResolutionComment('');
    setWaterSaved(item.estimated_water_saved ? String(item.estimated_water_saved) : item.issue_type === 'water' ? '50' : '0');
    setEnergySaved(item.estimated_energy_saved ? String(item.estimated_energy_saved) : item.issue_type === 'electricity' ? '12' : '0');
    setWasteReduced(item.estimated_waste_reduced ? String(item.estimated_waste_reduced) : item.issue_type === 'waste' ? '5' : '0');
    setShowManageModal(true);
  };

  const handleSaveUpdate = async () => {
    if (!activeIssue) return;

    setIsSubmitting(true);
    try {
      await ApiService.updateIssueStatus(activeIssue.id, {
        status: newStatus,
        assigned_to: selectedAssignee !== null ? selectedAssignee : undefined,
        comment: resolutionComment.trim() || undefined,
        estimated_water_saved: newStatus === 'resolved' ? Number(waterSaved) || 0 : undefined,
        estimated_energy_saved: newStatus === 'resolved' ? Number(energySaved) || 0 : undefined,
        estimated_waste_reduced: newStatus === 'resolved' ? Number(wasteReduced) || 0 : undefined,
      });

      setShowManageModal(false);
      Alert.alert(
        'Report Updated! 🛠️',
        `Issue #${activeIssue.id} status is now ${newStatus.replace('_', ' ').toUpperCase()}.${
          newStatus === 'resolved' ? ' Estimated impact has been recorded and the reporter was notified.' : ''
        }`
      );
      fetchIssuesAndStaff();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update issue.');
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>ResourceCare Admin</Text>
          <Text style={styles.headerSubtitle}>Wastage Workflow & Resolution</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['all', 'reported', 'in_progress', 'resolved'].map((key) => (
            <Pressable
              key={key}
              onPress={() => setSelectedFilter(key)}
              style={[
                styles.filterPill,
                selectedFilter === key && styles.filterPillActive,
              ]}>
              <Text
                style={[
                  styles.filterPillText,
                  selectedFilter === key && styles.filterPillTextActive,
                ]}>
                {key === 'reported' ? 'PENDING' : key.replace('_', ' ').toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Category Filter */}
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
              {tKey === 'all' ? 'All Types' : `${getEmoji(tKey)} ${tKey[0].toUpperCase() + tKey.slice(1)}`}
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
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No Reports in this View</Text>
            <Text style={styles.emptySub}>
              All campus resource reports in this category are up to date!
            </Text>
          </View>
        ) : (
          <View style={styles.issuesList}>
            {issues.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => openManageModal(item)}
                  style={({ pressed }) => [styles.issueCard, pressed && styles.pressed]}>
                  <View style={styles.cardTop}>
                    <View style={styles.typeRow}>
                      <Text style={styles.typeEmoji}>{getEmoji(item.issue_type)}</Text>
                      <Text style={styles.typeText}>{item.issue_type.toUpperCase()}</Text>
                      <Text style={styles.idTag}>#{item.id}</Text>
                    </View>
                    <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.descText} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.cardMetaGrid}>
                    <Text style={styles.metaItem}>
                      📍 <Text style={styles.metaBold}>{item.location}</Text>
                    </Text>
                    <Text style={styles.metaItem}>
                      👤 Reporter: <Text style={styles.metaBold}>{item.reporter_name || 'Student'}</Text>
                    </Text>
                    <Text style={styles.metaItem}>
                      🛠️ Assigned: <Text style={styles.metaBold}>{item.assignee_name || 'Unassigned'}</Text>
                    </Text>
                    <Text style={styles.metaItem}>
                      📅 {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  {item.status === 'resolved' && (
                    <View style={styles.resolvedPill}>
                      <Text style={styles.resolvedPillText}>
                        🌱 Estimated Savings:{' '}
                        {item.estimated_water_saved ? `${item.estimated_water_saved}L water ` : ''}
                        {item.estimated_energy_saved ? `${item.estimated_energy_saved}kWh energy ` : ''}
                        {item.estimated_waste_reduced ? `${item.estimated_waste_reduced}kg waste` : ''}
                        {!item.estimated_water_saved && !item.estimated_energy_saved && !item.estimated_waste_reduced ? 'Standard resolution' : ''}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardActionRow}>
                    <Text style={styles.tapToManageText}>Tap to update status or assign →</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Admin Issue Management Modal */}
      <Modal visible={showManageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Manage Report #{activeIssue?.id}</Text>
                <Text style={styles.modalSub}>
                  {activeIssue?.issue_type.toUpperCase()} · {activeIssue?.location}
                </Text>
              </View>
              <Pressable onPress={() => setShowManageModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Photo preview if present */}
              {activeIssue?.image_url && (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: activeIssue.image_url }} style={styles.issueImage} resizeMode="cover" />
                </View>
              )}

              {/* Description */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>Reported Issue:</Text>
                <Text style={styles.modalDesc}>{activeIssue?.description}</Text>
                <Text style={styles.modalReporterText}>
                  Submitted by {activeIssue?.reporter_name || 'Student'} on{' '}
                  {activeIssue ? new Date(activeIssue.created_at).toLocaleString() : ''}
                </Text>
              </View>

              {/* Status Selector */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>Change Workflow Status:</Text>
                <View style={styles.statusButtonsRow}>
                  {['reported', 'in_progress', 'resolved'].map((st) => (
                    <Pressable
                      key={st}
                      onPress={() => setNewStatus(st)}
                      style={[
                        styles.statusSelectBtn,
                        newStatus === st && styles.statusSelectBtnActive,
                      ]}>
                      <Text
                        style={[
                          styles.statusSelectText,
                          newStatus === st && styles.statusSelectTextActive,
                        ]}>
                        {st === 'reported' ? 'REPORTED' : st.replace('_', ' ').toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Assignee Selector */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>Assign Responsibility:</Text>
                <View style={styles.assignRow}>
                  <Pressable
                    onPress={() => setSelectedAssignee(null)}
                    style={[
                      styles.assignChip,
                      selectedAssignee === null && styles.assignChipActive,
                    ]}>
                    <Text style={[styles.assignChipText, selectedAssignee === null && styles.assignChipTextActive]}>
                      Unassigned
                    </Text>
                  </Pressable>

                  {staffList.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => setSelectedAssignee(s.id)}
                      style={[
                        styles.assignChip,
                        selectedAssignee === s.id && styles.assignChipActive,
                      ]}>
                      <Text style={[styles.assignChipText, selectedAssignee === s.id && styles.assignChipTextActive]}>
                        {s.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Resolution Metrics (Only if marking resolved) */}
              {newStatus === 'resolved' && (
                <View style={styles.metricsBox}>
                  <Text style={styles.metricsTitle}>🌱 Record Estimated Savings</Text>
                  <Text style={styles.metricsSub}>
                    These estimated quantities update campus metrics and award resolution points to the student.
                  </Text>

                  <View style={styles.inputGroupRow}>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLbl}>Estimated Water Saved (L):</Text>
                      <TextInput
                        style={styles.metricInput}
                        keyboardType="numeric"
                        value={waterSaved}
                        onChangeText={setWaterSaved}
                      />
                    </View>

                    <View style={styles.inputCol}>
                      <Text style={styles.inputLbl}>Estimated Energy (kWh):</Text>
                      <TextInput
                        style={styles.metricInput}
                        keyboardType="numeric"
                        value={energySaved}
                        onChangeText={setEnergySaved}
                      />
                    </View>
                  </View>

                  <View style={styles.inputCol}>
                    <Text style={styles.inputLbl}>Estimated Waste Reduced (kg):</Text>
                    <TextInput
                      style={styles.metricInput}
                      keyboardType="numeric"
                      value={wasteReduced}
                      onChangeText={setWasteReduced}
                    />
                  </View>
                </View>
              )}

              {/* Resolution Comments */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>Resolution Notes / Staff Comment:</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="e.g., Plumber repaired the faucet seal in Block B. Valve tightened."
                  placeholderTextColor="#90A4AE"
                  value={resolutionComment}
                  onChangeText={setResolutionComment}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowManageModal(false)}
                style={styles.cancelModalBtn}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveUpdate}
                disabled={isSubmitting}
                style={styles.saveModalBtn}>
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveModalText}>Apply Status & Save</Text>
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
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#263238' },
  headerSubtitle: { fontSize: 11, color: '#78909C', fontWeight: '500' },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
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
  typePillActive: { borderColor: '#00897B', backgroundColor: '#E0F2F1' },
  typePillText: { fontSize: 11, fontWeight: '600', color: '#546E7A' },
  typePillTextActive: { color: '#00695C', fontWeight: '800' },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  issuesList: { gap: 12 },
  issueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeEmoji: { fontSize: 18 },
  typeText: { fontSize: 13, fontWeight: '800', color: '#263238' },
  idTag: { fontSize: 11, color: '#78909C', fontWeight: '700' },
  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  descText: { fontSize: 14, color: '#37474F', lineHeight: 20 },
  cardMetaGrid: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  metaItem: { fontSize: 11, color: '#607D8B' },
  metaBold: { fontWeight: '700', color: '#37474F' },
  resolvedPill: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 8,
  },
  resolvedPillText: { fontSize: 11, color: '#2E7D32', fontWeight: '700' },
  cardActionRow: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  tapToManageText: { fontSize: 11, color: '#1976D2', fontWeight: '700' },
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
  pressed: { opacity: 0.8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '90%',
    padding: 18,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#263238' },
  modalSub: { fontSize: 11, color: '#78909C', marginTop: 2 },
  closeBtn: { padding: 6 },
  closeBtnText: { fontSize: 16, color: '#78909C', fontWeight: 'bold' },
  modalBody: { gap: 14, paddingVertical: 4 },
  imagePreviewWrap: { borderRadius: 12, overflow: 'hidden', height: 160 },
  issueImage: { width: '100%', height: '100%' },
  modalSection: { gap: 6 },
  modalSectionLabel: { fontSize: 12, fontWeight: '700', color: '#37474F' },
  modalDesc: { fontSize: 13, color: '#263238', lineHeight: 18 },
  modalReporterText: { fontSize: 11, color: '#90A4AE', fontStyle: 'italic' },
  statusButtonsRow: { flexDirection: 'row', gap: 8 },
  statusSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  statusSelectBtnActive: { backgroundColor: '#2E7D32' },
  statusSelectText: { fontSize: 11, fontWeight: '700', color: '#546E7A' },
  statusSelectTextActive: { color: '#FFFFFF' },
  assignRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  assignChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  assignChipActive: { borderColor: '#1976D2', backgroundColor: '#E3F2FD' },
  assignChipText: { fontSize: 11, fontWeight: '600', color: '#546E7A' },
  assignChipTextActive: { color: '#1976D2', fontWeight: '800' },
  metricsBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  metricsTitle: { fontSize: 13, fontWeight: '800', color: '#1B5E20' },
  metricsSub: { fontSize: 10, color: '#388E3C', lineHeight: 14 },
  inputGroupRow: { flexDirection: 'row', gap: 10 },
  inputCol: { flex: 1, gap: 4 },
  inputLbl: { fontSize: 11, fontWeight: '600', color: '#2E7D32' },
  metricInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 70,
  },
  modalActions: { flexDirection: 'row', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ECEFF1' },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ECEFF1',
  },
  cancelModalText: { color: '#546E7A', fontWeight: '700' },
  saveModalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },
  saveModalText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
