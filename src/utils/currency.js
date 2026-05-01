export const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'NGN'];

export async function fetchExchangeRates(base = 'USD') {
  // In production, use a real API. Here is a placeholder:
  return {
    USD: 1,
    EUR: 0.93,
    GBP: 0.8,
    JPY: 155,
    NGN: 1400,
  };
}

export function convertCurrency(amount, from, to, rates) {
  if (from === to) return amount;
  return (amount / rates[from]) * rates[to];
}
