import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { getCurrencySymbol, getMonthLabel } from '../utils/formatters';
import useStore from '../store/useStore';

export default function AddBudgetScreen({ route, navigation }) {
  const month = route.params?.month;
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const { addBudget, budgets } = useStore();

  // Filter out already-budgeted categories
  const existingCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !existingCategories.has(c.id));

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return Alert.alert('Error', 'Enter a valid budget amount.');
    }

    setSaving(true);
    try {
      await addBudget({ category, amount: parseFloat(amount), month });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not save budget.');
    } finally {
      setSaving(false);
    }
  };

  if (availableCategories.length === 0) {
    return (
      <View style={styles.doneContainer}>
        <Text style={styles.doneIcon}>✅</Text>
        <Text style={styles.doneTitle}>All categories budgeted!</Text>
        <Text style={styles.doneText}>You've set budgets for all expense categories this month.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.monthBanner}>
        <Text style={styles.monthBannerText}>Budget for {getMonthLabel(month)}</Text>
      </View>

      {/* Category */}
      <View style={styles.card}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.grid}>
          {availableCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catChip,
                category === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '15' },
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catLabel, category === cat.id && { color: cat.color, fontWeight: '700' }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.card}>
        <Text style={styles.label}>Budget Limit *</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={COLORS.border}
            autoFocus
          />
        </View>
        <Text style={styles.hint}>Set your maximum spend for this category this month</Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Ionicons name="checkmark-circle" size={22} color="#fff" />
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Set Budget'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  monthBanner: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  monthBannerText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 4,
  },
  catIcon: { fontSize: 16 },
  catLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: 32, fontWeight: '800', color: COLORS.text, marginRight: 6 },
  amountInput: { flex: 1, fontSize: 38, fontWeight: '900', color: COLORS.text },
  hint: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    gap: 10,
    marginTop: 8,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  doneIcon: { fontSize: 64, marginBottom: 16 },
  doneTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  doneText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
