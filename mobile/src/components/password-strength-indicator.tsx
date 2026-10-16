import { StyleSheet, Text, View } from 'react-native';

import {
  evaluatePasswordStrength,
  PasswordRequirements,
} from '@/utils/password';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const result = evaluatePasswordStrength(password);
  const reqs: PasswordRequirements = result.requirements;

  // Don't clutter the UI if user hasn't typed anything yet
  const hasStartedTyping = password.length > 0;

  return (
    <View style={styles.container}>
      {/* Strength Header & Live Label */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Password Strength</Text>
        {hasStartedTyping && (
          <View style={[styles.badge, { backgroundColor: result.color + '1A' }]}>
            <Text style={[styles.badgeText, { color: result.color }]}>
              {result.label}
            </Text>
          </View>
        )}
      </View>

      {/* Horizontal Multi-Segment Strength Bar */}
      <View style={styles.meterTrack}>
        <View
          style={[
            styles.segment,
            {
              backgroundColor:
                result.score >= 1 ? result.color : '#ECEFF1',
            },
          ]}
        />
        <View
          style={[
            styles.segment,
            {
              backgroundColor:
                result.score >= 2 ? result.color : '#ECEFF1',
            },
          ]}
        />
        <View
          style={[
            styles.segment,
            {
              backgroundColor:
                result.score >= 3 ? result.color : '#ECEFF1',
            },
          ]}
        />
        <View
          style={[
            styles.segment,
            {
              backgroundColor:
                result.score >= 4 ? result.color : '#ECEFF1',
            },
          ]}
        />
      </View>

      {/* Requirements Checklist */}
      <View style={styles.checklistContainer}>
        <Text style={styles.checklistTitle}>Password requirements:</Text>

        <ChecklistItem
          label="At least 8 characters"
          isMet={reqs.minLength}
        />
        <ChecklistItem
          label="Uppercase letter (A-Z)"
          isMet={reqs.hasUppercase}
        />
        <ChecklistItem
          label="Lowercase letter (a-z)"
          isMet={reqs.hasLowercase}
        />
        <ChecklistItem
          label="Number (0-9)"
          isMet={reqs.hasNumber}
        />
        <ChecklistItem
          label="Special character (!@#$%...)"
          isMet={reqs.hasSpecialChar}
        />
      </View>
    </View>
  );
}

function ChecklistItem({ label, isMet }: { label: string; isMet: boolean }) {
  return (
    <View style={styles.itemRow}>
      <Text
        style={[
          styles.itemIcon,
          isMet ? styles.iconMet : styles.iconUnmet,
        ]}>
        {isMet ? '✓' : '○'}
      </Text>
      <Text
        style={[
          styles.itemLabel,
          isMet ? styles.labelMet : styles.labelUnmet,
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    gap: 10,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#263238',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  meterTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    gap: 4,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    borderRadius: 3,
  },
  checklistContainer: {
    gap: 6,
    paddingTop: 4,
  },
  checklistTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#546E7A',
    marginBottom: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 16,
    textAlign: 'center',
  },
  iconMet: {
    color: '#2E7D32',
  },
  iconUnmet: {
    color: '#B0BEC5',
  },
  itemLabel: {
    fontSize: 12,
  },
  labelMet: {
    color: '#263238',
    fontWeight: '600',
  },
  labelUnmet: {
    color: '#78909C',
    fontWeight: '400',
  },
});
