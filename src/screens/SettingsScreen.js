import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { CURRENCIES } from '../utils/formatters';
import { exportToCSV } from '../utils/exportImport';
import {
  cancelAllNotifications,
  requestNotificationPermissions,
} from '../utils/notifications';
import {
  getAllTransactions,
  getAllSubscriptions,
  getAllBudgets,
  getAllRecurringTransactions,
} from '../database/db';
import useStore, { useLoadSettings } from '../store/useStore';

export default function SettingsScreen() {
  const { settings, setSetting } = useStore();
  const loadSettings = useLoadSettings();

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const selectedCurrency = settings.currency || 'USD';
  const notificationsEnabled = settings.notifications !== 'disabled';
  const darkModeEnabled = settings.theme === 'dark';

  const handleCurrencyChange = async (currency) => {
    await setSetting('currency', currency);
  };

  const handleNotificationToggle = async (enabled) => {
    try {
      if (enabled) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert('Permission Needed', 'Notifications were not enabled.');
          return;
        }
        await setSetting('notifications', 'enabled');
      } else {
        await cancelAllNotifications();
        await setSetting('notifications', 'disabled');
      }
    } catch (err) {
      Alert.alert('Notification Error', err.message || 'Could not update notifications.');
    }
  };

  const handleThemeToggle = async (enabled) => {
    await setSetting('theme', enabled ? 'dark' : 'light');
  };

  const handleExport = async (label, filename, loader) => {
    try {
      const rows = await loader();
      const fileUri = await exportToCSV(rows, filename);
      Alert.alert('Export Complete', `${label} exported to ${fileUri}`);
    } catch (err) {
      Alert.alert('Export Failed', err.message || `Could not export ${label}.`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency</Text>
        <View style={styles.currencyGrid}>
          {CURRENCIES.map((currency) => {
            const selected = selectedCurrency === currency.code;
            return (
              <TouchableOpacity
                key={currency.code}
                style={[styles.currencyChip, selected && styles.currencyChipActive]}
                onPress={() => handleCurrencyChange(currency.code)}
              >
                <Text style={[styles.currencySymbol, selected && styles.currencyTextActive]}>
                  {currency.symbol}
                </Text>
                <Text style={[styles.currencyCode, selected && styles.currencyTextActive]}>
                  {currency.code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textSecondary}
          />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={22} color={COLORS.primary} />
            <Text style={styles.settingLabel}>Dark Theme</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={handleThemeToggle}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={darkModeEnabled ? COLORS.primary : COLORS.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => handleExport('Transactions', 'transactions.csv', getAllTransactions)}
        >
          <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.primary} />
          <Text style={styles.exportText}>Transactions CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => handleExport('Subscriptions', 'subscriptions.csv', getAllSubscriptions)}
        >
          <Ionicons name="repeat-outline" size={20} color={COLORS.subscription} />
          <Text style={styles.exportText}>Subscriptions CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => handleExport('Budgets', 'budgets.csv', getAllBudgets)}
        >
          <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
          <Text style={styles.exportText}>Budgets CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => handleExport('Recurring transactions', 'recurring-transactions.csv', getAllRecurringTransactions)}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.income} />
          <Text style={styles.exportText}>Recurring CSV</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyChip: {
    width: '30.8%',
    minHeight: 64,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  currencyChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  currencyTextActive: { color: COLORS.primary },
  settingRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  exportButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: COLORS.background,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
});
