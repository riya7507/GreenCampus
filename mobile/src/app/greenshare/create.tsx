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

const CATEGORIES = [
  { key: 'books', label: 'Books', emoji: '📚' },
  { key: 'electronics', label: 'Electronics', emoji: '💻' },
  { key: 'lab', label: 'Lab Gear', emoji: '🔬' },
  { key: 'sports', label: 'Sports', emoji: '⚽' },
  { key: 'other', label: 'Other', emoji: '📦' },
];

const CONDITIONS = [
  { key: 'like_new', label: 'Like New', desc: 'No visible signs of wear' },
  { key: 'good', label: 'Good', desc: 'Minor cosmetic blemishes' },
  { key: 'fair', label: 'Fair', desc: 'Fully functional, noticeable use' },
];

export default function CreateItemScreen() {
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('books');
  const [condition, setCondition] = useState<string>('good');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validate = () => {
    const errs: { name?: string } = {};
    if (!name.trim()) {
      errs.name = 'Item name is required';
    } else if (name.trim().length < 3) {
      errs.name = 'Item name must be at least 3 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await ApiService.createItem({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        condition,
      });

      Alert.alert(
        'Item Listed! 📦',
        'Your item is now live in the GreenShare catalog. You earned +15 Green Points for supporting circular reuse!',
        [
          {
            text: 'Go to Catalog',
            onPress: () => router.replace('/greenshare'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Listing Failed', err.message || 'Could not list item. Please try again.');
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
        <Text style={styles.headerTitle}>List an Item to Share</Text>
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
            <Text style={styles.calloutIcon}>🤝</Text>
            <View style={styles.calloutTextWrap}>
              <Text style={styles.calloutTitle}>Earn +15 Green Points</Text>
              <Text style={styles.calloutSub}>
                Sharing reduces campus purchases, avoids plastic packaging, and empowers classmates.
              </Text>
            </View>
          </View>

          {/* Item Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Item Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g., Organic Chemistry 8th Edition, TI-84 Plus CE"
              placeholderTextColor="#90A4AE"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({});
              }}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Category Picker */}
          <Text style={styles.sectionLabel}>Select Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.key;

              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  style={[
                    styles.catBtn,
                    isSelected && styles.catBtnSelected,
                  ]}>
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Condition Picker */}
          <Text style={styles.sectionLabel}>Item Condition</Text>
          <View style={styles.conditionRow}>
            {CONDITIONS.map((cond) => {
              const isSelected = condition === cond.key;

              return (
                <Pressable
                  key={cond.key}
                  onPress={() => setCondition(cond.key)}
                  style={[
                    styles.condCard,
                    isSelected && styles.condCardSelected,
                  ]}>
                  <Text style={[styles.condTitle, isSelected && styles.condTitleSelected]}>
                    {cond.label}
                  </Text>
                  <Text style={styles.condDesc}>{cond.desc}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Optional Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description & Notes (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Include pickup details (e.g., available outside Library, includes charging cable)"
              placeholderTextColor="#90A4AE"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Action */}
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
              <Text style={styles.submitButtonText}>Publish Listing (+15 PTS)</Text>
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
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    gap: 12,
  },
  calloutIcon: { fontSize: 26 },
  calloutTextWrap: { flex: 1 },
  calloutTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1' },
  calloutSub: { fontSize: 11, color: '#1976D2', marginTop: 2, lineHeight: 15 },
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
  inputError: { borderColor: '#E53935' },
  errorText: { fontSize: 11, color: '#E53935', fontWeight: '600' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#37474F' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECEFF1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catBtnSelected: { borderColor: '#1976D2', backgroundColor: '#E3F2FD' },
  catEmoji: { fontSize: 16 },
  catText: { fontSize: 12, fontWeight: '700', color: '#546E7A' },
  catTextSelected: { color: '#1976D2' },
  conditionRow: { flexDirection: 'row', gap: 8 },
  condCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#ECEFF1',
    gap: 4,
  },
  condCardSelected: { borderColor: '#1976D2', backgroundColor: '#E3F2FD' },
  condTitle: { fontSize: 12, fontWeight: '700', color: '#37474F' },
  condTitleSelected: { color: '#1976D2' },
  condDesc: { fontSize: 9, color: '#78909C' },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#263238',
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#1976D2',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
