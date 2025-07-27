import {DetectedCurrency, CurrencyDatabase, DetectionResult} from '../types/currency';

// Mock currency database
const currencyDatabase: CurrencyDatabase = {
  USD: {
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    denominations: [1, 2, 5, 10, 20, 50, 100],
    country: 'United States',
  },
  EUR: {
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    denominations: [5, 10, 20, 50, 100, 200, 500],
    country: 'European Union',
  },
  GBP: {
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    denominations: [5, 10, 20, 50],
    country: 'United Kingdom',
  },
  JPY: {
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    denominations: [1000, 2000, 5000, 10000],
    country: 'Japan',
  },
  CAD: {
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    denominations: [5, 10, 20, 50, 100],
    country: 'Canada',
  },
  AUD: {
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    denominations: [5, 10, 20, 50, 100],
    country: 'Australia',
  },
};

// Mock detection function
export const detectCurrency = async (imageData?: any): Promise<DetectionResult> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Mock detection with random results
  const currencies = Object.keys(currencyDatabase);
  const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
  const currencyInfo = currencyDatabase[randomCurrency];
  const randomDenomination = currencyInfo.denominations[
    Math.floor(Math.random() * currencyInfo.denominations.length)
  ];

  // Simulate varying confidence levels
  const confidence = 0.7 + Math.random() * 0.3; // 70-100%

  // Mock security features
  const allFeatures = [
    'Watermark detected',
    'Security thread present',
    'Serial number visible',
    'Microprinting found',
    'Color-changing ink detected',
    'Raised printing felt',
    'UV security features',
    'Holographic elements',
  ];

  const numFeatures = Math.floor(Math.random() * 4) + 2; // 2-5 features
  const features = allFeatures
    .sort(() => 0.5 - Math.random())
    .slice(0, numFeatures);

  const detectedCurrency: DetectedCurrency = {
    currency: randomCurrency,
    denomination: randomDenomination,
    confidence: confidence,
    country: currencyInfo.country,
    description: `${currencyInfo.name} - ${randomDenomination} ${currencyInfo.name === 'Japanese Yen' ? 'Yen' : currencyInfo.name.split(' ')[1] || 'Note'}`,
    features: features,
    timestamp: Date.now(),
  };

  return {
    detected: true,
    currency: detectedCurrency,
  };
};

// Function to get currency information
export const getCurrencyInfo = (currencyCode: string) => {
  return currencyDatabase[currencyCode];
};

// Function to validate currency denomination
export const isValidDenomination = (currencyCode: string, denomination: number): boolean => {
  const currency = currencyDatabase[currencyCode];
  return currency ? currency.denominations.includes(denomination) : false;
};

// Function to get all supported currencies
export const getSupportedCurrencies = () => {
  return Object.keys(currencyDatabase).map(code => ({
    code,
    ...currencyDatabase[code],
  }));
};