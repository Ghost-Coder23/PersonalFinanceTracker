import { create } from 'zustand';
import { useCallback } from 'react';
import {
  getTransactionsByMonth,
  insertTransaction,
  deleteTransactionById,
  getAllSubscriptions,
  insertSubscription,
  deleteSubscriptionById,
  getBudgetsByMonth,
  insertBudget,
  deleteBudgetById,
  getMonthlyTotals,
  getExpensesByCategory,
  getLast6MonthsTotals,
  getAllCustomers,
  insertCustomer,
  updateCustomer,
  deleteCustomerById,
  getAllRecurringTransactions,
  insertRecurringTransaction,
  deleteRecurringTransactionById,
  getAllTags,
  insertTag,
  deleteTagById,
  getAllGoals,
  insertGoal,
  updateGoal,
  deleteGoalById,
  getSetting,
  setSetting,
} from '../database/db';
import { getCurrentMonth } from '../utils/formatters';

const useStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────────────────────
  transactions: [],
  subscriptions: [],
  budgets: [],
  monthlyTotals: { income: 0, expense: 0 },
  expensesByCategory: [],
  last6MonthsTotals: [],
  customers: [],
  recurringTransactions: [],
  tags: [],
  goals: [],
  settings: {},
  selectedMonth: getCurrentMonth(),
  loading: false,

  // ─── Month ───────────────────────────────────────────────────────────────
  setSelectedMonth: (month) => {
    set({ selectedMonth: month });
    get().loadMonthData(month);
  },

  // ─── Transactions ─────────────────────────────────────────────────────────
  loadTransactions: async (month) => {
    const m = month || get().selectedMonth;
    const transactions = await getTransactionsByMonth(m);
    set({ transactions });
  },

  addTransaction: async (data) => {
    await insertTransaction(data);
    const month = get().selectedMonth;
    await get().loadTransactions(month);
    await get().loadMonthData(month);
  },

  removeTransaction: async (id) => {
    await deleteTransactionById(id);
    const month = get().selectedMonth;
    await get().loadTransactions(month);
    await get().loadMonthData(month);
  },

  // ─── Subscriptions ────────────────────────────────────────────────────────
  loadSubscriptions: async () => {
    const subscriptions = await getAllSubscriptions();
    set({ subscriptions });
  },

  addSubscription: async (data) => {
    await insertSubscription(data);
    await get().loadSubscriptions();
  },

  removeSubscription: async (id) => {
    await deleteSubscriptionById(id);
    await get().loadSubscriptions();
  },

  // ─── Budgets ──────────────────────────────────────────────────────────────
  loadBudgets: async (month) => {
    const m = month || get().selectedMonth;
    const budgets = await getBudgetsByMonth(m);
    set({ budgets });
  },

  addBudget: async (data) => {
    await insertBudget(data);
    await get().loadBudgets();
  },

  removeBudget: async (id) => {
    await deleteBudgetById(id);
    await get().loadBudgets();
  },

  // ─── Customers ───────────────────────────────────────────────────────────
  loadCustomers: async () => {
    const customers = await getAllCustomers();
    set({ customers });
  },

  addCustomer: async (data) => {
    await insertCustomer(data);
    await get().loadCustomers();
  },

  updateCustomer: async (id, data) => {
    await updateCustomer(id, data);
    await get().loadCustomers();
  },

  removeCustomer: async (id) => {
    await deleteCustomerById(id);
    await get().loadCustomers();
  },

  // ─── Recurring Transactions ─────────────────────────────────────────────
  loadRecurringTransactions: async () => {
    const recurringTransactions = await getAllRecurringTransactions();
    set({ recurringTransactions });
  },
  addRecurringTransaction: async (data) => {
    await insertRecurringTransaction(data);
    await get().loadRecurringTransactions();
  },
  removeRecurringTransaction: async (id) => {
    await deleteRecurringTransactionById(id);
    await get().loadRecurringTransactions();
  },

  // ─── Tags ───────────────────────────────────────────────────────────────
  loadTags: async () => {
    const tags = await getAllTags();
    set({ tags });
  },
  addTag: async (name) => {
    await insertTag(name);
    await get().loadTags();
  },
  removeTag: async (id) => {
    await deleteTagById(id);
    await get().loadTags();
  },

  // ─── Goals ──────────────────────────────────────────────────────────────
  loadGoals: async () => {
    const goals = await getAllGoals();
    set({ goals });
  },
  addGoal: async (data) => {
    await insertGoal(data);
    await get().loadGoals();
  },
  updateGoal: async (id, data) => {
    await updateGoal(id, data);
    await get().loadGoals();
  },
  removeGoal: async (id) => {
    await deleteGoalById(id);
    await get().loadGoals();
  },

  // ─── Analytics ────────────────────────────────────────────────────────────
  loadMonthData: async (month) => {
    const m = month || get().selectedMonth;
    const [monthlyTotals, expensesByCategory] = await Promise.all([
      getMonthlyTotals(m),
      getExpensesByCategory(m),
    ]);
    set({ monthlyTotals, expensesByCategory });
  },

  loadReportsData: async () => {
    const last6MonthsTotals = await getLast6MonthsTotals();
    set({ last6MonthsTotals });
    await get().loadMonthData();
  },

  // ─── Settings ───────────────────────────────────────────────────────────
  loadSettings: async () => {
    const currency = await getSetting('currency');
    const theme = await getSetting('theme');
    set({ settings: { currency, theme } });
  },
  setSetting: async (key, value) => {
    await setSetting(key, value);
    await get().loadSettings();
  },

  // ─── Load All ─────────────────────────────────────────────────────────────
  loadAll: async () => {
    set({ loading: true });
    const month = get().selectedMonth;
    await Promise.all([
      get().loadTransactions(month),
      get().loadSubscriptions(),
      get().loadBudgets(month),
      get().loadCustomers(),
      get().loadMonthData(month),
    ]);
    set({ loading: false });
  },
}));

// Stable selector hooks — these return the same function reference every render
// so they are safe to use as useEffect / useFocusEffect dependencies
export const useLoadAll = () => useStore(useCallback((s) => s.loadAll, []));
export const useLoadTransactions = () => useStore(useCallback((s) => s.loadTransactions, []));
export const useLoadSubscriptions = () => useStore(useCallback((s) => s.loadSubscriptions, []));
export const useLoadBudgets = () => useStore(useCallback((s) => s.loadBudgets, []));
export const useLoadCustomers = () => useStore(useCallback((s) => s.loadCustomers, []));
export const useLoadMonthData = () => useStore(useCallback((s) => s.loadMonthData, []));
export const useLoadReportsData = () => useStore(useCallback((s) => s.loadReportsData, []));
export const useLoadRecurringTransactions = () => useStore(useCallback((s) => s.loadRecurringTransactions, []));
export const useLoadTags = () => useStore(useCallback((s) => s.loadTags, []));
export const useLoadGoals = () => useStore(useCallback((s) => s.loadGoals, []));
export const useLoadSettings = () => useStore(useCallback((s) => s.loadSettings, []));

export default useStore;
