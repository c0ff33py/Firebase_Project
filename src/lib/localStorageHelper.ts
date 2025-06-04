import type { Transaction } from '@/types';

const TRANSACTIONS_KEY = 'kesiLedgerTransactions';

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
