import * as SQLite from 'expo-sqlite';

let database = null;

export const getDB = () => database;

export const initDB = async () => {
  database = await SQLite.openDatabaseAsync('financeapp.db');

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT DEFAULT '',
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      billing_cycle TEXT NOT NULL,
      next_renewal TEXT NOT NULL,
      category TEXT NOT NULL,
      is_trial INTEGER DEFAULT 0,
      trial_end_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      UNIQUE(category, month)
    );
  `);

  return database;
};

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────

export const getAllTransactions = async () => {
  const db = getDB();
  return await db.getAllAsync(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
  );
};

export const getTransactionsByMonth = async (month) => {
  const db = getDB();
  return await db.getAllAsync(
    "SELECT * FROM transactions WHERE strftime('%Y-%m', date) = ? ORDER BY date DESC",
    [month]
  );
};

export const insertTransaction = async ({ type, amount, category, description, date }) => {
  const db = getDB();
  const result = await db.runAsync(
    'INSERT INTO transactions (type, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
    [type, parseFloat(amount), category, description || '', date]
  );
  return result.lastInsertRowId;
};

export const deleteTransactionById = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
};

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

export const getAllSubscriptions = async () => {
  const db = getDB();
  return await db.getAllAsync(
    'SELECT * FROM subscriptions ORDER BY next_renewal ASC'
  );
};

export const insertSubscription = async ({
  name,
  amount,
  billing_cycle,
  next_renewal,
  category,
  is_trial,
  trial_end_date,
}) => {
  const db = getDB();
  const result = await db.runAsync(
    `INSERT INTO subscriptions
      (name, amount, billing_cycle, next_renewal, category, is_trial, trial_end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, parseFloat(amount), billing_cycle, next_renewal, category, is_trial ? 1 : 0, trial_end_date || null]
  );
  return result.lastInsertRowId;
};

export const deleteSubscriptionById = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
};

// ─── BUDGETS ─────────────────────────────────────────────────────────────────

export const getBudgetsByMonth = async (month) => {
  const db = getDB();
  return await db.getAllAsync('SELECT * FROM budgets WHERE month = ?', [month]);
};

export const insertBudget = async ({ category, amount, month }) => {
  const db = getDB();
  const result = await db.runAsync(
    'INSERT OR REPLACE INTO budgets (category, amount, month) VALUES (?, ?, ?)',
    [category, parseFloat(amount), month]
  );
  return result.lastInsertRowId;
};

export const deleteBudgetById = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export const getMonthlyTotals = async (month) => {
  const db = getDB();
  const rows = await db.getAllAsync(
    `SELECT type, SUM(amount) as total FROM transactions
     WHERE strftime('%Y-%m', date) = ?
     GROUP BY type`,
    [month]
  );
  const result = { income: 0, expense: 0 };
  rows.forEach((row) => {
    result[row.type] = row.total || 0;
  });
  return result;
};

export const getExpensesByCategory = async (month) => {
  const db = getDB();
  return await db.getAllAsync(
    `SELECT category, SUM(amount) as total FROM transactions
     WHERE type = 'expense' AND strftime('%Y-%m', date) = ?
     GROUP BY category
     ORDER BY total DESC`,
    [month]
  );
};

export const getLast6MonthsTotals = async () => {
  const db = getDB();
  return await db.getAllAsync(
    `SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total
     FROM transactions
     WHERE date >= date('now', '-6 months')
     GROUP BY month, type
     ORDER BY month ASC`
  );
};
