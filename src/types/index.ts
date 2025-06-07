export type PaymentMethod = 'KPay' | 'WaveMoney';
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  name: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
  serviceFee?: number; // Added serviceFee field
}
