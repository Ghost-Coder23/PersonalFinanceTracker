import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import AddSubscriptionScreen from '../screens/AddSubscriptionScreen';
import BudgetScreen from '../screens/BudgetScreen';
import AddBudgetScreen from '../screens/AddBudgetScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ManageScreen from '../screens/ManageScreen';
import CustomersScreen from '../screens/CustomersScreen';
import RecurringTransactionsScreen from '../screens/RecurringTransactionsScreen';
import TagsScreen from '../screens/TagsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const stackOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
};

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: '💰 Finance Tracker' }} />
    </Stack.Navigator>
  );
}

function TransactionsStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Transactions' }} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={({ route }) => ({
        title: route.params?.type === 'income' ? 'Add Income' : 'Add Expense',
      })} />
    </Stack.Navigator>
  );
}

function BudgetStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Budget" component={BudgetScreen} options={{ title: 'Budget' }} />
      <Stack.Screen name="AddBudget" component={AddBudgetScreen} options={{ title: 'Set Budget' }} />
    </Stack.Navigator>
  );
}

function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports & Analytics' }} />
    </Stack.Navigator>
  );
}

function ManageStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Manage" component={ManageScreen} options={{ title: 'Manage' }} />
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ title: 'Subscriptions' }} />
      <Stack.Screen name="AddSubscription" component={AddSubscriptionScreen} options={{ title: 'Add Subscription' }} />
      <Stack.Screen name="Recurring" component={RecurringTransactionsScreen} options={{ title: 'Recurring' }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: 'Goals' }} />
      <Stack.Screen name="Customers" component={CustomersScreen} options={{ title: 'Customers' }} />
      <Stack.Screen name="Tags" component={TagsScreen} options={{ title: 'Tags' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            HomeTab: focused ? 'home' : 'home-outline',
            TransactionsTab: focused ? 'swap-horizontal' : 'swap-horizontal-outline',
            BudgetTab: focused ? 'wallet' : 'wallet-outline',
            ReportsTab: focused ? 'bar-chart' : 'bar-chart-outline',
            ManageTab: focused ? 'apps' : 'apps-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={DashboardStack} options={{ title: 'Home' }} />
      <Tab.Screen name="TransactionsTab" component={TransactionsStack} options={{ title: 'Transactions' }} />
      <Tab.Screen name="BudgetTab" component={BudgetStack} options={{ title: 'Budget' }} />
      <Tab.Screen name="ReportsTab" component={ReportsStack} options={{ title: 'Reports' }} />
      <Tab.Screen name="ManageTab" component={ManageStack} options={{ title: 'Manage' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
