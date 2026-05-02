import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { getCategoryById } from '../utils/categories';
import { formatCurrency, formatDate, getDaysUntil } from '../utils/formatters';

export default function SubscriptionItem({ subscription, onDelete, onNotify }) {
  if (!subscription) return null;
  const item = subscription;
  const category = getCategoryById(item.category, 'subscription');
  const daysUntil = getDaysUntil(item.next_renewal);
  const isUrgent = daysUntil <= 3;
  const isSoon = daysUntil <= 7;

  const renewalColor = isUrgent ? COLORS.danger : isSoon ? COLORS.warning : COLORS.textSecondary;

  const cycleLabel = {
    monthly: '/mo',
    yearly: '/yr',
    weekly: '/wk',
    quarterly: '/qtr',
  }[item.billing_cycle] || '';

  const handleDelete = () => {
    Alert.alert('Remove Subscription', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: category.color + '20' }]}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          {item.is_trial ? (
            <View style={styles.trialBadge}>
              <Text style={styles.trialText}>TRIAL</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.category}>{category.label}</Text>
        <Text style={[styles.renewal, { color: renewalColor }]}>
          {daysUntil === 0
            ? '🔔 Renews today'
            : daysUntil < 0
            ? 'Overdue renewal'
            : `Renews in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>
          {formatCurrency(item.amount)}
          <Text style={styles.cycle}>{cycleLabel}</Text>
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {onNotify && (
            <TouchableOpacity onPress={() => onNotify(item)} style={styles.actionBtn}>
              <Ionicons name="notifications-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 6,
  },
  trialBadge: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  trialText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.warning,
  },
  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  renewal: {
    fontSize: 12,
    fontWeight: '600',
  },
  right: { alignItems: 'flex-end' },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.subscription,
    marginBottom: 6,
  },
  cycle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
