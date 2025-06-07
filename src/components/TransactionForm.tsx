'use client';

import type { Transaction } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction';
import { loadServiceFeeRate } from '@/lib/localStorageHelper'; // Added import
import { CalendarIcon, SparklesIcon, Loader2, InfoIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';

const transactionFormSchema = z.object({
  date: z.date({ required_error: 'Date is required.' }),
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required.' }),
  category: z.string().min(1, 'Category is required.'),
  name: z.string().min(1, "Name is required."),
  phoneNumber: z.string().min(1, "Phone number is required.").regex(/^\+?[0-9\s-()]{7,20}$/, "Invalid phone number format."),
  paymentMethod: z.enum(['KPay', 'WaveMoney'], { required_error: 'Payment method is required.' }),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
  animateTrigger: React.Dispatch<React.SetStateAction<string | null>>;
}

export function TransactionForm({ onAddTransaction, animateTrigger }: TransactionFormProps) {
  const { toast } = useToast();
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [descriptionForCategory, setDescriptionForCategory] = useState('');
  const [currentServiceFeeRate, setCurrentServiceFeeRate] = useState(0);
  const [calculatedServiceFee, setCalculatedServiceFee] = useState(0);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: new Date(),
      type: 'expense',
      paymentMethod: 'KPay',
      description: '',
      category: '',
      name: '',
      phoneNumber: '',
    },
  });

  const watchDescription = form.watch('description');
  const watchAmount = form.watch('amount');

  const refreshFeeRate = useCallback(() => {
    if (typeof window !== 'undefined') {
      setCurrentServiceFeeRate(loadServiceFeeRate());
    }
  }, []);

  useEffect(() => {
    refreshFeeRate();
     // Add event listener for localStorage changes to fee rate
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'kesiLedgerServiceFeeRate') {
        refreshFeeRate();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshFeeRate]);

  useEffect(() => {
    setDescriptionForCategory(watchDescription);
  }, [watchDescription]);

  useEffect(() => {
    if (watchAmount > 0 && currentServiceFeeRate > 0) {
      const fee = (watchAmount * currentServiceFeeRate) / 100;
      setCalculatedServiceFee(parseFloat(fee.toFixed(2)));
    } else {
      setCalculatedServiceFee(0);
    }
  }, [watchAmount, currentServiceFeeRate]);

  const handleSuggestCategory = async () => {
    if (!descriptionForCategory) {
      toast({ title: 'Error', description: 'Please enter a description first.', variant: 'destructive' });
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await categorizeTransaction({ transactionDescription: descriptionForCategory });
      form.setValue('category', result.suggestedCategory, { shouldValidate: true });
      toast({ title: 'Success', description: `Suggested category: ${result.suggestedCategory}` });
    } catch (error) {
      console.error('Error suggesting category:', error);
      toast({ title: 'Error', description: 'Could not suggest a category.', variant: 'destructive' });
    } finally {
      setIsCategorizing(false);
    }
  };

  const onSubmit = (data: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      ...data,
      serviceFee: calculatedServiceFee > 0 ? calculatedServiceFee : undefined,
    };
    onAddTransaction(newTransaction);
    animateTrigger(newTransaction.id);
    form.reset({
      date: new Date(),
      type: 'expense',
      paymentMethod: 'KPay',
      description: '',
      category: '',
      name: '',
      phoneNumber: '',
      amount: undefined,
    });
    setCalculatedServiceFee(0); // Reset calculated fee display
    toast({ title: 'Success', description: `${data.type === 'income' ? 'Income' : 'Expense'} added successfully.`});
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Controller
                name="date"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.date && <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" {...form.register('amount')} placeholder="0.00" onChange={(e) => {
                form.setValue('amount', parseFloat(e.target.value) || 0);
                refreshFeeRate(); // Re-check fee rate in case it changed in another tab
              }}/>
              {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
            </div>
          </div>
           {/* Service Fee Display */}
           {calculatedServiceFee > 0 && (
            <div className="p-3 bg-muted/50 rounded-md text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Service Fee ({currentServiceFeeRate}%):
                </span>
                <span className="font-medium">{formatCurrency(calculatedServiceFee)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                 <span className="text-muted-foreground">
                  {form.getValues('type') === 'income' ? 'Net Amount Receivable:' : 'Total Amount Payable:'}
                </span>
                <span className="font-semibold">
                  {form.getValues('type') === 'income'
                    ? formatCurrency(form.getValues('amount') - calculatedServiceFee)
                    : formatCurrency(form.getValues('amount') + calculatedServiceFee)}
                </span>
              </div>
            </div>
          )}


          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...form.register('description')} placeholder="e.g., Groceries, Salary" />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex gap-2">
              <Input id="category" {...form.register('category')} placeholder="e.g., Food, Income" />
              <Button type="button" onClick={handleSuggestCategory} disabled={isCategorizing || !descriptionForCategory} variant="outline" size="icon" aria-label="Suggest Category">
                {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <SparklesIcon className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name')} placeholder="User's name" />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" {...form.register('phoneNumber')} placeholder="+1234567890" />
              {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Trigger re-calculation of displayed net/total amount if type changes
                      if (watchAmount > 0 && currentServiceFeeRate > 0) {
                        const fee = (watchAmount * currentServiceFeeRate) / 100;
                        setCalculatedServiceFee(parseFloat(fee.toFixed(2)));
                      }
                    }}
                    defaultValue={field.value}
                    className="flex space-x-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income" id="income" />
                      <Label htmlFor="income" className="font-normal text-accent cursor-pointer">Income</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="expense" id="expense" />
                      <Label htmlFor="expense" className="font-normal text-destructive cursor-pointer">Expense</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {form.formState.errors.type && <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Controller
                name="paymentMethod"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KPay">KPay</SelectItem>
                      <SelectItem value="WaveMoney">WaveMoney</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.paymentMethod && <p className="text-sm text-destructive">{form.formState.errors.paymentMethod.message}</p>}
            </div>
          </div>

          <CardFooter className="p-0 pt-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Transaction
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
