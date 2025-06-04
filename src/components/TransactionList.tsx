import type { Transaction } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, CreditCard, Smartphone } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  animatedRowId: string | null;
}

export function TransactionList({ transactions, animatedRowId }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card className="shadow-lg mt-6 md:mt-0 flex-grow">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-center py-8">No transactions yet. Add one to get started!</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const PaymentMethodIcon = ({ method }: { method: Transaction['paymentMethod']}) => {
    if (method === 'KPay') return <CreditCard className="h-5 w-5 inline-block mr-1 text-muted-foreground" aria-label="KPay" />;
    if (method === 'WaveMoney') return <Smartphone className="h-5 w-5 inline-block mr-1 text-muted-foreground" aria-label="WaveMoney" />;
    return null;
  };

  return (
    <Card className="shadow-lg mt-6 md:mt-0 flex-grow flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[400px] md:h-[calc(100%-2rem)] pr-1"> {/* Adjust height as needed */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow 
                  key={t.id} 
                  className={cn(t.id === animatedRowId && 'animate-fadeInSlideDown')}
                >
                  <TableCell>{format(t.date, 'MMM dd, yy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                    {t.type === 'income' ? 
                      <TrendingUp className="h-5 w-5 mr-1 text-accent" /> : 
                      <TrendingDown className="h-5 w-5 mr-1 text-destructive" />}
                    <span className="capitalize">{t.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[150px] truncate" title={t.description}>{t.description}</TableCell>
                  <TableCell className="max-w-[100px] truncate" title={t.category}>{t.category}</TableCell>
                  <TableCell className="max-w-[100px] truncate" title={t.name}>{t.name}</TableCell>
                  <TableCell className="max-w-[120px] truncate" title={t.phoneNumber}>{t.phoneNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <PaymentMethodIcon method={t.paymentMethod} />
                      {t.paymentMethod}
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      t.type === 'income' ? 'text-accent' : 'text-destructive'
                    )}
                  >
                    {formatCurrency(t.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
