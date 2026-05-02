import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { formatCurrency, getMonthLabel, getPrevMonth, getNextMonth } from '../utils/formatters';
import useStore, { useLoadTransactions } from '../store/useStore';
import TransactionItem from '../components/TransactionItem';

export default function TransactionsScreen({ navigation }) {
  const [filter, setFilter] = useState('all');
  const {
    transactions, monthlyTotals, selectedMonth,
    setSelectedMonth, removeTransaction, loading,
  } = useStore();
  const loadTransactions = useLoadTransactions();

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

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

      {/* Totals Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.income }]}>
            +{formatCurrency(monthlyTotals.income)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.expense }]}>
            -{formatCurrency(monthlyTotals.expense)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={[
            styles.summaryAmount,
            { color: monthlyTotals.income - monthlyTotals.expense >= 0 ? COLORS.income : COLORS.expense }
          ]}>
            {formatCurrency(monthlyTotals.income - monthlyTotals.expense)}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {['all', 'income', 'expense'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.activeTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadTransactions()} />}
        renderItem={({ item }) => (
          <TransactionItem item={item} onDelete={removeTransaction} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No {filter !== 'all' ? filter : ''} transactions</Text>
          </View>
        }
      />

      {/* FAB Buttons */}
      <View style={styles.fabs}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: COLORS.income }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.fabText}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: COLORS.expense }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.fabText}>Expense</Text>
        </TouchableOpacity>
      </View>
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
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 4 },
  summaryAmount: { fontSize: 14, fontWeight: '800' },
  divider: { width: 1, backgroundColor: COLORS.border },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  activeTabText: { color: COLORS.white },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', padding: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary },
  fabs: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'row',
    gap: 10,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 50,
    gap: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
