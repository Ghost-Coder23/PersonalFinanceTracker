import * as SQLite from 'expo-sqlite';
import dayjs from 'dayjs';

let database = null;

export const getDB = () => database;

const addColumnIfMissing = async (table, columnDefinition) => {
  const columnName = columnDefinition.trim().split(/\s+/)[0];
  const columns = await database.getAllAsync(`PRAGMA table_info(${table})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    await database.execAsync(`ALTER TABLE ${table} ADD COLUMN ${columnDefinition}`);
  }
};

const getNextRecurringDate = (date, frequency) => {
  const current = dayjs(date);
  if (frequency === 'daily') return current.add(1, 'day');
  if (frequency === 'weekly') return current.add(1, 'week');
  if (frequency === 'quarterly') return current.add(3, 'month');
  if (frequency === 'yearly') return current.add(1, 'year');
  return current.add(1, 'month');
};

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

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT DEFAULT '',
      start_date TEXT NOT NULL,
      frequency TEXT NOT NULL,
      next_due_date TEXT,
      is_active INTEGER DEFAULT 1,
      customer_id INTEGER,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (transaction_id, tag_id),
      FOREIGN KEY(transaction_id) REFERENCES transactions(id),
      FOREIGN KEY(tag_id) REFERENCES tags(id)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  await addColumnIfMissing('recurring_transactions', 'next_due_date TEXT');
  await addColumnIfMissing('recurring_transactions', 'is_active INTEGER DEFAULT 1');
  await database.runAsync(
    'UPDATE recurring_transactions SET next_due_date = start_date WHERE next_due_date IS NULL'
  );

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

export const getAllBudgets = async () => {
  const db = getDB();
  return await db.getAllAsync('SELECT * FROM budgets ORDER BY month DESC, category ASC');
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

// ─── CUSTOMERS ──────────────────────────────────────────────────────────────

export const getAllCustomers = async () => {
  const db = getDB();
  return await db.getAllAsync('SELECT * FROM customers ORDER BY name ASC');
};

export const insertCustomer = async ({ name, email, phone, notes }) => {
  const db = getDB();
  const result = await db.runAsync(
    'INSERT INTO customers (name, email, phone, notes) VALUES (?, ?, ?, ?)',
    [name, email || '', phone || '', notes || '']
  );
  return result.lastInsertRowId;
};

export const updateCustomer = async (id, { name, email, phone, notes }) => {
  const db = getDB();
  await db.runAsync(
    'UPDATE customers SET name = ?, email = ?, phone = ?, notes = ? WHERE id = ?',
    [name, email || '', phone || '', notes || '', id]
  );
};

export const deleteCustomerById = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
};

// ─── RECURRING TRANSACTIONS ────────────────────────────────────────────────
export const getAllRecurringTransactions = async () => {
  const db = getDB();
  return await db.getAllAsync(
    `SELECT * FROM recurring_transactions
     ORDER BY COALESCE(next_due_date, start_date) ASC`
  );
};
export const insertRecurringTransaction = async (data) => {
  const db = getDB();
  const startDate = data.start_date;
  const result = await db.runAsync(
    `INSERT INTO recurring_transactions
      (type, amount, category, description, start_date, frequency, next_due_date, is_active, customer_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.type,
      parseFloat(data.amount),
      data.category,
      data.description || '',
      startDate,
      data.frequency,
      data.next_due_date || startDate,
      data.is_active === false ? 0 : 1,
      data.customer_id || null,
    ]
  );
  return result.lastInsertRowId;
};
export const deleteRecurringTransactionById = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM recurring_transactions WHERE id = ?', [id]);
};

export const generateDueRecurringTransactions = async () => {
  const db = getDB();
  const today = dayjs().format('YYYY-MM-DD');
  const dueItems = await db.getAllAsync(
    `SELECT * FROM recurring_transactions
     WHERE is_active = 1
       AND date(COALESCE(next_due_date, start_date)) <= date(?)
     ORDER BY COALESCE(next_due_date, start_date) ASC`,
    [today]
  );

  let generatedCount = 0;

  for (const item of dueItems) {
    let dueDate = dayjs(item.next_due_date || item.start_date);
    let safetyCount = 0;

    while (!dueDate.isAfter(dayjs(today), 'day') && safetyCount < 36) {
      await db.runAsync(
        'INSERT INTO transactions (type, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
        [
          item.type,
          parseFloat(item.amount),
          item.category,
          item.description || `Recurring ${item.type}`,
          dueDate.format('YYYY-MM-DD'),
        ]
      );
      generatedCount += 1;
      safetyCount += 1;
      dueDate = getNextRecurringDate(dueDate, item.frequency);
    }

    await db.runAsync(
      'UPDATE recurring_transactions SET next_due_date = ? WHERE id = ?',
      [dueDate.format('YYYY-MM-DD'), item.id]
    );
  }

  return generatedCount;
};
// ─── TAGS ──────────────────────────────────────────────────────────────────
export const getAllTags = async () => {
  const db = getDB();
  return await db.getAllAsync('SELECT * FROM tags ORDER BY name ASC');
};
export const insertTag = async (name) => {
  const db = getDB();
  const result = await db.runAsync('INSERT INTO tags (name) VALUES (?)', [name]);
  return result.lastInsertRowId;
};
export const deleteTagById = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM tags WHERE id = ?', [id]);
};
// ─── GOALS ─────────────────────────────────────────────────────────────────
export const getAllGoals = async () => {
  const db = getDB();
  return await db.getAllAsync('SELECT * FROM goals ORDER BY deadline ASC');
};
export const insertGoal = async (data) => {
  const db = getDB();
  const result = await db.runAsync(
    'INSERT INTO goals (name, target_amount, current_amount, deadline) VALUES (?, ?, ?, ?)',
    [data.name, parseFloat(data.target_amount), parseFloat(data.current_amount) || 0, data.deadline || null]
  );
  return result.lastInsertRowId;
};
export const updateGoal = async (id, data) => {
  const db = getDB();
  await db.runAsync(
    'UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, deadline = ? WHERE id = ?',
    [data.name, parseFloat(data.target_amount), parseFloat(data.current_amount) || 0, data.deadline || null, id]
  );
};
export const deleteGoalById = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
};
// ─── SETTINGS ──────────────────────────────────────────────────────────────
export const getSetting = async (key) => {
  const db = getDB();
  const row = await db.getAllAsync('SELECT value FROM settings WHERE key = ?', [key]);
  return row.length ? row[0].value : null;
};
export const setSetting = async (key, value) => {
  const db = getDB();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
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
