import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';
import { getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

export default function BudgetProgress({ budget, spent }) {
  const category = getCategoryById(budget.category, 'expense');
  const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const isOver = spent > budget.amount;
  const isNear = percentage >= 80 && !isOver;

  const barColor = isOver ? COLORS.danger : isNear ? COLORS.warning : COLORS.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={[styles.iconWrap, { backgroundColor: category.color + '20' }]}>
            <Text style={styles.icon}>{category.icon}</Text>
          </View>
          <Text style={styles.label}>{category.label}</Text>
        </View>
        <View style={styles.amountsRow}>
          <Text style={[styles.spent, { color: isOver ? COLORS.danger : COLORS.text }]}>
            {formatCurrency(spent)}
          </Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.budget}>{formatCurrency(budget.amount)}</Text>
        </View>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.percentText, { color: barColor }]}>
          {percentage.toFixed(0)}% used
        </Text>
        <Text style={styles.remaining}>
          {isOver
            ? `${formatCurrency(spent - budget.amount)} over`
            : `${formatCurrency(budget.amount - spent)} left`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: { fontSize: 16 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spent: {
    fontSize: 14,
    fontWeight: '800',
  },
  separator: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  budget: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  barBackground: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  remaining: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
