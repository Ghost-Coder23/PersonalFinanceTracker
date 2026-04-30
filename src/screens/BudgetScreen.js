import React, { useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { formatCurrency, getMonthLabel, getPrevMonth, getNextMonth } from '../utils/formatters';
import useStore from '../store/useStore';
import BudgetProgress from '../components/BudgetProgress';

export default function BudgetScreen({ navigation }) {
  const {
    budgets, transactions, expensesByCategory, selectedMonth,
    setSelectedMonth, loadBudgets, loadMonthData, loading,
    removeBudget,
  } = useStore();

  useFocusEffect(
    React.useCallback(() => {
      loadBudgets();
      loadMonthData();
    }, [selectedMonth])
  );

  // Build spent map from expenses by category
  const spentMap = useMemo(() => {
    const map = {};
    expensesByCategory.forEach((item) => {
      map[item.category] = item.total;
    });
    return map;
  }, [expensesByCategory]);

  const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (spentMap[b.category] || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <View style={styles.container}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => setSelectedMonth(getPrevMonth(selectedMonth))}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{getMonthLabel(selectedMonth)}</Text>
        <TouchableOpacity onPress={() => setSelectedMonth(getNextMonth(selectedMonth))}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <View style={styles.overview}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Total Budget</Text>
            <Text style={styles.overviewAmount}>{formatCurrency(totalBudget)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Spent</Text>
            <Text style={[styles.overviewAmount, { color: COLORS.expense }]}>
              {formatCurrency(totalSpent)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Remaining</Text>
            <Text style={[
              styles.overviewAmount,
              { color: totalRemaining >= 0 ? COLORS.income : COLORS.expense }
            ]}>
              {formatCurrency(totalRemaining)}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => { loadBudgets(); loadMonthData(); }} />
        }
        renderItem={({ item }) => (
          <BudgetProgress
            budget={item}
            spent={spentMap[item.category] || 0}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Budgets Set</Text>
            <Text style={styles.emptyText}>Set spending limits by category to track your budget</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddBudget', { month: selectedMonth })}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  monthLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  overview: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 4 },
  overviewAmount: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  divider: { width: 1, backgroundColor: COLORS.border },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', padding: 48 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  emptyText: {
    fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
