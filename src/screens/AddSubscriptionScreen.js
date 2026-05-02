import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Switch, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { SUBSCRIPTION_CATEGORIES } from '../utils/categories';
import { formatDate, getCurrencySymbol } from '../utils/formatters';
import useStore from '../store/useStore';
import dayjs from 'dayjs';

const BILLING_CYCLES = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'yearly', label: 'Yearly' },
];

export default function AddSubscriptionScreen({ navigation }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [category, setCategory] = useState(SUBSCRIPTION_CATEGORIES[0].id);
  const [nextRenewal, setNextRenewal] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(new Date());
  const [showTrialDatePicker, setShowTrialDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const { addSubscription } = useStore();

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Please enter a subscription name.');
    if (!amount || isNaN(parseFloat(amount))) return Alert.alert('Error', 'Enter a valid amount.');
    if (parseFloat(amount) <= 0) return Alert.alert('Error', 'Amount must be > 0.');

    setSaving(true);
    try {
      await addSubscription({
        name: name.trim(),
        amount: parseFloat(amount),
        billing_cycle: billingCycle,
        next_renewal: dayjs(nextRenewal).format('YYYY-MM-DD'),
        category,
        is_trial: isTrial,
        trial_end_date: isTrial ? dayjs(trialEndDate).format('YYYY-MM-DD') : null,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not save subscription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Name */}
      <View style={styles.card}>
        <Text style={styles.label}>Service Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Netflix, Spotify..."
          placeholderTextColor={COLORS.border}
          autoFocus
        />
      </View>

      {/* Amount */}
      <View style={styles.card}>
        <Text style={styles.label}>Amount *</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={COLORS.border}
          />
        </View>
      </View>

      {/* Billing Cycle */}
      <View style={styles.card}>
        <Text style={styles.label}>Billing Cycle *</Text>
        <View style={styles.cycleRow}>
          {BILLING_CYCLES.map((cycle) => (
            <TouchableOpacity
              key={cycle.id}
              style={[styles.cycleChip, billingCycle === cycle.id && styles.cycleChipSelected]}
              onPress={() => setBillingCycle(cycle.id)}
            >
              <Text style={[styles.cycleText, billingCycle === cycle.id && styles.cycleTextSelected]}>
                {cycle.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category */}
      <View style={styles.card}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoriesGrid}>
          {SUBSCRIPTION_CATEGORIES.map((cat) => (
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

      {/* Next Renewal */}
      <View style={styles.card}>
        <Text style={styles.label}>Next Renewal Date *</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dateText}>{formatDate(nextRenewal)}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={nextRenewal}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setNextRenewal(selectedDate);
            }}
          />
        )}
      </View>

      {/* Trial Toggle */}
      <View style={styles.card}>
        <View style={styles.trialRow}>
          <View>
            <Text style={styles.label}>Free Trial</Text>
            <Text style={styles.trialSubtext}>Toggle if this is a trial subscription</Text>
          </View>
          <Switch
            value={isTrial}
            onValueChange={setIsTrial}
            trackColor={{ false: COLORS.border, true: COLORS.warning + '60' }}
            thumbColor={isTrial ? COLORS.warning : COLORS.textSecondary}
          />
        </View>
        {isTrial && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>Trial Ends</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTrialDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.warning} />
              <Text style={styles.dateText}>{formatDate(trialEndDate)}</Text>
            </TouchableOpacity>
            {showTrialDatePicker && (
              <DateTimePicker
                value={trialEndDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowTrialDatePicker(Platform.OS === 'ios');
                  if (selectedDate) setTrialEndDate(selectedDate);
                }}
              />
            )}
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Ionicons name="checkmark-circle" size={22} color="#fff" />
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Add Subscription'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
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
  input: {
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    fontWeight: '600',
  },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: 32, fontWeight: '800', color: COLORS.text, marginRight: 6 },
  amountInput: { flex: 1, fontSize: 38, fontWeight: '900', color: COLORS.text },
  cycleRow: { flexDirection: 'row', gap: 8 },
  cycleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cycleChipSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  cycleText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  cycleTextSelected: { color: COLORS.primary, fontWeight: '800' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  dateText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
  trialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trialSubtext: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: COLORS.subscription,
    gap: 10,
    marginTop: 8,
    elevation: 6,
    shadowColor: COLORS.subscription,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
