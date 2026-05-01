import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { COLORS } from '../utils/colors';

export function SpendingPieChart({ data }) {
  if (!data || !data.length) return <Text>No data</Text>;
  return (
    <PieChart
      data={data.map(item => ({
        name: item.category,
        population: item.total,
        color: COLORS[item.category] || COLORS.primary,
        legendFontColor: '#333',
        legendFontSize: 12,
      }))}
      width={Dimensions.get('window').width - 32}
      height={180}
      chartConfig={{ color: () => COLORS.primary }}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      absolute
    />
  );
}

export function IncomeExpenseLineChart({ data }) {
  if (!data || !data.length) return <Text>No data</Text>;
  const months = data.map(d => d.month);
  const income = data.map(d => d.income || 0);
  const expense = data.map(d => d.expense || 0);
  return (
    <LineChart
      data={{
        labels: months,
        datasets: [
          { data: income, color: () => COLORS.income, strokeWidth: 2 },
          { data: expense, color: () => COLORS.expense, strokeWidth: 2 },
        ],
        legend: ['Income', 'Expense'],
      }}
      width={Dimensions.get('window').width - 32}
      height={220}
      chartConfig={{
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        labelColor: () => '#333',
      }}
      bezier
      style={styles.chart}
    />
  );
}

const styles = StyleSheet.create({
  chart: { marginVertical: 8, borderRadius: 16 },
});
