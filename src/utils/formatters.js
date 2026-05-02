import dayjs from 'dayjs';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
];

let activeCurrency = 'USD';

export const setActiveCurrency = (currency = 'USD') => {
  activeCurrency = currency;
};

export const getActiveCurrency = () => activeCurrency;

export const getCurrencySymbol = (currency = activeCurrency) => {
  const found = CURRENCIES.find((item) => item.code === currency);
  return found?.symbol || currency || '$';
};

export const formatCurrency = (amount, currencyOrSymbol = activeCurrency) => {
  const num = parseFloat(amount) || 0;
  const symbol = getCurrencySymbol(currencyOrSymbol);
  return `${symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (date) => dayjs(date).format('MMM DD, YYYY');

export const formatShortDate = (date) => dayjs(date).format('MMM DD');

export const formatMonthYear = (date) => dayjs(date).format('MMMM YYYY');

export const getCurrentMonth = () => dayjs().format('YYYY-MM');

export const getCurrentDate = () => dayjs().format('YYYY-MM-DD');

export const getMonthLabel = (monthStr) =>
  dayjs(monthStr + '-01').format('MMMM YYYY');

export const isThisMonth = (dateStr) =>
  dayjs(dateStr).format('YYYY-MM') === getCurrentMonth();

export const getDaysUntil = (dateStr) =>
  dayjs(dateStr).startOf('day').diff(dayjs().startOf('day'), 'day');

export const getPrevMonth = (monthStr) =>
  dayjs(monthStr + '-01').subtract(1, 'month').format('YYYY-MM');

export const getNextMonth = (monthStr) =>
  dayjs(monthStr + '-01').add(1, 'month').format('YYYY-MM');
