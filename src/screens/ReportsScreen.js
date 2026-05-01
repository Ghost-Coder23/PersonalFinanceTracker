import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { COLORS } from '../utils/colors';
import { getCategoryById } from '../utils/categories';
import { formatCurrency, getMonthLabel } from '../utils/formatters';
import useStore, { useLoadReportsData } from '../store/useStore';
import dayjs from 'dayjs';
import { SpendingPieChart, IncomeExpenseLineChart } from '../components/AnalyticsCharts';

const screenWidth = Dimensions.get('window').width - 32;

const chartConfig = {
  backgroundColor: COLORS.card,
  backgroundGradientFrom: COLORS.card,
  backgroundGradientTo: COLORS.card,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
  labelColor: () => COLORS.textSecondary,
  style: { borderRadius: 16 },
  barPercentage: 0.6,
  propsForLabels: { fontSize: 11 },
};

export default function ReportsScreen() {
  const {
    selectedMonth, monthlyTotals, expensesByCategory,
    last6MonthsTotals, loading,
  } = useStore();
  const loadReportsData = useLoadReportsData();

  useFocusEffect(
    React.useCallback(() => {
      loadReportsData();
    }, [selectedMonth, loadReportsData])
  );

  // Build last 6 months bar chart data
  const months6 = Array.from({ length: 6 }, (_, i) =>
    dayjs().subtract(5 - i, 'month').format('YYYY-MM')
  );

  const incomeData = months6.map((m) => {
    const found = last6MonthsTotals.find((r) => r.month === m && r.type === 'income');
    return found ? parseFloat(found.total) : 0;
  });

  const expenseData = months6.map((m) => {
    const found = last6MonthsTotals.find((r) => r.month === m && r.type === 'expense');
    return found ? parseFloat(found.total) : 0;
  });

  const barLabels = months6.map((m) => dayjs(m + '-01').format('MMM'));

  // Pie chart data for expenses by category
  const pieColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#00C853', '#F44336', '#3F51B5', '#E91E63',
    '#009688', '#607D8B',
  ];

  const pieData = expensesByCategory.slice(0, 6).map((item, index) => {
    const cat = getCategoryById(item.category, 'expense');
    return {
      name: cat.label,
      population: parseFloat(item.total),
      color: pieColors[index % pieColors.length],
      legendFontColor: COLORS.textSecondary,
      legendFontSize: 12,
    };
  });

  const balance = monthlyTotals.income - monthlyTotals.expense;
  const savingsRate = monthlyTotals.income > 0
    ? ((balance / monthlyTotals.income) * 100).toFixed(1)
    : '0.0';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReportsData} />}
    >
      <Text style={styles.monthTitle}>{getMonthLabel(selectedMonth)}</Text>

      {/* Key Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: COLORS.income }]}>
            {formatCurrency(monthlyTotals.income)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💸</Text>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statValue, { color: COLORS.expense }]}>
            {formatCurrency(monthlyTotals.expense)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏦</Text>
          <Text style={styles.statLabel}>Net Savings</Text>
          <Text style={[styles.statValue, { color: balance >= 0 ? COLORS.income : COLORS.expense }]}>
            {formatCurrency(balance)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statLabel}>Savings Rate</Text>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{savingsRate}%</Text>
        </View>
      </View>

      {/* 6-Month Income Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>💹 6-Month Income Trend</Text>
        {incomeData.some((v) => v > 0) ? (
          <BarChart
            data={{
              labels: barLabels,
              datasets: [{ data: incomeData }],
            }}
            width={screenWidth - 32}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
            }}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars={false}
          />
        ) : (
          <View style={styles.noData}><Text style={styles.noDataText}>No income data yet</Text></View>
        )}
      </View>

      {/* 6-Month Expense Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>📉 6-Month Expense Trend</Text>
        {expenseData.some((v) => v > 0) ? (
          <BarChart
            data={{
              labels: barLabels,
              datasets: [{ data: expenseData }],
            }}
            width={screenWidth - 32}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 82, 82, ${opacity})`,
            }}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars={false}
          />
        ) : (
          <View style={styles.noData}><Text style={styles.noDataText}>No expense data yet</Text></View>
        )}
      </View>

      {/* Expense Breakdown Pie */}
      {pieData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🥧 Expense Breakdown</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            style={styles.chart}
          />
        </View>
      )}

      {/* Category Breakdown List */}
      {expensesByCategory.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📋 Spending by Category</Text>
          {expensesByCategory.map((item, index) => {
            const cat = getCategoryById(item.category, 'expense');
            const pct = monthlyTotals.expense > 0
              ? ((item.total / monthlyTotals.expense) * 100).toFixed(1)
              : 0;
            return (
              <View key={item.category} style={styles.catRow}>
                <View style={[styles.catIconWrap, { backgroundColor: cat.color + '20' }]}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                </View>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{cat.label}</Text>
                  <View style={styles.catBarBg}>
                    <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                  </View>
                </View>
                <View style={styles.catAmounts}>
                  <Text style={styles.catAmount}>{formatCurrency(item.total)}</Text>
                  <Text style={styles.catPct}>{pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.header}>Spending by Category</Text>
      <SpendingPieChart data={expensesByCategory} />
      <Text style={styles.header}>Income vs Expense (Last 6 Months)</Text>
      <IncomeExpenseLineChart data={months6.map((month, i) => ({
        month,
        income: incomeData[i],
        expense: expenseData[i],
      }))} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  monthTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: (Dimensions.get('window').width - 52) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '900' },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  chartTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  chart: { borderRadius: 12, marginLeft: -8 },
  noData: { height: 100, justifyContent: 'center', alignItems: 'center' },
  noDataText: { color: COLORS.textSecondary, fontSize: 14 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catIcon: { fontSize: 18 },
  catInfo: { flex: 1 },
  catName: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  catBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catBarFill: { height: '100%', borderRadius: 3 },
  catAmounts: { alignItems: 'flex-end' },
  catAmount: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  catPct: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
});
