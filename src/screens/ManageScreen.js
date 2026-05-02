import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import useStore, { useLoadAll } from '../store/useStore';

const ITEMS = [
  {
    title: 'Subscriptions',
    icon: 'repeat-outline',
    color: COLORS.subscription,
    screen: 'Subscriptions',
    countKey: 'subscriptions',
  },
  {
    title: 'Recurring',
    icon: 'refresh-outline',
    color: COLORS.income,
    screen: 'Recurring',
    countKey: 'recurringTransactions',
  },
  {
    title: 'Goals',
    icon: 'flag-outline',
    color: COLORS.primary,
    screen: 'Goals',
    countKey: 'goals',
  },
  {
    title: 'Customers',
    icon: 'people-outline',
    color: COLORS.secondary,
    screen: 'Customers',
    countKey: 'customers',
  },
  {
    title: 'Tags',
    icon: 'pricetag-outline',
    color: COLORS.warning,
    screen: 'Tags',
    countKey: 'tags',
  },
  {
    title: 'Settings',
    icon: 'settings-outline',
    color: COLORS.text,
    screen: 'Settings',
  },
];

export default function ManageScreen({ navigation }) {
  const state = useStore();
  const loadAll = useLoadAll();

  useFocusEffect(
    React.useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Manage</Text>
      <View style={styles.grid}>
        {ITEMS.map((item) => {
          const count = item.countKey ? state[item.countKey]?.length || 0 : null;
          return (
            <TouchableOpacity
              key={item.screen}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {count !== null && (
                    <Text style={styles.count}>{count}</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 14,
  },
  grid: { gap: 10 },
  card: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
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
  cardBody: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  count: {
    minWidth: 24,
    textAlign: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
});
