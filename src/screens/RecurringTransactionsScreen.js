import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryById } from '../utils/categories';
import { formatCurrency, formatDate, getCurrencySymbol } from '../utils/formatters';
import useStore, {
  useLoadRecurringTransactions,
  useProcessRecurringTransactions,
} from '../store/useStore';
import dayjs from 'dayjs';

const FREQUENCIES = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'yearly', label: 'Yearly' },
];

const getEmptyForm = () => ({
  type: 'expense',
  amount: '',
  category: EXPENSE_CATEGORIES[0].id,
  description: '',
  start_date: new Date(),
  frequency: 'monthly',
});

export default function RecurringTransactionsScreen() {
  const {
    recurringTransactions,
    addRecurringTransaction,
    removeRecurringTransaction,
  } = useStore();
  const loadRecurringTransactions = useLoadRecurringTransactions();
  const processRecurringTransactions = useProcessRecurringTransactions();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(getEmptyForm());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadRecurringTransactions();
    }, [loadRecurringTransactions])
  );

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const setType = (type) => {
    const nextCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm({ ...form, type, category: nextCategories[0].id });
  };

  const handleSave = async () => {
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      Alert.alert('Validation', 'Enter a valid amount.');
      return;
    }
    if (!form.category || !form.frequency) {
      Alert.alert('Validation', 'Choose a category and frequency.');
      return;
    }

    setSaving(true);
    try {
      await addRecurringTransaction({
        ...form,
        amount: parseFloat(form.amount),
        start_date: dayjs(form.start_date).format('YYYY-MM-DD'),
      });
      setModalVisible(false);
      setForm(getEmptyForm());
      Alert.alert('Saved', 'Recurring transaction saved.');
    } catch (err) {
      Alert.alert('Error', 'Could not save recurring transaction.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDue = async () => {
    try {
      const count = await processRecurringTransactions();
      Alert.alert('Recurring Updated', `${count} transaction${count === 1 ? '' : 's'} generated.`);
    } catch (err) {
      Alert.alert('Error', 'Could not generate recurring transactions.');
    }
  };

  const renderRecurringItem = ({ item }) => {
    const category = getCategoryById(item.category, item.type);
    const isIncome = item.type === 'income';
    return (
      <View style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: category.color + '20' }]}>
          <Text style={styles.icon}>{category.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.description || category.label}
          </Text>
          <Text style={styles.meta}>
            {category.label} - {item.frequency} - {formatDate(item.next_due_date || item.start_date)}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: isIncome ? COLORS.income : COLORS.expense }]}>
            {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => removeRecurringTransaction(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleGenerateDue}>
          <Ionicons name="play-circle-outline" size={19} color={COLORS.primary} />
          <Text style={styles.actionText}>Generate Due</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={19} color={COLORS.white} />
          <Text style={[styles.actionText, styles.primaryActionText]}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recurringTransactions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderRecurringItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="refresh-outline" size={52} color={COLORS.textSecondary} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No recurring transactions</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Recurring Transaction</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.segmented}>
            {['expense', 'income'].map((type) => {
              const active = form.type === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setType(type)}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>
              <TextInput
                style={styles.amountInput}
                value={form.amount}
                onChangeText={(amount) => setForm({ ...form, amount })}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={COLORS.border}
              />
            </View>
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipGrid}>
              {categories.map((cat) => {
                const active = form.category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      active && { borderColor: cat.color, backgroundColor: cat.color + '15' },
                    ]}
                    onPress={() => setForm({ ...form, category: cat.id })}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryLabel, active && { color: cat.color }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyRow}>
              {FREQUENCIES.map((frequency) => {
                const active = form.frequency === frequency.id;
                return (
                  <TouchableOpacity
                    key={frequency.id}
                    style={[styles.frequencyChip, active && styles.frequencyChipActive]}
                    onPress={() => setForm({ ...form, frequency: frequency.id })}
                  >
                    <Text style={[styles.frequencyText, active && styles.frequencyTextActive]}>
                      {frequency.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.label}>First Due Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateText}>{formatDate(form.start_date)}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.start_date}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) setForm({ ...form, start_date: selectedDate });
                }}
              />
            )}
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.label}>Note</Text>
            <TextInput
              style={styles.noteInput}
              value={form.description}
              onChangeText={(description) => setForm({ ...form, description })}
              placeholder="e.g. Rent, paycheck, insurance"
              placeholderTextColor={COLORS.border}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Recurring'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  primaryActionText: { color: COLORS.white },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  right: { alignItems: 'flex-end' },
  amount: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },
  deleteBtn: { padding: 4 },
  empty: {
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalContent: { padding: 16, paddingBottom: 40 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  segmentTextActive: { color: COLORS.white },
  fieldCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryIcon: { fontSize: 16 },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyChip: {
    minWidth: '47%',
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  frequencyChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  frequencyText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  frequencyTextActive: { color: COLORS.primary },
  dateButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primaryLight,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  noteInput: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
  },
});
