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

interface ImpactRecordItem {
  id: number;
  user_name?: string;
  issue_id?: number;
  issue_type?: string;
  water_saved: number;
  energy_saved: number;
  waste_reduced: number;
  recorded_at: string;
}

interface AdminImpactData {
  estimated_water_saved_litres: number;
  estimated_energy_saved_kwh: number;
  estimated_waste_reduced_kg: number;
  total_issues_resolved: number;
  total_items_shared: number;
  purchases_avoided: number;
  recent_records: ImpactRecordItem[];
}

export default function SustainabilityImpactAdminScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [impactData, setImpactData] = useState<AdminImpactData | null>(null);
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

  const fetchImpactData = async () => {
    try {
      setError(null);
      const data = await ApiService.getAdminImpact();
      setImpactData(data);
    } catch {
      setError('Unable to load sustainability impact audit data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchImpactData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchImpactData();
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
          <Text style={styles.headerTitle}>Sustainability Impact</Text>
          <Text style={styles.headerSubtitle}>Campus Ecological Accounting</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }>
        {/* Core Methodology Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            Environmental metrics below are calculated estimates derived from verified campus leak repairs, power cutoffs, and circular reuse cycles.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Primary Impact Grid */}
            <View style={styles.impactGrid}>
              <View style={[styles.impactCard, styles.cardTeal]}>
                <Text style={styles.impactIcon}>💧</Text>
                <Text style={styles.impactVal}>
                  {impactData?.estimated_water_saved_litres ?? 0} L
                </Text>
                <Text style={styles.impactLabel}>Estimated Water Saved</Text>
                <Text style={styles.impactSub}>From repaired campus fixtures</Text>
              </View>

              <View style={[styles.impactCard, styles.cardBlue]}>
                <Text style={styles.impactIcon}>⚡</Text>
                <Text style={styles.impactVal}>
                  {impactData?.estimated_energy_saved_kwh ?? 0} kWh
                </Text>
                <Text style={styles.impactLabel}>Estimated Energy Saved</Text>
                <Text style={styles.impactSub}>Avoided kilowatt-hours</Text>
              </View>

              <View style={[styles.impactCard, styles.cardGreen]}>
                <Text style={styles.impactIcon}>♻️</Text>
                <Text style={styles.impactVal}>
                  {impactData?.estimated_waste_reduced_kg ?? 0} kg
                </Text>
                <Text style={styles.impactLabel}>Estimated Waste Diverted</Text>
                <Text style={styles.impactSub}>Landfill avoidance</Text>
              </View>
            </View>

            {/* Circular Economy & Operational Summary */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Circular Economy & Operations</Text>
            </View>

            <View style={styles.operationsGrid}>
              <View style={styles.opCard}>
                <Text style={styles.opNumber}>{impactData?.total_issues_resolved ?? 0}</Text>
                <Text style={styles.opLabel}>Issues Resolved</Text>
              </View>

              <View style={styles.opCard}>
                <Text style={styles.opNumber}>{impactData?.total_items_shared ?? 0}</Text>
                <Text style={styles.opLabel}>Items Shared</Text>
              </View>

              <View style={styles.opCard}>
                <Text style={styles.opNumber}>{impactData?.purchases_avoided ?? 0}</Text>
                <Text style={styles.opLabel}>Purchases Avoided</Text>
              </View>
            </View>

            {/* UN Sustainable Development Goals Alignment */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>UN SDG Framework Alignment</Text>
              <Text style={styles.sectionSub}>Supporting international sustainability goals</Text>
            </View>

            <View style={styles.sdgGrid}>
              <View style={styles.sdgItem}>
                <View style={[styles.sdgPill, { backgroundColor: '#26BDE2' }]}>
                  <Text style={styles.sdgPillText}>SDG 6</Text>
                </View>
                <View style={styles.sdgContent}>
                  <Text style={styles.sdgTitle}>Clean Water & Sanitation</Text>
                  <Text style={styles.sdgDesc}>ResourceCare water leak audits and rapid plumbing repair.</Text>
                </View>
              </View>

              <View style={styles.sdgItem}>
                <View style={[styles.sdgPill, { backgroundColor: '#FCC30B' }]}>
                  <Text style={styles.sdgPillText}>SDG 7</Text>
                </View>
                <View style={styles.sdgContent}>
                  <Text style={styles.sdgTitle}>Affordable & Clean Energy</Text>
                  <Text style={styles.sdgDesc}>Eliminating running lights, AC units, and lab power drain.</Text>
                </View>
              </View>

              <View style={styles.sdgItem}>
                <View style={[styles.sdgPill, { backgroundColor: '#FD9D24' }]}>
                  <Text style={styles.sdgPillText}>SDG 11</Text>
                </View>
                <View style={styles.sdgContent}>
                  <Text style={styles.sdgTitle}>Sustainable Campus Communities</Text>
                  <Text style={styles.sdgDesc}>Community-wide resource stewardship and transparent tracking.</Text>
                </View>
              </View>

              <View style={styles.sdgItem}>
                <View style={[styles.sdgPill, { backgroundColor: '#BF8B2E' }]}>
                  <Text style={styles.sdgPillText}>SDG 12</Text>
                </View>
                <View style={styles.sdgContent}>
                  <Text style={styles.sdgTitle}>Responsible Consumption</Text>
                  <Text style={styles.sdgDesc}>GreenShare circular asset borrowing replacing single purchases.</Text>
                </View>
              </View>

              <View style={styles.sdgItem}>
                <View style={[styles.sdgPill, { backgroundColor: '#3F7E44' }]}>
                  <Text style={styles.sdgPillText}>SDG 13</Text>
                </View>
                <View style={styles.sdgContent}>
                  <Text style={styles.sdgTitle}>Climate Action</Text>
                  <Text style={styles.sdgDesc}>Direct footprint reduction through collective student action.</Text>
                </View>
              </View>
            </View>

            {/* Recent Impact Records Audit Log */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Impact Audit Ledger</Text>
              <Text style={styles.sectionSub}>Recent entries in impact_records table</Text>
            </View>

            {impactData?.recent_records && impactData.recent_records.length > 0 ? (
              <View style={styles.recordsList}>
                {impactData.recent_records.map((r) => (
                  <View key={r.id} style={styles.recordItem}>
                    <View style={styles.recordLeft}>
                      <Text style={styles.recordTitle}>
                        {r.issue_type ? `${r.issue_type.toUpperCase()} Resolution` : `Impact Record #${r.id}`}
                      </Text>
                      <Text style={styles.recordUser}>
                        Recorded for {r.user_name || 'Student'}
                      </Text>
                      <Text style={styles.recordDate}>
                        {new Date(r.recorded_at).toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.recordSavings}>
                      {r.water_saved > 0 && (
                        <Text style={styles.savingTeal}>+{r.water_saved}L water</Text>
                      )}
                      {r.energy_saved > 0 && (
                        <Text style={styles.savingBlue}>+{r.energy_saved}kWh</Text>
                      )}
                      {r.waste_reduced > 0 && (
                        <Text style={styles.savingGreen}>+{r.waste_reduced}kg</Text>
                      )}
                      {r.water_saved === 0 && r.energy_saved === 0 && r.waste_reduced === 0 && (
                        <Text style={styles.savingNeutral}>Logged</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🌱</Text>
                <Text style={styles.emptyTitle}>No impact data available yet</Text>
                <Text style={styles.emptySub}>
                  Once administrators resolve ResourceCare reports and log estimated quantities, they appear here.
                </Text>
              </View>
            )}
          </>
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.three,
  },
  noticeCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  noticeIcon: { fontSize: 18 },
  noticeText: { fontSize: 11, color: '#2E7D32', flex: 1, lineHeight: 15, fontWeight: '600' },
  impactGrid: { gap: 10 },
  impactCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  cardTeal: { backgroundColor: '#E0F2F1', borderColor: '#B2DFDB' },
  cardBlue: { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' },
  cardGreen: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  impactIcon: { fontSize: 24 },
  impactVal: { fontSize: 26, fontWeight: '800', color: '#263238' },
  impactLabel: { fontSize: 13, fontWeight: '700', color: '#37474F' },
  impactSub: { fontSize: 11, color: '#78909C' },
  sectionHeader: { marginTop: Spacing.one },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#263238' },
  sectionSub: { fontSize: 11, color: '#78909C', fontWeight: '500' },
  operationsGrid: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  opCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    alignItems: 'center',
    gap: 4,
  },
  opNumber: { fontSize: 20, fontWeight: '800', color: '#263238' },
  opLabel: { fontSize: 10, color: '#546E7A', fontWeight: '700', textAlign: 'center' },
  sdgGrid: { gap: 10 },
  sdgItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 12,
    alignItems: 'center',
  },
  sdgPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 54,
    alignItems: 'center',
  },
  sdgPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  sdgContent: { flex: 1 },
  sdgTitle: { fontSize: 13, fontWeight: '700', color: '#263238' },
  sdgDesc: { fontSize: 11, color: '#78909C', marginTop: 2 },
  recordsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    overflow: 'hidden',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  recordLeft: { flex: 1, paddingRight: 8 },
  recordTitle: { fontSize: 13, fontWeight: '800', color: '#263238' },
  recordUser: { fontSize: 11, color: '#546E7A', marginTop: 1 },
  recordDate: { fontSize: 10, color: '#90A4AE', marginTop: 2 },
  recordSavings: { alignItems: 'flex-end', gap: 2 },
  savingTeal: { fontSize: 11, fontWeight: '800', color: '#00897B' },
  savingBlue: { fontSize: 11, fontWeight: '800', color: '#1976D2' },
  savingGreen: { fontSize: 11, fontWeight: '800', color: '#2E7D32' },
  savingNeutral: { fontSize: 11, color: '#90A4AE' },
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
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#263238' },
  emptySub: { fontSize: 12, color: '#78909C', textAlign: 'center', lineHeight: 18 },
});
