export const LIGHT_COLORS = {
  primary: '#6C63FF',
  primaryLight: '#EEF0FF',
  primaryDark: '#4A42D6',
  secondary: '#FF6584',
  income: '#00C853',
  incomeLight: '#E8F5E9',
  expense: '#FF5252',
  expenseLight: '#FFEBEE',
  subscription: '#FF9800',
  subscriptionLight: '#FFF3E0',
  background: '#F5F7FF',
  card: '#FFFFFF',
  input: '#F8F9FF',
  text: '#1A1A2E',
  textSecondary: '#8C8FA5',
  border: '#EBEBF0',
  success: '#00C853',
  warning: '#FF9800',
  danger: '#FF5252',
  white: '#FFFFFF',
  shadow: 'rgba(108, 99, 255, 0.12)',
  overlay: 'rgba(0,0,0,0.5)',
};

export const DARK_COLORS = {
  primary: '#8E88FF',
  primaryLight: '#252344',
  primaryDark: '#B4B0FF',
  secondary: '#FF7C98',
  income: '#4ADE80',
  incomeLight: '#12351F',
  expense: '#FB7185',
  expenseLight: '#3F1720',
  subscription: '#FDBA74',
  subscriptionLight: '#3B2611',
  background: '#10131C',
  card: '#191D29',
  input: '#111827',
  text: '#F8FAFC',
  textSecondary: '#A6ADBB',
  border: '#2B3140',
  success: '#4ADE80',
  warning: '#FDBA74',
  danger: '#FB7185',
  white: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.24)',
  overlay: 'rgba(0,0,0,0.65)',
};

export const COLORS = { ...LIGHT_COLORS };

export const applyTheme = (theme = 'light') => {
  Object.assign(COLORS, theme === 'dark' ? DARK_COLORS : LIGHT_COLORS);
};
