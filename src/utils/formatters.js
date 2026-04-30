import dayjs from 'dayjs';

export const formatCurrency = (amount, symbol = '$') => {
  const num = parseFloat(amount) || 0;
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
  dayjs(dateStr).diff(dayjs(), 'day');

export const getPrevMonth = (monthStr) =>
  dayjs(monthStr + '-01').subtract(1, 'month').format('YYYY-MM');

export const getNextMonth = (monthStr) =>
  dayjs(monthStr + '-01').add(1, 'month').format('YYYY-MM');
