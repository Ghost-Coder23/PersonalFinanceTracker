import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { formatCurrency, getDaysUntil, getMonthLabel } from '../utils/formatters';
import useStore, { useLoadAll } from '../store/useStore';
import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';
import SubscriptionItem from '../components/SubscriptionItem';

export default function DashboardScreen({ navigation }) {
  const {
    transactions, subscriptions, recurringTransactions, monthlyTotals,
    selectedMonth, loading, removeTransaction, removeSubscription,
  } = useStore();
  const loadAll = useLoadAll();

  useFocusEffect(
    React.useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const balance = monthlyTotals.income - monthlyTotals.expense;
  const recentTransactions = transactions.slice(0, 5);
  const upcomingSubscriptions = subscriptions.slice(0, 3);
  const upcomingRecurring = recurringTransactions
    .filter((item) => item.is_active !== 0)
    .slice(0, 3);

  const totalMonthlySubscriptions = subscriptions.reduce((acc, sub) => {
    if (sub.billing_cycle === 'monthly') return acc + sub.amount;
    if (sub.billing_cycle === 'yearly') return acc + sub.amount / 12;
    if (sub.billing_cycle === 'weekly') return acc + sub.amount * 4;
    if (sub.billing_cycle === 'quarterly') return acc + sub.amount / 3;
    return acc + sub.amount;
  }, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} />}
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{getMonthLabel(selectedMonth)} Balance</Text>
        <Text style={[styles.balanceAmount, { color: balance >= 0 ? '#fff' : '#FFB3B3' }]}>
          {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
        </Text>
        <Text style={styles.balanceSubtitle}>
          {balance >= 0 ? '✅ You\'re on track!' : '⚠️ Spending exceeds income'}
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsRow}>
        <SummaryCard
          title="Income"
          amount={formatCurrency(monthlyTotals.income)}
          icon="💰"
          color={COLORS.income}
        />
        <SummaryCard
          title="Expenses"
          amount={formatCurrency(monthlyTotals.expense)}
          icon="💸"
          color={COLORS.expense}
        />
        <SummaryCard
          title="Subscriptions"
          amount={formatCurrency(totalMonthlySubscriptions)}
          icon="🔄"
          color={COLORS.subscription}
          subtitle="/mo"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: COLORS.incomeLight }]}
            onPress={() => navigation.navigate('TransactionsTab', {
              screen: 'AddTransaction', params: { type: 'income' }
            })}
          >
            <Ionicons name="add-circle" size={22} color={COLORS.income} />
            <Text style={[styles.quickBtnText, { color: COLORS.income }]}>Add Income</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: COLORS.expenseLight }]}
            onPress={() => navigation.navigate('TransactionsTab', {
              screen: 'AddTransaction', params: { type: 'expense' }
            })}
          >
            <Ionicons name="remove-circle" size={22} color={COLORS.expense} />
            <Text style={[styles.quickBtnText, { color: COLORS.expense }]}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: COLORS.subscriptionLight }]}
            onPress={() => navigation.navigate('ManageTab', { screen: 'AddSubscription' })}
          >
            <Ionicons name="repeat" size={22} color={COLORS.subscription} />
            <Text style={[styles.quickBtnText, { color: COLORS.subscription }]}>Add Sub</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          recentTransactions.map((item) => (
            <TransactionItem key={item.id} item={item} onDelete={removeTransaction} />
          ))
        )}
      </View>

      {/* Upcoming Renewals */}
      {upcomingSubscriptions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ManageTab', { screen: 'Subscriptions' })}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {upcomingSubscriptions.map((item) => (
            <SubscriptionItem key={item.id} subscription={item} onDelete={removeSubscription} />
          ))}
        </View>
      )}

      {upcomingRecurring.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Recurring</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ManageTab', { screen: 'Recurring' })}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {upcomingRecurring.map((item) => {
            const daysUntil = getDaysUntil(item.next_due_date || item.start_date);
            const isIncome = item.type === 'income';
            return (
              <View key={item.id} style={styles.recurringCard}>
                <View style={[
                  styles.recurringIcon,
                  { backgroundColor: isIncome ? COLORS.incomeLight : COLORS.expenseLight },
                ]}>
                  <Ionicons
                    name={isIncome ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                    size={22}
                    color={isIncome ? COLORS.income : COLORS.expense}
                  />
                </View>
                <View style={styles.recurringInfo}>
                  <Text style={styles.recurringTitle} numberOfLines={1}>
                    {item.description || item.category}
                  </Text>
                  <Text style={styles.recurringMeta}>
                    {daysUntil <= 0 ? 'Due today' : `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`}
                  </Text>
                </View>
                <Text style={[
                  styles.recurringAmount,
                  { color: isIncome ? COLORS.income : COLORS.expense },
                ]}>
                  {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceAmount: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 8,
  },
  balanceSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  cardsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: -4,
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 6,
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.card,
    borderRadius: 16,
  },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  recurringCard: {
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
  recurringIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recurringInfo: { flex: 1 },
  recurringTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  recurringMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  recurringAmount: {
    fontSize: 15,
    fontWeight: '900',
  },
});
