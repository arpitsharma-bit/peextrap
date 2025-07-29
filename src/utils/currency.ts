export interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  icon: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', icon: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union', icon: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom', icon: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India', icon: '🇮🇳' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan', icon: '🇯🇵' },
];

export const getCurrencyByCode = (code: string): Currency => {
  return CURRENCIES.find(currency => currency.code === code) || CURRENCIES[0];
};

// Function to format number with commas (Indian format)
const formatNumberWithCommas = (num: number): string => {
  const numStr = Math.round(num).toString();
  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  
  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return lastThree;
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  const formattedAmount = formatNumberWithCommas(amount);
  
  return `${currency.symbol}${formattedAmount}`;
};

export const getCurrencyIcon = (currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  return currency.icon;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  return currency.symbol;
}; 