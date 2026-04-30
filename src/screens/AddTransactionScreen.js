import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { formatDate, getCurrentDate } from '../utils/formatters';
import useStore from '../store/useStore';
import dayjs from 'dayjs';

export default function AddTransactionScreen({ route, navigation }) {
  const type = route.params?.type || 'expense';
  const isIncome = type === 'income';

  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0].id);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const { addTransaction } = useStore();

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    if (parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0.');
      return;
    }

    setSaving(true);
    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: dayjs(date).format('YYYY-MM-DD'),
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not save transaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Type Banner */}
      <View style={[
        styles.typeBanner,
        { backgroundColor: isIncome ? COLORS.incomeLight : COLORS.expenseLight }
      ]}>
        <Text style={[styles.typeText, { color: isIncome ? COLORS.income : COLORS.expense }]}>
          {isIncome ? '💰 Income' : '💸 Expense'}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Amount *</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>$</Text>
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
      </View>

      {/* Category */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Category *</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                category === cat.id && styles.categoryChipSelected,
                category === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '15' },
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[
                styles.catLabel,
                category === cat.id && { color: cat.color, fontWeight: '700' }
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Date *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
            maximumDate={new Date()}
          />
        )}
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Note (optional)</Text>
        <TextInput
          style={styles.textInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Add a note..."
          placeholderTextColor={COLORS.border}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: isIncome ? COLORS.income : COLORS.expense },
          saving && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Ionicons name="checkmark-circle" size={22} color="#fff" />
        <Text style={styles.saveText}>
          {saving ? 'Saving...' : `Save ${isIncome ? 'Income' : 'Expense'}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  typeBanner: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  typeText: { fontSize: 16, fontWeight: '800' },
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 4,
  },
  categoryChipSelected: {
    borderWidth: 1.5,
  },
  catIcon: { fontSize: 16 },
  catLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  textInput: {
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 10,
    marginTop: 8,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
