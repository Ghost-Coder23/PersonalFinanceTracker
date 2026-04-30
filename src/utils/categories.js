export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍔', color: '#FF9800' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#2196F3' },
  { id: 'housing', label: 'Housing & Rent', icon: '🏠', color: '#9C27B0' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#FF5722' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#E91E63' },
  { id: 'health', label: 'Health', icon: '❤️', color: '#F44336' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎮', color: '#3F51B5' },
  { id: 'education', label: 'Education', icon: '📚', color: '#009688' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#00BCD4' },
  { id: 'personal', label: 'Personal Care', icon: '💆', color: '#8BC34A' },
  { id: 'savings', label: 'Savings', icon: '🐷', color: '#4CAF50' },
  { id: 'other', label: 'Other', icon: '📦', color: '#607D8B' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: '💼', color: '#4CAF50' },
  { id: 'freelance', label: 'Freelance', icon: '💻', color: '#2196F3' },
  { id: 'business', label: 'Business', icon: '🏢', color: '#9C27B0' },
  { id: 'investment', label: 'Investment', icon: '📈', color: '#FF9800' },
  { id: 'rental', label: 'Rental Income', icon: '🏠', color: '#00BCD4' },
  { id: 'gift', label: 'Gift', icon: '🎁', color: '#E91E63' },
  { id: 'other_income', label: 'Other', icon: '💰', color: '#607D8B' },
];

export const SUBSCRIPTION_CATEGORIES = [
  { id: 'streaming', label: 'Streaming', icon: '📺', color: '#E91E63' },
  { id: 'music', label: 'Music', icon: '🎵', color: '#9C27B0' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: '#3F51B5' },
  { id: 'software', label: 'Software/SaaS', icon: '💻', color: '#2196F3' },
  { id: 'fitness', label: 'Fitness', icon: '💪', color: '#4CAF50' },
  { id: 'news', label: 'News & Media', icon: '📰', color: '#FF9800' },
  { id: 'cloud', label: 'Cloud Storage', icon: '☁️', color: '#00BCD4' },
  { id: 'other_sub', label: 'Other', icon: '📦', color: '#607D8B' },
];

export const getCategoryById = (id, type = 'expense') => {
  const list =
    type === 'income'
      ? INCOME_CATEGORIES
      : type === 'subscription'
      ? SUBSCRIPTION_CATEGORIES
      : EXPENSE_CATEGORIES;
  return list.find((c) => c.id === id) || { label: id, icon: '📦', color: '#607D8B' };
};
