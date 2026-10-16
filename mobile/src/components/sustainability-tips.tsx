import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export interface EcoTip {
  id: string;
  title: string;
  tip: string;
  category: 'water' | 'energy' | 'waste' | 'greenshare';
  impact: string;
  sdg?: string;
}

const CURATED_TIPS: EcoTip[] = [
  {
    id: 'tip-1',
    title: 'Report Dripping Faucets',
    tip: 'A single dripping tap in campus restrooms can waste over 15–20 liters of water daily. Report it on ResourceCare to get it repaired swiftly!',
    category: 'water',
    impact: 'Estimated ~15L water saved/day',
    sdg: 'SDG 6',
  },
  {
    id: 'tip-2',
    title: 'Vampire Power Cutoff',
    tip: 'Lab computer monitors, chargers, and empty study hall consoles draw standby energy even when idle. Switch off multi-plugs when departing.',
    category: 'energy',
    impact: 'Estimated ~0.8 kWh conserved',
    sdg: 'SDG 7',
  },
  {
    id: 'tip-3',
    title: 'Borrow Before You Buy',
    tip: 'Need a scientific calculator, lab coat, or semester book? Request it from a peer on GreenShare instead of purchasing a single-use replacement.',
    category: 'greenshare',
    impact: 'Avoids ~3.5 kg embedded CO2e',
    sdg: 'SDG 12',
  },
  {
    id: 'tip-4',
    title: 'Rinse Before Recycling',
    tip: 'Food residue in plastic drink containers can contaminate entire recycling batches. Give them a quick rinse at the wash station!',
    category: 'waste',
    impact: 'Prevents batch contamination',
    sdg: 'SDG 12',
  },
  {
    id: 'tip-5',
    title: 'Stairs Over Elevators',
    tip: 'Taking the stairs for trips under 3 floors cuts building lift motor electricity demand and promotes fitness between classes.',
    category: 'energy',
    impact: 'Estimated ~0.2 kWh saved/trip',
    sdg: 'SDG 11',
  },
  {
    id: 'tip-6',
    title: 'Campus Refill Stations',
    tip: 'Carrying a durable bottle and using filtered campus water fountains eliminates single-use plastic bottles and saves personal expenses.',
    category: 'water',
    impact: 'Saves 1 plastic bottle per refill',
    sdg: 'SDG 6',
  },
];

export function SustainabilityTips() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPledged, setIsPledged] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(1);

  useEffect(() => {
    // Determine daily tip from day of the year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setCurrentIndex(dayOfYear % CURATED_TIPS.length);
  }, []);

  const currentTip = CURATED_TIPS[currentIndex] || CURATED_TIPS[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CURATED_TIPS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CURATED_TIPS.length) % CURATED_TIPS.length);
  };

  const handlePledge = () => {
    if (!isPledged) {
      setIsPledged(true);
      setStreakCount((prev) => prev + 1);
    }
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'water':
        return { bg: '#E0F2F1', text: '#00695C', icon: '💧', label: 'Water Care' };
      case 'energy':
        return { bg: '#E3F2FD', text: '#1565C0', icon: '⚡', label: 'Clean Energy' };
      case 'waste':
        return { bg: '#E8F5E9', text: '#2E7D32', icon: '♻️', label: 'Zero Waste' };
      case 'greenshare':
        return { bg: '#FFF8E1', text: '#F57F17', icon: '🤝', label: 'GreenShare' };
      default:
        return { bg: '#E8F5E9', text: '#2E7D32', icon: '🌱', label: 'Campus Eco' };
    }
  };

  const theme = getCategoryTheme(currentTip.category);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.sparkleIcon}>✨</Text>
          <View>
            <Text style={styles.titleText}>Daily Sustainability Tip</Text>
            <Text style={styles.subText}>Everyday campus eco actions</Text>
          </View>
        </View>

        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streakCount}d</Text>
        </View>
      </View>

      {/* Tip Content */}
      <View style={styles.contentBox}>
        <View style={styles.tagRow}>
          <View style={[styles.categoryTag, { backgroundColor: theme.bg }]}>
            <Text style={[styles.categoryText, { color: theme.text }]}>
              {theme.icon} {theme.label}
            </Text>
          </View>

          {currentTip.sdg && (
            <View style={styles.sdgTag}>
              <Text style={styles.sdgText}>{currentTip.sdg}</Text>
            </View>
          )}
        </View>

        <Text style={styles.tipTitle}>{currentTip.title}</Text>
        <Text style={styles.tipBody}>"{currentTip.tip}"</Text>

        <View style={styles.impactRow}>
          <View style={styles.impactDot} />
          <Text style={styles.impactText}>{currentTip.impact}</Text>
        </View>
      </View>

      {/* Footer Controls */}
      <View style={styles.footerRow}>
        <View style={styles.navRow}>
          <Pressable onPress={handlePrev} style={styles.navBtn}>
            <Text style={styles.navBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {CURATED_TIPS.length}
          </Text>
          <Pressable onPress={handleNext} style={styles.navBtn}>
            <Text style={styles.navBtnText}>›</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handlePledge}
          disabled={isPledged}
          style={[styles.pledgeBtn, isPledged && styles.pledgeBtnDone]}>
          <Text style={[styles.pledgeBtnText, isPledged && styles.pledgeBtnTextDone]}>
            {isPledged ? '✓ Pledged Today' : "🌱 I'll do this today"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    padding: 14,
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleIcon: {
    fontSize: 16,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#263238',
  },
  subText: {
    fontSize: 10,
    color: '#78909C',
    fontWeight: '500',
  },
  streakBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  streakText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F57F17',
  },
  contentBox: {
    backgroundColor: '#F8FAF8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    padding: 12,
    gap: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sdgTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sdgText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#78909C',
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#263238',
    marginTop: 2,
  },
  tipBody: {
    fontSize: 11,
    color: '#455A64',
    lineHeight: 16,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00897B',
  },
  impactText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00695C',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontSize: 16,
    color: '#546E7A',
    fontWeight: 'bold',
    lineHeight: 18,
  },
  counterText: {
    fontSize: 10,
    color: '#78909C',
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  pledgeBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pledgeBtnDone: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  pledgeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pledgeBtnTextDone: {
    color: '#2E7D32',
  },
});

export default SustainabilityTips;
