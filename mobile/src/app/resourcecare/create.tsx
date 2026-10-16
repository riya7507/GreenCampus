import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { ApiService } from '@/services/api';

const ISSUE_TYPES = [
  { key: 'water', label: 'Water Leak', emoji: '💧', sub: 'Taps, pipes, washroom flush' },
  { key: 'electricity', label: 'Energy Wastage', emoji: '⚡', sub: 'Lights, AC, left-on lab equipment' },
  { key: 'waste', label: 'Waste Overflow', emoji: '♻️', sub: 'Trash bin spill, uncollected litter' },
  { key: 'other', label: 'General Hazard', emoji: '⚠️', sub: 'Broken fixture, door draft, other' },
];

export default function CreateIssueScreen() {
  const router = useRouter();

  const [issueType, setIssueType] = useState<string>('water');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ location?: string; description?: string }>({});

  const validate = () => {
    const errs: { location?: string; description?: string } = {};
    if (!location.trim()) {
      errs.location = 'Please specify the exact campus location';
    }
    if (!description.trim()) {
      errs.description = 'Please describe the issue observed';
    } else if (description.trim().length < 8) {
      errs.description = 'Description must be at least 8 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await ApiService.createIssue({
        issue_type: issueType,
        location: location.trim(),
        description: description.trim(),
      });

      Alert.alert(
        'Report Submitted! 🌱',
        'Thank you for caring for our campus! You earned +10 Green Points.',
        [
          {
            text: 'View Reports',
            onPress: () => router.replace('/resourcecare'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message || 'Could not submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        <Text style={styles.headerTitle}>Report Campus Wastage</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Reward Callout */}
          <View style={styles.calloutCard}>
            <Text style={styles.calloutIcon}>🌱</Text>
            <View style={styles.calloutTextWrap}>
              <Text style={styles.calloutTitle}>Earn +10 Green Points</Text>
              <Text style={styles.calloutSub}>
                Every verified report saves campus resources and climbs your leaderboard rank.
              </Text>
            </View>
          </View>

          {/* Issue Type Picker */}
          <Text style={styles.sectionLabel}>Select Resource Category</Text>
          <View style={styles.typesGrid}>
            {ISSUE_TYPES.map((type) => {
              const isSelected = issueType === type.key;

              return (
                <Pressable
                  key={type.key}
                  onPress={() => setIssueType(type.key)}
                  style={[
                    styles.typeCard,
                    isSelected && styles.typeCardSelected,
                  ]}>
                  <Text style={styles.typeEmoji}>{type.emoji}</Text>
                  <Text style={[styles.typeTitle, isSelected && styles.typeTitleSelected]}>
                    {type.label}
                  </Text>
                  <Text style={styles.typeSub} numberOfLines={2}>
                    {type.sub}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Location Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Campus Location *</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="e.g., Engineering Block B, 2nd Floor Men's Restroom"
              placeholderTextColor="#90A4AE"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
              }}
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Issue Details *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe the leak or wastage (e.g., faucet leaking ~1 drop per second, valve loose)"
              placeholderTextColor="#90A4AE"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Submit Button */}
          <Pressable
            accessibilityRole="button"
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
              pressed && styles.pressed,
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report (+10 PTS)</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  calloutCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    gap: 12,
  },
  calloutIcon: { fontSize: 26 },
  calloutTextWrap: { flex: 1 },
  calloutTitle: { fontSize: 14, fontWeight: '800', color: '#1B5E20' },
  calloutSub: { fontSize: 11, color: '#388E3C', marginTop: 2, lineHeight: 15 },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: '#263238' },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#ECEFF1',
    gap: 4,
  },
  typeCardSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  typeEmoji: { fontSize: 22 },
  typeTitle: { fontSize: 13, fontWeight: '700', color: '#263238' },
  typeTitleSelected: { color: '#2E7D32' },
  typeSub: { fontSize: 10, color: '#78909C', lineHeight: 14 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#37474F' },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#263238',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#263238',
    minHeight: 100,
  },
  inputError: { borderColor: '#E53935' },
  errorText: { fontSize: 11, color: '#E53935', fontWeight: '600' },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginTop: Spacing.two,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
