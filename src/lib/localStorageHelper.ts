import type { Transaction } from '@/types';

const TRANSACTIONS_KEY = 'kesiLedgerTransactions';
const SERVICE_FEE_RATE_KEY = 'kesiLedgerServiceFeeRate';

export function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const serializedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    if (serializedTransactions === null) {
      return [];
    }
    const storedTransactions = JSON.parse(serializedTransactions) as any[];
    // Dates are stored as strings, so we need to convert them back to Date objects
    return storedTransactions.map(tx => ({
      ...tx,
      date: new Date(tx.date),
      serviceFee: tx.serviceFee ? parseFloat(tx.serviceFee) : undefined, // Ensure serviceFee is a number
    }));
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serializedTransactions = JSON.stringify(transactions);
    localStorage.setItem(TRANSACTIONS_KEY, serializedTransactions);
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
  }
}

// Default service fee rate is 1%
const DEFAULT_SERVICE_FEE_RATE = 1;

export function loadServiceFeeRate(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_SERVICE_FEE_RATE;
  }
  try {
    const rate = localStorage.getItem(SERVICE_FEE_RATE_KEY);
    if (rate === null) {
      return DEFAULT_SERVICE_FEE_RATE;
    }
    const parsedRate = parseFloat(rate);
    return isNaN(parsedRate) ? DEFAULT_SERVICE_FEE_RATE : parsedRate;
  } catch (error) {
    console.error('Error loading service fee rate from localStorage:', error);
    return DEFAULT_SERVICE_FEE_RATE;
  }
}

export function saveServiceFeeRate(rate: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(SERVICE_FEE_RATE_KEY, rate.toString());
  } catch (error)
    {
    console.error('Error saving service fee rate to localStorage:', error);
  }
}
