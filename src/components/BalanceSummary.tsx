import type { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BalanceSummaryProps {
  transactions: Transaction[];
}

export function BalanceSummary({ transactions }: BalanceSummaryProps) {
  const totalIncomeGross = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpensesGross = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalServiceFeesOnIncome = transactions
    .filter((t) => t.type === 'income' && t.serviceFee)
    .reduce((sum, t) => sum + (t.serviceFee || 0), 0);

  const totalServiceFeesOnExpenses = transactions
    .filter((t) => t.type === 'expense' && t.serviceFee)
    .reduce((sum, t) => sum + (t.serviceFee || 0), 0);
  
  const netIncome = totalIncomeGross - totalServiceFeesOnIncome;
  const totalEffectiveExpenses = totalExpensesGross + totalServiceFeesOnExpenses;
  const balance = netIncome - totalEffectiveExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
          <span className="text-lg">Net Income:</span>
          <span className="text-lg font-semibold text-accent">{formatCurrency(netIncome)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
          <span className="text-lg">Total Effective Expenses:</span>
          <span className="text-lg font-semibold text-destructive">{formatCurrency(totalEffectiveExpenses)}</span>
        </div>
         { (totalServiceFeesOnIncome > 0 || totalServiceFeesOnExpenses > 0) && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            {totalServiceFeesOnIncome > 0 && (
              <div className="flex justify-between items-center">
                <span>(Gross Income: {formatCurrency(totalIncomeGross)}, Fees: {formatCurrency(totalServiceFeesOnIncome)})</span>
              </div>
            )}
            {totalServiceFeesOnExpenses > 0 && (
               <div className="flex justify-between items-center">
                <span>(Gross Expenses: {formatCurrency(totalExpensesGross)}, Fees: {formatCurrency(totalServiceFeesOnExpenses)})</span>
              </div>
            )}
          </div>
        )}
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
