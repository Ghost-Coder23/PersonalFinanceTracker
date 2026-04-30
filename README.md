# 💰 Finance Tracker — React Native App

A full-featured personal finance app built with React Native + Expo.

## Features
- 📊 **Dashboard** — Monthly balance, income/expense summary, quick add buttons
- 💸 **Transactions** — Log income & expenses with categories, dates, notes
- 🔄 **Subscriptions** — Track recurring payments with renewal alerts & trial tracking
- 🎯 **Budget** — Set monthly spending limits per category with progress bars
- 📈 **Reports** — Bar charts, pie charts, 6-month trends, savings rate

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS or Android)

### 2. Install Dependencies
```bash
cd FinanceApp
npm install
```

### 3. Start the App
```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

---

## 📁 Project Structure

```
FinanceApp/
├── App.js                        # Entry point, DB init
├── app.json                      # Expo config
├── src/
│   ├── database/
│   │   └── db.js                 # SQLite CRUD operations
│   ├── store/
│   │   └── useStore.js           # Zustand global state
│   ├── navigation/
│   │   └── AppNavigator.js       # Bottom tabs + stack navigators
│   ├── screens/
│   │   ├── DashboardScreen.js    # Home overview
│   │   ├── TransactionsScreen.js # Transaction list + filters
│   │   ├── AddTransactionScreen.js
│   │   ├── SubscriptionsScreen.js
│   │   ├── AddSubscriptionScreen.js
│   │   ├── BudgetScreen.js       # Budget progress
│   │   ├── AddBudgetScreen.js
│   │   └── ReportsScreen.js      # Charts & analytics
│   ├── components/
│   │   ├── SummaryCard.js
│   │   ├── TransactionItem.js
│   │   ├── SubscriptionItem.js
│   │   └── BudgetProgress.js
│   └── utils/
│       ├── colors.js             # Design system colors
│       ├── categories.js         # Category definitions
│       └── formatters.js         # Currency, date helpers
```

---

## 🧱 Tech Stack

| Tool | Purpose |
|------|---------|
| React Native + Expo | Framework |
| expo-sqlite | Local database |
| Zustand | State management |
| React Navigation | Tab + stack navigation |
| react-native-chart-kit | Bar & pie charts |
| dayjs | Date handling |
| @expo/vector-icons | Ionicons |

---

## 🎨 Customization

### Change Currency Symbol
In `src/utils/formatters.js`, update the `formatCurrency` function:
```js
export const formatCurrency = (amount, symbol = '$') => { ... }
```
Pass your symbol: `formatCurrency(amount, 'R')` for South African Rand, `formatCurrency(amount, '£')` for GBP, etc.

### Add New Categories
In `src/utils/categories.js`, add to the relevant array:
```js
{ id: 'my_cat', label: 'My Category', icon: '🎯', color: '#FF5722' }
```

### Change Theme Colors
Edit `src/utils/colors.js` — update `primary`, `income`, `expense`, etc.

---

## 📱 Screenshots Overview

| Screen | Description |
|--------|-------------|
| Dashboard | Balance card, quick actions, recent activity |
| Transactions | Filterable list with month navigation |
| Subscriptions | Upcoming renewals, monthly/yearly cost |
| Budget | Progress bars per category |
| Reports | Bar + pie charts, spending breakdown |

---

## 🔮 Future Enhancements
- [ ] Export to CSV / PDF
- [ ] Push notifications for subscription renewals
- [ ] Multi-currency support
- [ ] Cloud sync / backup
- [ ] Dark mode
- [ ] Recurring transaction automation
- [ ] Import from bank statements
