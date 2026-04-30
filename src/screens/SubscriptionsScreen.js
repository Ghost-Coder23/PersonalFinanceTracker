import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { formatCurrency } from '../utils/formatters';
import useStore from '../store/useStore';
import SubscriptionItem from '../components/SubscriptionItem';

export default function SubscriptionsScreen({ navigation }) {
  const { subscriptions, loadSubscriptions, removeSubscription, loading } = useStore();

  useFocusEffect(
    React.useCallback(() => {
      loadSubscriptions();
    }, [])
  );

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    if (sub.billing_cycle === 'monthly') return acc + sub.amount;
    if (sub.billing_cycle === 'yearly') return acc + sub.amount / 12;
    if (sub.billing_cycle === 'weekly') return acc + sub.amount * 4;
    return acc + sub.amount;
  }, 0);

  const totalYearly = totalMonthly * 12;

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Monthly Cost</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalMonthly)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Annual Cost</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalYearly)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Subs</Text>
          <Text style={styles.summaryAmount}>{subscriptions.length}</Text>
        </View>
      </View>

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSubscriptions} />}
        renderItem={({ item }) => (
          <SubscriptionItem item={item} onDelete={removeSubscription} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No subscriptions tracked</Text>
            <Text style={styles.emptySubtext}>Add your first subscription below</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddSubscription')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  summary: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 4 },
  summaryAmount: { fontSize: 16, fontWeight: '800', color: COLORS.subscription },
  divider: { width: 1, backgroundColor: COLORS.border },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', padding: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: COLORS.textSecondary },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.subscription,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.subscription,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
