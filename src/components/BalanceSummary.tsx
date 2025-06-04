import type { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BalanceSummaryProps {
  transactions: Transaction[];
}

export function BalanceSummary({ transactions }: BalanceSummaryProps) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    // Using a placeholder currency, adjust as needed for Kesi or local currency.
    // For example, 'MMK' for Myanmar Kyat if Kesi is a name and not currency.
    // For now, using a generic style without currency symbol for broader applicability.
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
          <span className="text-lg">Total Income:</span>
          <span className="text-lg font-semibold text-accent">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
          <span className="text-lg">Total Expenses:</span>
          <span className="text-lg font-semibold text-destructive">{formatCurrency(totalExpenses)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-card border border-border rounded-md mt-4">
          <span className="text-xl font-bold">Current Balance:</span>
          <span
            className={cn(
              'text-xl font-bold',
              balance >= 0 ? 'text-accent' : 'text-destructive'
            )}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
