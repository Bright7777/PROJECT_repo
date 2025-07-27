export interface DetectedCurrency {
  currency: string;
  denomination: number;
  confidence: number;
  country: string;
  description: string;
  features?: string[];
  timestamp: number;
}

export interface CurrencyDatabase {
  [key: string]: {
    name: string;
    symbol: string;
    flag: string;
    denominations: number[];
    country: string;
  };
}

export interface DetectionResult {
  detected: boolean;
  currency?: DetectedCurrency;
  error?: string;
}